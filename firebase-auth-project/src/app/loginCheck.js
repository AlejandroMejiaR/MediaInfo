import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { auth } from './firebase.js';
import { showMessage } from './showMessage.js';

const logoutButton = document.querySelector('#logout');

// Redirige si el usuario no está autenticado
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        // Muestra el mensaje de bienvenida solo una vez por sesión
        if (!sessionStorage.getItem('welcomeMessageShown')) {
            showMessage(`Bienvenido ${user.displayName || user.email}`);
            sessionStorage.setItem('welcomeMessageShown', 'true');
        }
    }
});

// Maneja el cierre de sesión
logoutButton.addEventListener('click', async () => {
    // Limpiamos la bandera de bienvenida al cerrar sesión
    sessionStorage.removeItem('welcomeMessageShown'); 
    await signOut(auth);
});