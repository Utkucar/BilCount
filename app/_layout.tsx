// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Slot, SplashScreen, usePathname, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { GlobalProvider, useGlobalContext } from '@/lib/global-provider';
import './global.css';

/**
 * Inner layout runs inside GlobalProvider and handles auth guard
 */
function AuthGuard() {
    const { isLoggedIn, loading } = useGlobalContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (isLoggedIn) {
                // Redirect away from auth pages once logged in
                if (pathname === '/sign-in' || pathname === '/signup') {
                    router.replace('/');
                }
            } else {
                // If not logged in, force to sign-in
                if (pathname !== '/sign-in' && pathname !== '/signup') {
                    router.replace('/sign-in');
                }
            }
        }
    }, [isLoggedIn, loading, pathname]);

    if (loading) {
        return null;
    }

    return <Slot />;
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'Rubik-Bold': require('../assets/fonts/Rubik-Bold.ttf'),
        'Rubik-ExtraBold': require('../assets/fonts/Rubik-ExtraBold.ttf'),
        'Rubik-Light': require('../assets/fonts/Rubik-Light.ttf'),
        'Rubik-Regular': require('../assets/fonts/Rubik-Regular.ttf'),
        'Rubik-Medium': require('../assets/fonts/Rubik-Medium.ttf'),
        'Rubik-SemiBold': require('../assets/fonts/Rubik-SemiBold.ttf'),
    });

    const [appReady, setAppReady] = useState(false);

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.preventAutoHideAsync();
            setAppReady(true);
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded || !appReady) {
        return null;
    }

    return (
        <GlobalProvider>
            <AuthGuard />
        </GlobalProvider>
    );
}
