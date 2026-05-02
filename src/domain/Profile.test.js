import { describe, it, expect } from 'vitest';
import Profile from './Profile.js';

describe('Profile Domain Model', () => {
    describe('Basic Properties', () => {
        it('should have correct default values', () => {
            const profile = new Profile();

            expect(profile.userId).toBeNull();
            expect(profile.firstName).toBe('');
            expect(profile.lastName).toBe('');
            expect(profile.phone).toBe('');
        });

        it('should set and get properties correctly', () => {
            const profile = new Profile();

            profile.firstName = 'John';
            profile.lastName = 'Doe';
            profile.phone = '123-456-7890';

            expect(profile.firstName).toBe('John');
            expect(profile.lastName).toBe('Doe');
            expect(profile.phone).toBe('123-456-7890');
        });

        it('should initialize with provided props', () => {
            const profile = new Profile({
                firstName: 'Jane',
                lastName: 'Doe',
                userId: 'user-123',
            });

            expect(profile.firstName).toBe('Jane');
            expect(profile.lastName).toBe('Doe');
            expect(profile.userId).toBe('user-123');
        });
    });

    describe('Initials', () => {
        it('should generate correct initials from firstName and lastName', () => {
            const profile = new Profile({ firstName: 'John', lastName: 'Doe' });
            expect(profile.initials).toBe('JD');
        });

        it('should handle first name only', () => {
            const profile = new Profile({ firstName: 'Prince' });
            expect(profile.initials).toBe('P');
        });

        it('should handle empty names', () => {
            const profile = new Profile();
            expect(profile.initials).toBe('');
        });
    });

    describe('fullName', () => {
        it('should return full name', () => {
            const profile = new Profile({ firstName: 'John', lastName: 'Doe' });
            expect(profile.fullName).toBe('John Doe');
        });

        it('should trim when only first name', () => {
            const profile = new Profile({ firstName: 'John' });
            expect(profile.fullName).toBe('John');
        });

        it('should trim when only last name', () => {
            const profile = new Profile({ lastName: 'Doe' });
            expect(profile.fullName).toBe('Doe');
        });

        it('should return empty string with no names', () => {
            const profile = new Profile();
            expect(profile.fullName).toBe('');
        });
    });

    describe('Validation', () => {
        it('should be savable with firstName', () => {
            const profile = new Profile({ firstName: 'John' });
            expect(profile.isSavable()).toBe(true);
        });

        it('should not be savable without firstName', () => {
            const profile = new Profile();
            expect(profile.isSavable()).toBe(false);
        });

        it('should not be savable with empty firstName', () => {
            const profile = new Profile({ firstName: '   ' });
            expect(profile.isSavable()).toBe(false);
        });
    });

    describe('toString', () => {
        it('should return full name', () => {
            const profile = new Profile({ firstName: 'John', lastName: 'Doe' });
            expect(profile.toString()).toBe('John Doe');
        });
    });
});
