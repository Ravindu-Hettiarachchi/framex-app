import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

type Package = {
  _id: string;
  title: string;
  price: number;
  description: string;
  image?: string;
  features?: string[];
};

export default function PackagesScreen() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/packages`);
      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to fetch packages");
        return;
      }

      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Fetch packages error:", error);
      Alert.alert("Error", "Could not fetch packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    loadUser();
  }, []);

  const handleBookNow = (pkg: Package) => {
    console.log("Book Package pressed:", pkg.title);

    if (!user) {
      router.push("/login");
      return;
    }

    router.push({
      pathname: "/(tabs)/bookings",
      params: {
        packageId: pkg._id,
        title: pkg.title,
        price: String(pkg.price),
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0F", paddingTop: 80 }}>
      <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
        <Text
          style={{
            color: "#F5F1E8",
            fontSize: 32,
            fontWeight: "700",
          }}
        >
          Our Packages
        </Text>

        <Text
          style={{
            color: "#A1A1AA",
            fontSize: 15,
            marginTop: 8,
            lineHeight: 22,
          }}
        >
          Choose a premium photography package tailored to your timeless
          moments.
        </Text>
      </View>

      <FlatList
        data={packages}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: "#7C7C85", textAlign: "center", marginTop: 40 }}>
              No packages available at the moment.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#15151B",
              borderRadius: 22,
              marginBottom: 20,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#23232B",
            }}
          >
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={{ width: "100%", height: 180 }}
                contentFit="cover"
              />
            )}

            <View style={{ padding: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#F5F1E8", fontSize: 22, fontWeight: "700" }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{ color: "#C6A96B", fontSize: 18, fontWeight: "700" }}
                >
                  Rs. {item.price}
                </Text>
              </View>

              <Text
                style={{
                  color: "#A1A1AA",
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {item.description}
              </Text>

              <TouchableOpacity
                onPress={() => handleBookNow(item)}
                style={{
                  backgroundColor: "#C6A96B",
                  paddingVertical: 14,
                  borderRadius: 14,
                  marginTop: 20,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#0B0B0F", fontWeight: "700", fontSize: 16 }}
                >
                  Book Package
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#0B0B0F"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}