import { describe, expect, it } from 'vitest';

import { getLocale, formatDate } from '../../src/helpers/formatDate.js';

describe('formatDate', () => {
    it('should return formatted date string', () => {
        const date = new Date(2022, 1, 1);
        const format = {
            language: 'en-US',
            timeFormat: 'hh:mm A',
            dateFormat: 'MMM D, YYYY',
        };
        const result = formatDate(date, format);
        expect(result).toBe('12:00 AM | Feb 1, 2022');
    });

    it('should return empty string if no date is provided', () => {
        const result = formatDate('');
        expect(result).toBe('');
    });
});

describe('getLocale', () => {
    it('should return correct format for en-US', () => {
        Object.defineProperty(window.navigator, 'language', { value: 'en-US', configurable: true });
        const result = getLocale();
        expect(result).toEqual({
            language: 'en-US',
            timeFormat: 'hh:mm A',
            dateFormat: 'MMM D, YYYY',
        });
    });

    it('should return correct format for pl', () => {
        Object.defineProperty(window.navigator, 'language', { value: 'pl', configurable: true });
        const result = getLocale();
        expect(result).toEqual({
            language: 'pl',
            timeFormat: 'HH:mm',
            dateFormat: 'DD-MM-YYYY',
        });
    });

    it('should return default format for unknown language', () => {
        Object.defineProperty(window.navigator, 'language', { value: 'unknown', configurable: true });
        const result = getLocale();
        expect(result).toEqual({
            language: 'en',
            timeFormat: 'HH:mm',
            dateFormat: 'DD-MM-YY',
        });
    });
});
