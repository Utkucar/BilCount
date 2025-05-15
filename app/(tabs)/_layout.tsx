// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { icons } from '@/constants/icons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#4CAF50',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderColor: '#eee',
                    height: 60,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Image
                            source={icons.home}
                            style={{ tintColor: color, width: 24, height: 24 }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color, focused }) => (
                        <Image
                            source={icons.search}
                            style={{ tintColor: color, width: 24, height: 24 }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Image
                            source={icons.person}
                            style={{ tintColor: color, width: 24, height: 24 }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="locations"
                options={{
                    title: 'Locations',
                    tabBarIcon: ({ color, focused }) => (
                        <Image
                            source={icons.location}
                            style={{ tintColor: color, width: 24, height: 24 }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
