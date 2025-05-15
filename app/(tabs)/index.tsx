// app/index.tsx
import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import Search from '@/components/Search';
import { FeaturedCard, Card } from '@/components/Cards';
import { Filter } from '@/components/Filters';
import { useGlobalContext } from '@/lib/global-provider';
import {
  getLatestProperties,
  getProperties,
} from '@/services/firebase';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export default function Home() {
  const { user } = useGlobalContext();
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  const filter = params.filter || 'All';
  const query = params.query || '';

  const [latest, setLatest] = useState<Location[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);

  const [properties, setProperties] = useState<Location[]>([]);
  const [propsLoading, setPropsLoading] = useState(true);

  // Fetch latest 5
  useEffect(() => {
    (async () => {
      setLatestLoading(true);
      try {
        const docs = await getLatestProperties(5);
        setLatest(
            docs.map((d) => ({
              id: d.id,
              name: d.name,
              latitude: Number(d.latitude),
              longitude: Number(d.longitude),
            }))
        );
      } catch (err) {
        console.error('Error loading latest:', err);
      } finally {
        setLatestLoading(false);
      }
    })();
  }, []);

  // Fetch filtered & searched
  useEffect(() => {
    (async () => {
      setPropsLoading(true);
      try {
        const docs = await getProperties({ filter, query, limit: 6 });
        setProperties(
            docs.map((d) => ({
              id: d.id,
              name: d.name,
              latitude: Number(d.latitude),
              longitude: Number(d.longitude),
            }))
        );
      } catch (err) {
        console.error('Error loading properties:', err);
      } finally {
        setPropsLoading(false);
      }
    })();
  }, [filter, query]);

  // Build favorites from user.favLocations
  const favorites = React.useMemo(() => {
    if (!user?.favLocations || properties.length === 0) return [];
    return properties.filter((p) => user.favLocations.includes(p.id));
  }, [user, properties]);

  const handleCardPress = (id: string) =>
      router.push(`/locations/${id}`);

  return (
      <SafeAreaView className="bg-white h-full">
        <FlatList
            data={properties}
            renderItem={({ item }) => (
                <Card item={item} onPress={() => handleCardPress(item.id)} />
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerClassName="pb-32"
            columnWrapperClassName="flex gap-5 px-5"
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              propsLoading ? (
                  <ActivityIndicator
                      size="large"
                      className="text-primary-300 mt-5"
                  />
              ) : (
                  <Text className="text-center mt-5">No results found</Text>
              )
            }
            ListHeaderComponent={
              <View className="px-5">
                {/* 👤 Greeting */}
                <View className="flex flex-row items-center justify-between mt-5">
                  <View className="flex flex-row items-center">
                    <Image
                        source={{
                          uri:
                              user?.avatar ||
                              'https://ui-avatars.com/api/?name=User',
                        }}
                        className="w-12 h-12 rounded-full"
                    />
                    <View className="ml-2">
                      <Text className="text-xs font-rubik text-black-100">
                        Good Morning
                      </Text>
                      <Text className="text-base font-rubik-medium text-black-300">
                        {user?.name || 'User'}
                      </Text>
                    </View>
                  </View>
                  <Image source={icons.bell} className="w-6 h-6" />
                </View>

                {/* 🔎 Search bar */}
                <Search />

                {/* ❤️ Favorites */}
                <View className="my-5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xl font-rubik-extrabold text-black-300">
                      Favourites
                    </Text>
                    <TouchableOpacity>
                      <Text className="text-base font-rubik-bold text-primary-300">
                        See All
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {favorites.length === 0 ? (
                      <Text className="text-center text-sm text-gray-400 mt-4">
                        You haven’t favorited any locations yet.
                      </Text>
                  ) : (
                      <FlatList
                          data={favorites}
                          renderItem={({ item }) => (
                              <FeaturedCard
                                  item={item}
                                  onPress={() => handleCardPress(item.id)}
                              />
                          )}
                          keyExtractor={(item) => item.id}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerClassName="mt-5 flex-row gap-5"
                      />
                  )}
                </View>

                {/* ⭐ Recommended */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-xl font-rubik-extrabold text-black-300">
                    Our Recommendations
                  </Text>
                  <TouchableOpacity>
                    <Text className="text-base font-rubik-bold text-primary-300">
                      See All
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
        />
      </SafeAreaView>
  );
}
