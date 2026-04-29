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
update,
push
} from "@react-native-firebase/database";

import { db } from "../config/firebase";

export default function PharmacyScreen(){

const [prescriptions,setPrescriptions] = useState([]);

useEffect(()=>{

const consultRef = ref(db,"consultations");

onValue(consultRef,(snapshot)=>{

let data=[];

snapshot.forEach(child=>{

let val = child.val();

if(val.status === "pending-pharmacy"){

data.push({
id:child.key,
...val
});

}

});

setPrescriptions(data);

});

},[]);

const dispenseDrug = (item)=>{

update(ref(db,"consultations/"+item.id),{
status:"completed"
});

const reminder = {
patientName:item.patientName,
drug:item.prescription,
dosage:item.dosage,
duration:item.duration,
startDate:new Date().toISOString().split("T")[0]
};

push(ref(db,"reminders"),reminder);

};

const renderItem = ({item}) => (

<View style={styles.card}>

<Text style={styles.token}>{item.token}</Text>

<Text style={styles.name}>{item.patientName}</Text>

<Text style={styles.drug}>
Drug: {item.prescription}
</Text>

<Text>
Dosage: {item.dosage}
</Text>

<Text>
Duration: {item.duration}
</Text>

<TouchableOpacity
style={styles.button}
onPress={()=>dispenseDrug(item)}
>

<Text style={styles.buttonText}>
Dispense Medication
</Text>

</TouchableOpacity>

</View>

);

return(

<View style={styles.container}>

<Text style={styles.title}>
Pharmacy
</Text>

<FlatList
data={prescriptions}
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

card:{
backgroundColor:"#fff",
padding:20,
borderRadius:10,
marginBottom:15
},

token:{
fontSize:22,
fontWeight:"bold",
color:"#2563eb"
},

name:{
fontSize:18,
marginBottom:5
},

drug:{
fontWeight:"bold"
},

button:{
backgroundColor:"#10b981",
padding:12,
borderRadius:8,
marginTop:10
},

buttonText:{
color:"#fff",
textAlign:"center",
fontWeight:"bold"
}

});