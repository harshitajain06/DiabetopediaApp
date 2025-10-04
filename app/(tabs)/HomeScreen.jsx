import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DiabeticAppHome() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.header}>🌸 Diabetopedia</Text>
      <Text style={styles.subHeader}>
        Manage your health - take control of your plate!
      </Text>

      {/* App Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
        Welcome to Diabetopedia — your smart companion for diabetes care. Simply <Text style={styles.boldText}>snap or upload a photo</Text> of your meal with our <Text style={styles.boldText}>AI Food Scanner</Text> to instantly know if it’s diabetes-friendly and discover healthier choices.
        </Text>
      </View>

      {/* Cards */}
      <TouchableOpacity
        style={[styles.card, styles.cardPurple]}
        onPress={() => Linking.openURL("https://diabetopedia.in/")}
      >
        <Text style={styles.cardTitle}>📊 Diabetes Care</Text>
        <Text style={styles.cardDesc}>
        <Text style={styles.boldText}>Click here</Text> to learn in depth about Diabetes and manage your health.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.cardYellow]}
        onPress={() => Linking.openURL("https://diabetopedia-sand.vercel.app/")}
      >
        <Text style={styles.cardTitle}>🥗 Meal Planner</Text>
        <Text style={styles.cardDesc}>
        <Text style={styles.boldText}>Click here</Text> to get customised <Text style={styles.boldText}>diet charts</Text> for diabetics.
        </Text>
      </TouchableOpacity>

      {/* Footer note pointing to Scan tab */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
        Tap the <Text style={styles.boldText}>Scan tab</Text> below for instant insights on your plate
        </Text>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrowEmoji}>⬇️</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FFFFFF", // very light beige background
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#000000", // light blue
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#000000", // light blue
  },
  descriptionContainer: {
    marginBottom: 16,
    backgroundColor: "#FFF9C4", // soft pastel yellow box
    padding: 15,
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 20,
    marginBottom: 10,
    color: "#000000", // black text
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "bold",
  },
  card: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardPurple: {
    backgroundColor: "#B8E3E9", // light blue
  },
  cardYellow: {
    backgroundColor: "#FFF176", // soft yellow
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000000", // black
  },
  cardDesc: {
    fontSize: 14,
    color: "#000000", // black
  },
  footerContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#000000", // black
    textAlign: "center",
  },
  arrowContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  arrowEmoji: {
    fontSize: 24,
    fontWeight: "bold",
  },
});