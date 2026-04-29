import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";

class NotificationService {

  // Create notification channel (Android only)
  async createChannel() {
    await notifee.createChannel({
      id: "mediqueue-channel",
      name: "MediQueue Notifications",
      importance: AndroidImportance.HIGH,
    });
  }

  // Request permission (important for iOS + Android 13+)
  async requestPermission() {
    await notifee.requestPermission();
  }

  // Simple notification
  async showNotification(title: string, body: string) {

    await this.createChannel();

    await notifee.displayNotification({
      title: title,
      body: body,
      android: {
        channelId: "mediqueue-channel",
        smallIcon: "ic_launcher",
      },
    });
  }

  // Schedule medication reminder
  async scheduleMedicationReminder(
    drugName: string,
    message: string,
    date: Date
  ) {

    await this.createChannel();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        title: `Medication Reminder: ${drugName}`,
        body: message,
        android: {
          channelId: "mediqueue-channel",
          smallIcon: "ic_launcher",
        },
      },
      trigger
    );
  }

  // Appointment reminder
  async scheduleAppointmentReminder(
    patientName: string,
    date: Date
  ) {

    await this.createChannel();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        title: "Clinic Appointment Reminder",
        body: `Hello ${patientName}, you have an appointment today.`,
        android: {
          channelId: "mediqueue-channel",
          smallIcon: "ic_launcher",
        },
      },
      trigger
    );
  }

  // Queue alert
  async queueAlert(token: string) {

    await this.createChannel();

    await notifee.displayNotification({
      title: "Queue Update",
      body: `Token ${token}, please proceed to the consultation room.`,
      android: {
        channelId: "mediqueue-channel",
        smallIcon: "ic_launcher",
      },
    });
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    await notifee.cancelAllNotifications();
  }

}

export default new NotificationService();