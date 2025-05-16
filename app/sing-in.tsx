// app/sign-in.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';
import { Redirect, router } from 'expo-router';

const SignIn = () => {
  const { login, refetch, loading, isLoggedIn } = useGlobalContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isLoggedIn) return <Redirect href="/" />;

  const handleLogIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password.trim());
      if (user) {
        await refetch();
        router.replace('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Failed to log in. Please try again.';

      switch (err.code) {
        case 'auth/wrong-password':
          errorMessage = 'The password you entered is incorrect. Please try again.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address format is invalid.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }

      Alert.alert('Login Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="flex-grow px-10 pt-5">
          <Image
            source={images.onboarding}
            className="w-full h-3/6"
            resizeMode="contain"
          />
          <Text className="text-base text-center uppercase font-rubik text-black-200">
            Welcome to BilCount
          </Text>
          <Text className="text-3xl font-rubik-bold text-black-300 text-center mt-2">
            Let's Get You Started!
          </Text>

          <TextInput
            placeholder="Bilkent Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="border border-gray-300 rounded-lg px-4 py-3 mt-8"
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="border border-gray-300 rounded-lg px-4 py-3 mt-4"
          />

          <TouchableOpacity
            onPress={handleLogIn}
            disabled={submitting}
            className="bg-primary-300 rounded-full py-4 mt-6"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-center font-rubik-medium text-lg">
                Log In
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/signup')}
            className="mt-4"
          >
            <Text className="text-center text-sm font-rubik text-primary-300">
              Don't have an account?{' '}
              <Text className="font-rubik-bold">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;
