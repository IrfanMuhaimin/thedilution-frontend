// src/utils/passwordValidator.test.js
import { describe, it, expect } from 'vitest';
import { validatePassword } from './passwordValidator';

describe('Lockout Security: Password Complexity Validator', () => {
    
    it('should fail if password is too short (under 8 characters)', () => {
        const result = validatePassword('Pass123');
        expect(result.hasLength).toBe(false);
        expect(result.isValid).toBe(false);
    });

    it('should fail if password has no uppercase letters', () => {
        const result = validatePassword('password123');
        expect(result.hasUpper).toBe(false);
        expect(result.isValid).toBe(false);
    });

    it('should fail if password has no numbers', () => {
        const result = validatePassword('Passwordabc');
        expect(result.hasNumber).toBe(false);
        expect(result.isValid).toBe(false);
    });

    it('should pass if password meets all clinical security parameters', () => {
        const result = validatePassword('TheDilution#2025');
        expect(result.hasLength).toBe(true);
        expect(result.hasUpper).toBe(true);
        expect(result.hasLower).toBe(true);
        expect(result.hasNumber).toBe(true);
        expect(result.isValid).toBe(true);
    });
});