import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { ref, push, onValue } from "@react-native-firebase/database";
import { db } from "../config/firebase";

export default function RegisterPatient({ navigation }) {

const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [gender, setGender] = useState("");
const [email, setEmail] = useState("");

const [nextToken, setNextToken] = useState("Q001");

useEffect(() => {

const queueRef = ref(db, "queue");

onValue(queueRef, snapshot => {

let count = 0;

snapshot.forEach(() => {
count++;
});

let tokenNumber = count + 1;

let token = "Q" + String(tokenNumber).padStart(3,"0");

setNextToken(token);

});

},[]);

const registerPatient = () => {

if(name === "" || phone === "" || email=== "" || gender === ""){
Alert.alert("Error","Please fill all fields");
return;
}

const today = new Date().toISOString().split("T")[0];

const patientData = {
name:name,
phone:phone,
gender:gender,
patientEmail:email,
createdAt:today
};

push(ref(db,"patients"), patientData);

const queueData = {
token:nextToken,
patientName:name,
patientEmail:email,
status:"waiting",
date:today
};

push(ref(db,"queue"), queueData);

Alert.alert(
"Success",
"Patient registered with Token " + nextToken
);

setName("");
setPhone("");
setGender("");
setEmail("");

navigation.navigate("Queue");

};

return(

<View style={styles.container}>

<Text style={styles.title}>Register Patient</Text>

<Text style={styles.token}>Next Token: {nextToken}</Text>

<TextInput
style={styles.input}
placeholder="Patient Name"
value={name}
onChangeText={setName}
/>

<TextInput
style={styles.input}
placeholder="Phone Number"
value={phone}
onChangeText={setPhone}
/>

<TextInput
style={styles.input}
placeholder="Email"
value={email}
onChangeText={setEmail}
/>

<TextInput
style={styles.input}
placeholder="Gender"
value={gender}
onChangeText={setGender}
/>

<TouchableOpacity
style={styles.button}
onPress={registerPatient}
>

<Text style={styles.buttonText}>
Register & Add to Queue
</Text>

</TouchableOpacity>

</View>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
padding:25,
backgroundColor:"#f4f6fb",
justifyContent:"center"
},

title:{
fontSize:24,
fontWeight:"bold",
marginBottom:10,
color:"#2c3e50"
},

token:{
fontSize:18,
color:"#2563eb",
marginBottom:20
},

input:{
backgroundColor:"#fff",
padding:15,
borderRadius:10,
marginBottom:15,
borderWidth:1,
borderColor:"#ddd"
},

button:{
backgroundColor:"#2563eb",
padding:16,
borderRadius:10
},

buttonText:{
color:"#fff",
textAlign:"center",
fontWeight:"bold",
fontSize:16
}

});