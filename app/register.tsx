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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleRegister = async () => {
    try {
      if (
        !name.trim() ||
        !email.trim() ||
        !password.trim() ||
        !confirmPassword.trim()
      ) {
        Alert.alert("Validation Error", "Please fill all fields");
        return;
      }

      if (name.trim().length < 3) {
        Alert.alert("Validation Error", "Name must be at least 3 characters");
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

      if (password !== confirmPassword) {
        Alert.alert("Validation Error", "Passwords do not match");
        return;
      }

      setLoading(true);

      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Registration Failed", data.message || "Something went wrong");
        return;
      }

      Alert.alert("Success", "Account created successfully");
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
            Create Account
          </Text>

          <Text
            style={{
              color: "#A1A1AA",
              fontSize: 15,
              marginTop: 10,
              lineHeight: 22,
            }}
          >
            Join FrameX and start booking premium photography experiences.
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
            placeholder="Full Name"
            placeholderTextColor="#7C7C85"
            value={name}
            onChangeText={setName}
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
            placeholder="Password"
            placeholderTextColor="#7C7C85"
            value={password}
            onChangeText={setPassword}
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
            placeholder="Confirm Password"
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
            onPress={handleRegister}
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
              {loading ? "Creating..." : "Create Account"}
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
            Already have an account?{" "}
            <Text style={{ color: "#C6A96B", fontWeight: "600" }}>
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}