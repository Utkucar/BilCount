// app/locations/[id].tsx
import React from "react";
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Progress from "react-native-progress";
import { useSubscription } from "@/lib/useFirebase";
import { useCrowdPercentage } from "@/lib/useCrowdPercentage";
import { db } from "@/services/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import icons from "@/constants/icons";
import { locationImages } from "@/constants/locationImages";

export default function LocationDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();

    // Firestore subscription for location metadata
    const { data: location, loading: locationLoading } = useSubscription<any>(
        (next, onError) => {
            if (!id) { onError?.("No ID"); return () => {};
            }
            const unsub = onSnapshot(
                doc(db, "locations", id),
                snap => next(snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null),
                onError
            );
            return unsub;
        },
        [id]
    );

    // RealtimeDB hook for crowd percentage
    const {
        crowdPercentage,
        loading: crowdLoading
    } = useCrowdPercentage(id, location?.capacity);

    // Determine progress color based on thresholds
    const getProgressColor = (percent: number | null) => {
        if (percent == null) return '#00f';
        if (percent <= 20) return '#4caf50';      // green
        if (percent <= 50) return '#ffff50'; //yellow
        if (percent <= 80) return '#ff8700';      // orange
        return '#f44336';                        // red
    };

    const events = [
        { time: '10:00 AM', title: 'Yoga Class' },
        { time: '1:00 PM', title: 'Lunch Meetup' },
        { time: '3:30 PM', title: 'Guest Lecture' },
    ];

    if (locationLoading || crowdLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0061FF" />
            </View>
        );
    }

    if (!location) {
        return (
            <View style={styles.centered}>
                <Text style={styles.notFound}>Location not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.button}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
                    <Image source={icons.backArrow} style={styles.backIcon} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <Image
                    source={locationImages[location.id] ?? { uri: location.image }}
                    style={styles.heroImage}
                />
                <Text style={styles.title}>{location.name}</Text>
                <Text style={styles.subtitle}>{location.description}</Text>

                {/* Occupancy with circular progress */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Occupancy</Text>
                    <View style={styles.circleContainer}>
                        <Progress.Circle
                            size={120}
                            progress={(crowdPercentage ?? 0) / 100}
                            color={getProgressColor(crowdPercentage)}
                            showsText
                            animated
                            formatText={() => `${crowdPercentage ?? 0}%`}
                            thickness={10}
                        />
                    </View>
                </View>

                {/* Temperature & Noise row */}
                <View style={[styles.row, styles.section]}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>Temperature</Text>
                        <Text style={styles.infoValue}>22.5°C</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>Noise Level</Text>
                        <Text style={styles.infoValue}>65 dB</Text>
                    </View>
                </View>

                {/* Scheduled Events */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    {events.map((e) => (
                        <View key={e.time} style={styles.eventRow}>
                            <Text style={styles.eventTime}>{e.time}</Text>
                            <Text style={styles.eventTitle}>{e.title}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    scroll: { padding: 20, paddingBottom: 40 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    backIcon: { width: 24, height: 24, marginRight: 8 },
    backText: { fontSize: 18, fontWeight: '500', color: '#000' },
    heroImage: { width: '100%', height: 240, borderRadius: 12, marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: '#111' },
    subtitle: { fontSize: 16, color: '#555', marginBottom: 20 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
    circleContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    infoBox: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
    infoTitle: { fontSize: 16, color: '#333' },
    infoValue: { fontSize: 22, fontWeight: '700', color: '#000', marginTop: 4 },
    eventRow: { flexDirection: 'row', marginBottom: 12 },
    eventTime: { width: 80, fontSize: 16, color: '#777' },
    eventTitle: { fontSize: 16, fontWeight: '500', color: '#333' },
    notFound: { fontSize: 18, color: '#333' },
    button: { marginTop: 16, backgroundColor: '#0061FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    buttonText: { color: 'white', fontSize: 16 },
});