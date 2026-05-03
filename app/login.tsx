import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/Api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter email and password");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    try {
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
        setErrorMsg(data.message || "Invalid credentials");
        return;
      }

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      setSuccessMsg("Login successful! Redirecting...");
      setTimeout(() => router.replace("/(tabs)"), 800);
    } catch (error) {
      setErrorMsg("Could not connect to server. Please try again.");
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("../assets/images/icon.png")}
              style={{ width: 44, height: 44, borderRadius: 10, marginRight: 12 }}
            />
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
          </View>

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

          {/* ERROR MESSAGE */}
          {errorMsg ? (
            <View
              style={{
                backgroundColor: "#2D1515",
                borderWidth: 1,
                borderColor: "#EF4444",
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <Text style={{ color: "#EF4444", fontSize: 14, flex: 1 }}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* SUCCESS MESSAGE */}
          {successMsg ? (
            <View
              style={{
                backgroundColor: "#152D1A",
                borderWidth: 1,
                borderColor: "#22C55E",
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#22C55E" />
              <Text style={{ color: "#22C55E", fontSize: 14, flex: 1 }}>{successMsg}</Text>
            </View>
          ) : null}

          {/* EMAIL */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#7C7C85"
            value={email}
            onChangeText={(v) => { setEmail(v); setErrorMsg(""); }}
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
              onChangeText={(v) => { setPassword(v); setErrorMsg(""); }}
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
            Don't have an account?{" "}
            <Text style={{ color: "#C6A96B", fontWeight: "600" }}>
              Create Account
            </Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}