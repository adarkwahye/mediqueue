
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { ref, push, onValue, get } from "@react-native-firebase/database";
import { db, auth } from "../config/firebase";
import NotificationService from "../config/NotificationService";


// Types
type Doctor = {
	id: string;
	name: string;
	email: string;
};

type Appointment = {
	id?: string;
	patientEmail: string;
	patientName: string;
	doctorId: string;
	doctorName: string;
	date: string;
	time: string;
	createdAt: string;
};

export default function AppointmentsScreen() {
	const user = auth.currentUser;
	const patientEmail = user?.email || "";
	const patientName = user?.displayName || "";

	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [doctors, setDoctors] = useState<Doctor[]>([]);
	const [selectedDoctor, setSelectedDoctor] = useState<string>("");
	const [selectedDoctorName, setSelectedDoctorName] = useState<string>("");
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	// Fetch doctors
	useEffect(() => {
		const usersRef = ref(db, "users");
		get(usersRef).then(snapshot => {
			let docs: Doctor[] = [];
			snapshot.forEach(child => {
				const val = child.val();
				if (val.role === "doctor") {
					docs.push({
						id: child.key || "",
						name: val.name || val.email,
						email: val.email
					});
				}
			});
			setDoctors(docs);
			setLoading(false);
		});
	}, []);

	// Fetch appointments
	useEffect(() => {
		const appointmentRef = ref(db, "appointments");
		onValue(appointmentRef, snapshot => {
			let list: Appointment[] = [];
			snapshot.forEach(child => {
				list.push({
					id: child.key,
					...child.val()
				});
			});
			// Show only future appointments for this patient
			setAppointments(list.filter(a => a.patientEmail === patientEmail));
		});
	}, [patientEmail]);

	// Handle doctor selection
	const handleDoctorSelect = (id: string) => {
		setSelectedDoctor(id);
		const doc = doctors.find(d => d.id === id);
		setSelectedDoctorName(doc ? doc.name : "");
	};

	// Date picker handler
	const onDateChange = (event: any, selectedDate?: Date) => {
		setShowDatePicker(Platform.OS === 'ios');
		if (selectedDate) {
			const yyyy = selectedDate.getFullYear();
			const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
			const dd = String(selectedDate.getDate()).padStart(2, '0');
			setDate(`${yyyy}-${mm}-${dd}`);
		}
	};

	// Time picker handler
	const onTimeChange = (event: any, selectedTime?: Date) => {
		setShowTimePicker(Platform.OS === 'ios');
		if (selectedTime) {
			const hh = String(selectedTime.getHours()).padStart(2, '0');
			const min = String(selectedTime.getMinutes()).padStart(2, '0');
			setTime(`${hh}:${min}`);
		}
	};

	// Save appointment
	const saveAppointment = async () => {
		if (!selectedDoctor || !date || !time) {
			Alert.alert("Error", "Please select doctor, date, and time");
			return;
		}
		if (!patientEmail) {
			Alert.alert("Error", "You must be logged in as a patient");
			return;
		}
		setSubmitting(true);
		try {
			const appointment: Appointment = {
				patientEmail,
				patientName: patientName || patientEmail,
				doctorId: selectedDoctor,
				doctorName: selectedDoctorName,
				date,
				time,
				createdAt: new Date().toISOString()
			};
			await push(ref(db, "appointments"), appointment);
			// Schedule notification
			const appointmentDate = new Date(`${date}T${time}`);
			await NotificationService.scheduleAppointmentReminder(
				patientName || patientEmail,
				appointmentDate
			);
			Alert.alert("Success", "Appointment booked and reminder set");
			setDate("");
			setTime("");
			setSelectedDoctor("");
			setSelectedDoctorName("");
		} catch {
			Alert.alert("Error", "Failed to book appointment");
		}
		setSubmitting(false);
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#2563eb" />
				<Text style={styles.loadingText}>Loading doctors...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Book Appointment</Text>

			{/* Doctor Picker */}
			<Text style={styles.doctorLabel}>Select Doctor</Text>
			<View style={styles.pickerBox}>
				{doctors.length === 0 ? (
					<Text>No doctors available</Text>
				) : (
					doctors.map(doc => (
						<TouchableOpacity
							key={doc.id}
							style={selectedDoctor === doc.id ? styles.selectedDoctor : styles.doctorBtn}
							onPress={() => handleDoctorSelect(doc.id)}
						>
							  <Text style={selectedDoctor === doc.id ? styles.selectedDoctorText : styles.doctorText}>{doc.name}</Text>
						</TouchableOpacity>
					))
				)}
			</View>


			{/* Date Picker */}
			<TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
				<Text style={date ? styles.selectedText : styles.placeholderText}>
					{date ? date : 'Select Date'}
				</Text>
			</TouchableOpacity>
			{showDatePicker && (
				<DateTimePicker
					value={date ? new Date(date) : new Date()}
					mode="date"
					display="default"
					onChange={onDateChange}
					minimumDate={new Date()}
				/>
			)}

			{/* Time Picker */}
			<TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
				<Text style={time ? styles.selectedText : styles.placeholderText}>
					{time ? time : 'Select Time'}
				</Text>
			</TouchableOpacity>
			{showTimePicker && (
				<DateTimePicker
					value={time ? new Date(`1970-01-01T${time}`) : new Date()}
					mode="time"
					display="default"
					onChange={onTimeChange}
				/>
			)}

			<TouchableOpacity style={styles.button} onPress={saveAppointment} disabled={submitting}>
				<Text style={styles.buttonText}>{submitting ? "Booking..." : "Book Appointment"}</Text>
			</TouchableOpacity>

			<Text style={styles.section}>My Upcoming Appointments</Text>

			<FlatList
				data={appointments}
				keyExtractor={item => item.id || Math.random().toString()}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<Text style={styles.name}>Doctor: {item.doctorName}</Text>
						<Text>Date: {item.date}</Text>
						<Text>Time: {item.time}</Text>
					</View>
				)}
				ListEmptyComponent={<Text>No appointments found.</Text>}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f4f6fb"
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20
	},
	input: {
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10
	},
	button: {
		backgroundColor: "#2563eb",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		marginBottom: 20
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold"
	},
	section: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10
	},
	card: {
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10
	},
	name: {
		fontWeight: "bold"
	},
	pickerBox: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: 10
	},
    placeholderText: {
		color: '#888',
	},
	selectedText: {
		color: '#222',
	},
	doctorBtn: {
		borderWidth: 1,
		borderColor: "#2563eb",
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 14,
		marginRight: 8,
		marginBottom: 8,
		backgroundColor: "#fff"
	},
	selectedDoctor: {
		borderWidth: 1,
		borderColor: "#2563eb",
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 14,
		marginRight: 8,
		marginBottom: 8,
		backgroundColor: "#2563eb"
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	loadingText: {
		marginTop: 10,
		color: "#2563eb"
	},
	doctorLabel: {
		marginBottom: 5,
		fontWeight: "bold"
	},
	doctorText: {
		color: "#2563eb"
	},
	selectedDoctorText: {
		color: "#fff"
	}
});