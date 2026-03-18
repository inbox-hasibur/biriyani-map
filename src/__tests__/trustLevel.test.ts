import { describe, it, expect } from 'vitest';
import { getTrustLevel, getTrustMeta, TRUST_META } from '@/lib/trustLevel';

describe('trustLevel', () => {
  describe('getTrustLevel', () => {
    it('returns "confirmed" for score >= 10', () => {
      expect(getTrustLevel(10)).toBe('confirmed');
      expect(getTrustLevel(15)).toBe('confirmed');
      expect(getTrustLevel(100)).toBe('confirmed');
    });

    it('returns "almost" for score 5-9', () => {
      expect(getTrustLevel(5)).toBe('almost');
      expect(getTrustLevel(7)).toBe('almost');
      expect(getTrustLevel(9)).toBe('almost');
    });

    it('returns "unconfirmed" for score < 5', () => {
      expect(getTrustLevel(0)).toBe('unconfirmed');
      expect(getTrustLevel(4)).toBe('unconfirmed');
      expect(getTrustLevel(-5)).toBe('unconfirmed');
    });
  });

  describe('getTrustMeta', () => {
    it('returns correct metadata for each trust level', () => {
      const confirmed = getTrustMeta(10);
      expect(confirmed.label).toBe('Confirmed');
      expect(confirmed.fill).toBe('#16a34a');

      const almost = getTrustMeta(7);
      expect(almost.label).toBe('Almost Confirmed');
      expect(almost.fill).toBe('#eab308');

      const unconfirmed = getTrustMeta(2);
      expect(unconfirmed.label).toBe('Unconfirmed');
      expect(unconfirmed.fill).toBe('#94a3b8');
    });
  });

  describe('TRUST_META', () => {
    it('has all required trust levels', () => {
      expect(TRUST_META).toHaveProperty('confirmed');
      expect(TRUST_META).toHaveProperty('almost');
      expect(TRUST_META).toHaveProperty('unconfirmed');
    });

    it('each trust level has fill, glow, and label', () => {
      Object.values(TRUST_META).forEach(meta => {
        expect(meta).toHaveProperty('fill');
        expect(meta).toHaveProperty('glow');
        expect(meta).toHaveProperty('label');
        expect(typeof meta.fill).toBe('string');
        expect(typeof meta.glow).toBe('string');
        expect(typeof meta.label).toBe('string');
      });
    });
  });
});
