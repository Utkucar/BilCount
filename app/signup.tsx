// app/signup.tsx
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';

const SignUp = () => {
    const { refetch, signUp } = useGlobalContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        const domain = 'bilkent.edu';
        if (!email.toLowerCase().endsWith(`@${domain}`)) {
            Alert.alert('Invalid Email', `Please use your ${domain} email.`);
            return;
        }

        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            // signUp from context enforces allowed domain internally
            await signUp(email.trim(), password.trim());
            await refetch();

            Alert.alert(
                'Account Created',
                'Your account was created. Please log in with your Bilkent email and password.'
            );

            router.replace('/sign-in');
        } catch (err: any) {
            console.error('Sign up error:', err);
            let errorMessage = err.message || 'Failed to sign up. Please try again.';

            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Try logging in.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address format.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use at least 6 characters.';
            }

            Alert.alert('Sign Up Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="bg-white h-full px-6 pt-10">
            <Text className="text-2xl font-rubik-bold text-center mb-6">
                Create a BilCount Account
            </Text>

            <TextInput
                placeholder="Bilkent Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />

            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />

            <TouchableOpacity
                onPress={handleSignUp}
                disabled={loading}
                className="bg-primary-300 rounded-full py-4"
            >
                <Text className="text-white text-center font-rubik-medium text-lg">
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.replace('/sign-in')}
                className="mt-4"
            >
                <Text className="text-center text-sm font-rubik text-primary-300">
                    Already have an account?{' '}
                    <Text className="font-rubik-bold">Log in</Text>
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default SignUp;