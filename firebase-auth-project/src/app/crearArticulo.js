import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    savePost,
    getPost,
    updatePost
} from "./firebase.js";
import { showMessage } from './showMessage.js';

const taskForm = document.getElementById("task-form");
const fecha = new Date();
const dia = fecha.getDate();
const mes = fecha.getMonth() + 1;
const ano = fecha.getFullYear();
const fechaString = `${dia}/${mes}/${ano}`;

let autor = "";
let authorId = ""; // Variable para el UID del autor
let editStatus = false;
let id = '';

// Obtener nombre y UID del usuario
onAuthStateChanged(auth, (user) => {
    if (user) {
        autor = user.displayName;
        authorId = user.uid; // Guardamos el UID
    }
});

// --- Lógica de Edición ---
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    id = params.get('id');

    if (id) {
        editStatus = true;
        const doc = await getPost(id);
        const task = doc.data();

        taskForm['task-title'].value = task.title;
        taskForm['task-description'].value = task.description;
        taskForm['task-section'].value = task.section;
        taskForm['task-image-url'].value = task.imageUrl;

        // Cambiar texto del botón
        taskForm.querySelector('button[type="submit"]').innerText = 'Actualizar';
    }
});


taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = taskForm["task-title"].value;
    const description = taskForm["task-description"].value;
    const section = taskForm["task-section"].value;
    const imageUrl = taskForm["task-image-url"].value; // Obtener la URL de la imagen del campo de texto

    if (!authorId) {
        showMessage("Error: Usuario no autenticado.", "error");
        return;
    }

    try {
        if (!editStatus) {
            // Creando un nuevo post, ahora pasamos el authorId
            await savePost(authorId, autor, title, description, section, fechaString, imageUrl);
            showMessage("El articulo ha sido publicado ");
        } else {
            // Actualizando un post existente
            await updatePost(id, {
                title: title,
                description: description,
                section: section,
                imageUrl: imageUrl
            });
            showMessage("El artículo ha sido actualizado");
        }
        
        taskForm.reset();
        // Después de 2 segundos, redirigir a App.html
        setTimeout(() => {
            window.location.href = "./App.html";
        }, 2000);

    } catch (error) {
        console.log(error);
        showMessage("Error al procesar el artículo: " + error.message, "error");
    }
});