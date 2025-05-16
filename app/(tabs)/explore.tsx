import React from 'react';
import { View, Image, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFirebase } from '@/lib/useFirebase';
import { getLocations, Location as FirestoreLocation } from '@/services/firebase';
import images from '@/constants/images';
import { router } from 'expo-router';

interface MapPin {
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
}

export default function Explore() {
    const { data: rawLocations, loading, error, refetch } =
        useFirebase<FirestoreLocation[], { filter: string; query: string; limit: number }>({
            fn:     getLocations,
            params: { filter: 'All', query: '', limit: 100 },
            skip:   false,
        });

    const locations: MapPin[] = React.useMemo(() => {
        if (!rawLocations) return [];

        return rawLocations.map((loc) => {
            const lat = loc.coordinates?.lat ?? 0;
            const lng = loc.coordinates?.lng ?? 0;

            return {
                id:   loc.id,
                name: loc.name,
                coordinates: { lat, lng },
            };
        });
    }, [rawLocations]);

    // **Debug**: log your pins to make sure they're valid
    console.log('🔍 Map pins:', locations);

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }
    if (error) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Error loading locations.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Logo */}
            <View style={{ alignItems: 'center', paddingTop: 16 }}>
                <Image source={images.bilcount} style={{ width: 160, height: 48 }} resizeMode="contain" />
            </View>

            <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1, width: '100%' }}
                initialRegion={{
                    latitude: 39.8698,
                    longitude: 32.7503,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation
                showsMyLocationButton
            >
                {locations.map((pin) =>
                    pin.coordinates.lat !== 0 && pin.coordinates.lng !== 0 ? (
                        <Marker
                            key={pin.id}
                            coordinate={{
                                latitude: pin.coordinates.lat,
                                longitude: pin.coordinates.lng,
                            }}
                            title={pin.name}
                            onPress={() => router.push(`/locations/${pin.id}`)}
                        />
                    ) : null
                )}
            </MapView>
        </SafeAreaView>
    );
}
