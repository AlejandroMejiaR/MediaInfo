import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    savePost,
    getPost,
    updatePost,
    deletePost
} from "./firebase.js";
import { showMessage } from './showMessage.js';

const taskForm = document.getElementById("task-form");
const btnDelete = document.getElementById('btn-delete');
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

// --- Lógica de Edición y Borrado ---
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

        // Cambiar texto y mostrar botones de acción
        taskForm.querySelector('#btn-task-form').innerText = 'Actualizar';
        btnDelete.style.display = 'block';

    } else {
        // Asegurarse de que el botón de eliminar esté oculto si no es modo edición
        btnDelete.style.display = 'none';
    }
});

btnDelete.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevenir el envío del formulario

    if (confirm("¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer.")) {
        try {
            await deletePost(id);
            showMessage("El artículo ha sido eliminado.");
            setTimeout(() => {
                window.location.href = "./App.html";
            }, 1500);
        } catch (error) {
            console.error("Error al eliminar el artículo:", error);
            showMessage("Error al eliminar el artículo: " + error.message, "error");
        }
    }
});

taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = taskForm["task-title"].value;
    const description = taskForm["task-description"].value;
    const section = taskForm["task-section"].value;
    const imageUrl = taskForm["task-image-url"].value;

    if (!authorId) {
        showMessage("Error: Usuario no autenticado.", "error");
        return;
    }

    try {
        if (!editStatus) {
            await savePost(authorId, autor, title, description, section, fechaString, imageUrl);
            showMessage("El articulo ha sido publicado.");
        } else {
            await updatePost(id, {
                title: title,
                description: description,
                section: section,
                imageUrl: imageUrl
            });
            showMessage("El artículo ha sido actualizado.");
        }
        
        taskForm.reset();
        setTimeout(() => {
            window.location.href = "./App.html";
        }, 1500);

    } catch (error) {
        console.log(error);
        showMessage("Error al procesar el artículo: " + error.message, "error");
    }
});