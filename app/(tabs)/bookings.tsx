import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from "../../constants/Api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

type Booking = {
  _id: string;
  packageId: any;
  userId: any;
  date: string;
  time?: string;
  status: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────
const formatDate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatTime = (d: Date) => {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const isDateInPast = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const picked = new Date(d);
  picked.setHours(0, 0, 0, 0);
  return picked < today;
};

// ── Banner ────────────────────────────────────────────────────────────────
const Banner = ({
  text,
  type,
}: {
  text: string;
  type: "error" | "success";
}) => (
  <View
    style={{
      backgroundColor: type === "error" ? "#2D1515" : "#152D1A",
      borderWidth: 1,
      borderColor: type === "error" ? "#EF4444" : "#22C55E",
      borderRadius: 10,
      padding: 12,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    }}
  >
    <Ionicons
      name={
        type === "error" ? "alert-circle-outline" : "checkmark-circle-outline"
      }
      size={18}
      color={type === "error" ? "#EF4444" : "#22C55E"}
    />
    <Text
      style={{
        color: type === "error" ? "#EF4444" : "#22C55E",
        fontSize: 14,
        flex: 1,
      }}
    >
      {text}
    </Text>
  </View>
);

// ── Main Component ────────────────────────────────────────────────────────
export default function BookingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const incomingPackageId = params.packageId as string | undefined;
  const incomingTitle = params.title as string | undefined;
  const incomingPrice = params.price as string | undefined;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);

  // Date / Time state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  // Native picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Web fallback string state
  const [webDate, setWebDate] = useState("");
  const [webTime, setWebTime] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const isBookingMode = !!incomingPackageId;

  // ── Load user + bookings ───────────────────────────────────────────────
  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBookings(data);
    } catch (e) {
      console.log("Fetch bookings error:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      const raw = await AsyncStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    };
    init();
    fetchBookings();
  }, []);

  // ── Validation ────────────────────────────────────────────────────────
  const validate = (): boolean => {
    setFormError("");

    const dateValue = Platform.OS === "web" ? webDate : selectedDate ? formatDate(selectedDate) : "";
    const timeValue = Platform.OS === "web" ? webTime : selectedTime ? formatTime(selectedTime) : "";

    if (!dateValue) {
      setFormError("Please select a date");
      return false;
    }
    if (!timeValue) {
      setFormError("Please select a time");
      return false;
    }

    // Past date check
    const checkDate = Platform.OS === "web" ? new Date(dateValue) : selectedDate!;
    if (isDateInPast(checkDate)) {
      setFormError("Date cannot be in the past");
      return false;
    }

    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    console.log("Confirm Booking pressed — packageId:", incomingPackageId);
    setFormSuccess("");

    if (!validate()) return;
    if (!user) { setFormError("You must be logged in"); return; }

    const dateStr = Platform.OS === "web" ? webDate : formatDate(selectedDate!);
    const timeStr = Platform.OS === "web" ? webTime : formatTime(selectedTime!);

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
          date: dateStr,
          time: timeStr,
        }),
      });

      const data = await res.json();
      console.log("Booking response:", data);

      if (!res.ok) {
        setFormError(data.message || "Failed to create booking");
        return;
      }

      setFormSuccess("Booking Created! ✓");
      setSelectedDate(null);
      setSelectedTime(null);
      setWebDate("");
      setWebTime("");
      await fetchBookings();

      setTimeout(() => {
        setFormSuccess("");
        router.setParams({ packageId: "", title: "", price: "" });
      }, 2000);
    } catch (e) {
      console.log("Booking error:", e);
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Date/Time Picker UI ───────────────────────────────────────────────
  const renderDateField = () => {
    if (Platform.OS === "web") {
      // Web: use native HTML date input via TextInput
      return (
        <View>
          <Text style={{ color: "#A1A1AA", fontSize: 13, marginBottom: 6 }}>
            Date
          </Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#7C7C85"
            value={webDate}
            onChangeText={(v) => { setWebDate(v); setFormError(""); }}
            style={inputStyle}
          />
        </View>
      );
    }

    return (
      <View>
        <Text style={{ color: "#A1A1AA", fontSize: 13, marginBottom: 6 }}>
          Date
        </Text>
        <TouchableOpacity
          onPress={() => { setShowTimePicker(false); setShowDatePicker(true); }}
          style={inputStyle}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="calendar-outline" size={18} color="#C6A96B" />
            <Text style={{ color: selectedDate ? "#F5F1E8" : "#7C7C85", fontSize: 15 }}>
              {selectedDate ? formatDate(selectedDate) : "Tap to select date"}
            </Text>
          </View>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            minimumDate={new Date()}
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (event.type !== "dismissed" && date) {
                setSelectedDate(date);
                setFormError("");
              }
            }}
          />
        )}
      </View>
    );
  };

  const renderTimeField = () => {
    if (Platform.OS === "web") {
      return (
        <View>
          <Text style={{ color: "#A1A1AA", fontSize: 13, marginBottom: 6 }}>
            Time
          </Text>
          <TextInput
            placeholder="e.g. 10:00 AM"
            placeholderTextColor="#7C7C85"
            value={webTime}
            onChangeText={(v) => { setWebTime(v); setFormError(""); }}
            style={inputStyle}
          />
        </View>
      );
    }

    return (
      <View>
        <Text style={{ color: "#A1A1AA", fontSize: 13, marginBottom: 6 }}>
          Time
        </Text>
        <TouchableOpacity
          onPress={() => { setShowDatePicker(false); setShowTimePicker(true); }}
          style={inputStyle}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="time-outline" size={18} color="#C6A96B" />
            <Text style={{ color: selectedTime ? "#F5F1E8" : "#7C7C85", fontSize: 15 }}>
              {selectedTime ? formatTime(selectedTime) : "Tap to select time"}
            </Text>
          </View>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime || new Date()}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (event.type !== "dismissed" && time) {
                setSelectedTime(time);
                setFormError("");
              }
            }}
          />
        )}
      </View>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0B0B0F" }}
      contentContainerStyle={{
        paddingTop: 80,
        paddingHorizontal: 24,
        paddingBottom: 60,
      }}
    >
      <Text
        style={{
          color: "#F5F1E8",
          fontSize: 28,
          fontWeight: "700",
          marginBottom: 4,
        }}
      >
        My Bookings
      </Text>
      <Text
        style={{ color: "#A1A1AA", fontSize: 14, marginBottom: 28 }}
      >
        Review your reserved photography sessions.
      </Text>

      {/* ── BOOKING FORM ── */}
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="camera-outline"
              size={22}
              color="#C6A96B"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "700" }}
            >
              Book: {incomingTitle}
            </Text>
          </View>

          <Text
            style={{
              color: "#C6A96B",
              fontSize: 15,
              fontWeight: "600",
              marginBottom: 20,
            }}
          >
            Rs. {incomingPrice}
          </Text>

          {formError ? <Banner text={formError} type="error" /> : null}
          {formSuccess ? <Banner text={formSuccess} type="success" /> : null}

          {/* Date Picker */}
          <View style={{ marginBottom: 14 }}>{renderDateField()}</View>

          {/* Time Picker */}
          <View style={{ marginBottom: 20 }}>{renderTimeField()}</View>

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
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#0B0B0F"
            />
            <Text
              style={{ color: "#0B0B0F", fontWeight: "700", fontSize: 16 }}
            >
              {submitting ? "Confirming..." : "Confirm Booking"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── BOOKINGS LIST ── */}
      <Text
        style={{
          color: "#F5F1E8",
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 14,
        }}
      >
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
          <Text
            style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "600" }}
          >
            {item.packageId?.title || "Unknown Package"}
          </Text>
          <Text style={{ color: "#C6A96B", marginTop: 6, fontSize: 15 }}>
            Rs. {item.packageId?.price || "N/A"}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              gap: 6,
            }}
          >
            <Ionicons name="calendar-outline" size={14} color="#A1A1AA" />
            <Text style={{ color: "#A1A1AA" }}>{item.date}</Text>
          </View>

          {item.time ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
                gap: 6,
              }}
            >
              <Ionicons name="time-outline" size={14} color="#A1A1AA" />
              <Text style={{ color: "#A1A1AA" }}>{item.time}</Text>
            </View>
          ) : null}

          <View
            style={{
              marginTop: 10,
              backgroundColor:
                item.status === "Approved" ? "#152D1A" : "#1C1C24",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                color:
                  item.status === "Approved"
                    ? "#22C55E"
                    : item.status === "Rejected"
                    ? "#EF4444"
                    : "#A1A1AA",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {item.status}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Shared input style ────────────────────────────────────────────────────
const inputStyle: any = {
  backgroundColor: "#0B0B0F",
  color: "#F5F1E8",
  padding: 14,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#23232B",
  fontSize: 15,
};