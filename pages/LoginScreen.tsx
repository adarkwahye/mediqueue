import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { signInWithEmailAndPassword } from "@react-native-firebase/auth";
import { db, auth } from "../config/firebase";
import { ref, get } from "@react-native-firebase/database";

export default function LoginScreen({ navigation }) {

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleLogin = () => {

signInWithEmailAndPassword(auth, email, password)
.then(async (userCredential) => {

const uid = userCredential.user.uid;

const snapshot = await get(ref(db, "users/" + uid));

if(snapshot.exists()){

const role = snapshot.val().role;

if(role === "doctor"){
navigation.replace("DoctorDashboard");
}

else if(role === "reception"){
navigation.replace("Home");
}

else if(role === "pharmacy"){
navigation.replace("Pharmacy");
}

else{
navigation.replace("Patient", {
    patientId: email
});
}

}

})
.catch((error)=>{
Alert.alert("Login Error", error.message);
});

};

return (

<View style={styles.container}>

<Text style={styles.title}>Clinic Queue System</Text>

<Text style={styles.subtitle}>Login to Continue</Text>

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

<TouchableOpacity style={styles.button} onPress={handleLogin}>
<Text style={styles.buttonText}>Login</Text>
</TouchableOpacity>

<TouchableOpacity onPress={()=>navigation.navigate("Register")}>
<Text style={{textAlign:"center",marginTop:15}}>
Don't have an account? Register
</Text>
</TouchableOpacity>

</View>

);
}

const styles = StyleSheet.create({

container: {
flex: 1,
backgroundColor: "#f2f6ff",
justifyContent: "center",
padding: 30
},

title: {
fontSize: 28,
fontWeight: "bold",
textAlign: "center",
color: "#2c3e50",
marginBottom: 10
},

subtitle: {
textAlign: "center",
marginBottom: 30,
color: "#7f8c8d"
},

input: {
backgroundColor: "#fff",
padding: 15,
borderRadius: 10,
marginBottom: 15,
borderWidth: 1,
borderColor: "#ddd"
},

button: {
backgroundColor: "#3b82f6",
padding: 15,
borderRadius: 10,
alignItems: "center"
},

buttonText: {
color: "#fff",
fontWeight: "bold",
fontSize: 16
}

});