import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Image } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Api";

export default function AdminPackagesScreen() {
  const [packages, setPackages] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/packages`);
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const createPackage = async () => {
    try {
      if (!title || !price || !description) {
        Alert.alert("Validation Error", "Please fill title, price, and description");
        return;
      }

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          price: Number(price),
          description,
          image,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Create failed");
        return;
      }

      Alert.alert("Success", "Package created");
      setTitle("");
      setPrice("");
      setDescription("");
      setImage("");
      fetchPackages();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not create package");
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/packages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Delete failed");
        return;
      }

      Alert.alert("Success", "Package deleted");
      fetchPackages();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not delete package");
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0F", paddingTop: 80 }}>
      <Text
        style={{
          color: "#F5F1E8",
          fontSize: 28,
          fontWeight: "700",
          paddingHorizontal: 24,
          marginBottom: 20,
        }}
      >
        Manage Packages
      </Text>

      <View
        style={{
          marginHorizontal: 24,
          backgroundColor: "#15151B",
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#23232B",
          padding: 16,
          marginBottom: 18,
        }}
      >
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Package title"
          placeholderTextColor="#7C7C85"
          style={{
            backgroundColor: "#1D1D24",
            color: "#F5F1E8",
            padding: 14,
            borderRadius: 12,
            marginBottom: 10,
          }}
        />

        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="Price"
          placeholderTextColor="#7C7C85"
          keyboardType="numeric"
          style={{
            backgroundColor: "#1D1D24",
            color: "#F5F1E8",
            padding: 14,
            borderRadius: 12,
            marginBottom: 10,
          }}
        />

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#7C7C85"
          multiline
          style={{
            backgroundColor: "#1D1D24",
            color: "#F5F1E8",
            padding: 14,
            borderRadius: 12,
            marginBottom: 10,
            minHeight: 90,
            textAlignVertical: "top",
          }}
        />

        <TextInput
          value={image}
          onChangeText={setImage}
          placeholder="Image URL"
          placeholderTextColor="#7C7C85"
          style={{
            backgroundColor: "#1D1D24",
            color: "#F5F1E8",
            padding: 14,
            borderRadius: 12,
            marginBottom: 12,
          }}
        />

        <TouchableOpacity
          onPress={createPackage}
          style={{
            backgroundColor: "#C6A96B",
            paddingVertical: 14,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#0B0B0F", textAlign: "center", fontWeight: "600" }}>
            Add Package
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={packages}
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
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={{
                  width: "100%",
                  height: 140,
                  borderRadius: 14,
                  marginBottom: 12,
                }}
                resizeMode="cover"
              />
            ) : null}

            <Text style={{ color: "#F5F1E8", fontSize: 18, fontWeight: "600" }}>
              {item.title}
            </Text>

            <Text style={{ color: "#C6A96B", marginTop: 6 }}>
              Rs. {item.price}
            </Text>

            <Text style={{ color: "#A1A1AA", marginTop: 8 }}>
              {item.description}
            </Text>

            <TouchableOpacity
              onPress={() => deletePackage(item._id)}
              style={{
                marginTop: 14,
                backgroundColor: "#2A2A33",
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#F5F1E8", textAlign: "center", fontWeight: "600" }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}