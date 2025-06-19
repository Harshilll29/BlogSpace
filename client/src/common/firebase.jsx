import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBSIXgrsmWM4pfvrld-IkQutLlRtPnuYMI",
  authDomain: "blog-app-7363a.firebaseapp.com",
  projectId: "blog-app-7363a",
  storageBucket: "blog-app-7363a.firebasestorage.app",
  messagingSenderId: "956991754953",
  appId: "1:956991754953:web:04d55c69d80cce22063318",
  measurementId: "G-TR327EL1NY"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


//google auth
const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () =>{

    let user = null;

    await signInWithPopup(auth, provider)
    .then((result)=>{
        user = result.user;
    })
    .catch((err)=>{
        console.log(err)
    })

    return user;
}