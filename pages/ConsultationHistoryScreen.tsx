import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput
} from "react-native";

import { ref, onValue } from "@react-native-firebase/database";
import { db } from "../config/firebase";

export default function ConsultationHistoryScreen() {

  const [consultations, setConsultations] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    const consultRef = ref(db, "consultations");

    const unsubscribe = onValue(consultRef, (snapshot) => {

      let data = [];

      snapshot.forEach(child => {
        const val = child.val();

        if (val) {
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

    return () => unsubscribe();

  }, []);

  // Filter by patient name or token
  const filteredData = consultations.filter(item =>
    item.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    item.token?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (

    <View style={styles.card}>

      <View style={styles.header}>
        <Text style={styles.token}>{item.token}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>

      <Text style={styles.name}>{item.patientName}</Text>

      <Text><Text style={styles.label}>Symptoms:</Text> {item.symptoms}</Text>
      <Text><Text style={styles.label}>Diagnosis:</Text> {item.diagnosis}</Text>

      <Text style={styles.section}>Prescription</Text>

      <Text><Text style={styles.label}>Drug:</Text> {item.prescription}</Text>
      <Text><Text style={styles.label}>Dosage:</Text> {item.dosage}</Text>
      <Text><Text style={styles.label}>Duration:</Text> {item.duration}</Text>

      {item.doctorNote ? (
        <Text><Text style={styles.label}>Note:</Text> {item.doctorNote}</Text>
      ) : null}

      <Text style={styles.status}>{item.status}</Text>

    </View>

  );

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Consultation History</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by name or token..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No consultations found
          </Text>
        }
      />

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
    marginBottom:15
  },

  search:{
    backgroundColor:"#fff",
    padding:12,
    borderRadius:10,
    marginBottom:15,
    borderWidth:1,
    borderColor:"#ddd"
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
  }

});