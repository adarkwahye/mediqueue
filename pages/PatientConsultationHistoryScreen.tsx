import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet
} from "react-native";

import { ref, onValue } from "@react-native-firebase/database";
import { auth, db } from "../config/firebase";

export default function PatientConsultationHistoryScreen() {

  const user = auth.currentUser;
  const email = user?.email;

  const [consultations, setConsultations] = useState([]);

  useEffect(() => {

    if (!email) return;

    const consultRef = ref(db, "consultations");

    onValue(consultRef, snapshot => {

      let data = [];

      snapshot.forEach(child => {

        const val = child.val();

        // ✅ FILTER BY LOGGED-IN PATIENT EMAIL
        if (val.patientEmail === email) {

          data.push({
            id: child.key,
            ...val
          });

        }

      });

      // Sort latest first
      data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setConsultations(data);

    });

  }, []);

  /* ===========================
     RENDER ITEM
  =========================== */
  const renderItem = ({ item }) => (

    <View style={styles.card}>

      <View style={styles.header}>
        <Text style={styles.token}>{item.token}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>

      <Text style={styles.name}>{item.patientName}</Text>

      <Text>
        <Text style={styles.label}>Symptoms: </Text>
        {item.symptoms || "-"}
      </Text>

      <Text>
        <Text style={styles.label}>Diagnosis: </Text>
        {item.diagnosis || "-"}
      </Text>

      <Text style={styles.section}>Prescription</Text>

      <Text>
        <Text style={styles.label}>Drug: </Text>
        {item.prescription || "-"}
      </Text>

      <Text>
        <Text style={styles.label}>Dosage: </Text>
        {item.dosage || "-"}
      </Text>

      <Text>
        <Text style={styles.label}>Duration: </Text>
        {item.duration || "-"} days
      </Text>

      {item.doctorNote ? (
        <Text>
          <Text style={styles.label}>Doctor Note: </Text>
          {item.doctorNote}
        </Text>
      ) : null}

      <Text style={styles.status}>{item.status}</Text>

    </View>

  );

  return (

    <View style={styles.container}>

      <Text style={styles.title}>My Consultations</Text>

      <FlatList
        data={consultations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No consultation records found
          </Text>
        }
      />

    </View>

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
    fontSize:24,
    fontWeight:"bold",
    marginBottom:15
  },

  card:{
    backgroundColor:"#fff",
    padding:15,
    borderRadius:10,
    marginBottom:12,
    elevation:2
  },

  header:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:5
  },

  token:{
    fontSize:18,
    fontWeight:"bold",
    color:"#2563eb"
  },

  date:{
    color:"#888"
  },

  name:{
    fontSize:16,
    fontWeight:"bold",
    marginBottom:5
  },

  section:{
    marginTop:8,
    fontWeight:"bold",
    color:"#10b981"
  },

  label:{
    fontWeight:"bold"
  },

  status:{
    marginTop:8,
    fontWeight:"bold",
    color:"#ef4444"
  },

  empty:{
    textAlign:"center",
    marginTop:20,
    color:"#888"
  }

});