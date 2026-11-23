import { describe, expect, it } from 'vitest';
import { isHttpUrl, validateImageFile } from './validation';

const createFile = (type: string, sizeBytes: number) =>
  new File([new Uint8Array(sizeBytes)], 'file', { type });

describe('isHttpUrl', () => {
  it('accepts only http(s) URLs', () => {
    expect(isHttpUrl('https://example.com/cover.jpg')).toBe(true);
    expect(isHttpUrl('http://example.com')).toBe(true);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('not a url')).toBe(false);
  });
});

describe('validateImageFile', () => {
  it('accepts supported images up to 5 MB', () => {
    expect(validateImageFile(createFile('image/png', 1024))).toBeNull();
  });

  it('rejects unsupported types and files over 5 MB', () => {
    expect(validateImageFile(createFile('application/pdf', 1024))).toMatch(/Only JPEG/);
    expect(validateImageFile(createFile('image/jpeg', 6 * 1024 * 1024))).toMatch(/5 MB/);
  });
});
