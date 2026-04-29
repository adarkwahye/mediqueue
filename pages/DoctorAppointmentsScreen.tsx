import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { ref, onValue } from "@react-native-firebase/database";
import { db, auth } from "../config/firebase";

// Appointment type
interface Appointment {
  id: string;
  patientEmail: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  createdAt: string;
}

export default function DoctorAppointmentsScreen() {
  const user = auth.currentUser;
  const doctorId = user?.uid || "";
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    const appointmentRef = ref(db, "appointments");
    const unsubscribe = onValue(appointmentRef, snapshot => {
      let list: Appointment[] = [];
      snapshot.forEach(child => {
        const val = child.val();
        if (val.doctorId === doctorId) {
          list.push({ id: child.key || "", ...val });
        }
      });
      // Sort by date/time ascending
      list.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      setAppointments(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [doctorId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading your appointments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      <FlatList
        data={appointments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.patientName}>Patient: {item.patientName}</Text>
            <Text>Email: {item.patientEmail}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Time: {item.time}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No appointments found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6fb"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  patientName: {
    fontWeight: "bold"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 10,
    color: "#2563eb"
  }
});
