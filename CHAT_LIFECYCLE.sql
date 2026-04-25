-- ============================================================
-- PHASE 1.1  Add lifecycle columns
-- ============================================================
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'COMPLETED')),
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- Backfill: mark conversations whose order is already completed
UPDATE public.conversations c
SET    status = 'COMPLETED',
       ended_at = COALESCE(o.completed_at, NOW())
FROM   public.orders o
WHERE  c.order_id = o.id
AND    o.status = 'completed'
AND    c.status = 'ACTIVE';

-- ============================================================
-- PHASE 1.2  Clean up reuse artifacts BEFORE adding UNIQUE
--   Keep the most-recent conversation per order
-- ============================================================
WITH ranked AS (
  SELECT id, order_id,
         ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY created_at DESC) rn
  FROM   public.conversations
  WHERE  order_id IS NOT NULL
)
UPDATE public.conversations c
SET    status   = 'COMPLETED',
       ended_at = NOW()
FROM   ranked r
WHERE  c.id = r.id AND r.rn > 1;

-- Orphans (no order_id) -> close them
UPDATE public.conversations
SET    status = 'COMPLETED',
       ended_at = NOW()
WHERE  order_id IS NULL AND status = 'ACTIVE';

-- ============================================================
-- PHASE 1.3  Structural constraints
-- ============================================================
-- Ensure all orders have a conversation (Backfill missing)
INSERT INTO public.conversations (order_id, customer_id, vendor_id, status)
SELECT o.id, o.customer_id, o.vendor_id,
       CASE WHEN o.status='completed' THEN 'COMPLETED' ELSE 'ACTIVE' END
FROM   public.orders o
LEFT JOIN public.conversations c ON c.order_id = o.id
WHERE  c.id IS NULL
ON CONFLICT (order_id) DO NOTHING;

-- Now add NOT NULL and UNIQUE
ALTER TABLE public.conversations
  ALTER COLUMN order_id SET NOT NULL;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_order_id_key UNIQUE (order_id);

-- Foreign key cascade
ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_order_id_fkey,
  ADD  CONSTRAINT conversations_order_id_fkey
       FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- ============================================================
-- PHASE 1.4  Immutability trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_conversation_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_id    IS DISTINCT FROM OLD.order_id
  OR NEW.customer_id IS DISTINCT FROM OLD.customer_id
  OR NEW.vendor_id   IS DISTINCT FROM OLD.vendor_id THEN
    RAISE EXCEPTION 'conversations.order_id/customer_id/vendor_id are immutable (conv=%)', OLD.id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_conversations_immutable ON public.conversations;
CREATE TRIGGER trg_conversations_immutable
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.enforce_conversation_immutable();

-- ============================================================
-- PHASE 1.5  Auto-close trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.close_conversation_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.status = 'completed'
     AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.conversations
    SET    status   = 'COMPLETED',
           ended_at = COALESCE(NEW.completed_at, NOW())
    WHERE  order_id = NEW.id
    AND    status   = 'ACTIVE';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_close_conversation_on_order_complete ON public.orders;
CREATE TRIGGER trg_close_conversation_on_order_complete
AFTER UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.close_conversation_on_order_complete();

-- ============================================================
-- PHASE 1.6  Block writes on COMPLETED conversations
-- ============================================================
CREATE OR REPLACE FUNCTION public.block_messages_on_closed_conversation()
RETURNS TRIGGER AS $$
DECLARE v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM public.conversations WHERE id = NEW.conversation_id;
  IF v_status = 'COMPLETED' THEN
    RAISE EXCEPTION 'Conversation % is COMPLETED — messages are read-only.', NEW.conversation_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_msg_on_closed ON public.messages;
CREATE TRIGGER trg_block_msg_on_closed
BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.block_messages_on_closed_conversation();

-- Typing indicators
CREATE OR REPLACE FUNCTION public.block_typing_on_closed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED'
     AND (NEW.customer_typing_at IS DISTINCT FROM OLD.customer_typing_at
       OR NEW.vendor_typing_at   IS DISTINCT FROM OLD.vendor_typing_at) THEN
    NEW.customer_typing_at := OLD.customer_typing_at;
    NEW.vendor_typing_at   := OLD.vendor_typing_at;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_typing_on_closed ON public.conversations;
CREATE TRIGGER trg_block_typing_on_closed
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.block_typing_on_closed();

-- ============================================================
-- PHASE 1.8  View refresh
-- ============================================================
DROP VIEW IF EXISTS public.conversations_with_users CASCADE;
CREATE VIEW public.conversations_with_users AS
SELECT
  c.id, c.order_id, c.customer_id, c.vendor_id,
  c.status, c.ended_at,
  c.customer_typing_at, c.vendor_typing_at,
  c.created_at, c.updated_at,
  cu.full_name    AS customer_name,
  cu.avatar_url   AS customer_avatar,
  vu.full_name    AS vendor_name,
  vu.avatar_url   AS vendor_avatar,
  o.status        AS order_status,
  o.completion_requested_at,
  o.completed_at
FROM public.conversations c
LEFT JOIN public.user_profiles cu ON cu.user_id = c.customer_id
LEFT JOIN public.user_profiles vu ON vu.user_id = c.vendor_id
LEFT JOIN public.orders        o  ON o.id       = c.order_id;

GRANT SELECT ON public.conversations_with_users TO authenticated;

-- ============================================================
-- PHASE 2  Atomic Order + Conversation RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_order_with_conversation(
  p_vendor_id      UUID,
  p_customer_id    UUID,
  p_customer_name  TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_title          TEXT,
  p_package_type   TEXT,
  p_event_date     DATE,
  p_amount         NUMERIC,
  p_notes          TEXT DEFAULT NULL
)
RETURNS TABLE (order_id UUID, conversation_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_conv_id  UUID;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_customer_id THEN
    RAISE EXCEPTION 'customer_id must equal auth.uid()';
  END IF;

  INSERT INTO public.orders (
    vendor_id, customer_id, customer_name, customer_email, customer_phone,
    title, package_type, event_date, amount, notes, status
  ) VALUES (
    p_vendor_id, p_customer_id, p_customer_name, p_customer_email, p_customer_phone,
    p_title, p_package_type, p_event_date, p_amount, p_notes, 'pending'
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.conversations (order_id, customer_id, vendor_id, status)
  VALUES (v_order_id, p_customer_id, p_vendor_id, 'ACTIVE')
  RETURNING id INTO v_conv_id;

  RETURN QUERY SELECT v_order_id, v_conv_id;
END $$;

GRANT EXECUTE ON FUNCTION public.create_order_with_conversation(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, NUMERIC, TEXT
) TO authenticated;

-- ============================================================
-- PHASE 6  Completion Request Idempotency
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uniq_completion_req_per_conversation
ON public.messages (conversation_id)
WHERE message_type = 'completion_request';
