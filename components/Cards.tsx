import icons from "@/constants/icons";
import images from "@/constants/images";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Location as FirestoreLocation } from "@/services/firebase";
import { useGlobalContext } from '@/lib/global-provider';

// Extend FirestoreLocation with UI-specific fields
interface CardItem extends FirestoreLocation {
  rating?: number;
  address?: string;
  price?: number;
}

interface Props {
  item: CardItem;
  onPress?: () => void;
}

export const FeaturedCard = ({ item, onPress }: Props) => {
  const { user, toggleFavorite } = useGlobalContext();
  const isFav = user?.favLocations.includes(item.id) ?? false;

  return (
      <TouchableOpacity
          onPress={onPress}
          className="flex flex-col items-start w-60 h-80 relative"
      >
        {/* Background Image */}
        <Image source={{ uri: item.image }} className="size-full rounded-2xl" />

        {/* Gradient Overlay */}
        <Image
            source={images.cardGradient}
            className="size-full rounded-2xl absolute bottom-0"
        />

        {/* Favorite Toggle */}
        <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            className="absolute top-3 right-3 p-1 bg-white rounded-full z-50"
            style={{ elevation: 5 }}
        >
          <Image
              source={isFav ? icons.heartFilled : icons.heart}
              className="w-6 h-6"
          />
        </TouchableOpacity>

        {/* Rating Badge */}
        {item.rating != null && (
            <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 left-5 z-40">
              <Image source={icons.star} className="size-3.5" />
              <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
                {item.rating}
              </Text>
            </View>
        )}

        {/* Content */}
        <View className="flex flex-col items-start absolute bottom-5 inset-x-5 z-40">
          <Text
              className="text-xl font-rubik-extrabold text-white"
              numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.address && (
              <Text className="text-base font-rubik text-white" numberOfLines={1}>
                {item.address}
              </Text>
          )}

          <View className="flex flex-row items-center justify-between w-full">
            {item.price != null && (
                <Text className="text-xl font-rubik-extrabold text-white">
                  ${item.price}
                </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
  );
};

export const Card = ({ item, onPress }: Props) => {
  const { user, toggleFavorite } = useGlobalContext();
  const isFav = user?.favLocations.includes(item.id) ?? false;

  return (
      <TouchableOpacity
          className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
          onPress={onPress}
      >
        {/* Favorite Toggle */}
        <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            className="absolute top-3 right-3 p-1 bg-white rounded-full z-50"
            style={{ elevation: 5 }}
        >
          <Image
              source={isFav ? icons.heartFilled : icons.heart}
              className="w-5 h-5"
              tintColor="#191D31"
          />
        </TouchableOpacity>

        {/* Rating Badge */}
        {item.rating != null && (
            <View className="flex flex-row items-center absolute px-2 top-5 left-5 bg-white/90 p-1 rounded-full z-40">
              <Image source={icons.star} className="size-2.5" />
              <Text className="text-xs font-rubik-bold text-primary-300 ml-0.5">
                {item.rating}
              </Text>
            </View>
        )}

        {/* Main Image */}
        <Image source={{ uri: item.image }} className="w-full h-40 rounded-lg" />

        {/* Text Content */}
        <View className="flex flex-col mt-2">
          <Text className="text-base font-rubik-bold text-black-300">
            {item.name}
          </Text>
          {item.address && (
              <Text className="text-xs font-rubik text-black-100">
                {item.address}
              </Text>
          )}
        </View>
      </TouchableOpacity>
  );
};
