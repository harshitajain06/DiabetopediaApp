import React from "react";
import { ScrollView, Text, View, TouchableOpacity, Linking, StyleSheet } from "react-native";

export default function DiabeticAppHome() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.header}>🌸 Diabetes Care</Text>
      <Text style={styles.subHeader}>
        Manage your health and track your progress
      </Text>

      {/* App Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          Welcome to Diabetopedia - your comprehensive diabetes management companion. 
          This app is designed to help you take control of your diabetes journey with 
          easy-to-use tools and features that support your daily health management needs.
        </Text>
        <Text style={styles.descriptionText}>
          This app also comes with an AI-based scanner tool that analyzes the food you 
          eat daily. It gives you a comprehensive analysis of whether it is considered 
          healthy for you or not. Tap the "Scan" tab below to quickly evaluate meals and 
          get clear insights on what’s suitable for you.
        </Text>
      </View>

      {/* Cards */}
      <TouchableOpacity
        style={[styles.card, styles.cardPurple]}
        onPress={() => Linking.openURL("https://www.diabetopedia.in/")}
      >
        <Text style={styles.cardTitle}>📊 Diabetes Care</Text>
        <Text style={styles.cardDesc}>
          Click here to learn in depth about Diabetes and manage your health.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.cardYellow]}
        onPress={() => Linking.openURL("https://diabetopedia.vercel.app/")}
      >
        <Text style={styles.cardTitle}>🥗 Meal Planner</Text>
        <Text style={styles.cardDesc}>
          Click here to get healthy meal suggestions for diabetics.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.cardPurple]}
        onPress={() => Linking.openURL("https://www.who.int/health-topics/diabetes")}
      >
        <Text style={styles.cardTitle}>📖 Learn About Diabetes</Text>
        <Text style={styles.cardDesc}>
          Educational resources to understand and manage diabetes.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F9F6FF", // very light lavender background
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#5E35B1", // deep purple
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#7E57C2", // medium purple
  },
  descriptionContainer: {
    marginBottom: 20,
    backgroundColor: "#FFF9C4", // soft pastel yellow box
    padding: 15,
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 14,
    marginBottom: 10,
    color: "#4A148C", // dark purple text
    lineHeight: 20,
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
    backgroundColor: "#E1BEE7", // soft lavender purple
  },
  cardYellow: {
    backgroundColor: "#FFF176", // soft yellow
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#311B92", // deep purple
  },
  cardDesc: {
    fontSize: 14,
    color: "#4A148C",
  },
});