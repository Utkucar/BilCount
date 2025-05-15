// app/explore.tsx
import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProperties } from '@/services/firebase';
import images from '@/constants/images';
import { router } from 'expo-router';

// Define type for a location
interface Location {
    id: string;
    name: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export default function Explore() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const docs = await getProperties({ filter: 'All', limit: 100 });
                const mapped = docs.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    coordinates: {
                        lat: Number(doc.latitude),
                        lng: Number(doc.longitude),
                    },
                }));
                setLocations(mapped);
            } catch (err) {
                console.error('Failed to load locations:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <Image source={images.loader} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header Logo */}
            <View className="items-center justify-center bg-white pt-4">
                <Image
                    source={images.bilcount}
                    className="w-40 h-12"
                    resizeMode="contain"
                />
            </View>

            {/* Map with markers */}
            <MapView
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: 39.8698,
                    longitude: 32.7503,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation
                showsMyLocationButton
            >
                {locations.map(loc => (
                    <Marker
                        key={loc.id}
                        coordinate={{
                            latitude: loc.coordinates.lat,
                            longitude: loc.coordinates.lng,
                        }}
                        title={loc.name}
                        onPress={() => router.push(`/locations/${loc.id}`)}
                    />
                ))}
            </MapView>
        </SafeAreaView>
    );
}
