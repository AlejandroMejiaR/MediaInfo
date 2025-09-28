
import './main.js'
import { GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js"
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './showMessage.js'

const googleButton = document.querySelector('#google-login')
const signInForm = document.querySelector('#signin-form')
const forgotPassword = document.querySelector('#forgot-password')

signInForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = signInForm['signin-email'].value;
    const password = signInForm['signin-password'].value;

    try {
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        console.log(userCredentials)
        window.location.href = 'articles.html';
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

googleButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider()
    try {
        const googleuserCredentials = await signInWithPopup(auth, provider);
        window.location.href = 'articles.html';
    } catch (error) {
        console.log(error)
    }
})

forgotPassword.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = signInForm['signin-email'].value;
    if (email === "") {
        showMessage("Por favor, ingrese su correo electrónico para restablecer la contraseña.", "error");
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        showMessage("Se ha enviado un correo electrónico para restablecer la contraseña.", "success");
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            showMessage("El usuario no esta registrado. ", "error");
        } else {
            showMessage("Algo salió mal", "error");
            console.log(error)
        }
    }
});
