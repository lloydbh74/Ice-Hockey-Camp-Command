import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifySession } from './admin-auth';
import * as dbActions from './db';
import { mockD1 } from '../../tests/setup';
import { D1Database } from '@cloudflare/workers-types';

// Mock cookies
vi.mock('next/headers', () => ({
    cookies: vi.fn().mockReturnValue({
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    })
}));

// Mock db actions
vi.mock('./db', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        getAdminSession: vi.fn(),
        deleteAdminSession: vi.fn(),
    };
});

describe('Admin Auth Logic (admin-auth.ts)', () => {
    const db = mockD1 as unknown as D1Database;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('verifySession', () => {
        it('should return email for valid non-expired session', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            vi.mocked(dbActions.getAdminSession).mockResolvedValueOnce({
                id: 'sess_1',
                email: 'admin@camp.com',
                expires_at: futureDate.toISOString()
            });

            const result = await verifySession(db, 'sess_1');
            expect(result).toBe('admin@camp.com');
        });

        it('should return null and delete session if expired', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            vi.mocked(dbActions.getAdminSession).mockResolvedValueOnce({
                id: 'sess_expired',
                email: 'admin@camp.com',
                expires_at: pastDate.toISOString()
            });

            const result = await verifySession(db, 'sess_expired');

            expect(result).toBeNull();
            expect(dbActions.deleteAdminSession).toHaveBeenCalledWith(db, 'sess_expired');
        });

        it('should return null if session not found', async () => {
            vi.mocked(dbActions.getAdminSession).mockResolvedValueOnce(null);

            const result = await verifySession(db, 'sess_missing');
            expect(result).toBeNull();
        });
    });
});
