import { describe, expect, it } from 'vitest';
import { getInitials, pluralize } from './format';

describe('pluralize', () => {
  it('uses the singular form only for one item', () => {
    expect(pluralize(1, 'book')).toBe('1 book');
    expect(pluralize(0, 'book')).toBe('0 books');
    expect(pluralize(3, 'person', 'people')).toBe('3 people');
  });
});

describe('getInitials', () => {
  it('returns up to two uppercase initials', () => {
    expect(getInitials('olena kovalenko')).toBe('OK');
    expect(getInitials('Iryna Maria Shevchenko')).toBe('IM');
    expect(getInitials('  Admin ')).toBe('A');
  });
});
