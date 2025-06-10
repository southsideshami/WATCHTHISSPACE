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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

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
const storage = getStorage(app);

const messagesRef = collection(db, "messages");
const galleryRef = collection(db, "gallery");

// Handle new message
const sendMessage = async () => {
  const input = document.getElementById("messageInput");
  if (input.value.trim()) {
    await addDoc(messagesRef, {
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
    const msg = document.createElement("p");
    msg.textContent = doc.data().text;
    messages.appendChild(msg);
  });
});

// Handle image upload
const uploadImage = async (file) => {
  const imageRef = ref(storage, `uploads/${file.name}`);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);
  await addDoc(galleryRef, {
    imageUrl: url,
    uploadedAt: Date.now()
  });
};

document.getElementById("uploadButton").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) uploadImage(file);
});

// Display images and auto-delete after 2 hours
onSnapshot(galleryRef, (snapshot) => {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  snapshot.forEach(async (docSnap) => {
    const data = docSnap.data();
    const now = Date.now();
    if (now - data.uploadedAt >= 2 * 60 * 60 * 1000) {
      // Delete image from storage and Firestore
      const imgRef = ref(storage, data.imageUrl);
      await deleteObject(imgRef).catch(() => {});
      await deleteDoc(doc(db, "gallery", docSnap.id));
    } else {
      const img = document.createElement("img");
      img.src = data.imageUrl;
      img.classList = "w-40 h-40 object-cover m-2 rounded-lg";
      gallery.appendChild(img);
    }
  });
});
