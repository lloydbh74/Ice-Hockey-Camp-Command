import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock D1Database for db.ts tests
export const mockD1 = {
    prepare: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    first: vi.fn(),
    all: vi.fn(),
    run: vi.fn(),
    batch: vi.fn(),
};

// Global mocks
vi.stubGlobal('fetch', vi.fn());

vi.mock('@cloudflare/next-on-pages', () => ({
    getRequestContext: vi.fn(),
}));

// Mock server-only to avoid errors in jsdom
vi.mock('server-only', () => ({}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useParams: () => ({ id: '2' }),
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
}));
