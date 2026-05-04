import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function AdminScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0B0B0F",
        paddingTop: 80,
        paddingHorizontal: 24,
      }}
    >
      <Text
        style={{
          color: "#F5F1E8",
          fontSize: 30,
          fontWeight: "700",
          marginBottom: 10,
        }}
      >
        Admin Panel
      </Text>

      <Text
        style={{
          color: "#A1A1AA",
          fontSize: 14,
          lineHeight: 22,
          marginBottom: 24,
        }}
      >
        Manage bookings, payments, and packages from one place.
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/admin-bookings")}
        style={{
          backgroundColor: "#15151B",
          borderColor: "#23232B",
          borderWidth: 1,
          padding: 18,
          borderRadius: 18,
          marginBottom: 14,
        }}
      >
        <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "600" }}>
          Manage Bookings
        </Text>
        <Text style={{ color: "#A1A1AA", marginTop: 6 }}>
          Approve, reject, or remove bookings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/admin-payments")}
        style={{
          backgroundColor: "#15151B",
          borderColor: "#23232B",
          borderWidth: 1,
          padding: 18,
          borderRadius: 18,
          marginBottom: 14,
        }}
      >
        <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "600" }}>
          Manage Payments
        </Text>
        <Text style={{ color: "#A1A1AA", marginTop: 6 }}>
          View and update payment status
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/admin-packages")}
        style={{
          backgroundColor: "#15151B",
          borderColor: "#23232B",
          borderWidth: 1,
          padding: 18,
          borderRadius: 18,
          marginBottom: 14,
        }}
      >
        <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "600" }}>
          Manage Packages
        </Text>
        <Text style={{ color: "#A1A1AA", marginTop: 6 }}>
          Add, edit, and delete packages
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/admin-users")}
        style={{
          backgroundColor: "#15151B",
          borderColor: "#23232B",
          borderWidth: 1,
          padding: 18,
          borderRadius: 18,
        }}
      >
        <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "600" }}>
          Manage Users
        </Text>
        <Text style={{ color: "#A1A1AA", marginTop: 6 }}>
          Update roles or delete user accounts
        </Text>
      </TouchableOpacity>
    </View>
  );
}