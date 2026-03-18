import { describe, it, expect } from 'vitest';
import { isAdmin, ADMIN_EMAILS } from '@/lib/supabaseClient';

describe('supabaseClient', () => {
  describe('isAdmin', () => {
    it('returns true for admin emails', () => {
      ADMIN_EMAILS.forEach(email => {
        expect(isAdmin(email)).toBe(true);
      });
    });

    it('returns true case-insensitively', () => {
      expect(isAdmin('ADMIN@UNIMAP.COM')).toBe(true);
      expect(isAdmin('Admin@UniMap.com')).toBe(true);
    });

    it('returns false for non-admin emails', () => {
      expect(isAdmin('user@example.com')).toBe(false);
      expect(isAdmin('test@test.com')).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(isAdmin(null)).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
      expect(isAdmin('')).toBe(false);
    });
  });
});
