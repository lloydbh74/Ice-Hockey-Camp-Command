import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimelineGrid } from './TimelineGrid';
import React from 'react';

// Mock child components
vi.mock('./SessionCard', () => ({
    SessionCard: ({ session }: any) => <div data-testid="session-card">{session.name}</div>
}));

vi.mock('./SessionForm', () => ({
    SessionForm: () => <div data-testid="session-form" />
}));

vi.mock('./SessionEditForm', () => ({
    SessionEditForm: () => <div data-testid="session-edit-form" />
}));

describe('TimelineGrid Component', () => {
    const mockStreams = [
        { id: 1, name: 'Goalies' },
        { id: 2, name: 'Skaters' }
    ];

    const mockSessions = [
        {
            id: 101,
            camp_day_id: 1,
            name: 'Morning Ice',
            start_time: '08:00',
            end_time: '09:00',
            stream_ids: [1]
        },
        {
            id: 102,
            camp_day_id: 1,
            name: 'Conflict Session',
            start_time: '08:30',
            end_time: '09:30',
            stream_ids: [1]
        }
    ];

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ results: mockSessions })
        }));
    });

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('renders stream names in headers', async () => {
        render(
            <TimelineGrid
                campId={2}
                dayId={1}
                streams={mockStreams}
                onSessionUpdate={() => { }}
            />
        );

        expect(await screen.findByText('Goalies')).toBeInTheDocument();
        expect(screen.getByText('Skaters')).toBeInTheDocument();
    });

    it('renders session cards for the correct streams', async () => {
        render(
            <TimelineGrid
                campId={2}
                dayId={1}
                streams={mockStreams}
                onSessionUpdate={() => { }}
            />
        );

        const cards = await screen.findAllByTestId('session-card');
        expect(cards).toHaveLength(2);
        expect(cards[0]).toHaveTextContent('Morning Ice');
    });

    it('identifies and marks conflicting sessions with ring-red-500', async () => {
        const { container } = render(
            <TimelineGrid
                campId={2}
                dayId={1}
                streams={mockStreams}
                onSessionUpdate={() => { }}
            />
        );

        // Wait for cards to load
        await screen.findAllByTestId('session-card');

        // Both sessions overlap in stream 1
        const conflictElements = container.querySelectorAll('.ring-red-500');
        expect(conflictElements.length).toBeGreaterThan(0);
    });

    it('shows empty state message when no streams provided', async () => {
        render(
            <TimelineGrid
                campId={2}
                dayId={1}
                streams={[]}
                onSessionUpdate={() => { }}
            />
        );

        expect(await screen.findByText(/No streams created yet/)).toBeInTheDocument();
    });
});
