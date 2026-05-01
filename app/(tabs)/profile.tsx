import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

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
          fontSize: 28,
          fontWeight: "700",
          marginBottom: 24,
        }}
      >
        Profile
      </Text>

      {user ? (
        <>
          <View
            style={{
              backgroundColor: "#15151B",
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: "#23232B",
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#A1A1AA", marginBottom: 8 }}>Name</Text>
            <Text style={{ color: "#F5F1E8", fontSize: 18, marginBottom: 16 }}>
              {user.name || "User"}
            </Text>

            <Text style={{ color: "#A1A1AA", marginBottom: 8 }}>Email</Text>
            <Text style={{ color: "#F5F1E8", fontSize: 18 }}>
              {user.email || "No email"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: "#C6A96B",
              paddingVertical: 14,
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                color: "#0B0B0F",
                textAlign: "center",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={{ alignItems: "center", marginTop: 40, marginBottom: 30 }}>
            <Text style={{ color: "#A1A1AA", fontSize: 16 }}>
              Please log in to view your profile.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={{
              backgroundColor: "#C6A96B",
              paddingVertical: 14,
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                color: "#0B0B0F",
                textAlign: "center",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Login
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}