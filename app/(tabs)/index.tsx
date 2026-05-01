import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0B0B0F" }}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          paddingTop: 80,
          paddingHorizontal: 24,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text
          style={{
            color: "#F5F1E8",
            fontSize: 32,
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
            lineHeight: 24,
            maxWidth: "95%",
          }}
        >
          Capture timeless stories through premium photography and cinematic
          visual experiences.
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/packages")}
          style={{
            marginTop: 22,
            backgroundColor: "#C6A96B",
            paddingVertical: 14,
            borderRadius: 16,
            width: 170,
          }}
        >
          <Text
            style={{
              color: "#0B0B0F",
              textAlign: "center",
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            Explore Packages
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <View
        style={{
          marginTop: 28,
          marginHorizontal: 24,
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
            fontSize: 20,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Featured Experience
        </Text>

        <Text
          style={{
            color: "#A1A1AA",
            fontSize: 14,
            lineHeight: 22,
            marginBottom: 16,
          }}
        >
          From weddings to pre-shoots, we craft elegant frames that preserve
          the emotion of every moment.
        </Text>

        <Image
          source={require("../../assets/images/wedding1.jpg")}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 18,
          }}
          resizeMode="cover"
        />
      </View>

      <View style={{ marginTop: 28, paddingHorizontal: 24 }}>
        <Text
          style={{
            color: "#F5F1E8",
            fontSize: 22,
            fontWeight: "600",
            marginBottom: 14,
          }}
        >
          Our Past Works
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            {
              image: require("../../assets/images/wedding1.jpg"),
              title: "Wedding Story",
            },
            {
              image: require("../../assets/images/shoot1.jpg"),
              title: "Pre Shoot",
            },
            {
              image: require("../../assets/images/event1.jpg"),
              title: "Event Coverage",
            },
          ].map((item, index) => (
            <View
              key={index}
              style={{
                width: 240,
                marginRight: 14,
                backgroundColor: "#15151B",
                borderRadius: 20,
                padding: 12,
                borderWidth: 1,
                borderColor: "#23232B",
              }}
            >
              <Image
                source={item.image}
                style={{
                  width: "100%",
                  height: 150,
                  borderRadius: 16,
                  marginBottom: 12,
                }}
                resizeMode="cover"
              />

              <Text
                style={{
                  color: "#F5F1E8",
                  fontSize: 17,
                  fontWeight: "600",
                }}
              >
                {item.title}
              </Text>

              <Text
                style={{
                  color: "#A1A1AA",
                  fontSize: 13,
                  marginTop: 6,
                  lineHeight: 20,
                }}
              >
                A refined visual story created with premium tones and timeless
                composition.
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={{ marginTop: 28, paddingHorizontal: 24 }}>
        <Text
          style={{
            color: "#F5F1E8",
            fontSize: 22,
            fontWeight: "600",
            marginBottom: 14,
          }}
        >
          Moments in Frames
        </Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1, gap: 12 }}>
            <Image
              source={require("../../assets/images/wedding1.jpg")}
              style={{
                width: "100%",
                height: 160,
                borderRadius: 18,
              }}
              resizeMode="cover"
            />

            <Image
              source={require("../../assets/images/shoot1.jpg")}
              style={{
                width: "100%",
                height: 110,
                borderRadius: 18,
              }}
              resizeMode="cover"
            />
          </View>

          <View style={{ flex: 1, gap: 12 }}>
            <Image
              source={require("../../assets/images/event1.jpg")}
              style={{
                width: "100%",
                height: 110,
                borderRadius: 18,
              }}
              resizeMode="cover"
            />

            <Image
              source={require("../../assets/images/wedding1.jpg")}
              style={{
                width: "100%",
                height: 160,
                borderRadius: 18,
              }}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      <View style={{ marginTop: 28, paddingHorizontal: 24 }}>
        <Text
          style={{
            color: "#F5F1E8",
            fontSize: 22,
            fontWeight: "600",
            marginBottom: 14,
          }}
        >
          Client Feedback
        </Text>

        {[
          {
            name: "Nethmi",
            text: "The team captured every moment beautifully. The final edits felt elegant and emotional.",
          },
          {
            name: "Kavindu",
            text: "Professional service, premium quality, and a very smooth booking experience from start to finish.",
          },
        ].map((review, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#15151B",
              borderRadius: 18,
              padding: 18,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#23232B",
            }}
          >
            <Text
              style={{
                color: "#F5F1E8",
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              {review.name}
            </Text>

            <Text
              style={{
                color: "#A1A1AA",
                fontSize: 14,
                lineHeight: 22,
              }}
            >
              {review.text}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}