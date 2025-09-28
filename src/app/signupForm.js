import { createUserWithEmailAndPassword, updateProfile} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js"
import { auth, saveUser } from './firebase.js'
import { showMessage } from './showMessage.js'


const signupForm = document.querySelector('#signup-form')

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = signupForm['signup-email'].value
    const username = signupForm['signup-user'].value
    const password = signupForm['signup-password'].value
    const rol = signupForm['signup-rol'].value

    //console.log(email, username, password, rol);

    try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        const id = ("User ID: ", userCredentials.user.uid);
        await updateProfile(userCredentials.user, {displayName: username});  
        await saveUser(id,username,rol);
        window.location.href = 'App.html';
        //
        //showMessage("welcome " + userCredentials.user.email)

    } catch (error) {
        //console.log(error.message)
        //console.log(error.code)

        if (error.code === 'auth/email-already-in-use') {
            showMessage("El correo ya esta en uso. ", "error");
        }
        else if (error.code === 'auth/invalid-email') {
            showMessage("Correo invalido. ", "error");
        }
        else if (error.code === 'auth/weak-password') {
            showMessage("La contraseña es muy debil, debe tener almenos 6 caracteres. ", "error");
        }
        else if (error.code === 'auth/missing-password') {
            showMessage("Escriba una contraseña. ", "error");
        }
        else if (error.code) {
            showMessage("Algo no fue como se esperaba. ", "error");
        }
    }
})

