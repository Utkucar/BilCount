// lib/useFirebase.ts

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

/**
 * One-off async fetch
 * @param fn - async function accepting params of type P
 * @param params - parameters passed to fn (can be any type)
 * @param skip - if true, initial fetch is skipped
 */
export function useFirebase<T, P>(
    fn: (params: P) => Promise<T>,
    params: P,
    skip = false
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (p: P) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fn(p);
            setData(result);
        } catch (e: any) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setError(msg);
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!skip) {
            fetchData(params);
        }
        // only run on mount or when fn reference changes
    }, [fn]);

    const refetch = (newParams?: P) => fetchData(newParams ?? params);

    return { data, loading, error, refetch };
}

/**
 * Real-time subscription hook
 * @param subscribeFn - function that accepts next and onError callbacks and returns an unsubscribe function
 * @param deps - dependency array for restarting the subscription
 */
export function useSubscription<T>(
    subscribeFn: (
        next: (data: T) => void,
        onError?: (err: any) => void
    ) => () => void,
    deps: any[] = []
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeFn(
            d => { setData(d); setLoading(false); },
            e => { console.error(e); setError(e); setLoading(false); }
        );
        return () => unsubscribe();
    }, deps);

    return { data, loading, error };
}
