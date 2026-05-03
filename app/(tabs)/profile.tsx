import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/Api";

const API_BASE_URL = API_URL;

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);

  // Edit Profile State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [editError, setEditError] = useState("");

  // Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setNewName(parsed.name || "");
      setNewEmail(parsed.email || "");
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  const handleUpdateProfile = async () => {
    setEditError("");
    if (!newName || !newEmail) {
      setEditError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        const updatedUser = { ...user, name: newName, email: newEmail };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditModalVisible(false);
        setProfileMsg({ text: "Profile updated successfully", type: "success" });
        setTimeout(() => setProfileMsg(null), 3000);
      } else {
        setEditError(data.message || "Failed to update profile");
      }
    } catch (error) {
      setEditError("Network error. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user._id}/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordSuccess("Password updated successfully!");
        setTimeout(() => {
          setPasswordModalVisible(false);
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordSuccess("");
        }, 1200);
      } else {
        setPasswordError(data.message || "Failed to update password");
      }
    } catch (error) {
      setPasswordError("Network error. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user._id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await AsyncStorage.clear();
        setDeleteModalVisible(false);
        router.replace("/register");
      }
    } catch (error) {
      setDeleteModalVisible(false);
    }
  };

  const MsgBanner = ({ text, type }: { text: string; type: "error" | "success" }) => (
    <View style={{
      backgroundColor: type === "error" ? "#2D1515" : "#152D1A",
      borderWidth: 1,
      borderColor: type === "error" ? "#EF4444" : "#22C55E",
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    }}>
      <Ionicons
        name={type === "error" ? "alert-circle-outline" : "checkmark-circle-outline"}
        size={18}
        color={type === "error" ? "#EF4444" : "#22C55E"}
      />
      <Text style={{ color: type === "error" ? "#EF4444" : "#22C55E", fontSize: 14, flex: 1 }}>
        {text}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0B0B0F" }}
      contentContainerStyle={{ paddingTop: 80, paddingHorizontal: 24, paddingBottom: 40 }}
    >
      <Text style={{ color: "#F5F1E8", fontSize: 28, fontWeight: "700", marginBottom: 24 }}>
        Profile
      </Text>

      {/* Global profile message */}
      {profileMsg && <MsgBanner text={profileMsg.text} type={profileMsg.type} />}

      {user ? (
        <>
          <View style={{ backgroundColor: "#15151B", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#23232B", marginBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View>
                <Text style={{ color: "#A1A1AA", marginBottom: 4 }}>Name</Text>
                <Text style={{ color: "#F5F1E8", fontSize: 18 }}>{user.name || "User"}</Text>
              </View>
              <TouchableOpacity onPress={() => { setEditError(""); setEditModalVisible(true); }}>
                <Ionicons name="create-outline" size={24} color="#C6A96B" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: "#A1A1AA", marginBottom: 4 }}>Email</Text>
            <Text style={{ color: "#F5F1E8", fontSize: 18 }}>{user.email || "No email"}</Text>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => { setPasswordError(""); setPasswordSuccess(""); setPasswordModalVisible(true); }}
              style={{ backgroundColor: "#1C1C24", paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "#23232B" }}
            >
              <Text style={{ color: "#F5F1E8", textAlign: "center", fontSize: 16, fontWeight: "600" }}>
                Change Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={{ backgroundColor: "#C6A96B", paddingVertical: 14, borderRadius: 14 }}
            >
              <Text style={{ color: "#0B0B0F", textAlign: "center", fontSize: 16, fontWeight: "600" }}>
                Logout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeleteModalVisible(true)}
              style={{ paddingVertical: 14, marginTop: 20 }}
            >
              <Text style={{ color: "#EF4444", textAlign: "center", fontSize: 14, fontWeight: "500" }}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
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
            style={{ backgroundColor: "#C6A96B", paddingVertical: 14, borderRadius: 14 }}
          >
            <Text style={{ color: "#0B0B0F", textAlign: "center", fontSize: 16, fontWeight: "600" }}>
              Login
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#15151B", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#23232B" }}>
            <Text style={{ color: "#F5F1E8", fontSize: 20, fontWeight: "700", marginBottom: 16 }}>Edit Profile</Text>

            {editError ? <MsgBanner text={editError} type="error" /> : null}

            <Text style={{ color: "#A1A1AA", marginBottom: 8 }}>Full Name</Text>
            <TextInput
              value={newName}
              onChangeText={(v) => { setNewName(v); setEditError(""); }}
              style={{ backgroundColor: "#0B0B0F", color: "#F5F1E8", padding: 12, borderRadius: 10, marginBottom: 16 }}
            />

            <Text style={{ color: "#A1A1AA", marginBottom: 8 }}>Email Address</Text>
            <TextInput
              value={newEmail}
              onChangeText={(v) => { setNewEmail(v); setEditError(""); }}
              autoCapitalize="none"
              style={{ backgroundColor: "#0B0B0F", color: "#F5F1E8", padding: 12, borderRadius: 10, marginBottom: 24 }}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#1C1C24" }}>
                <Text style={{ color: "#A1A1AA", textAlign: "center" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdateProfile} style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#C6A96B" }}>
                <Text style={{ color: "#0B0B0F", textAlign: "center", fontWeight: "600" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#15151B", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#23232B" }}>
            <Text style={{ color: "#F5F1E8", fontSize: 20, fontWeight: "700", marginBottom: 16 }}>Change Password</Text>

            {passwordError ? <MsgBanner text={passwordError} type="error" /> : null}
            {passwordSuccess ? <MsgBanner text={passwordSuccess} type="success" /> : null}

            <TextInput
              placeholder="Current Password"
              placeholderTextColor="#7C7C85"
              secureTextEntry
              value={oldPassword}
              onChangeText={(v) => { setOldPassword(v); setPasswordError(""); }}
              style={{ backgroundColor: "#0B0B0F", color: "#F5F1E8", padding: 12, borderRadius: 10, marginBottom: 12 }}
            />

            <TextInput
              placeholder="New Password"
              placeholderTextColor="#7C7C85"
              secureTextEntry
              value={newPassword}
              onChangeText={(v) => { setNewPassword(v); setPasswordError(""); }}
              style={{ backgroundColor: "#0B0B0F", color: "#F5F1E8", padding: 12, borderRadius: 10, marginBottom: 12 }}
            />

            <TextInput
              placeholder="Confirm New Password"
              placeholderTextColor="#7C7C85"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); setPasswordError(""); }}
              style={{ backgroundColor: "#0B0B0F", color: "#F5F1E8", padding: 12, borderRadius: 10, marginBottom: 24 }}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#1C1C24" }}>
                <Text style={{ color: "#A1A1AA", textAlign: "center" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChangePassword} style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#C6A96B" }}>
                <Text style={{ color: "#0B0B0F", textAlign: "center", fontWeight: "600" }}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#15151B", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#3D1515" }}>
            <Ionicons name="warning-outline" size={36} color="#EF4444" style={{ marginBottom: 12 }} />
            <Text style={{ color: "#F5F1E8", fontSize: 20, fontWeight: "700", marginBottom: 10 }}>Delete Account</Text>
            <Text style={{ color: "#A1A1AA", fontSize: 14, lineHeight: 22, marginBottom: 24 }}>
              Are you sure you want to permanently delete your account? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#1C1C24" }}>
                <Text style={{ color: "#A1A1AA", textAlign: "center", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAccount} style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#EF4444" }}>
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}