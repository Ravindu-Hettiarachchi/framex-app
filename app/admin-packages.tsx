import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Image } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AdminPackagesScreen() {
  const [packages, setPackages] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/packages`);
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setDescription("");
    setImage("");
    setIsEditing(false);
    setEditingId(null);
    setIsFormVisible(false);
  };

  const handleCreateOrUpdate = () => {
    if (isEditing) {
      updatePackage();
    } else {
      createPackage();
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
      resetForm();
      fetchPackages();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not create package");
    }
  };

  const updatePackage = async () => {
    try {
      if (!title || !price || !description) {
        Alert.alert("Validation Error", "Please fill title, price, and description");
        return;
      }

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/packages/${editingId}`, {
        method: "PUT",
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
        Alert.alert("Error", data.message || "Update failed");
        return;
      }

      Alert.alert("Success", "Package updated");
      resetForm();
      fetchPackages();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not update package");
    }
  };

  const startEditing = (item: any) => {
    setTitle(item.title);
    setPrice(item.price.toString());
    setDescription(item.description);
    setImage(item.image || "");
    setIsEditing(true);
    setEditingId(item._id);
    setIsFormVisible(true);
  };

  const deletePackage = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this package?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0F", paddingTop: 60 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, marginBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={28} color="#F5F1E8" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#F5F1E8",
              fontSize: 24,
              fontWeight: "700",
            }}
          >
            Packages
          </Text>
        </View>

        {!isFormVisible && (
          <TouchableOpacity
            onPress={() => setIsFormVisible(true)}
            style={{
              backgroundColor: "#C6A96B",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name="add" size={20} color="#0B0B0F" />
            <Text style={{ color: "#0B0B0F", fontWeight: "600", fontSize: 14 }}>Add New</Text>
          </TouchableOpacity>
        )}
      </View>

      {isFormVisible && (
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
          <Text style={{ color: "#C6A96B", fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            {isEditing ? "Edit Package" : "Add New Package"}
          </Text>

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

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={handleCreateOrUpdate}
              style={{
                flex: 1,
                backgroundColor: "#C6A96B",
                paddingVertical: 14,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#0B0B0F", textAlign: "center", fontWeight: "600" }}>
                {isEditing ? "Update Package" : "Add Package"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetForm}
              style={{
                flex: 1,
                backgroundColor: "#2A2A33",
                paddingVertical: 14,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#F5F1E8", textAlign: "center", fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => startEditing(item)}
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
                <Ionicons name="create-outline" size={18} color="#C6A96B" />
                <Text style={{ color: "#C6A96B", fontWeight: "600" }}>
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => deletePackage(item._id)}
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
    </View>
  );
}