import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";

import { ref, onValue, update } from "@react-native-firebase/database";
import { auth, db } from "../config/firebase";
import NotificationService from "../config/NotificationService";

export default function MedicationReminderScreen() {

  const user = auth.currentUser;
  const email = user?.email;

  const [reminders, setReminders] = useState([]);
  const [now, setNow] = useState(new Date());

  /* ===========================
     CLOCK (for countdown)
  =========================== */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ===========================
     LOAD REMINDERS
  =========================== */
  useEffect(() => {

    if (!email) return;

    NotificationService.requestPermission();

    const reminderRef = ref(db, "reminders");

    onValue(reminderRef, snapshot => {

      let data = [];

      snapshot.forEach(child => {
        const val = child.val();

        if (val.patientEmail === email) {

          // Schedule notifications
          scheduleNotifications(child.key, val);

          data.push({
            id: child.key,
            ...val
          });
        }
      });

      setReminders(data);

    });

  }, []);

  /* ===========================
     SCHEDULE NOTIFICATIONS
  =========================== */
  const scheduledIds = new Set(); // prevent duplicates

  const scheduleNotifications = async (id, reminder) => {

    if (!reminder.schedule) return;

    for (let time of reminder.schedule) {

      const notifId = `${id}_${time}`;

      if (scheduledIds.has(notifId)) continue;

      scheduledIds.add(notifId);

      const date = new Date(time);

      // skip past times
      if (date <= new Date()) continue;

      await NotificationService.scheduleMedicationReminder(
        reminder.drug,
        reminder.tips || "Time to take your medication",
        date
      );

    }

  };

  const sanitizeKey = (time) => {
    return time.replace(/[.#$[\]]/g, "_");
  };

  /* ===========================
     MARK AS TAKEN
  =========================== */
  const markTaken = (reminderId, time) => {

    const safeTime = sanitizeKey(time);

    const takenRef = ref(db, `reminders/${reminderId}/taken`);

    update(takenRef, {
      [safeTime]: true
    });

  };

  /* ===========================
     GET NEXT DOSE
  =========================== */
  const getNextDose = (schedule, taken) => {

    for (let time of schedule) {

      if (!taken?.[sanitizeKey(time)]) {

        const date = new Date(time);

        if (date > now) {
          return date;
        }

      }

    }

    return null;

  };

  /* ===========================
     COUNTDOWN FORMAT
  =========================== */
  const formatCountdown = (date) => {

    const diff = date - now;

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return `${h}h ${m}m ${s}s`;

  };

  /* ===========================
     RENDER ITEM
  =========================== */
  const renderItem = ({ item }) => {

    const nextDose = getNextDose(item.schedule, item.taken);

    return (

      <View style={styles.card}>

        <Text style={styles.drug}>{item.drug}</Text>
        <Text>Dosage: {item.dosage}</Text>
        <Text>Duration: {item.duration} days</Text>

        {item.schedule.map(time => {

          const taken = item.taken?.[sanitizeKey(time)];

          return (
            <View key={time} style={styles.row}>

              <Text>{new Date(time).toLocaleString()}</Text>

              <Text>
                {taken ? "✅ Taken" : "⏳ Pending"}
              </Text>

              {!taken && (
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => markTaken(item.id, time)}
                >
                  <Text style={{color:"#fff"}}>Take</Text>
                </TouchableOpacity>
              )}

            </View>
          );

        })}

        {nextDose && (
          <Text style={styles.countdown}>
            Next dose in: {formatCountdown(nextDose)}
          </Text>
        )}

      </View>

    );

  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Medication Reminders</Text>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
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
    padding:15,
    borderRadius:10,
    marginBottom:12,
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
    alignItems:"center",
    marginTop:5
  },

  btn:{
    backgroundColor:"#10b981",
    padding:6,
    borderRadius:5
  },

  countdown:{
    marginTop:10,
    fontWeight:"bold",
    color:"#ef4444"
  }

});