import React, { useState } from "react";
import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Alert,
ScrollView
} from "react-native";

import { ref, push, update } from "@react-native-firebase/database";
import { db } from "../config/firebase";

export default function ConsultationScreen({ route, navigation }) {

const patient = route?.params?.patient;

if (!patient) {
  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
      <Text>No patient selected</Text>
    </View>
  );
}

const [symptoms,setSymptoms] = useState("");
const [diagnosis,setDiagnosis] = useState("");
const [drug,setDrug] = useState("");
const [dosage,setDosage] = useState("");
const [duration,setDuration] = useState("");
const [note,setNote] = useState("");

/* ===========================
   GENERATE TIMES FROM DOSAGE
=========================== */
const generateTimesFromDosage = (dosage) => {

  const text = dosage.toLowerCase();

  if (text.includes("1 time")) return ["08:00"];
  if (text.includes("2 times")) return ["08:00", "20:00"];
  if (text.includes("3 times")) return ["08:00", "14:00", "20:00"];

  return ["08:00"]; // default

};

/* ===========================
   GENERATE FULL SCHEDULE
=========================== */
const generateSchedules = () => {

  const times = generateTimesFromDosage(dosage);

  const numDays = parseInt(duration);

  if (!numDays || numDays <= 0) return [];

  let schedules = [];

  for (let d = 0; d < numDays; d++) {

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + d);

    times.forEach(time => {

      const [hour, minute] = time.split(":").map(Number);

      let doseDate = new Date(baseDate);
      doseDate.setHours(hour, minute, 0, 0);

      schedules.push(doseDate.toISOString());

    });

  }

  return schedules;

};

/* ===========================
   SAVE CONSULTATION + REMINDERS
=========================== */
const saveConsultation = () => {

  if (!drug || !dosage || !duration) {
    Alert.alert("Error", "Please fill all required fields");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  const consultationData = {
    patientId: patient.id,
    patientName: patient.patientName,
    token: patient.token,
    patientEmail: patient.patientEmail,
    symptoms,
    diagnosis,
    prescription: drug,
    dosage,
    duration,
    doctorNote: note,
    date: today,
    status: "pending-pharmacy"
  };

  // Save consultation
  push(ref(db,"consultations"), consultationData);

  // Generate schedules automatically
  const schedules = generateSchedules();

  // Save reminders
  push(ref(db,"reminders"), {
    patientId: patient.id,
    token: patient.token,
    patientEmail: patient.patientEmail,
    drug,
    dosage,
    duration,
    tips: note,
    schedule: schedules,
    taken: {
      init: false
    }
  });

  // Update queue
  update(ref(db,"queue/"+patient.id),{
    status:"consulted"
  });

  Alert.alert("Success","Consultation & reminders saved");

  navigation.navigate("Queue");

};

return(

<ScrollView style={styles.container}>

<Text style={styles.title}>Doctor Consultation</Text>

<View style={styles.patientBox}>
  <Text style={styles.token}>{patient.token}</Text>
  <Text style={styles.name}>{patient.patientName}</Text>
</View>

<TextInput
style={styles.input}
placeholder="Symptoms"
value={symptoms}
onChangeText={setSymptoms}
/>

<TextInput
style={styles.input}
placeholder="Diagnosis"
value={diagnosis}
onChangeText={setDiagnosis}
/>

<Text style={styles.section}>Prescription</Text>

<TextInput
style={styles.input}
placeholder="Drug Name"
value={drug}
onChangeText={setDrug}
/>

<TextInput
style={styles.input}
placeholder="Dosage (e.g. 3 times daily)"
value={dosage}
onChangeText={setDosage}
/>

<TextInput
style={styles.input}
placeholder="Duration (days e.g. 5)"
value={duration}
onChangeText={setDuration}
keyboardType="numeric"
/>

<TextInput
style={styles.input}
placeholder="Doctor Note"
value={note}
onChangeText={setNote}
/>

<TouchableOpacity
style={styles.button}
onPress={saveConsultation}
>
<Text style={styles.buttonText}>
Save Consultation
</Text>
</TouchableOpacity>

</ScrollView>

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

patientBox:{
backgroundColor:"#2563eb",
padding:20,
borderRadius:10,
marginBottom:20
},

token:{
color:"#fff",
fontSize:28,
fontWeight:"bold"
},

name:{
color:"#fff",
fontSize:18
},

section:{
fontSize:18,
fontWeight:"bold",
marginTop:10,
marginBottom:5
},

input:{
backgroundColor:"#fff",
padding:15,
borderRadius:10,
marginBottom:12,
borderWidth:1,
borderColor:"#ddd"
},

button:{
backgroundColor:"#10b981",
padding:16,
borderRadius:10,
marginTop:10
},

buttonText:{
color:"#fff",
textAlign:"center",
fontWeight:"bold",
fontSize:16
}

});