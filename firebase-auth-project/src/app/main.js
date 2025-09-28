import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { auth } from './firebase.js';
import { showMessage } from './showMessage.js';

document.addEventListener("DOMContentLoaded", () => {
    const forgotPasswordLink = document.querySelector('#forgot-password');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();

            const email = prompt("Por favor, ingrese su correo electrónico para restablecer la contraseña:");

            if (email) {
                try {
                    await sendPasswordResetEmail(auth, email);
                    showMessage("Se ha enviado un correo para restablecer la contraseña.", "success");
                } catch (error) {
                    let message = "Ocurrió un error al intentar restablecer la contraseña.";
                    if (error.code === 'auth/user-not-found') {
                        message = "No se encontró ningún usuario con ese correo electrónico.";
                    }
                    showMessage(message, "error");
                }
            }
        });
    }
});
