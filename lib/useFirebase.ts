// lib/useFirebase.ts

import { useEffect, useState } from "react";
import { Alert } from "react-native";

// --- One-off async fetch hook --------------------------------------------
interface UseFirebaseOptions<T, P extends Record<string, any>> {
    fn: (params: P) => Promise<T>;
    params?: P;
    skip?: boolean;
}

interface UseFirebaseReturn<T, P> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (newParams?: P) => Promise<void>;
}

export function useFirebase<T, P extends Record<string, any>>({
                                                                  fn,
                                                                  params = {} as P,
                                                                  skip = false,
                                                              }: UseFirebaseOptions<T, P>): UseFirebaseReturn<T, P> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<string | null>(null);
    const [lastParams, setLastParams] = useState<P>(params);

    const fetchData = async (fetchParams: P) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fn(fetchParams);
            setData(result);
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "An unknown error occurred";
            setError(errorMessage);
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // initial fetch on mount
    useEffect(() => {
        if (!skip) {
            fetchData(lastParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refetch = async (newParams?: P) => {
        const toUse = newParams ?? lastParams;
        setLastParams(toUse);
        await fetchData(toUse);
    };

    return { data, loading, error, refetch };
}

// --- Real-time subscription hook -----------------------------------------
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
            (d) => { setData(d); setLoading(false); },
            (e) => { console.error(e); setError(e); setLoading(false); }
        );
        return () => unsubscribe();
    }, deps);

    return { data, loading, error };
}
