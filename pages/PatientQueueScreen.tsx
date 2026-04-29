import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList
} from "react-native";

import { ref, onValue } from "@react-native-firebase/database";
import { auth, db } from "../config/firebase";
import NotificationService from "../config/NotificationService";

export default function PatientQueueScreen() {

  const user = auth.currentUser;
  const email = user?.email;

  const [queueList, setQueueList] = useState([]);
  const [position, setPosition] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [nowServing, setNowServing] = useState(null);

  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {

    if (!email) return;

    NotificationService.requestPermission();

    const queueRef = ref(db, "queue");

    onValue(queueRef, snapshot => {

      let list = [];

      snapshot.forEach(child => {
        const data = child.val();

        if (data.status !== "served") {
          list.push({
            id: child.key,
            ...data
          });
        }
      });

      // Sort by token
      list.sort((a,b)=> a.token.localeCompare(b.token));

      setQueueList(list);

      // Find current patient
      const index = list.findIndex(item => item.patientEmail === email);

      if (index >= 0) {
        setPosition(index + 1);
        setPeopleAhead(index);
      } else {
        setPosition(null);
        setPeopleAhead(0);
      }

      // Find now serving
      const current = list.find(item => item.status === "in-progress");
      setNowServing(current);

      // 🔔 ALERT WHEN IT'S YOUR TURN
      if (current && current.patientEmail === email && !alertSent) {

        NotificationService.showNotification(
          "It's Your Turn!",
          "Please proceed for your consultation"
        );

        setAlertSent(true);

      }

    });

  }, []);

  /* ===========================
     RENDER QUEUE ITEM
  =========================== */
  const renderItem = ({ item }) => (

    <View style={styles.row}>

      <Text style={styles.token}>{item.token}</Text>

      <Text style={styles.name}>
        {item.patientEmail === email ? "You" : item.patientName}
      </Text>

      <Text style={styles.status}>{item.status}</Text>

    </View>

  );

  return (

    <View style={styles.container}>

      <Text style={styles.title}>My Queue Status</Text>

      {/* NOW SERVING */}
      <View style={styles.cardBlue}>
        <Text style={styles.cardLabel}>Now Serving</Text>
        <Text style={styles.cardNumber}>
          {nowServing ? nowServing.token : "-"}
        </Text>
      </View>

      {/* POSITION */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Your Position</Text>
        <Text style={styles.cardNumber}>
          {position || "-"}
        </Text>
      </View>

      {/* PEOPLE AHEAD */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>People Ahead</Text>
        <Text style={styles.cardNumber}>
          {peopleAhead}
        </Text>
      </View>

      {/* QUEUE LIST */}
      <Text style={styles.section}>Queue List</Text>

      <FlatList
        data={queueList}
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

  card:{
    backgroundColor:"#fff",
    padding:20,
    borderRadius:10,
    marginBottom:12,
    alignItems:"center",
    elevation:2
  },

  cardBlue:{
    backgroundColor:"#2563eb",
    padding:20,
    borderRadius:10,
    marginBottom:12,
    alignItems:"center"
  },

  cardLabel:{
    color:"#555"
  },

  cardNumber:{
    fontSize:28,
    fontWeight:"bold",
    color:"#000"
  },

  section:{
    marginTop:10,
    marginBottom:10,
    fontWeight:"bold",
    fontSize:18
  },

  row:{
    backgroundColor:"#fff",
    padding:15,
    borderRadius:10,
    marginBottom:10,
    flexDirection:"row",
    justifyContent:"space-between"
  },

  token:{
    fontWeight:"bold",
    color:"#2563eb"
  },

  name:{
    color:"#333"
  },

  status:{
    color:"#888"
  }

});