import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "@react-native-firebase/auth";
import { ref, set } from "@react-native-firebase/database";
import { auth, db } from "../config/firebase";

export default function RegisterScreen({ navigation }) {

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [role, setRole] = useState("patient");

const handleRegister = () => {

createUserWithEmailAndPassword(auth, email, password)
.then((userCredential) => {

const uid = userCredential.user.uid;

set(ref(db, "users/" + uid), {
name,
email,
role
});

Alert.alert("Success", "Account created");

navigation.replace("Login");

})
.catch(error => Alert.alert("Error", error.message));

};

return (

<View style={styles.container}>

<Text style={styles.title}>Register</Text>

<TextInput
style={styles.input}
placeholder="Full Name"
value={name}
onChangeText={setName}
/>

<TextInput
style={styles.input}
placeholder="Email"
value={email}
onChangeText={setEmail}
/>

<TextInput
style={styles.input}
placeholder="Password"
secureTextEntry
value={password}
onChangeText={setPassword}
/>

<Text style={{marginBottom:10}}>Select Role</Text>

<View style={styles.roles}>

<TouchableOpacity onPress={()=>setRole("patient")}>
<Text style={role=="patient"?styles.active:styles.role}>Patient</Text>
</TouchableOpacity>

<TouchableOpacity onPress={()=>setRole("reception")}>
<Text style={role=="reception"?styles.active:styles.role}>Receptionist</Text>
</TouchableOpacity>

<TouchableOpacity onPress={()=>setRole("doctor")}>
<Text style={role=="doctor"?styles.active:styles.role}>Doctor</Text>
</TouchableOpacity>

<TouchableOpacity onPress={()=>setRole("pharmacy")}>
<Text style={role=="pharmacy"?styles.active:styles.role}>Pharmacist</Text>
</TouchableOpacity>

</View>

<TouchableOpacity style={styles.button} onPress={handleRegister}>
<Text style={{color:"#fff"}}>Register</Text>
</TouchableOpacity>

</View>

);
}

const styles = StyleSheet.create({
container:{flex:1,justifyContent:"center",padding:25},
title:{fontSize:24,fontWeight:"bold",marginBottom:20},
input:{borderWidth:1,borderColor:"#ddd",padding:12,borderRadius:8,marginBottom:10},
roles:{flexDirection:"row",flexWrap:"wrap",marginBottom:20},
role:{marginRight:10,color:"#555"},
active:{marginRight:10,color:"#2563eb",fontWeight:"bold"},
button:{backgroundColor:"#2563eb",padding:15,alignItems:"center",borderRadius:8}
});