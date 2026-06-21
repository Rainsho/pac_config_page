'use client';

import { useEffect, useRef, useCallback } from 'react';

type SSECallback = (data: unknown) => void;

export function useSSE(events: Record<string, SSECallback>) {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const es = new EventSource('/api/fs/progress/events');

    for (const [event, handler] of Object.entries(events)) {
      es.addEventListener(event, (e) => {
        try {
          const data = JSON.parse(e.data);
          handler(data);
        } catch {
          // ignore parse errors
        }
      });
    }

    return () => es.close();
    // Only connect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
