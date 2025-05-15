// app/profile.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    TextInput,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';
import { updatePassword as firebaseUpdatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { router } from 'expo-router';

interface SettingsItemProps {
    icon: any;
    title: string;
    onPress?: () => void;
    textStyle?: string;
    showArrow?: boolean;
}

const SettingsItem = ({ icon, title, onPress, textStyle = '', showArrow = true }: SettingsItemProps) => (
    <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between py-3">
        <View className="flex-row items-center gap-3">
            <Image source={icon} className="w-6 h-6" />
            <Text className={`text-lg font-rubik-medium text-black-300 ${textStyle}`}>{title}</Text>
        </View>
        {showArrow && <Image source={icons.rightArrow} className="w-5 h-5" />}
    </TouchableOpacity>
);

export default function Profile() {
    const { user, refetch, logout } = useGlobalContext();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert('Success!', 'You have been logged out!');
            refetch();
            router.replace('/sign-in');
        } catch (err) {
            Alert.alert('Failed to logout');
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        const firebaseUser = auth.currentUser;
        if (!firebaseUser || !user?.email) {
            Alert.alert('Error', 'No authenticated user.');
            return;
        }
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(firebaseUser, credential);
            await firebaseUpdatePassword(firebaseUser, newPassword);
            Alert.alert('Success!', 'Password changed successfully!');
            setModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Password change error:', error);
            Alert.alert('Error', error.message || 'Failed to change password.');
        }
    };

    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20 }}>
                <View className="flex-row justify-end mt-5">
                    <Image source={icons.bell} className="w-5 h-5 mr-5" />
                </View>

                <View className="items-center mt-5">
                    <Image
                        source={{ uri: user?.avatar }}
                        className="w-44 h-44 rounded-full border-2"
                    />
                    <TouchableOpacity className="absolute bottom-0 right-5">
                        <Image source={icons.edit} className="w-9 h-9" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-rubik-extrabold mt-4">
                        {user?.name.split('.')[0] || 'User'}
                    </Text>
                </View>

                <View className="mt-10">
                    <SettingsItem icon={icons.info} title="History" />
                    <SettingsItem icon={icons.wallet} title="Support Us" />
                    <SettingsItem
                        icon={icons.edit}
                        title="Change Password"
                        onPress={() => setModalVisible(true)}
                    />
                </View>

                <View className="mt-5 border-t border-primary-200 pt-5">
                    <SettingsItem
                        icon={icons.logout}
                        title="Logout"
                        textStyle="text-danger"
                        showArrow={false}
                        onPress={handleLogout}
                    />
                </View>
            </ScrollView>

            {/* Change Password Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-center items-center bg-black/60">
                    <View className="w-11/12 bg-white p-6 rounded-2xl">
                        <Text className="text-xl font-rubik-bold mb-4 text-center">Change Password</Text>
                        <TextInput
                            className="border p-3 rounded-lg my-2"
                            placeholder="Current Password"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <TextInput
                            className="border p-3 rounded-lg my-2"
                            placeholder="New Password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TextInput
                            className="border p-3 rounded-lg my-2"
                            placeholder="Confirm New Password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <View className="flex-row justify-between mt-5">
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="w-5/12 bg-gray-300 p-3 rounded-lg mr-2">
                                <Text className="text-center text-black">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePasswordChange} className="w-5/12 bg-primary-300 p-3 rounded-lg ml-2">
                                <Text className="text-center text-white">Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
