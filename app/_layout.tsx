import { Slot, SplashScreen, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { GlobalProvider, useGlobalContext } from '@/lib/global-provider';
import './global.css';

export default function RootLayout() {
    const { isLoggedIn, loading } = useGlobalContext();
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        'Rubik-Bold': require('../assets/fonts/Rubik-Bold.ttf'),
        'Rubik-ExtraBold': require('../assets/fonts/Rubik-ExtraBold.ttf'),
        'Rubik-Light': require('../assets/fonts/Rubik-Light.ttf'),
        'Rubik-Regular': require('../assets/fonts/Rubik-Regular.ttf'),
        'Rubik-Medium': require('../assets/fonts/Rubik-Medium.ttf'),
        'Rubik-SemiBold': require('../assets/fonts/Rubik-SemiBold.ttf'),
    });

    const [appReady, setAppReady] = useState(false);

    // Load fonts and delay for any native initialization
    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.preventAutoHideAsync();
            (async () => {
                // small delay to ensure auth state resolves
                await new Promise(res => setTimeout(res, 200));
                setAppReady(true);
                await SplashScreen.hideAsync();
            })();
        }
    }, [fontsLoaded]);

    // Auth guard: redirect based on login state
    useEffect(() => {
        if (!loading && appReady) {
            const path = router.pathname;
            if (isLoggedIn) {
                if (path === '/sign-in' || path === '/signup') {
                    router.replace('/');
                }
            } else {
                if (path !== '/sign-in' && path !== '/signup') {
                    router.replace('/sign-in');
                }
            }
        }
    }, [loading, isLoggedIn, appReady]);

    // Render nothing until ready
    if (!fontsLoaded || !appReady || loading) {
        return null;
    }

    return (
        <GlobalProvider>
            <Slot />
        </GlobalProvider>
    );
}
