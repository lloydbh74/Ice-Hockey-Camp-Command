import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCampDays, getSessionsForDay, associateProductWithCamp } from './db';
import { mockD1 } from '../../tests/setup';
import { D1Database } from '@cloudflare/workers-types';

describe('Database Logic (db.ts)', () => {
    const db = mockD1 as unknown as D1Database;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCampDays', () => {
        it('should return results array from D1 result', async () => {
            const mockDays = [{ id: 1, label: 'Day 1' }];
            mockD1.all.mockResolvedValueOnce({ results: mockDays });

            const result = await getCampDays(db, 1);

            expect(result).toEqual(mockDays);
            expect(mockD1.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM CampDays'));
        });
    });

    describe('getSessionsForDay', () => {
        it('should parse comma-separated stream IDs into number array', async () => {
            const mockRawSessions = [
                { id: 10, name: 'Ice Session', stream_ids: '1,2,3' }
            ];
            mockD1.all.mockResolvedValueOnce({ results: mockRawSessions });

            const result = await getSessionsForDay(db, 1);

            expect(result[0].stream_ids).toEqual([1, 2, 3]);
        });

        it('should handle empty stream IDs', async () => {
            const mockRawSessions = [
                { id: 11, name: 'Dryland', stream_ids: null }
            ];
            mockD1.all.mockResolvedValueOnce({ results: mockRawSessions });

            const result = await getSessionsForDay(db, 1);

            expect(result[0].stream_ids).toEqual([]);
        });
    });

    describe('Smart Sync (associateProductWithCamp)', () => {
        it('should create a stream if product has form_template_id and stream missing', async () => {
            // 1. Mock product fetch
            mockD1.first.mockResolvedValueOnce({ id: 5, name: 'Goalie Ticket', form_template_id: 100 });
            // 2. Mock association insert
            mockD1.run.mockResolvedValueOnce({ success: true });
            // 3. Mock stream check (return null = doesn't exist)
            mockD1.first.mockResolvedValueOnce(null);
            // 4. Mock stream insert
            mockD1.run.mockResolvedValueOnce({ success: true });

            await associateProductWithCamp(db, { campId: 1, productId: 5, price: 500 });

            // Verify stream check was called
            expect(mockD1.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM Streams'));
            // Verify stream insert was called
            expect(mockD1.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO Streams'));
        });

        it('should NOT create a stream if product has no form_template_id', async () => {
            // 1. Mock product fetch (no form_template_id)
            mockD1.first.mockResolvedValueOnce({ id: 6, name: 'Jersey' });
            // 2. Mock association insert
            mockD1.run.mockResolvedValueOnce({ success: true });

            await associateProductWithCamp(db, { campId: 1, productId: 6, price: 50 });

            // Should not check for streams
            expect(mockD1.prepare).not.toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM Streams'));
        });
    });
});
