import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from "react-native";

import { ref, onValue } from "@react-native-firebase/database";
import { signOut } from "@react-native-firebase/auth";
import { db, auth } from "../config/firebase";

export default function PatientDashboard({ navigation }) {

  const user = auth.currentUser;
  const email = user?.email;

  const [totalMeds, setTotalMeds] = useState(0);
  const [pendingMeds, setPendingMeds] = useState(0);
  const [queuePosition, setQueuePosition] = useState(null);
  const [consultations, setConsultations] = useState(0);

  /* ===========================
     LOAD PATIENT DATA
  =========================== */
  useEffect(() => {

    if (!email) return;

    // REMINDERS
    const reminderRef = ref(db, "reminders");

    onValue(reminderRef, snapshot => {

      let total = 0;
      let pending = 0;

      snapshot.forEach(child => {
        const data = child.val();

        if (data.patientEmail === email) {
          total++;

          // count pending doses
          if (data.schedule) {
            pending += data.schedule.length;
          }
        }
      });

      setTotalMeds(total);
      setPendingMeds(pending);

    });

    // CONSULTATIONS
    const consultRef = ref(db, "consultations");

    onValue(consultRef, snapshot => {

      let count = 0;

      snapshot.forEach(child => {
        const data = child.val();

        if (data.patientEmail === email) {
          count++;
        }
      });

      setConsultations(count);

    });

    // QUEUE POSITION
    const queueRef = ref(db, "queue");

    onValue(queueRef, snapshot => {

      let list = [];

      snapshot.forEach(child => {
        const data = child.val();

        if (data.status !== "served") {
          list.push(data);
        }
      });

      list.sort((a,b)=> a.token.localeCompare(b.token));

      const index = list.findIndex(item => item.patientEmail === email);

      setQueuePosition(index >= 0 ? index + 1 : null);

    });

  }, []);

  /* ===========================
     LOGOUT
  =========================== */
  const handleLogout = () => {

    Alert.alert(
      "Logout",
      "Are you sure?",
      [
        { text:"Cancel" },
        {
          text:"Logout",
          onPress: async ()=>{
            await signOut(auth);
            navigation.replace("Login");
          }
        }
      ]
    );

  };

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>Patient Dashboard</Text>

      {/* ===== ANALYTICS CARDS ===== */}
      <View style={styles.cardContainer}>

        <View style={styles.card}>
          <Text style={styles.number}>{totalMeds}</Text>
          <Text style={styles.label}>Medications</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>{pendingMeds}</Text>
          <Text style={styles.label}>Pending Doses</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>{consultations}</Text>
          <Text style={styles.label}>Consultations</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>
            {queuePosition || "-"}
          </Text>
          <Text style={styles.label}>Queue Position</Text>
        </View>

      </View>


      {/* ===== NAVIGATION ===== */}

      <Text style={styles.section}>My Services</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Appointments")}
      >
        <Text style={styles.buttonText}>Book Appointment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MedicationReminder")}
      >
        <Text style={styles.buttonText}>Medication Reminders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MedicationHistory")}
      >
        <Text style={styles.buttonText}>Medication History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("PatientQueue")}
      >
        <Text style={styles.buttonText}>My Queue Status</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("PatientConsultationHistory")}
      >
        <Text style={styles.buttonText}>Consultation History</Text>
      </TouchableOpacity>

      {/* ===== LOGOUT ===== */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>

  );

}

/* ===========================
   STYLES
=========================== */

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:20,
    backgroundColor:"#f4f6fb"
  },

  title:{
    fontSize:26,
    fontWeight:"bold",
    marginBottom:20
  },

  cardContainer:{
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"space-between"
  },

  card:{
    backgroundColor:"#fff",
    width:"48%",
    padding:20,
    borderRadius:12,
    marginBottom:15,
    alignItems:"center",
    elevation:3
  },

  number:{
    fontSize:26,
    fontWeight:"bold",
    color:"#2563eb"
  },

  label:{
    marginTop:5,
    color:"#555"
  },

  section:{
    marginTop:20,
    marginBottom:10,
    fontSize:18,
    fontWeight:"bold"
  },

  button:{
    backgroundColor:"#2563eb",
    padding:15,
    borderRadius:10,
    marginBottom:12
  },

  buttonText:{
    color:"#fff",
    textAlign:"center",
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