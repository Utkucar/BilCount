// app/locations/[id].tsx
import React from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Progress from "react-native-progress";

import { useSubscription } from "@/lib/useFirebase";
import { db } from "@/services/firebase";
import icons from "@/constants/icons";
import { doc, onSnapshot } from "firebase/firestore";
import {useCrowdPercentage} from "@/lib/useCrowdPercentage";

export default function LocationDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();

    // real-time subscription to the Firestore document
    const { data: location, loading: locationLoading } = useSubscription<any>(
        (next, onError) => {
            if (!id) {
                onError?.("No ID provided");
                return () => {};
            }
            const docRef = doc(db, "locations", id);
            const unsub = onSnapshot(
                docRef,
                (snap) => {
                    if (snap.exists()) {
                        next({ id: snap.id, ...(snap.data() as any) });
                    } else {
                        next(null);
                    }
                },
                onError
            );
            return unsub;
        },
        [id]
    );

    // get current crowd percentage (your existing hook)
    const { crowdPercentage, loading: crowdLoading } =
        useCrowdPercentage(id, location?.capacity);

    if (locationLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0061FF" />
            </View>
        );
    }

    if (!location) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-lg font-rubik-medium text-black-300">
                    Location not found.
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 bg-primary-300 px-4 py-2 rounded-full"
                >
                    <Text className="text-white font-rubik-medium">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getCrowdColor = (value: number | null): string => {
        if (value === null) return "#3B82F6";
        if (value < 50) return "#22C55E";
        if (value < 75) return "#EAB308";
        if (value < 95) return "#F97316";
        return "#EF4444";
    };

    return (
        <SafeAreaView className="bg-white h-full">
            <ScrollView className="px-5">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex flex-row items-center mt-4"
                >
                    <Image source={icons.backArrow} className="w-5 h-5 mr-2" />
                    <Text className="text-base font-rubik-medium text-black-300">
                        Back
                    </Text>
                </TouchableOpacity>

                {location.image && (
                    <Image
                        source={{ uri: location.image }}
                        className="w-full h-60 rounded-xl mt-5"
                    />
                )}

                <View className="mt-5">
                    <Text className="text-2xl font-rubik-extrabold text-black-300">
                        {location.name}
                    </Text>
                    {location.description && (
                        <Text className="text-sm text-black-200 mt-1">
                            {location.description}
                        </Text>
                    )}

                    <View className="mt-4">
                        <Text className="text-lg font-rubik-bold">Capacity</Text>
                        <Text className="text-primary-300 text-xl font-rubik-extrabold">
                            {location.capacity}
                        </Text>
                    </View>

                    <View className="mt-4">
                        <Text className="text-lg font-rubik-bold mb-1">Crowd Level</Text>
                        {crowdLoading ? (
                            <ActivityIndicator size="small" color="#0061FF" />
                        ) : (
                            <View>
                                <Progress.Bar
                                    progress={(crowdPercentage ?? 0) / 100}
                                    width={null}
                                    height={16}
                                    borderRadius={10}
                                    animated
                                    animationType="spring"
                                    color={getCrowdColor(crowdPercentage)}
                                    unfilledColor="#E5E7EB"
                                    borderWidth={0}
                                />
                                <Text className="mt-2 text-sm text-black-300 font-rubik-medium">
                                    {crowdPercentage != null
                                        ? `${crowdPercentage}% full`
                                        : "No data"}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="mt-4">
                        <Text className="text-lg font-rubik-bold">Floor Count</Text>
                        <Text className="text-black-300 text-lg">
                            {location.floorCount}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
