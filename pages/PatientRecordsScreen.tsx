import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput } from "react-native";
import { ref, onValue } from "@react-native-firebase/database";
import { db } from "../config/firebase";

export default function PatientRecordsScreen(){

const [patients,setPatients] = useState([]);
const [search,setSearch] = useState("");

useEffect(()=>{

const patientRef = ref(db,"patients");

onValue(patientRef, snapshot=>{

let list = [];

snapshot.forEach(child=>{
list.push({
id: child.key,
...child.val()
});
});

setPatients(list);

});

},[]);

const filteredPatients = patients.filter(p =>
p.name?.toLowerCase().includes(search.toLowerCase())
);

return(

<View style={styles.container}>

<Text style={styles.title}>Patient Records</Text>

<TextInput
style={styles.search}
placeholder="Search patient..."
value={search}
onChangeText={setSearch}
/>

<FlatList
data={filteredPatients}
keyExtractor={(item)=>item.id}
renderItem={({item})=>(
<View style={styles.card}>
<Text style={styles.name}>{item.name}</Text>
<Text>Phone: {item.phone}</Text>
<Text>Gender: {item.gender}</Text>
<Text>Email: {item.patientEmail}</Text>
</View>
)}
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
marginBottom:20
},

search:{
backgroundColor:"#fff",
padding:15,
borderRadius:10,
marginBottom:15
},

card:{
backgroundColor:"#fff",
padding:15,
borderRadius:10,
marginBottom:10
},

name:{
fontWeight:"bold",
fontSize:16
}

});