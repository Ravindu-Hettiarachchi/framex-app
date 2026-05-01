import { View, Text, FlatList, Alert } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Api";

type Booking = {
  _id: string;
  packageId: any;
  userId: any;
  date: string;
  status: string;
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to fetch bookings");
        return;
      }

      setBookings(data);
    } catch (error) {
      console.log("Fetch bookings error:", error);
      Alert.alert("Error", "Could not fetch bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0F", paddingTop: 80 }}>
      <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
        <Text
          style={{
            color: "#F5F1E8",
            fontSize: 28,
            fontWeight: "700",
          }}
        >
          My Bookings
        </Text>

        <Text
          style={{
            color: "#A1A1AA",
            fontSize: 14,
            marginTop: 8,
          }}
        >
          Review your reserved photography sessions.
        </Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={{ color: "#F5F1E8", paddingHorizontal: 24 }}>
            No bookings found
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#15151B",
              padding: 18,
              marginBottom: 14,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "#23232B",
            }}
          >
            <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "600" }}>
              {item.packageId?.title || "Unknown Package"}
            </Text>

            <Text style={{ color: "#C6A96B", marginTop: 6, fontSize: 15 }}>
              Rs. {item.packageId?.price || "N/A"}
            </Text>

            <Text style={{ color: "#A1A1AA", marginTop: 8 }}>
              {new Date(item.date).toDateString()}
            </Text>

            <Text style={{ color: "#F5F1E8", marginTop: 8 }}>
              Status: {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}