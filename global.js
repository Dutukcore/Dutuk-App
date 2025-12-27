import { Buffer } from 'buffer';

// Ensure Buffer is globally available
if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
}

// Web-specific: Ensure window.Buffer is available
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}