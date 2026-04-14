# Booking Flow Restructure — Implementation Plan

## Overview
This document outlines the architectural shift from a mixed-flow model to a strict **Listing → Order → Conversation → Confirmed Booking** pipeline.

## 1. Core Objectives
- Enforce the booking pipeline: All events must originate from vendor listings.
- Unify state: Map conversations 1:1 to orders.
- Eliminate dependency on legacy tables (`planned_events`, `requests`).
- Implement robust event completion and review posting.

## 2. Proposed Database Changes

### Events Table
Add fields to distinguish listings from confirmed bookings.
- `source_order_id`: UUID (FK to `orders`)
- `is_listing`: BOOLEAN (Default: `true`)

### Orders Table
Add fields to link back to the source listing and the resulting conversation.
- `listing_event_id`: UUID (FK to `events`)
- `conversation_id`: UUID (FK to `conversations`)

### Unique Constraints
- `idx_events_one_per_order`: One confirmed event per order.
- `idx_conversations_one_per_order`: One conversation per order.

## 3. Mandatory RPCs

### `create_booking_order`
Atomic function for customers to initiate a booking.
- Inputs: `listing_event_id`, `event_date`, `notes`.
- Actions: Validates listing, checks for duplicates, creates pending order.

### `approve_order`
Atomic function for vendors to accept a booking.
- Inputs: `order_id`.
- Actions: Creates conversation, creates confirmed event row, updates order status.

## 4. Application Layer Changes

### dutuk-user (Customer App)
- Update Event Detail page to use `create_booking_order`.
- Gated Chat: Messages only unlocked after order approval.
- Implement Review posting UI (currently backend-only).

### dutuk-vendor (Vendor App)
- Update Order Approval to use `approve_order` RPC.
- Ensure chat navigation uses the newly enforced `order_id` / `event_id` link.

## 5. Migration Strategy
1. **Phase 1 (DB):** Apply schema changes and create RPCs.
2. **Phase 2 (User App):** Implement booking flow and gated chat.
3. **Phase 3 (Vendor App):** Update approval logic.
4. **Phase 4 (Cleanup):** Deprecate legacy hooks and orphaned code.

---
**Status:** Ready for Execution (Pending Token).
