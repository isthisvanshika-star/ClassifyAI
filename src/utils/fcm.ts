import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBNdRaNU4j1i_JPjiS2Zl1HFheMDiDsSxo",
  authDomain: "classifyai-c0b7b.firebaseapp.com",
  projectId: "classifyai-c0b7b",
  storageBucket: "classifyai-c0b7b.firebasestorage.app",
  messagingSenderId: "122412797185",
  appId: "1:122412797185:web:38381b1d4e762296815f00",
  measurementId: "G-HVVELRT9TY",
};

const app = initializeApp(firebaseConfig);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;
export const storage = getStorage(app);
export const requestForToken = async () => {
  if (!messaging) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BJy84FEJYufE9Xy6Ax39HQsxS2AXgDOP7EYhfeaFNfJMi-NMXVtJP2hjQJq3BiHflG-WzOdC1jxn7ln02PdFeHE",
      });
      if (token) {
        console.log("FCM Token Generated !!", token);
        return token;
      }
    } else {
      console.log("Permission denied for Notification");
    }
  } catch (error) {
    console.log("An error occurred while generating token", error);
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return null;

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("Foreground message received: ", payload);
    callback(payload);
  });

  return unsubscribe;
};
