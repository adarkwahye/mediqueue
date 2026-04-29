import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getDatabase } from '@react-native-firebase/database';
import { getStorage } from '@react-native-firebase/storage';

const app = getApp();

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);