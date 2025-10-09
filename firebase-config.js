// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    limit, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDRyQn5LoDP-d64qxVOEoLyVL6JXn-fAGI",
    authDomain: "yamamoto-create.firebaseapp.com",
    projectId: "yamamoto-create",
    storageBucket: "yamamoto-create.appspot.com", //修正: .firebasestorageはいらない
    messagingSenderId: "1004212225289",
    appId: "1:1004212225289:web:7e66f9c169c40edc683fd8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export all the necessary Firebase services and functions for other modules to use
export {
    auth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    db,
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    serverTimestamp,
    storage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
};

