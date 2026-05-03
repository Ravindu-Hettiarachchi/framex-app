import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from "../../constants/Api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

// ─── Types ────────────────────────────────────────────────────────────────────
type Booking = {
  _id: string;
  packageId: any;
  userId: any;
  date: string;
  time?: string;
  status: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fmtTime = (d: Date) => {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const isPast = (d: Date) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const check = new Date(d);  check.setHours(0, 0, 0, 0);
  return check < today;
};

const validate = (date: string, time: string, setErr: (s: string) => void): boolean => {
  setErr("");
  if (!date.trim()) { setErr("Please select a date"); return false; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { setErr("Date must be YYYY-MM-DD"); return false; }
  const p = new Date(date);
  if (isNaN(p.getTime())) { setErr("Invalid date"); return false; }
  if (isPast(p)) { setErr("Date cannot be in the past"); return false; }
  if (!time.trim()) { setErr("Please select a time"); return false; }
  return true;
};

// ─── Inline Banner ────────────────────────────────────────────────────────────
const Banner = ({ text, type }: { text: string; type: "error" | "success" }) => (
  <View style={{
    backgroundColor: type === "error" ? "#2D1515" : "#152D1A",
    borderWidth: 1, borderColor: type === "error" ? "#EF4444" : "#22C55E",
    borderRadius: 10, padding: 12, marginBottom: 14,
    flexDirection: "row", alignItems: "center", gap: 8,
  }}>
    <Ionicons
      name={type === "error" ? "alert-circle-outline" : "checkmark-circle-outline"}
      size={18} color={type === "error" ? "#EF4444" : "#22C55E"}
    />
    <Text style={{ color: type === "error" ? "#EF4444" : "#22C55E", fontSize: 14, flex: 1 }}>
      {text}
    </Text>
  </View>
);

// ─── Date+Time Picker Form ─────────────────────────────────────────────────
function DateTimeForm({
  date, setDate, time, setTime, setErr,
}: {
  date: string; setDate: (s: string) => void;
  time: string; setTime: (s: string) => void;
  setErr: (s: string) => void;
}) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const dateObj = date ? new Date(date) : new Date();
  const timeObj = new Date();
  if (time) {
    const [hm, ampm] = time.split(" ");
    const [hStr, mStr] = hm.split(":");
    let h = parseInt(hStr);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    timeObj.setHours(h, parseInt(mStr));
  }

  if (Platform.OS === "web") {
    return (
      <>
        <Text style={label}>Date</Text>
        <TextInput
          placeholder="YYYY-MM-DD" placeholderTextColor="#7C7C85"
          value={date} keyboardType="numeric" maxLength={10}
          onChangeText={v => { setDate(v); setErr(""); }}
          style={input}
        />
        <Text style={label}>Time</Text>
        <TextInput
          placeholder="e.g. 10:30 AM" placeholderTextColor="#7C7C85"
          value={time}
          onChangeText={v => { setTime(v); setErr(""); }}
          style={input}
        />
      </>
    );
  }

  return (
    <>
      <Text style={label}>Date</Text>
      <TouchableOpacity onPress={() => { setShowTime(false); setShowDate(true); }} style={input}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons name="calendar-outline" size={18} color="#C6A96B" />
          <Text style={{ color: date ? "#F5F1E8" : "#7C7C85", fontSize: 15 }}>
            {date || "Tap to select date"}
          </Text>
        </View>
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker
          value={dateObj} mode="date" minimumDate={new Date()} display="default"
          onChange={(e, d) => {
            setShowDate(false);
            if (e.type !== "dismissed" && d) { setDate(fmtDate(d)); setErr(""); }
          }}
        />
      )}

      <Text style={label}>Time</Text>
      <TouchableOpacity onPress={() => { setShowDate(false); setShowTime(true); }} style={input}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons name="time-outline" size={18} color="#C6A96B" />
          <Text style={{ color: time ? "#F5F1E8" : "#7C7C85", fontSize: 15 }}>
            {time || "Tap to select time"}
          </Text>
        </View>
      </TouchableOpacity>
      {showTime && (
        <DateTimePicker
          value={timeObj} mode="time" is24Hour={false} display="default"
          onChange={(e, t) => {
            setShowTime(false);
            if (e.type !== "dismissed" && t) { setTime(fmtTime(t)); setErr(""); }
          }}
        />
      )}
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BookingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const incomingPackageId = params.packageId as string | undefined;
  const incomingTitle     = params.title     as string | undefined;
  const incomingPrice     = params.price     as string | undefined;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser]         = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Create form
  const [cDate, setCDate]         = useState("");
  const [cTime, setCTime]         = useState("");
  const [cErr, setCErr]           = useState("");
  const [cSuccess, setCSuccess]   = useState("");
  const [cBusy, setCBusy]         = useState(false);

  // ── Edit modal
  const [editId, setEditId]       = useState<string | null>(null);
  const [eDate, setEDate]         = useState("");
  const [eTime, setETime]         = useState("");
  const [eErr, setEErr]           = useState("");
  const [eSuccess, setESuccess]   = useState("");
  const [eBusy, setEBusy]         = useState(false);

  const isBookingMode = !!incomingPackageId;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res   = await fetch(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBookings(data);
    } catch (e) { console.log("fetchBookings error:", e); }
  };

  useEffect(() => {
    AsyncStorage.getItem("user").then(r => r && setUser(JSON.parse(r)));
    fetchBookings();
  }, []);

  // ── CREATE ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    console.log("Create booking pressed — pkg:", incomingPackageId);
    setCSuccess("");
    if (!validate(cDate, cTime, setCErr)) return;
    if (!user) { setCErr("You must be logged in"); return; }

    try {
      setCBusy(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user._id, packageId: incomingPackageId, date: cDate, time: cTime }),
      });
      const data = await res.json();
      console.log("Create response:", data);
      if (!res.ok) { setCErr(data.message || "Failed"); return; }

      if (Platform.OS !== "web") Alert.alert("Success", "Booking Created");
      setCSuccess("Booking Created! ✓");
      setCDate(""); setCTime("");
      await fetchBookings();
      setTimeout(() => { setCSuccess(""); router.setParams({ packageId: "", title: "", price: "" }); }, 2000);
    } catch (e) { setCErr("Network error. Please try again."); }
    finally { setCBusy(false); }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const openEdit = (b: Booking) => {
    setEDate(b.date || ""); setETime(b.time || ""); setEErr(""); setESuccess(""); setEditId(b._id);
  };

  const handleUpdate = async () => {
    console.log("Update booking pressed — id:", editId);
    setESuccess("");
    if (!validate(eDate, eTime, setEErr)) return;

    try {
      setEBusy(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/bookings/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: eDate, time: eTime }),
      });
      const data = await res.json();
      console.log("Update response:", data);
      if (!res.ok) { setEErr(data.message || "Failed to update"); return; }

      if (Platform.OS !== "web") Alert.alert("Success", "Booking updated");
      setESuccess("Booking updated! ✓");
      await fetchBookings();
      setTimeout(() => { setEditId(null); setESuccess(""); }, 1200);
    } catch (e) { setEErr("Network error. Please try again."); }
    finally { setEBusy(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setConfirmDeleteId(null); await fetchBookings(); }
    } catch (e) { console.log("Delete error:", e); }
  };

  const onCancelPress = (id: string) => {
    if (Platform.OS === "web") {
      setConfirmDeleteId(id);
    } else {
      Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", style: "destructive", onPress: () => handleDelete(id) },
      ]);
    }
  };

  // ── Status badge color ────────────────────────────────────────────────────
  const statusColor = (s: string) =>
    s === "Approved" ? "#22C55E" : s === "Rejected" ? "#EF4444" : "#C6A96B";
  const statusBg = (s: string) =>
    s === "Approved" ? "#152D1A" : s === "Rejected" ? "#2D1515" : "#2A2211";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0B0B0F" }}
      contentContainerStyle={{ paddingTop: 80, paddingHorizontal: 24, paddingBottom: 60 }}
    >
      <Text style={{ color: "#F5F1E8", fontSize: 28, fontWeight: "700", marginBottom: 4 }}>
        My Bookings
      </Text>
      <Text style={{ color: "#A1A1AA", fontSize: 14, marginBottom: 28 }}>
        Manage your reserved photography sessions.
      </Text>

      {/* ── CREATE FORM ── */}
      {isBookingMode && (
        <View style={card}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons name="camera-outline" size={22} color="#C6A96B" style={{ marginRight: 8 }} />
            <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "700" }}>
              Book: {incomingTitle}
            </Text>
          </View>
          <Text style={{ color: "#C6A96B", fontSize: 15, fontWeight: "600", marginBottom: 20 }}>
            Rs. {incomingPrice}
          </Text>

          {cErr     ? <Banner text={cErr}     type="error"   /> : null}
          {cSuccess ? <Banner text={cSuccess} type="success" /> : null}

          <DateTimeForm date={cDate} setDate={setCDate} time={cTime} setTime={setCTime} setErr={setCErr} />

          <TouchableOpacity onPress={handleCreate} disabled={cBusy} style={[btn, { marginTop: 6 }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#0B0B0F" />
            <Text style={btnTxt}>{cBusy ? "Confirming..." : "Confirm Booking"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── BOOKINGS LIST ── */}
      <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
        {bookings.length > 0 ? "Your Bookings" : "No bookings yet"}
      </Text>

      {bookings.map((item) => (
        <View key={item._id} style={card}>
          {/* Title + Status */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <Text style={{ color: "#F5F1E8", fontSize: 17, fontWeight: "700", flex: 1 }}>
              {item.packageId?.title || "Unknown Package"}
            </Text>
            <View style={{
              backgroundColor: statusBg(item.status),
              paddingHorizontal: 10, paddingVertical: 3,
              borderRadius: 20, marginLeft: 8,
            }}>
              <Text style={{ color: statusColor(item.status), fontSize: 12, fontWeight: "700" }}>
                {item.status}
              </Text>
            </View>
          </View>

          <Text style={{ color: "#C6A96B", fontSize: 14, fontWeight: "600", marginBottom: 10 }}>
            Rs. {item.packageId?.price || "N/A"}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Ionicons name="calendar-outline" size={14} color="#A1A1AA" />
            <Text style={{ color: "#A1A1AA" }}>{item.date || "—"}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <Ionicons name="time-outline" size={14} color="#A1A1AA" />
            <Text style={{ color: "#A1A1AA" }}>{item.time || "—"}</Text>
          </View>

          {/* Edit + Cancel buttons (Pending only) */}
          {item.status === "Pending" && (
            <View>
              {confirmDeleteId === item._id ? (
                // Inline confirm on web
                <View style={{ backgroundColor: "#2D1515", borderRadius: 12, padding: 14,
                  borderWidth: 1, borderColor: "#EF444460", marginTop: 4 }}>
                  <Text style={{ color: "#F5F1E8", fontSize: 14, marginBottom: 12, textAlign: "center" }}>
                    Cancel this booking?
                  </Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setConfirmDeleteId(null)}
                      style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: "#1C1C24", alignItems: "center" }}>
                      <Text style={{ color: "#A1A1AA", fontWeight: "600" }}>Keep</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item._id)}
                      style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: "#EF4444", alignItems: "center" }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>Yes, Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    onPress={() => openEdit(item)}
                    style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center",
                      gap: 6, backgroundColor: "#1C1C24", paddingVertical: 10, borderRadius: 12,
                      borderWidth: 1, borderColor: "#C6A96B60" }}>
                    <Ionicons name="create-outline" size={16} color="#C6A96B" />
                    <Text style={{ color: "#C6A96B", fontWeight: "600", fontSize: 14 }}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onCancelPress(item._id)}
                    style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center",
                      gap: 6, backgroundColor: "#1C1C24", paddingVertical: 10, borderRadius: 12,
                      borderWidth: 1, borderColor: "#EF444460" }}>
                    <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                    <Text style={{ color: "#EF4444", fontWeight: "600", fontSize: 14 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      {/* ── EDIT MODAL ── */}
      <Modal visible={!!editId} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#15151B", borderRadius: 24, padding: 24,
            borderWidth: 1, borderColor: "#C6A96B40" }}>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: "#F5F1E8", fontSize: 20, fontWeight: "700" }}>Edit Booking</Text>
              <TouchableOpacity onPress={() => setEditId(null)}>
                <Ionicons name="close-circle-outline" size={28} color="#A1A1AA" />
              </TouchableOpacity>
            </View>

            {eErr     ? <Banner text={eErr}     type="error"   /> : null}
            {eSuccess ? <Banner text={eSuccess} type="success" /> : null}

            <DateTimeForm date={eDate} setDate={setEDate} time={eTime} setTime={setETime} setErr={setEErr} />

            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <TouchableOpacity onPress={() => setEditId(null)}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#1C1C24", alignItems: "center" }}>
                <Text style={{ color: "#A1A1AA", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdate} disabled={eBusy}
                style={{ flex: 1, padding: 14, borderRadius: 12,
                  backgroundColor: eBusy ? "#8B7A55" : "#C6A96B", alignItems: "center" }}>
                <Text style={{ color: "#0B0B0F", fontWeight: "700" }}>
                  {eBusy ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const card: any = {
  backgroundColor: "#15151B", borderRadius: 20, padding: 20,
  borderWidth: 1, borderColor: "#23232B", marginBottom: 16,
};
const input: any = {
  backgroundColor: "#0B0B0F", color: "#F5F1E8", padding: 14,
  borderRadius: 12, borderWidth: 1, borderColor: "#23232B",
  fontSize: 15, marginBottom: 14,
};
const label: any = { color: "#A1A1AA", fontSize: 13, marginBottom: 6 };
const btn: any = {
  backgroundColor: "#C6A96B", paddingVertical: 15, borderRadius: 14,
  flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
};
const btnTxt: any = { color: "#0B0B0F", fontWeight: "700", fontSize: 16 };