import {  } from '../utils/accessibilityUtils';

describe('accessibilityUtils', () => {
  describe('checkContrastRatio', () => {
    test('returns correct contrast ratio for black on white', () => {
      const result = checkContrastRatio('#000000', '#FFFFFF');
      expect(result.ratio).toBeCloseTo(21, 0);
      expect(result.AA).toBe(true);
      expect(result.AAA).toBe(true);
    });

    test('returns correct contrast ratio for low contrast colors', () => {
      const result = checkContrastRatio('#777777', '#999999');
      expect(result.ratio).toBeLessThan(3);
      expect(result.AA).toBe(false);
      expect(result.AAA).toBe(false);
    });

    test('handles large text requirements correctly', () => {
      // This contrast ratio should pass AA for large text but fail for normal text
      const result = checkContrastRatio('#767676', '#FFFFFF', true);
      expect(result.ratio).toBeGreaterThan(3);
      expect(result.ratio).toBeLessThan(4.5);
      expect(result.AA).toBe(true); // Passes for large text (3:1)
      
      const normalTextResult = checkContrastRatio('#767676', '#FFFFFF', false);
      expect(normalTextResult.AA).toBe(false); // Fails for normal text (needs 4.5:1)
    });

    test('throws error for invalid color formats', () => {
      expect(() => {
        checkContrastRatio('invalid', '#FFFFFF');
      }).toThrow('Invalid color format');
      
      expect(() => {
        checkContrastRatio('#000', 'not-a-color');
      }).toThrow('Invalid color format');
    });
  });

  describe('getAccessibleTextColor', () => {
    test('returns white text for dark backgrounds', () => {
      expect(getAccessibleTextColor('#000000')).toBe('#ffffff');
      expect(getAccessibleTextColor('#333333')).toBe('#ffffff');
      expect(getAccessibleTextColor('#0000FF')).toBe('#ffffff');
    });

    test('returns black text for light backgrounds', () => {
      expect(getAccessibleTextColor('#FFFFFF')).toBe('#000000');
      expect(getAccessibleTextColor('#EEEEEE')).toBe('#000000');
      expect(getAccessibleTextColor('#FFFF00')).toBe('#000000');
    });

    test('defaults to black for invalid inputs', () => {
      expect(getAccessibleTextColor('invalid-color')).toBe('#000000');
    });
  });

  describe('hasProperCasing', () => {
    test('allows normal text', () => {
      expect(hasProperCasing('This is a normal sentence')).toBe(true);
    });

    test('allows up to two acronyms', () => {
      expect(hasProperCasing('This is HTML and CSS')).toBe(true);
      expect(hasProperCasing('UI API documentation')).toBe(true);
    });

    test('flags all caps text', () => {
      expect(hasProperCasing('THIS IS ALL CAPS TEXT')).toBe(false);
    });

    test('ignores single letter uppercase words', () => {
      expect(hasProperCasing('A B C are single letters')).toBe(true);
    });
  });

  describe('createSafeId', () => {
    test('creates unique IDs with prefix', () => {
      const id1 = createSafeId('test');
      const id2 = createSafeId('test');
      
      expect(id1).toMatch(/^test-[a-z0-9]{4}$/);
      expect(id2).toMatch(/^test-[a-z0-9]{4}$/);
      expect(id1).not.toBe(id2);
    });

    test('sanitizes value for ID creation', () => {
      const id = createSafeId('input', 'User Name!@#');
      expect(id).toMatch(/^input-user-name-[a-z0-9]{4}$/);
    });
  });
});
