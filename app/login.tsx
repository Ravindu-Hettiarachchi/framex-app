import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/Api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Validation Error", "Please enter email and password");
        return;
      }

      if (!validateEmail(email)) {
        Alert.alert("Validation Error", "Please enter a valid email address");
        return;
      }

      if (password.length < 6) {
        Alert.alert("Validation Error", "Password must be at least 6 characters");
        return;
      }

      setLoading(true);

      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
        return;
      }

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      Alert.alert("Success", "Login successful");

      router.replace("/(tabs)");
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
        {/* HEADER */}
        <View style={{ marginBottom: 36 }}>
          <Text
            style={{
              color: "#F5F1E8",
              fontSize: 34,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            FrameX
          </Text>

          <Text
            style={{
              color: "#A1A1AA",
              fontSize: 15,
              marginTop: 10,
              lineHeight: 22,
              maxWidth: "95%",
            }}
          >
            Sign in to continue your premium photography booking experience.
          </Text>
        </View>

        {/* CARD */}
        <View
          style={{
            backgroundColor: "#15151B",
            borderRadius: 22,
            padding: 20,
            borderWidth: 1,
            borderColor: "#23232B",
          }}
        >
          <Text
            style={{
              color: "#F5F1E8",
              fontSize: 22,
              fontWeight: "600",
              marginBottom: 18,
            }}
          >
            Welcome Back
          </Text>

          {/* EMAIL */}
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
              fontSize: 15,
            }}
          />

          {/* PASSWORD WITH EYE ICON */}
          <View style={{ position: "relative", marginBottom: 14 }}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#7C7C85"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={{
                backgroundColor: "#1D1D24",
                color: "#F5F1E8",
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#23232B",
                fontSize: 15,
              }}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 15,
                top: 18,
              }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#A1A1AA"
              />
            </TouchableOpacity>
          </View>

          {/* FORGOT PASSWORD */}
          <TouchableOpacity onPress={() => router.push("/forgot-password")}>
            <Text
              style={{
                color: "#C6A96B",
                textAlign: "right",
                marginBottom: 18,
                fontSize: 14,
              }}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            onPress={handleLogin}
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
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* REGISTER LINK */}
        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={{ marginTop: 22 }}
        >
          <Text
            style={{
              color: "#A1A1AA",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            Don’t have an account?{" "}
            <Text style={{ color: "#C6A96B", fontWeight: "600" }}>
              Create Account
            </Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}