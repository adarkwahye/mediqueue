import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet
} from "react-native";

import { ref, onValue } from "@react-native-firebase/database";
import { auth, db } from "../config/firebase";

export default function MedicationHistoryScreen() {

  const user = auth.currentUser;
  const email = user?.email;

  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    taken: 0,
    missed: 0,
    pending: 0
  });

  const sanitizeKey = (time) => {
    return time.replace(/[.#$[\]]/g, "_");
  };

  useEffect(() => {

    if (!email) return;

    const reminderRef = ref(db, "reminders");

    onValue(reminderRef, snapshot => {

      let list = [];

      let takenCount = 0;
      let missedCount = 0;
      let pendingCount = 0;

      const now = new Date();

      snapshot.forEach(child => {

        const val = child.val();

        if (val.patientEmail === email) {

          let taken = 0;
          let missed = 0;
          let pending = 0;

          val.schedule?.forEach(time => {

            const date = new Date(time);

            if (val.taken?.[sanitizeKey(time)]) {
              taken++;
              takenCount++;
            } else if (date < now) {
              missed++;
              missedCount++;
            } else {
              pending++;
              pendingCount++;
            }

          });

          list.push({
            id: child.key,
            ...val,
            taken,
            missed,
            pending
          });

        }

      });

      setData(list);

      setStats({
        taken: takenCount,
        missed: missedCount,
        pending: pendingCount
      });

    });

  }, []);

  /* ===========================
     CALCULATE ADHERENCE
  =========================== */
  const total = stats.taken + stats.missed;
  const adherence = total > 0
    ? ((stats.taken / total) * 100).toFixed(1)
    : 0;

  /* ===========================
     RENDER ITEM
  =========================== */
  const renderItem = ({ item }) => (

    <View style={styles.card}>

      <Text style={styles.drug}>{item.drug}</Text>

      <Text>Dosage: {item.dosage}</Text>
      <Text>Duration: {item.duration} days</Text>

      <View style={styles.row}>
        <Text style={styles.taken}>Taken: {item.taken}</Text>
        <Text style={styles.missed}>Missed: {item.missed}</Text>
        <Text style={styles.pending}>Pending: {item.pending}</Text>
      </View>

    </View>

  );

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Medication History</Text>

      {/* ===== GLOBAL STATS ===== */}
      <View style={styles.statsContainer}>

        <View style={styles.statCard}>
          <Text style={styles.number}>{stats.taken}</Text>
          <Text>Taken</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.number}>{stats.missed}</Text>
          <Text>Missed</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.number}>{stats.pending}</Text>
          <Text>Pending</Text>
        </View>

      </View>

      {/* ===== ADHERENCE ===== */}
      <View style={styles.adherenceCard}>
        <Text style={styles.adherenceText}>
          Adherence: {adherence}%
        </Text>
      </View>

      {/* ===== LIST ===== */}
      <FlatList
        data={data}
        keyExtractor={(item)=>item.id}
        renderItem={renderItem}
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

  statsContainer:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:15
  },

  statCard:{
    backgroundColor:"#fff",
    padding:15,
    borderRadius:10,
    alignItems:"center",
    flex:1,
    marginRight:5,
    elevation:2
  },

  number:{
    fontSize:20,
    fontWeight:"bold",
    color:"#2563eb"
  },

  adherenceCard:{
    backgroundColor:"#10b981",
    padding:15,
    borderRadius:10,
    marginBottom:15,
    alignItems:"center"
  },

  adherenceText:{
    color:"#fff",
    fontSize:18,
    fontWeight:"bold"
  },

  card:{
    backgroundColor:"#fff",
    padding:15,
    borderRadius:10,
    marginBottom:10,
    elevation:2
  },

  drug:{
    fontSize:18,
    fontWeight:"bold",
    color:"#2563eb",
    marginBottom:5
  },

  row:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:10
  },

  taken:{
    color:"#10b981"
  },

  missed:{
    color:"#ef4444"
  },

  pending:{
    color:"#f59e0b"
  }

});