import { View, Text, FlatList, TouchableOpacity, Alert, Image, TextInput } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AdminPaymentsScreen() {
  const [payments, setPayments] = useState<any[]>([]);
  const [refNumbers, setRefNumbers] = useState<{[key: string]: string}>({});

  const fetchPayments = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/payments/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to fetch payments");
        return;
      }

      setPayments(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not fetch payments");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const referenceNumber = refNumbers[id];

      if (status === "Paid" && !referenceNumber && payments.find(p => p._id === id)?.paymentMethod === "Bank Transfer") {
        Alert.alert("Error", "Please enter a reference number before confirming.");
        return;
      }

      const res = await fetch(`${API_URL}/api/payments/admin/status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, referenceNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Update failed");
        return;
      }

      Alert.alert("Success", `Payment ${status}`);
      fetchPayments();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not update payment");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0F", paddingTop: 60 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={28} color="#F5F1E8" />
        </TouchableOpacity>
        <Text
          style={{
            color: "#F5F1E8",
            fontSize: 28,
            fontWeight: "700",
          }}
        >
          Manage Payments
        </Text>
      </View>

      <FlatList
        data={payments}
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
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ color: "#F5F1E8", fontSize: 17, fontWeight: "600" }}>
                  {item.bookingId?.userId?.name || "User"}
                </Text>
                <Text style={{ color: "#A1A1AA", marginTop: 4 }}>
                  {item.bookingId?.packageId?.title || "Package"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#C6A96B", fontSize: 16, fontWeight: "700" }}>
                  Rs. {item.amount}
                </Text>
                <Text style={{ color: item.status === "Paid" ? "#22C55E" : "#EAB308", fontSize: 12, marginTop: 4 }}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#23232B" }}>
              <Text style={{ color: "#A1A1AA", fontSize: 14 }}>
                Method: <Text style={{ color: "#F5F1E8" }}>{item.paymentMethod}</Text>
              </Text>
              
              {item.referenceNumber && (
                <Text style={{ color: "#A1A1AA", fontSize: 14, marginTop: 4 }}>
                  Ref No: <Text style={{ color: "#C6A96B", fontWeight: "600" }}>{item.referenceNumber}</Text>
                </Text>
              )}
            </View>

            {item.receiptImage ? (
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: "#F5F1E8", marginBottom: 8, fontSize: 14, fontWeight: "600" }}>
                  Payment Receipt Slip:
                </Text>
                <Image 
                  source={{ uri: `${API_URL}${item.receiptImage}` }} 
                  style={{ width: "100%", height: 220, borderRadius: 12, backgroundColor: "#0B0B0F" }} 
                  resizeMode="contain" 
                />
              </View>
            ) : null}

            {item.status === "Pending" && item.paymentMethod === "Bank Transfer" && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: "#A1A1AA", marginBottom: 8, fontSize: 13 }}>
                  Verify the slip and enter the reference number:
                </Text>
                <TextInput
                  placeholder="Enter Reference Number"
                  placeholderTextColor="#7C7C85"
                  value={refNumbers[item._id] || ""}
                  onChangeText={(val) => setRefNumbers({...refNumbers, [item._id]: val})}
                  style={{ 
                    backgroundColor: "#1D1D24", 
                    color: "#F5F1E8", 
                    padding: 14, 
                    borderRadius: 12, 
                    borderWidth: 1, 
                    borderColor: "#23232B" 
                  }}
                />
              </View>
            )}

            <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
              {item.status !== "Paid" && (
                <TouchableOpacity
                  onPress={() => updateStatus(item._id, "Paid")}
                  style={{
                    flex: 1,
                    backgroundColor: "#C6A96B",
                    paddingVertical: 12,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: "#0B0B0F", textAlign: "center", fontWeight: "600" }}>
                    Confirm Payment
                  </Text>
                </TouchableOpacity>
              )}

              {item.status === "Pending" && (
                <TouchableOpacity
                  onPress={() => updateStatus(item._id, "Failed")}
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
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}