// app/explore.tsx
import React from 'react';
import {View, Image, ActivityIndicator, TouchableOpacity, Text} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFirebase } from '@/lib/useFirebase';
import { getLocations, Location as FirestoreLocation } from '@/services/firebase';
import images from '@/constants/images';
import { router } from 'expo-router';

// Define the shape we’ll actually render on the map
interface MapPin {
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
}

export default function Explore() {
    // Fetch up to 100 locations (no filtering/search on this screen)
    const {
        data: rawLocations,
        loading,
        error,
        refetch,
    } = useFirebase<FirestoreLocation[], { filter: string; query: string; limit: number }>({
        fn:     getLocations,
        params: { filter: 'All', query: '', limit: 100 },
        skip:   false,
    });

    // Transform FirestoreLocation → MapPin
    const locations: MapPin[] = React.useMemo(() => {
        if (!rawLocations) return [];
        return rawLocations.map((loc) => ({
            id:   loc.id,
            name: loc.name,
            coordinates: {
                lat: loc.coordinates?.latitude  ?? 0,
                lng: loc.coordinates?.longitude ?? 0,
            },
        }));
    }, [rawLocations]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <Text>Error loading locations.</Text>
                <TouchableOpacity onPress={() => refetch()}>
                    <Text>Try Again</Text>
                </TouchableOpacity>
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
                {locations.map((pin) => (
                    <Marker
                        key={pin.id}
                        coordinate={{
                            latitude: pin.coordinates.lat,
                            longitude: pin.coordinates.lng,
                        }}
                        title={pin.name}
                        onPress={() => router.push(`/locations/${pin.id}`)}
                    />
                ))}
            </MapView>
        </SafeAreaView>
    );
}
