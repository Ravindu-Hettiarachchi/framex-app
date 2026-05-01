import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Api";

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/bookings/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to fetch bookings");
        return;
      }

      setBookings(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not fetch bookings");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/bookings/admin/status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Update failed");
        return;
      }

      Alert.alert("Success", `Booking ${status}`);
      fetchBookings();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not update booking");
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Delete failed");
        return;
      }

      Alert.alert("Success", "Booking deleted");
      fetchBookings();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not delete booking");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0F", paddingTop: 80 }}>
      <Text
        style={{
          color: "#F5F1E8",
          fontSize: 28,
          fontWeight: "700",
          paddingHorizontal: 24,
          marginBottom: 20,
        }}
      >
        Manage Bookings
      </Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#15151B",
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "#23232B",
              padding: 18,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: "#F5F1E8", fontSize: 17, fontWeight: "600" }}>
              {item.userId?.name || "User"}
            </Text>

            <Text style={{ color: "#A1A1AA", marginTop: 4 }}>
              {item.userId?.email || "No email"}
            </Text>

            <Text style={{ color: "#C6A96B", marginTop: 10, fontSize: 16 }}>
              {item.packageId?.title || "Package"}
            </Text>

            <Text style={{ color: "#A1A1AA", marginTop: 4 }}>
              Rs. {item.packageId?.price || "N/A"}
            </Text>

            <Text style={{ color: "#A1A1AA", marginTop: 8 }}>
              {new Date(item.date).toDateString()}
            </Text>

            <Text style={{ color: "#F5F1E8", marginTop: 8 }}>
              Status: {item.status}
            </Text>

            <View style={{ flexDirection: "row", marginTop: 16, gap: 10 }}>
              <TouchableOpacity
                onPress={() => updateStatus(item._id, "Approved")}
                style={{
                  flex: 1,
                  backgroundColor: "#C6A96B",
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#0B0B0F", textAlign: "center", fontWeight: "600" }}>
                  Approve
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updateStatus(item._id, "Rejected")}
                style={{
                  flex: 1,
                  backgroundColor: "#7A1F1F",
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#F5F1E8", textAlign: "center", fontWeight: "600" }}>
                  Reject
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => deleteBooking(item._id)}
              style={{
                marginTop: 10,
                backgroundColor: "#2A2A33",
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#F5F1E8", textAlign: "center", fontWeight: "600" }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}