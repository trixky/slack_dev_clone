import firebase from 'firebase';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
	apiKey: "AIzaSyCfgyK3UZpiTgTLuxKWAWGRiQQ8jYN26CU",
	authDomain: "slack-dev-clone.firebaseapp.com",
	databaseURL: "https://slack-dev-clone.firebaseio.com",
	projectId: "slack-dev-clone",
	storageBucket: "slack-dev-clone.appspot.com",
	messagingSenderId: "633887285810",
	appId: "1:633887285810:web:b13f1b79a5cbe9bc14522b",
	measurementId: "G-T90DFNFSJ3"
};

firebase.initializeApp(firebaseConfig)

export default firebase;