// lib/useCrowdPercentage.ts

import { useEffect, useState } from "react";
import { realtimeDB } from "@/services/firebase";
import { ref, onValue } from "firebase/database";

export function useCrowdPercentage(
    id?: string,
    capacity?: number
) {
    const [crowdPercentage, setCrowdPercentage] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // if we don't have the bits to even subscribe, bail out immediately
        if (!id || capacity == null) {
            setCrowdPercentage(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const path = `logs/${id}`;
        console.log("👀 Subscribing to RealtimeDB path:", path);
        const logRef = ref(realtimeDB, path);

        const unsubscribe = onValue(
            logRef,
            (snapshot) => {
                const data = snapshot.val();
                if (!data) {
                    setCrowdPercentage(null);
                    setLoading(false);
                    return;
                }

                const logsArray = Object.values(data) as Array<{
                    count: number;
                    timestamp: number;
                    deviceId?: string;
                    deviceID?: string;
                }>;

                if (logsArray.length === 0) {
                    setCrowdPercentage(null);
                    setLoading(false);
                    return;
                }

                // sort descending
                const latest = logsArray.sort((a, b) => b.timestamp - a.timestamp)[0];
                if (typeof latest.count === "number") {
                    const percent = Math.min((latest.count / capacity) * 100, 100);
                    setCrowdPercentage(Math.round(percent));
                } else {
                    console.warn("⚠️ Invalid log entry", latest);
                    setCrowdPercentage(null);
                }
                setLoading(false);
            },
            (error) => {
                console.error("🔥 RealtimeDB error:", error);
                setLoading(false);
            }
        );

        return () => {
            console.log("🔌 Unsubscribing from:", path);
            unsubscribe();
        };
    }, [id, capacity]);

    return { crowdPercentage, loading };
}
