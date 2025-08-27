import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function DiabeticAppHome() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Diabetes Care</Text>
      <Text style={styles.subHeader}>
        Manage your health and track your progress
      </Text>

      {/* Cards */}
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>📊 Track Blood Sugar</Text>
        <Text style={styles.cardDesc}>
          Log your sugar levels daily to monitor your health.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>🥗 Meal Planner</Text>
        <Text style={styles.cardDesc}>
          Get healthy meal suggestions for diabetics.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>💊 Medication Reminders</Text>
        <Text style={styles.cardDesc}>
          Set alerts for your daily medicines and insulin.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>📅 Appointments</Text>
        <Text style={styles.cardDesc}>
          Keep track of doctor visits and check-ups.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
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
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0F766E",
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: "#4B5563",
  },
});
