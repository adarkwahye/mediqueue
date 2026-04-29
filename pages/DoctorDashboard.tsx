import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

import { ref, onValue } from "@react-native-firebase/database";
import { signOut } from "@react-native-firebase/auth";

import { db, auth } from "../config/firebase";

export default function DoctorDashboard({ navigation }) {

  const [totalQueue, setTotalQueue] = useState(0);
  const [served, setServed] = useState(0);

  useEffect(() => {

    const queueRef = ref(db, "queue");

    const unsubscribe = onValue(queueRef, (snapshot) => {

      let queueCount = 0;
      let servedCount = 0;

      snapshot.forEach(child => {
        const data = child.val();

        if (data) {
          if (data.status === "waiting") {
            queueCount++;
          }

          if (data.status === "consulted") {
            servedCount++;
          }
        }
      });

      setTotalQueue(queueCount);
      setServed(servedCount);

    });

    return () => unsubscribe();

  }, []);

  const handleLogout = () => {

    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace("Login");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );

  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Doctor Dashboard</Text>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalQueue}</Text>
          <Text style={styles.statLabel}>Patients in Queue</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{served}</Text>
          <Text style={styles.statLabel}>Patients Consulted</Text>
        </View>

      </View>


      {/* Navigation Cards */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Queue", { role: "doctor" })}
      >
        <Text style={styles.cardText}>View Patient Queue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("DoctorAppointments")}
      >
        <Text style={styles.cardText}>My Appointments</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ConsultationHistory")}
      >
        <Text style={styles.cardText}>Consultation History</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:20,
    backgroundColor:"#f4f6fb"
  },

  title:{
    fontSize:24,
    fontWeight:"bold",
    marginBottom:20
  },

  statsContainer:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:20
  },

  statCard:{
    backgroundColor:"#fff",
    flex:1,
    marginRight:10,
    padding:20,
    borderRadius:10,
    alignItems:"center",
    elevation:2
  },

  statNumber:{
    fontSize:28,
    fontWeight:"bold",
    color:"#2563eb"
  },

  statLabel:{
    color:"#555",
    marginTop:5
  },

  card:{
    backgroundColor:"#2563eb",
    padding:20,
    borderRadius:10,
    marginBottom:15
  },

  cardText:{
    color:"#fff",
    fontSize:18,
    fontWeight:"bold"
  },

  logoutBtn:{
    marginTop:20,
    backgroundColor:"#ef4444",
    padding:15,
    borderRadius:10
  },

  logoutText:{
    color:"#fff",
    textAlign:"center",
    fontWeight:"bold"
  }

});