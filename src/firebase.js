import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyBkmbzhBvfPXjp_dNAX8PlORCtrQsFSac0",
  authDomain: "phoenixer-insta.firebaseapp.com",
  databaseURL: "https://phoenixer-insta.firebaseio.com",
  projectId: "phoenixer-insta",
  storageBucket: "phoenixer-insta.appspot.com",
  messagingSenderId: "940379156176",
  appId: "1:940379156176:web:b4108c43ba3d5f3c7ef8d5",
  measurementId: "G-63YJE45Q07"
};

const firebaseApp = firebase.initializeApp(firebaseConfig)

const db = firebaseApp.firestore()
const auth = firebase.auth()
const storage = firebase.storage()

export { db, auth, storage }
