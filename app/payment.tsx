import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, Image } from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Api";
import * as ImagePicker from "expo-image-picker";

export default function PaymentScreen() {
  const { bookingId, amount, packageTitle } = useLocalSearchParams();
  const [method, setMethod] = useState<"card" | "bank">("card");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<ImagePicker.ImagePickerAsset | null>(null);

  // Card Dummy State
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const handleCardNumberChange = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Split into chunks of 4 and join with space
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (text: string) => {
    // Remove all non-digits
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 3) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    setExpiry(cleaned);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceipt(result.assets[0]);
    }
  };

  const handlePayment = async () => {
    if (method === "card") {
      // Basic Card Validation
      const cleanCard = cardNumber.replace(/\s/g, "");
      const cardRegex = /^[0-9]{16}$/;
      const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
      const cvvRegex = /^[0-9]{3}$/;

      if (!cardHolder.trim()) {
        Alert.alert("Validation", "Please enter the card holder's name.");
        return;
      }
      if (!cardRegex.test(cleanCard)) {
        Alert.alert("Validation", "Please enter a valid 16-digit card number.");
        return;
      }
      if (!expiryRegex.test(expiry)) {
        Alert.alert("Validation", "Please enter a valid expiry date (MM/YY).");
        return;
      }
      if (!cvvRegex.test(cvv)) {
        Alert.alert("Validation", "Please enter a valid 3-digit CVV.");
        return;
      }
    } else {
      if (!receipt) {
        Alert.alert("Validation", "Please upload the bank transfer receipt.");
        return;
      }
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      
      const formData = new FormData();
      formData.append("bookingId", bookingId as string);
      formData.append("amount", amount as string);
      formData.append("paymentMethod", method === "card" ? "Card" : "Bank Transfer");
      formData.append("status", method === "card" ? "Paid" : "Pending");

      if (receipt) {
        const mimeType = receipt.mimeType || 'image/jpeg';
        const fileName = receipt.fileName || `receipt.${receipt.uri.split('.').pop() || 'jpg'}`;
        
        // @ts-ignore
        formData.append("receiptImage", {
          uri: receipt.uri,
          name: fileName,
          type: mimeType,
        });
      }

      const res = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log("Server Error HTML:", responseText);
        throw new Error(`Server error (${res.status}). Please check if the backend is running correctly.`);
      }

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
              placeholder="Card Holder Name"
              placeholderTextColor="#7C7C85"
              value={cardHolder}
              onChangeText={setCardHolder}
              style={{ backgroundColor: "#1D1D24", color: "#F5F1E8", padding: 16, borderRadius: 12, marginBottom: 12 }}
            />

            <TextInput
              placeholder="Card Number"
              placeholderTextColor="#7C7C85"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19} // 16 digits + 3 spaces
              style={{ backgroundColor: "#1D1D24", color: "#F5F1E8", padding: 16, borderRadius: 12, marginBottom: 12 }}
            />
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TextInput
                placeholder="MM/YY"
                placeholderTextColor="#7C7C85"
                value={expiry}
                onChangeText={handleExpiryChange}
                keyboardType="numeric"
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
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "#A1A1AA", fontSize: 15, marginBottom: 6 }}>Bank Name: <Text style={{ color: "#F5F1E8" }}>Commercial Bank</Text></Text>
              <Text style={{ color: "#A1A1AA", fontSize: 15, marginBottom: 6 }}>Account Name: <Text style={{ color: "#F5F1E8" }}>FrameX Photography</Text></Text>
              <Text style={{ color: "#A1A1AA", fontSize: 15, marginBottom: 6 }}>Account No: <Text style={{ color: "#F5F1E8" }}>1234567890</Text></Text>
              <Text style={{ color: "#A1A1AA", fontSize: 15 }}>Branch: <Text style={{ color: "#F5F1E8" }}>Colombo</Text></Text>
            </View>
            
            <View style={{ borderTopWidth: 1, borderTopColor: "#23232B", paddingTop: 16 }}>
              <Text style={{ color: "#F5F1E8", fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                Upload Payment Slip
              </Text>
              
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  backgroundColor: "#1D1D24",
                  height: 180,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#23232B",
                  borderStyle: "dashed",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden"
                }}
              >
                {receipt ? (
                  <Image source={{ uri: receipt.uri }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={40} color="#7C7C85" />
                    <Text style={{ color: "#7C7C85", marginTop: 10 }}>Tap to upload bank slip</Text>
                  </>
                )}
              </TouchableOpacity>
              
              {receipt && (
                <TouchableOpacity onPress={() => setReceipt(null)} style={{ marginTop: 10 }}>
                  <Text style={{ color: "#EF4444", textAlign: "center" }}>Remove Image</Text>
                </TouchableOpacity>
              )}
            </View>
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
            {loading ? "Processing..." : method === "card" ? "Pay Now" : "Submit Receipt"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
