import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(Array.isArray(data) ? data : []);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not fetch users");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    
    Alert.alert(
      "Change Role",
      `Are you sure you want to change this user's role to ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await fetch(`${API_URL}/api/users/${userId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
              });

              if (res.ok) {
                Alert.alert("Success", "User role updated");
                fetchUsers();
              } else {
                const data = await res.json();
                Alert.alert("Error", data.message || "Update failed");
              }
            } catch (error) {
              Alert.alert("Error", "Could not update user");
            }
          },
        },
      ]
    );
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUser?._id) {
      Alert.alert("Error", "You cannot delete your own admin account.");
      return;
    }

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this user? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await fetch(`${API_URL}/api/users/${userId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (res.ok) {
                Alert.alert("Success", "User deleted");
                fetchUsers();
              } else {
                const data = await res.json();
                Alert.alert("Error", data.message || "Delete failed");
              }
            } catch (error) {
              Alert.alert("Error", "Could not delete user");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadCurrentUser();
    fetchUsers();
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
          Manage Users
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#C6A96B" />
        </View>
      ) : (
        <FlatList
          data={users}
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
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "600" }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: "#A1A1AA", marginTop: 4 }}>
                    {item.email}
                  </Text>
                  <View 
                    style={{ 
                      marginTop: 8, 
                      backgroundColor: item.role === "admin" ? "#C6A96B20" : "#2A2A33",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                      alignSelf: "flex-start"
                    }}
                  >
                    <Text style={{ color: item.role === "admin" ? "#C6A96B" : "#A1A1AA", fontSize: 12, fontWeight: "600", textTransform: "uppercase" }}>
                      {item.role}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => toggleRole(item._id, item.role)}
                  style={{
                    flex: 1,
                    backgroundColor: "#2A2A33",
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons name="shield-outline" size={18} color="#C6A96B" />
                  <Text style={{ color: "#C6A96B", fontWeight: "600" }}>
                    {item.role === "admin" ? "Make User" : "Make Admin"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteUser(item._id)}
                  style={{
                    flex: 1,
                    backgroundColor: "#2A2A33",
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF4B4B" />
                  <Text style={{ color: "#FF4B4B", fontWeight: "600" }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
