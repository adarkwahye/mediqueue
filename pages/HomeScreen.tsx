import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { ref, onValue } from "@react-native-firebase/database";
import { db, auth } from "../config/firebase"
import { signOut } from "@react-native-firebase/auth";

export default function HomeScreen({ navigation }) {

const [patientsToday, setPatientsToday] = useState(0);
const [queueWaiting, setQueueWaiting] = useState(0);
const [servedToday, setServedToday] = useState(0);
const [appointmentsToday, setAppointmentsToday] = useState(0);

useEffect(() => {

const today = new Date().toISOString().split("T")[0];

const queueRef = ref(db, "queue");
onValue(queueRef, snapshot => {

let waiting = 0;
let served = 0;

snapshot.forEach(child => {

const data = child.val();

if(data.date === today){

if(data.status === "waiting") waiting++;
if(data.status === "consulted") served++;

}

});

setQueueWaiting(waiting);
setServedToday(served);

});

const patientRef = ref(db, "patients");

onValue(patientRef, snapshot => {

let count = 0;

snapshot.forEach(child => {

const data = child.val();

if(data.createdAt === today){
count++;
}

});

setPatientsToday(count);

});

const appointmentRef = ref(db, "appointments");

onValue(appointmentRef, snapshot => {

let count = 0;

snapshot.forEach(child => {

const data = child.val();

if(data.date === today){
count++;
}

});

setAppointmentsToday(count);

});

},[]);

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

<ScrollView style={styles.container}>

<Text style={styles.title}>Clinic Dashboard</Text>

<View style={styles.cardContainer}>

<View style={styles.card}>
<Text style={styles.number}>{patientsToday}</Text>
<Text style={styles.label}>Patients Today</Text>
</View>

<View style={styles.card}>
<Text style={styles.number}>{queueWaiting}</Text>
<Text style={styles.label}>Waiting Queue</Text>
</View>

<View style={styles.card}>
<Text style={styles.number}>{servedToday}</Text>
<Text style={styles.label}>Served Today</Text>
</View>

<View style={styles.card}>
<Text style={styles.number}>{appointmentsToday}</Text>
<Text style={styles.label}>Appointments</Text>
</View>

</View>

<Text style={styles.section}>Quick Actions</Text>

<TouchableOpacity
style={styles.button}
onPress={() => navigation.navigate("RegisterPatient")}
>
<Text style={styles.buttonText}>Register Patient</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={() => navigation.navigate("Queue", { role: "receptionist" })}
>
<Text style={styles.buttonText}>Manage Queue</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={() => navigation.navigate("Appointments")}
>
<Text style={styles.buttonText}>Appointments</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={() => navigation.navigate("PatientRecords")}
>
<Text style={styles.buttonText}>Patient Records</Text>
</TouchableOpacity>

{/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

</ScrollView>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f4f6fb",
padding:20
},

title:{
fontSize:26,
fontWeight:"bold",
marginBottom:20,
color:"#2c3e50"
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
fontSize:28,
fontWeight:"bold",
color:"#2563eb"
},

label:{
marginTop:5,
color:"#7f8c8d"
},

section:{
marginTop:20,
marginBottom:10,
fontWeight:"bold",
fontSize:18
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