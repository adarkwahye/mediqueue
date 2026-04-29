// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./pages/LoginScreen";
import HomeScreen from "./pages/HomeScreen";
import RegisterPatient from "./pages/RegisterPatient";
import QueueScreen from "./pages/QueueScreen";
import ConsultationScreen from "./pages/ConsultationScreen";
import PharmacyScreen from "./pages/PharmacyScreen";
import RegisterScreen from "./pages/RegisterScreen";
import PatientDashboard from "./pages/PatientDashboard";
import PatientRecordsScreen from "./pages/PatientRecordsScreen";
import AppointmentsScreen from "./pages/AppointmentsScreen";
import DoctorDashboard from "./pages/DoctorDashboard";
import ConsultationHistoryScreen from "./pages/ConsultationHistoryScreen";
import MedicationReminderScreen from "./pages/MedicationReminderScreen";
import PatientQueueScreen from "./pages/PatientQueueScreen";
import MedicationHistoryScreen from "./pages/MedicationHistoryScreen";
import PatientConsultationHistoryScreen from "./pages/PatientConsultationHistoryScreen"
import DoctorAppointmentsScreen from "./pages/DoctorAppointmentsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading">
        <Stack.Screen name="Loading" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
        <Stack.Screen name="RegisterPatient" component={RegisterPatient} options={{ title: "Register Patient" }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
        <Stack.Screen name="Queue" component={QueueScreen} options={{ title: "Queue Management" }} />
        <Stack.Screen name="Consultation" component={ConsultationScreen} options={{ title: "Doctor Consultation" }} />
        <Stack.Screen name="Pharmacy" component={PharmacyScreen} options={{ title: "Pharmacy" }} />
        <Stack.Screen name="Patient" component={PatientDashboard} options={{ title: "Patient Dashboard" }} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen}/>
        <Stack.Screen name="PatientRecords" component={PatientRecordsScreen}/>
        <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} options={{ title: "Doctor Dashboard" }} />
        <Stack.Screen name="ConsultationHistory" component={ConsultationHistoryScreen} options={{ title: "Consultation History" }} />
        <Stack.Screen name="DoctorAppointments" component={DoctorAppointmentsScreen} options={{ title: "My Appointments" }} />
        <Stack.Screen name="MedicationReminder" component={MedicationReminderScreen} options={{ title: "Medication Reminders" }} />
        <Stack.Screen name="MedicationHistory" component={MedicationHistoryScreen} options={{ title: "Medication History" }} />
        <Stack.Screen name="PatientQueue" component={PatientQueueScreen} options={{ title: "My Queue Status" }} />
        <Stack.Screen name="PatientConsultationHistory" component={PatientConsultationHistoryScreen} options={{ title: "Consultation History" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
