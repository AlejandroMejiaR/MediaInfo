import { auth } from './firebase.js'
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js"
import {
    savePost,
    insertImage,
    getImage
} from "./firebase.js";
import { showMessage } from './showMessage.js'

const taskForm = document.getElementById("task-form");
const fecha = new Date();
const dia = fecha.getDate();
const mes = fecha.getMonth() + 1;
const ano = fecha.getFullYear();
const fechaString = `${dia}/${mes}/${ano}`;
let autor = "";
let imagenArchivo;
let imageUrl;
let filename;

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

    // Guardar y obtener url de la imagen
    let imagenInput = document.getElementById('task-image');
    imagenArchivo = imagenInput.files[0];

    // Obtén la extensión del archivo
    let extension = imagenArchivo.name.split('.').pop();

    // Genera un nombre de archivo único para la imagen
    filename = `${title}.${extension}`;

    // Usa la función insertImage para subir la imagen a Firebase Storage
    let res = await insertImage(imagenArchivo, filename);

    // Usa la función getImage para obtener la URL de descarga de la imagen
    imageUrl = await getImage(imagenArchivo, filename);

    console.log(imageUrl);  // Imprime la URL de descarga de la imagen

    try {
        await savePost(autor, title, description, section, fechaString, imageUrl);
        showMessage("El articulo ha sido publicado ")
        //Poner tostify de publicado y redirigir a la pagina principal
    } catch (error) {
        console.log(error);
    }
});










