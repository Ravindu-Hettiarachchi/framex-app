import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "../constants/Api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (value: string) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const handleResetPassword = async () => {
    try {
      if (!email.trim() || !newPassword.trim() || !confirmPassword.trim()) {
        Alert.alert("Validation Error", "Please fill all fields");
        return;
      }

      if (!validateEmail(email)) {
        Alert.alert("Validation Error", "Please enter a valid email address");
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert("Validation Error", "Password must be at least 6 characters");
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert("Validation Error", "Passwords do not match");
        return;
      }

      setLoading(true);

      const response = await fetch(`${API_URL}/api/users/forgot-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Reset Failed", data.message || "Something went wrong");
        return;
      }

      Alert.alert("Success", "Password reset successfully");
      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", "Could not connect to server");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0B0B0F",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={{ marginBottom: 36 }}>
          <Text
            style={{
              color: "#F5F1E8",
              fontSize: 34,
              fontWeight: "700",
            }}
          >
            Reset Password
          </Text>

          <Text
            style={{
              color: "#A1A1AA",
              fontSize: 15,
              marginTop: 10,
              lineHeight: 22,
            }}
          >
            Enter your email and create a new password for your account.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#15151B",
            borderRadius: 22,
            padding: 20,
            borderWidth: 1,
            borderColor: "#23232B",
          }}
        >
          <TextInput
            placeholder="Email"
            placeholderTextColor="#7C7C85"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: "#1D1D24",
              color: "#F5F1E8",
              padding: 16,
              marginBottom: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#23232B",
            }}
          />

          <TextInput
            placeholder="New Password"
            placeholderTextColor="#7C7C85"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={{
              backgroundColor: "#1D1D24",
              color: "#F5F1E8",
              padding: 16,
              marginBottom: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#23232B",
            }}
          />

          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#7C7C85"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={{
              backgroundColor: "#1D1D24",
              color: "#F5F1E8",
              padding: 16,
              marginBottom: 18,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#23232B",
            }}
          />

          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#8B7A55" : "#C6A96B",
              paddingVertical: 15,
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
              {loading ? "Updating..." : "Reset Password"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={{ marginTop: 22 }}
        >
          <Text
            style={{
              color: "#A1A1AA",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            Back to{" "}
            <Text style={{ color: "#C6A96B", fontWeight: "600" }}>
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}