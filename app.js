// app.js

// Firebase setup (make sure to replace with your actual config)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
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

document.getElementById("historyButton").addEventListener("click", async () => {
  const history = document.getElementById("messageHistory");
  history.innerHTML = "<h2 class='text-xl font-semibold mb-4'>🕰️ Message History</h2>";
  const snapshot = await getDocs(query(messagesRef, orderBy("timestamp")));
  snapshot.forEach((docSnap) => {
    const msg = docSnap.data();
    const msgEl = document.createElement("div");
    msgEl.classList = "bg-gray-700 text-white px-4 py-2 rounded shadow mb-2";
    msgEl.innerHTML = `<strong>${msg.sender}</strong>: ${msg.text}`;
    history.appendChild(msgEl);
  });

  document.getElementById("messagesSection").classList.add("hidden");
  document.getElementById("historySection").classList.remove("hidden");
});

document.getElementById("backButton").addEventListener("click", () => {
  document.getElementById("historySection").classList.add("hidden");
  document.getElementById("messagesSection").classList.remove("hidden");
});
