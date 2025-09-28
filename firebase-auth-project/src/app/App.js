import { onGetPosts } from "./firebase.js";
import { where } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import { auth, db } from './firebase.js';

const tasksContainer = document.getElementById("tasks-container");
const tasksContainerDeportes = document.getElementById("tasks-container-deportes");
const createItems = document.querySelectorAll('.create');
const adminItems = document.querySelectorAll('.admin');

// --- Lógica de Roles ---
const setupUIForUser = async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const role = userDocSnap.data().rol;
            if (role === "Lector") {
                createItems.forEach(item => item.style.display = 'none');
                adminItems.forEach(item => item.style.display = 'none');
            } else if (role === "Autor") {
                adminItems.forEach(item => item.style.display = 'none');
            }
        } else {
            // Si no se encuentra el documento, ocultar todo por seguridad
            createItems.forEach(item => item.style.display = 'none');
            adminItems.forEach(item => item.style.display = 'none');
        }
    } else {
        // Ocultar todo si el usuario no está logueado
        createItems.forEach(item => item.style.display = 'none');
        adminItems.forEach(item => item.style.display = 'none');
    }
};

// --- Carga de Artículos y Eventos ---
window.addEventListener("DOMContentLoaded", () => {
    // Observador de autenticación para gestionar la UI
    onAuthStateChanged(auth, user => {
        setupUIForUser(user);
    });

    // Cargar todos los artículos
    onGetPosts((querySnapshot) => {
        let html = "";
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            html += renderTask(doc.id, task);
        });
        tasksContainer.innerHTML = html;
    });

    // Cargar artículos de deportes
    onGetPosts((querySnapshot) => {
        let html = "";
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            html += renderTask(doc.id, task);
        });
        tasksContainerDeportes.innerHTML = html;
    }, where('section', '==', 'deportes'));
});

// Plantilla para renderizar un artículo
const renderTask = (id, task) => `
    <div class="col-12 col-sm-6 col-md-4 me-5" data-id="${id}">
        <div class="card card-block">
            <img src="${task.imageUrl}" class="card-img-top" alt="imagenArticulo">
            <div class="card-body">
                <div class="d-flex justify-content-between mb-2 text-muted">
                    <span>${task.autor}</span>
                    <span>${task.fecha}</span>
                </div>
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <button class="btn btn-primary btn-ver">Ver</button>
                <button class="btn btn-primary btn-comment">Comentarios</button>
                <button class="btn btn-primary btn-edit create">Editar</button>
                <button class="btn btn-primary btn-delete admin">Ocultar</button>
            </div>
        </div>
    </div>`;

// --- Event Delegation para los botones de las tarjetas ---
document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('btn-ver')) {
        const cardBody = target.closest('.card-body');
        const cardText = cardBody.querySelector('.card-text');

        if (cardText.style.overflow !== 'visible') {
            cardText.style.overflow = 'visible';
            cardText.style.height = '480px';
            cardBody.style.height = '630px';
            target.textContent = 'Dejar de ver';
        } else {
            cardText.style.overflow = 'hidden';
            cardText.style.height = 'auto';
            cardBody.style.height = '220px';
            target.textContent = 'Ver';
        }
    }
});


// --- Lógica de Scroll Horizontal ---
const setupHorizontalScroll = (container) => {
    let mouseDown = false;
    let startX, scrollLeft;

    container.addEventListener('mousedown', (e) => {
        mouseDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });
    container.addEventListener('mouseleave', () => mouseDown = false);
    container.addEventListener('mouseup', () => mouseDown = false);
    container.addEventListener('mousemove', (e) => {
        if (!mouseDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1;
        container.scrollLeft = scrollLeft - walk;
    });
};

setupHorizontalScroll(tasksContainer);
setupHorizontalScroll(tasksContainerDeportes);