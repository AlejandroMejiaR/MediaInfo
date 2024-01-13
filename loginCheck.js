import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js"
import { signOut } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './showMessage.js'
import {
    onGetUsers,
} from "./firebase.js";


const logout = document.querySelector('#logout');

onAuthStateChanged(auth, async (user) => {
    //console.log(user)
    if (!user) {
        window.location.href = 'index.html';
    } else {
        // Verificar si el mensaje de bienvenida ya se mostró
        if (!sessionStorage.getItem('welcomeMessageShown')) {
            showMessage("Bienvenido " + user.displayName);
            // Guardar la bandera en el sessionStorage
            sessionStorage.setItem('welcomeMessageShown', 'true');
        }
    }
})


//logout
logout.addEventListener('click', async () => {
    await signOut(auth);
    //console.log('signout')
})

//Roles
const createitem = document.querySelectorAll('.create');
const adminitem = document.querySelectorAll('.admin');

window.addEventListener("DOMContentLoaded", async (e) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid;  // Obtener la ID del usuario logueado
            onGetUsers((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const users = doc.id;
                    //console.log(users);
                    if (users == userId) {  // Comparar con los ID en la colección 'users'
                        const rol = doc.data().rol;  // Obtener el 'rol'
                       // console.log(`Nombre: ${nombre}, Rol: ${rol}`);
                        if (rol === "Lector") {
                            // Oculta los elementos
                            createitem.forEach(element => element.style.display = "none");
                            adminitem.forEach(element => element.style.display = "none");
                        }
                        else if(rol === "Autor"){
                            adminitem.forEach(element => element.style.display = "none");
                        }
                    }
                });
            });
        }
    });
});

//











