import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/functions";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0ugQcENIaDFbQW0OYD3uzDKOHTnJWd_I",
  authDomain: "biotech-f984b.firebaseapp.com",
  databaseURL: "https://biotech-f984b.firebaseio.com",
  projectId: "biotech-f984b",
  storageBucket: "biotech-f984b.appspot.com",
  messagingSenderId: "453536982791",
  appId: "1:453536982791:web:554ad1899b622008"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp;
