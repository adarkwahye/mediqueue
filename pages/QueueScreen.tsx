import React, { useEffect, useState } from "react";
import {
View,
Text,
FlatList,
TouchableOpacity,
StyleSheet
} from "react-native";

import {
ref,
onValue,
update
} from "@react-native-firebase/database";

import { db } from "../config/firebase";

export default function QueueScreen({ navigation, route }) {

const role = route?.params?.role || "receptionist"; // default

const [queueList,setQueueList] = useState([]);

useEffect(()=>{

const queueRef = ref(db,"queue");

onValue(queueRef,(snapshot)=>{

let data = [];

snapshot.forEach((child)=>{

data.push({
id: child.key,
...child.val()
});

});

data.sort((a,b)=> a.token.localeCompare(b.token));

setQueueList(data);

});

},[]);

const callNext = ()=>{

const next = queueList.find(item => item.status === "waiting");

if(next){

update(ref(db,"queue/"+next.id),{
status:"in-progress"
});

}

};

const markServed = (id)=>{

update(ref(db,"queue/"+id),{
status:"consulted"
});

};

const renderItem = ({item}) => (

<View style={styles.row}>

<View>
  <Text style={styles.token}>{item.token}</Text>
  <Text style={styles.name}>{item.patientName}</Text>
</View>

<View style={styles.actions}>

  <Text style={styles.status}>{item.status}</Text>

  {/* Doctor Action */}
  {role === "doctor" && item.status === "in-progress" && (
    <TouchableOpacity
      style={styles.consultBtn}
      onPress={() =>
        navigation.navigate("Consultation", {
          patient: item
        })
      }
    >
      <Text style={{color:"#fff"}}>Consult</Text>
    </TouchableOpacity>
  )}

  {/* Receptionist Action */}
  {role === "receptionist" && item.status === "in-progress" && (
    <TouchableOpacity
      style={styles.servedBtn}
      onPress={()=>markServed(item.id)}
    >
      <Text style={{color:"#fff"}}>Served</Text>
    </TouchableOpacity>
  )}

</View>

</View>

);

const nowServing = queueList.find(item => item.status === "in-progress");

return(

<View style={styles.container}>

<Text style={styles.title}>Queue Management</Text>

<View style={styles.nowServing}>

<Text style={styles.nowText}>Now Serving</Text>

<Text style={styles.nowToken}>
{nowServing ? nowServing.token : "None"}
</Text>

</View>

<TouchableOpacity
style={styles.callBtn}
onPress={callNext}
>

<Text style={styles.callText}>Call Next Patient</Text>

</TouchableOpacity>

<FlatList
data={queueList}
keyExtractor={(item)=>item.id}
renderItem={renderItem}
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

nowServing:{
backgroundColor:"#2563eb",
padding:20,
borderRadius:10,
marginBottom:20,
alignItems:"center"
},

nowText:{
color:"#fff",
fontSize:16
},

nowToken:{
color:"#fff",
fontSize:32,
fontWeight:"bold"
},

callBtn:{
backgroundColor:"#10b981",
padding:15,
borderRadius:10,
marginBottom:20
},

consultBtn:{
  backgroundColor:"#2563eb",
  padding:8,
  borderRadius:6,
  marginTop:5
},

callText:{
color:"#fff",
textAlign:"center",
fontWeight:"bold"
},

row:{
backgroundColor:"#fff",
padding:15,
borderRadius:10,
marginBottom:10,
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

token:{
fontSize:20,
fontWeight:"bold",
color:"#2563eb"
},

name:{
color:"#555"
},

status:{
marginBottom:5,
color:"#888"
},

actions:{
alignItems:"flex-end"
},

servedBtn:{
backgroundColor:"#ef4444",
padding:8,
borderRadius:6
}

});