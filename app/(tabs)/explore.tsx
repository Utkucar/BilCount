// app/explore.tsx
import React from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFirebase } from '@/lib/useFirebase';
import { getLocations } from '@/services/firebase';
import images from '@/constants/images';
import { router } from 'expo-router';

// Define type for a location
export interface Location {
    id: string;
    name: string;
    coordinates?: { latitude: number; longitude: number };
}


export default function Explore() {
    // Fetch up to 100 properties one-off
    const {
        data: docs,
        loading,
    } = useFirebase(getLocations, { filter: 'All', query: '', limit: 100 });

    const locations: { id: string; name: string; coordinates: { lat: any; lng: any } }[] = React.useMemo(
        () =>
            docs
                ? docs.map((d) => ({
                    id: d.id,
                    name: d.name,
                    coordinates: {
                        lat: d.latitude?.latitude ?? 0,
                        lng: d.longitude?.longitude ?? 0,
                    },
                }))
                : [],
        [docs]
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" />
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
                {locations.map((loc) => (
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
