import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
//import { WEB_API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID } from "C:\Users\dikea\Desktop\LilChef\frontend\.env";


const firebaseConfig = {
    apiKey: "AIzaSyAGLuRqrPutW83izLOcGwY5drPSo3aNV10",
    authDomain: "cookaing-da7d0.firebaseapp.com",
    projectId: "cookaing-da7d0",
    storageBucket: "cookaing-da7d0.appspot.com",
    messagingSenderId: "114118808176",
    appId: "1:114118808176:ios:6664d3039472ab86769ab5",
  };

/*
const firebaseConfig = {
    apiKey: WEB_API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID,
}
*/


if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

/*
if(!firebase.getApps.length){
    firebase.initializeApp(firebaseConfig);
}
    */


export const auth = getAuth();
//export const auth = firebase.auth() 