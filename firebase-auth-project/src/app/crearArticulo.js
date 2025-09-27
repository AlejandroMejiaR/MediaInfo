import { auth } from './firebase.js'
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js"
import {
    savePost
} from "./firebase.js";
import { showMessage } from './showMessage.js'

const taskForm = document.getElementById("task-form");
const fecha = new Date();
const dia = fecha.getDate();
const mes = fecha.getMonth() + 1;
const ano = fecha.getFullYear();
const fechaString = `${dia}/${mes}/${ano}`;
let autor = "";

// Obtener nombre del usuario
onAuthStateChanged(auth, (user) => {
    if (user) {
        autor = user.displayName;
    }
});

taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = taskForm["task-title"].value;
    const description = taskForm["task-description"].value;
    const section = taskForm["task-section"].value;
    const imageUrl = taskForm["task-image-url"].value; // Obtener la URL de la imagen del campo de texto

    try {
        await savePost(autor, title, description, section, fechaString, imageUrl);
        showMessage("El articulo ha sido publicado ");
        taskForm.reset();
        // Después de 2 segundos, redirigir a App.html
        setTimeout(() => {
            window.location.href = "./App.html";
        }, 2000);

    } catch (error) {
        console.log(error);
        showMessage("Error al publicar el artículo: " + error.message, "error");
    }
});