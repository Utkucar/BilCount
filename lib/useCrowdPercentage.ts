import { useEffect, useState } from "react";
import { realtimeDB } from "@/services/firebase";
import { ref, onValue } from "firebase/database";

export function useCrowdPercentage(id: string | undefined, capacity: number | undefined) {
    const [crowdPercentage, setCrowdPercentage] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || capacity === undefined) {
            setCrowdPercentage(null);
            setLoading(true);
            return;
        }

        const logRef = ref(realtimeDB, `logs/${id}`);
        console.log("👀 Subscribing to RealtimeDB path:", `logs/${id}`);

        const unsubscribe = onValue(
            logRef,
            (snapshot) => {
                console.log("📥 onValue triggered");
                const data = snapshot.val();
                console.log("📥 Snapshot val:", data);

                if (!data) {
                    setCrowdPercentage(null);
                    setLoading(false);
                    return;
                }

                const logsArray = Object.values(data) as {
                    count: number;
                    timestamp: number;
                    deviceId?: string;   // ✅ support lowercase
                    deviceID?: string;   // legacy support if needed
                }[];

                if (logsArray.length === 0) {
                    setCrowdPercentage(null);
                    setLoading(false);
                    return;
                }

                // Sort logs descending by timestamp
                logsArray.sort((a, b) => b.timestamp - a.timestamp);
                const latestLog = logsArray[0];

                if (latestLog && typeof latestLog.count === "number") {
                    const fullness = Math.min((latestLog.count / capacity) * 100, 100);
                    console.log(`✅ Latest log: count=${latestLog.count}, timestamp=${latestLog.timestamp}`);
                    setCrowdPercentage(Math.round(fullness));
                } else {
                    console.warn("⚠️ Invalid latest log entry:", latestLog);
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
            console.log("🔌 Unsubscribing from RealtimeDB path:", `logs/${id}`);
            unsubscribe();
        };
    }, [id, capacity]);

    return { crowdPercentage, loading };
}
