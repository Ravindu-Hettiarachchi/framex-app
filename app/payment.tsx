import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Api";

export default function PaymentScreen() {
  const { bookingId, amount, packageTitle } = useLocalSearchParams();
  const [method, setMethod] = useState<"card" | "bank">("card");
  const [loading, setLoading] = useState(false);

  // Card Dummy State
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayment = async () => {
    if (method === "card") {
      if (!cardNumber || !expiry || !cvv) {
        Alert.alert("Validation", "Please fill out all card details (Demo).");
        return;
      }
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      
      const payload = {
        bookingId,
        amount: Number(amount),
        paymentMethod: method === "card" ? "Card" : "Bank Transfer",
        status: method === "card" ? "Paid" : "Pending"
      };

      const res = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment failed");
      }

      Alert.alert(
        "Success", 
        method === "card" 
          ? "Payment successful! Your booking is confirmed." 
          : "Details submitted! Please wait for admin approval.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/bookings") }]
      );
      
    } catch (error: any) {
      console.log("Payment error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0F", paddingTop: 60 }}>
      {/* HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={28} color="#F5F1E8" />
        </TouchableOpacity>
        <Text style={{ color: "#F5F1E8", fontSize: 24, fontWeight: "700" }}>
          Complete Payment
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {/* SUMMARY CARD */}
        <View style={{ backgroundColor: "#15151B", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#23232B", marginBottom: 24 }}>
          <Text style={{ color: "#A1A1AA", fontSize: 14, marginBottom: 4 }}>Booking Summary</Text>
          <Text style={{ color: "#F5F1E8", fontSize: 20, fontWeight: "600", marginBottom: 12 }}>
            {packageTitle || "Photography Package"}
          </Text>
          
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#23232B", paddingTop: 12 }}>
            <Text style={{ color: "#A1A1AA", fontSize: 16 }}>Total Amount</Text>
            <Text style={{ color: "#C6A96B", fontSize: 22, fontWeight: "700" }}>
              Rs. {amount || "0"}
            </Text>
          </View>
        </View>

        <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
          Select Payment Method
        </Text>

        {/* METHOD TOGGLE */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => setMethod("card")}
            style={{
              flex: 1,
              backgroundColor: method === "card" ? "#C6A96B" : "#1D1D24",
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: method === "card" ? "#C6A96B" : "#23232B",
            }}
          >
            <Text style={{ textAlign: "center", fontWeight: "600", color: method === "card" ? "#0B0B0F" : "#A1A1AA" }}>
              Card Payment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMethod("bank")}
            style={{
              flex: 1,
              backgroundColor: method === "bank" ? "#C6A96B" : "#1D1D24",
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: method === "bank" ? "#C6A96B" : "#23232B",
            }}
          >
            <Text style={{ textAlign: "center", fontWeight: "600", color: method === "bank" ? "#0B0B0F" : "#A1A1AA" }}>
              Bank Transfer
            </Text>
          </TouchableOpacity>
        </View>

        {/* CARD FORM */}
        {method === "card" && (
          <View style={{ backgroundColor: "#15151B", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#23232B" }}>
            <Text style={{ color: "#A1A1AA", marginBottom: 16, fontSize: 13 }}>
              Note: This is a demo. Do not enter real card details.
            </Text>

            <TextInput
              placeholder="Card Number"
              placeholderTextColor="#7C7C85"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={16}
              style={{ backgroundColor: "#1D1D24", color: "#F5F1E8", padding: 16, borderRadius: 12, marginBottom: 12 }}
            />
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TextInput
                placeholder="MM/YY"
                placeholderTextColor="#7C7C85"
                value={expiry}
                onChangeText={setExpiry}
                maxLength={5}
                style={{ flex: 1, backgroundColor: "#1D1D24", color: "#F5F1E8", padding: 16, borderRadius: 12 }}
              />
              <TextInput
                placeholder="CVV"
                placeholderTextColor="#7C7C85"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={3}
                style={{ flex: 1, backgroundColor: "#1D1D24", color: "#F5F1E8", padding: 16, borderRadius: 12 }}
              />
            </View>
          </View>
        )}

        {/* BANK TRANSFER DETAILS */}
        {method === "bank" && (
          <View style={{ backgroundColor: "#15151B", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#23232B" }}>
            <Text style={{ color: "#F5F1E8", fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
              Bank Account Details
            </Text>
            <Text style={{ color: "#A1A1AA", fontSize: 15, marginBottom: 6 }}>Bank Name: <Text style={{ color: "#F5F1E8" }}>Commercial Bank</Text></Text>
            <Text style={{ color: "#A1A1AA", fontSize: 15, marginBottom: 6 }}>Account Name: <Text style={{ color: "#F5F1E8" }}>FrameX Photography</Text></Text>
            <Text style={{ color: "#A1A1AA", fontSize: 15, marginBottom: 6 }}>Account No: <Text style={{ color: "#F5F1E8" }}>1234567890</Text></Text>
            <Text style={{ color: "#A1A1AA", fontSize: 15, marginBottom: 16 }}>Branch: <Text style={{ color: "#F5F1E8" }}>Colombo</Text></Text>
            
            <Text style={{ color: "#C6A96B", fontSize: 13, lineHeight: 20 }}>
              Please transfer Rs. {amount} to the account above and click "I have Transferred". An admin will verify and approve your booking.
            </Text>
          </View>
        )}

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#8B7A55" : "#C6A96B",
            paddingVertical: 16,
            borderRadius: 14,
            marginTop: 30,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#0B0B0F", fontSize: 16, fontWeight: "700" }}>
            {loading ? "Processing..." : method === "card" ? "Pay Now" : "I have Transferred"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
