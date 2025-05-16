// app/index.tsx
import React from 'react';
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
import { useGlobalContext } from '@/lib/global-provider';
import { useFirebase } from '@/lib/useFirebase';
import {
  getLatestLocations,
  getLocations,
} from '@/services/firebase';

interface LocationItem {
  id: string;
  name: string;
  [key: string]: any;
}

export default function Index() {
  const { user } = useGlobalContext();
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  const filter = params.filter || 'All';
  const query = params.query || '';

  // Latest 5 locations
  const {
    data: latest,
      loading: latestLoading,
      refetch: refreshLatest,
    } = useFirebase<LocationItem[], { limit: number }>({
      // wrap the numeric-arg function in an object signature
         fn:     ({ limit }) => getLatestLocations(limit),
         params: { limit: 5 },
     skip:   false,
    });

  // Filtered / searched list, up to 6 items
  const {
    data: locations,
    loading: listLoading,
    refetch: refreshList,
  } = useFirebase<LocationItem[], { filter: string; query: string; limit: number }>({
    fn:     getLocations,
    params: { filter, query, limit: 6 },
    skip:   false,
  });

  // Favorites subset
  const favorites = React.useMemo(() => {
    if (!user?.favLocations || !locations) return [];
    return locations.filter((loc) => user.favLocations.includes(loc.id));
  }, [user, locations]);

  const handleCardPress = (id: string) => {
    router.push(`/locations/${id}`);
  };

  return (
      <SafeAreaView className="bg-white h-full">
        <FlatList
            data={locations ?? []}
            renderItem={({ item }) => (
                <Card item={item} onPress={() => handleCardPress(item.id)} />
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerClassName="pb-32"
            columnWrapperClassName="flex gap-5 px-5"
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              listLoading ? (
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
                    <TouchableOpacity onPress={() => refreshList()}>
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
                  <TouchableOpacity onPress={() => refreshLatest()}>
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
