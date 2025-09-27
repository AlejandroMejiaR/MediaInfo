import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js"
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './showMessage.js'

// Se corrige el selector para que coincida con el id 'google-login' del HTML
const googleButton = document.querySelector('#google-login') 
const signInForm = document.querySelector('#signin-form')

signInForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = signInForm['signin-email'].value;
    const password = signInForm['signin-password'].value;

    try {
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        console.log(userCredentials)
        window.location.href = 'App.html';
        //showMessage("welcome " + userCredentials.user.email)
    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            showMessage("Contraseña incorrecta. ", "error");
        }
        else if (error.code === 'auth/user-not-found') {
            showMessage("El usuario no esta registrado. ", "error");
        }
        else if (error.code) {
            showMessage("Credenciales no validas. ", "error");
        }
    }
})

//Login con google
googleButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider()
    try {
        const googleuserCredentials = await signInWithPopup(auth, provider);
        //console.log(googleuserCredentials)
        window.location.href = 'App.html';
        //showMessage("welcome " + googleuserCredentials.user.displayName)
    } catch (error) {
        //console.log(error)
    }
})