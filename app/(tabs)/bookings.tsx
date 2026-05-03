import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from "../../constants/Api";
import { Ionicons } from "@expo/vector-icons";

type Booking = {
  _id: string;
  packageId: any;
  userId: any;
  date: string;
  time?: string;
  status: string;
};

export default function BookingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Params from packages screen
  const incomingPackageId = params.packageId as string | undefined;
  const incomingTitle = params.title as string | undefined;
  const incomingPrice = params.price as string | undefined;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);

  // Form state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const isBookingMode = !!incomingPackageId;

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setBookings(data);
    } catch (error) {
      console.log("Fetch bookings error:", error);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();
    fetchBookings();
  }, []);

  const handleConfirmBooking = async () => {
    console.log("Confirm Booking pressed — packageId:", incomingPackageId);
    setFormError("");
    setFormSuccess("");

    if (!date.trim()) {
      setFormError("Please enter a date (e.g. 2025-12-25)");
      return;
    }
    if (!time.trim()) {
      setFormError("Please enter a time (e.g. 10:00 AM)");
      return;
    }
    if (!user) {
      setFormError("You must be logged in to book");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          packageId: incomingPackageId,
          date,
          time,
        }),
      });

      const data = await res.json();
      console.log("Booking response:", data);

      if (!res.ok) {
        setFormError(data.message || "Failed to create booking");
        return;
      }

      setFormSuccess("Booking Created! ✓");
      setDate("");
      setTime("");
      await fetchBookings();

      setTimeout(() => {
        setFormSuccess("");
        router.setParams({ packageId: "", title: "", price: "" });
      }, 2000);
    } catch (error) {
      console.log("Booking error:", error);
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0B0B0F" }}
      contentContainerStyle={{ paddingTop: 80, paddingHorizontal: 24, paddingBottom: 60 }}
    >
      <Text style={{ color: "#F5F1E8", fontSize: 28, fontWeight: "700", marginBottom: 4 }}>
        My Bookings
      </Text>
      <Text style={{ color: "#A1A1AA", fontSize: 14, marginBottom: 28 }}>
        Review your reserved photography sessions.
      </Text>

      {/* ── BOOKING FORM (only shown when coming from Packages) ── */}
      {isBookingMode && (
        <View
          style={{
            backgroundColor: "#15151B",
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: "#C6A96B40",
            marginBottom: 32,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Ionicons name="camera-outline" size={22} color="#C6A96B" style={{ marginRight: 8 }} />
            <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "700" }}>
              Book: {incomingTitle}
            </Text>
          </View>

          <Text style={{ color: "#C6A96B", fontSize: 15, fontWeight: "600", marginBottom: 20 }}>
            Rs. {incomingPrice}
          </Text>

          {/* Error / Success banners */}
          {formError ? (
            <View style={{
              backgroundColor: "#2D1515",
              borderWidth: 1,
              borderColor: "#EF4444",
              borderRadius: 10,
              padding: 12,
              marginBottom: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <Text style={{ color: "#EF4444", fontSize: 14, flex: 1 }}>{formError}</Text>
            </View>
          ) : null}

          {formSuccess ? (
            <View style={{
              backgroundColor: "#152D1A",
              borderWidth: 1,
              borderColor: "#22C55E",
              borderRadius: 10,
              padding: 12,
              marginBottom: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#22C55E" />
              <Text style={{ color: "#22C55E", fontSize: 14, flex: 1 }}>{formSuccess}</Text>
            </View>
          ) : null}

          {/* Date Input */}
          <Text style={{ color: "#A1A1AA", fontSize: 13, marginBottom: 6 }}>Date</Text>
          <TextInput
            placeholder="e.g. 2025-12-25"
            placeholderTextColor="#7C7C85"
            value={date}
            onChangeText={(v) => { setDate(v); setFormError(""); }}
            style={{
              backgroundColor: "#0B0B0F",
              color: "#F5F1E8",
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#23232B",
              marginBottom: 14,
              fontSize: 15,
            }}
          />

          {/* Time Input */}
          <Text style={{ color: "#A1A1AA", fontSize: 13, marginBottom: 6 }}>Time</Text>
          <TextInput
            placeholder="e.g. 10:00 AM"
            placeholderTextColor="#7C7C85"
            value={time}
            onChangeText={(v) => { setTime(v); setFormError(""); }}
            style={{
              backgroundColor: "#0B0B0F",
              color: "#F5F1E8",
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#23232B",
              marginBottom: 20,
              fontSize: 15,
            }}
          />

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirmBooking}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#8B7A55" : "#C6A96B",
              paddingVertical: 15,
              borderRadius: 14,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#0B0B0F" />
            <Text style={{ color: "#0B0B0F", fontWeight: "700", fontSize: 16 }}>
              {submitting ? "Confirming..." : "Confirm Booking"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── BOOKINGS LIST ── */}
      <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
        {bookings.length > 0 ? "Your Bookings" : "No bookings yet"}
      </Text>

      {bookings.map((item) => (
        <View
          key={item._id}
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
            📅 {item.date}
          </Text>
          {item.time && (
            <Text style={{ color: "#A1A1AA", marginTop: 4 }}>
              🕐 {item.time}
            </Text>
          )}
          <View style={{
            marginTop: 10,
            backgroundColor: item.status === "confirmed" ? "#152D1A" : "#1C1C24",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            alignSelf: "flex-start",
          }}>
            <Text style={{
              color: item.status === "confirmed" ? "#22C55E" : "#A1A1AA",
              fontSize: 13,
              fontWeight: "600",
              textTransform: "capitalize",
            }}>
              {item.status}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}