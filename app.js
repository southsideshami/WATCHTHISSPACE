// app.js

// Firebase setup (make sure to replace with your actual config)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

// Get username once per session
let username = localStorage.getItem("secret_username");
if (!username) {
  username = prompt("Choose a name for this secret chat:");
  localStorage.setItem("secret_username", username);
}

// Handle new message
const sendMessage = async () => {
  const input = document.getElementById("messageInput");
  if (input.value.trim()) {
    await addDoc(messagesRef, {
      sender: username,
      text: input.value,
      timestamp: serverTimestamp()
    });
    input.value = "";
  }
};

document.getElementById("sendButton").addEventListener("click", sendMessage);

// Real-time message listener
onSnapshot(query(messagesRef, orderBy("timestamp")), (snapshot) => {
  const messages = document.getElementById("messages");
  messages.innerHTML = "";
  snapshot.forEach((doc) => {
    const msg = doc.data();
    const msgEl = document.createElement("div");
    msgEl.classList = "bg-gray-700 text-white px-4 py-2 rounded shadow mb-2";
    msgEl.innerHTML = `<strong>${msg.sender}</strong>: ${msg.text}`;
    messages.appendChild(msgEl);
  });
});
