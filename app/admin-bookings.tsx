import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ── Status helpers ──────────────────────────────────────────────────────────
const statusColor = (s: string) =>
  s === "Approved" ? "#22C55E" : s === "Rejected" ? "#EF4444" : "#C6A96B";
const statusBg = (s: string) =>
  s === "Approved" ? "#152D1A" : s === "Rejected" ? "#2D1515" : "#2A2211";

// ── Inline Banner ───────────────────────────────────────────────────────────
const Banner = ({ text, type }: { text: string; type: "error" | "success" }) => (
  <View style={{
    backgroundColor: type === "error" ? "#2D1515" : "#152D1A",
    borderWidth: 1, borderColor: type === "error" ? "#EF4444" : "#22C55E",
    borderRadius: 10, padding: 12, marginHorizontal: 24, marginBottom: 14,
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

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBookings = async () => {
    setError("");
    try {
      const token = await AsyncStorage.getItem("token");
      const res  = await fetch(`${API_URL}/api/bookings/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || `Error ${res.status}: Failed to fetch bookings`);
        return;
      }
      
      const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setBookings(sorted);
      setSortOrder("desc");
    } catch (e: any) {
      console.log("fetchBookings error:", e);
      setError("Network error — could not reach server");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    const sorted = [...bookings].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return newOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    setBookings(sorted);
  };

  // ── Update status ──────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/bookings/admin/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      console.log("updateStatus response:", res.status, data);

      if (!res.ok) { setError(data.message || "Update failed"); return; }

      setToast(`Booking ${status} ✓`);
      setTimeout(() => setToast(""), 2500);
      fetchBookings();
    } catch (e) {
      console.log("updateStatus error:", e);
      setError("Network error — could not update booking");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const doDelete = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setConfirmId(null);
        setToast("Booking deleted ✓");
        setTimeout(() => setToast(""), 2500);
        fetchBookings();
      } else {
        const data = await res.json();
        setError(data.message || "Delete failed");
      }
    } catch (e) {
      setError("Network error — could not delete booking");
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0F", paddingTop: 60 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={28} color="#F5F1E8" />
        </TouchableOpacity>
        <Text style={{ color: "#F5F1E8", fontSize: 28, fontWeight: "700" }}>
          Manage Bookings
        </Text>
        <TouchableOpacity onPress={fetchBookings} style={{ marginLeft: "auto" }}>
          <Ionicons name="refresh-outline" size={24} color="#C6A96B" />
        </TouchableOpacity>
      </View>

      {/* Toast success */}
      {toast ? <Banner text={toast} type="success" /> : null}
      {/* Error */}
      {error ? <Banner text={error} type="error" /> : null}

      {/* Loading */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#C6A96B" />
          <Text style={{ color: "#A1A1AA", marginTop: 12 }}>Loading bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Ionicons name="calendar-outline" size={48} color="#3A3A45" />
              <Text style={{ color: "#7C7C85", marginTop: 16, fontSize: 16 }}>
                No bookings found
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{
              backgroundColor: "#15151B", borderRadius: 18,
              borderWidth: 1, borderColor: "#23232B",
              padding: 18, marginBottom: 14,
            }}>
              {/* User + Status */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#F5F1E8", fontSize: 17, fontWeight: "700" }}>
                    {item.userId?.name || "Unknown User"}
                  </Text>
                  <Text style={{ color: "#A1A1AA", fontSize: 13, marginTop: 2 }}>
                    {item.userId?.email || "No email"}
                  </Text>
                </View>
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

              {/* Package */}
              <Text style={{ color: "#C6A96B", fontSize: 15, fontWeight: "600" }}>
                {item.packageId?.title || "Unknown Package"}
              </Text>
              <Text style={{ color: "#A1A1AA", fontSize: 13, marginTop: 2 }}>
                Rs. {item.packageId?.price || "N/A"}
              </Text>

              {/* Date + Time */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
                <Ionicons name="calendar-outline" size={14} color="#A1A1AA" />
                <Text style={{ color: "#A1A1AA" }}>{item.date || "—"}</Text>
              </View>
              {item.time ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <Ionicons name="time-outline" size={14} color="#A1A1AA" />
                  <Text style={{ color: "#A1A1AA" }}>{item.time}</Text>
                </View>
              ) : null}

              {/* Payment Status Badge */}
              <View style={{ 
                flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12,
                backgroundColor: item.isPaid ? "#152D1A" : "#2D1515",
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                alignSelf: "flex-start", borderWidth: 1, borderColor: item.isPaid ? "#22C55E40" : "#EF444440"
              }}>
                <Ionicons 
                  name={item.isPaid ? "card-outline" : "alert-circle-outline"} 
                  size={16} 
                  color={item.isPaid ? "#22C55E" : "#EF4444"} 
                />
                <Text style={{ 
                  color: item.isPaid ? "#22C55E" : "#EF4444", 
                  fontSize: 13, fontWeight: "700" 
                }}>
                  {item.isPaid ? "PAYMENT ATTACHED" : "NO PAYMENT FOUND"}
                </Text>
              </View>

              {/* Approve / Reject buttons */}
              <View style={{ flexDirection: "row", marginTop: 16, gap: 10 }}>
                <TouchableOpacity
                  onPress={() => updateStatus(item._id, "Approved")}
                  style={{ 
                    flex: 1, 
                    backgroundColor: "#C6A96B", 
                    paddingVertical: 12, 
                    borderRadius: 12 
                  }}
                >
                  <Text style={{ color: "#0B0B0F", textAlign: "center", fontWeight: "700" }}>
                    Approve
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateStatus(item._id, "Rejected")}
                  style={{ flex: 1, backgroundColor: "#7A1F1F", paddingVertical: 12, borderRadius: 12 }}
                >
                  <Text style={{ color: "#F5F1E8", textAlign: "center", fontWeight: "700" }}>
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Delete with inline confirm */}
              {confirmId === item._id ? (
                <View style={{
                  marginTop: 10, backgroundColor: "#2D1515", borderRadius: 12,
                  padding: 14, borderWidth: 1, borderColor: "#EF444460",
                }}>
                  <Text style={{ color: "#F5F1E8", fontSize: 14, textAlign: "center", marginBottom: 12 }}>
                    Delete this booking?
                  </Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setConfirmId(null)}
                      style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: "#1C1C24", alignItems: "center" }}
                    >
                      <Text style={{ color: "#A1A1AA", fontWeight: "600" }}>Keep</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => doDelete(item._id)}
                      style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: "#EF4444", alignItems: "center" }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700" }}>Yes, Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setConfirmId(item._id)}
                  style={{ marginTop: 10, backgroundColor: "#2A2A33", paddingVertical: 12, borderRadius: 12 }}
                >
                  <Text style={{ color: "#F5F1E8", textAlign: "center", fontWeight: "600" }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}