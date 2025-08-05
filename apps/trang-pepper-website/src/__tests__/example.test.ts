// src/__tests__/example.test.ts
// นี่คือไฟล์ Test ตัวอย่างที่ง่ายที่สุด เพื่อให้ Vitest ตรวจพบ Test Case
import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    // การทดสอบพื้นฐานที่คาดหวังว่าจะผ่านเสมอ
    expect(true).toBe(true);
  });
});
