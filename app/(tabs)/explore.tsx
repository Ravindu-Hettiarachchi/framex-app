import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 60) / 2;

const CATEGORIES = [
  { id: "all", label: "All Works" },
  { id: "weddings", label: "Weddings" },
  { id: "portraits", label: "Portraits" },
  { id: "cinematic", label: "Cinematic" },
];

const GALLERY_ITEMS = [
  {
    id: "1",
    category: "weddings",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800",
    title: "The Royal Union",
  },
  {
    id: "2",
    category: "portraits",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800",
    title: "Elegance Redefined",
  },
  {
    id: "3",
    category: "cinematic",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800",
    title: "Urban Stories",
  },
  {
    id: "4",
    category: "weddings",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
    title: "Sunset Vows",
  },
  {
    id: "5",
    category: "portraits",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800",
    title: "Classic Soul",
  },
  {
    id: "6",
    category: "cinematic",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800",
    title: "Neon Dreams",
  },
];

export default function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems =
    activeCategory === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore Work</Text>
          <Text style={styles.subtitle}>
            A curated selection of our finest captures and cinematic journeys.
          </Text>
        </View>

        {/* CATEGORIES */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.activeCategoryChip,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.id && styles.activeCategoryText,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* GALLERY GRID */}
        <View style={styles.gridContainer}>
          {filteredItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.gridItem}>
              <Image
                source={{ uri: item.image }}
                style={styles.gridImage}
                contentFit="cover"
                transition={500}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={styles.gradient}
              >
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.badgeText}>{item.category}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    color: "#F5F1E8",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#15151B",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#23232B",
  },
  activeCategoryChip: {
    backgroundColor: "#C6A96B",
    borderColor: "#C6A96B",
  },
  categoryText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  activeCategoryText: {
    color: "#0B0B0F",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  gridItem: {
    width: COLUMN_WIDTH,
    height: 240,
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    backgroundColor: "#15151B",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    justifyContent: "flex-end",
    padding: 12,
  },
  itemTitle: {
    color: "#F5F1E8",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: "rgba(198, 169, 107, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#C6A96B",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
