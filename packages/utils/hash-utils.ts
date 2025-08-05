// src/lib/hash-utils.ts
import { createHash } from 'crypto';

export function calculateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
