import { onGetPosts, saveComment, onGetComments } from "./firebase.js";
import { where, doc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { auth, db } from './firebase.js';

const tasksContainer = document.getElementById("tasks-container");
const tasksContainerDeportes = document.getElementById("tasks-container-deportes");
const createItems = document.querySelectorAll('.create');
const adminItems = document.querySelectorAll('.admin');

let currentUserId = null;

// --- Lógica de Roles y UI Global ---
const setupUIForUser = async (user) => {
    if (user) {
        currentUserId = user.uid;
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
            createItems.forEach(item => item.style.display = 'none');
            adminItems.forEach(item => item.style.display = 'none');
        }
    } else {
        currentUserId = null;
        createItems.forEach(item => item.style.display = 'none');
        adminItems.forEach(item => item.style.display = 'none');
    }
};

// --- Carga de Artículos y Eventos ---
window.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, user => {
        setupUIForUser(user).then(() => {
            // Volver a cargar los posts después de que la UI del usuario esté configurada
            loadAllPosts();
            loadDeportesPosts();
        });
    });
});

const loadAllPosts = () => {
    onGetPosts((querySnapshot) => {
        let html = "";
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            html += renderTask(doc.id, task);
        });
        tasksContainer.innerHTML = html;
    });
};

const loadDeportesPosts = () => {
    onGetPosts((querySnapshot) => {
        let html = "";
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            html += renderTask(doc.id, task);
        });
        tasksContainerDeportes.innerHTML = html;
    }, where('section', '==', 'deportes'));
};

const renderTask = (id, task) => {
    // Lógica para mostrar el botón de editar solo al autor
    const isAuthor = currentUserId && currentUserId === task.authorId;
    const editButton = isAuthor 
        ? `<button class="btn btn-primary btn-edit">Editar</button>`
        : '';

    return `
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
                <div class="mt-auto d-flex justify-content-between">
                    <div>
                        <button class="btn btn-primary btn-comment" data-bs-toggle="modal" data-bs-target="#commentsModal">Comentarios</button>
                    </div>
                    <div>
                        ${editButton}
                        <button class="btn btn-primary btn-delete admin">Ocultar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};

document.body.addEventListener('click', (event) => {
    const target = event.target;
    const card = target.closest('[data-id]');
    if (!card) return;
    const postId = card.dataset.id;
    if (target.classList.contains('btn-edit')) {
        window.location.href = `./crearArticulo.html?id=${postId}`;
    }
});

// --- Lógica del Modal de Comentarios ---
const commentsModal = document.getElementById('commentsModal');
const commentForm = document.getElementById('comment-form');
let unsubscribeComments; // Variable para guardar el listener de comentarios

if (commentsModal) {
    // -- Cargar comentarios al abrir el modal --
    commentsModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget;
        const card = button.closest('[data-id]');
        const postId = card.dataset.id;
        commentForm.dataset.postId = postId; // Guardar ID en el form

        const commentsList = commentsModal.querySelector('#comments-list');

        // Escuchar en tiempo real los comentarios de este post
        unsubscribeComments = onGetComments(postId, (querySnapshot) => {
            commentsList.innerHTML = ''; // Limpiar antes de renderizar
            if (querySnapshot.empty) {
                commentsList.innerHTML = `<p class="text-center">No hay comentarios aún. ¡Sé el primero!</p>`;
            } else {
                querySnapshot.forEach(doc => {
                    const comment = doc.data();
                    const date = comment.createdAt.toDate().toLocaleString();
                    const commentHTML = `
                        <div class="card mb-2">
                            <div class="card-body">
                                <p class="card-text">${comment.text}</p>
                                <footer class="blockquote-footer text-end">${comment.authorName} <cite title="Source Title">- ${date}</cite></footer>
                            </div>
                        </div>
                    `;
                    commentsList.innerHTML += commentHTML;
                });
            }
        });
    });

    // -- Dejar de escuchar al cerrar el modal --
    commentsModal.addEventListener('hide.bs.modal', () => {
        if (unsubscribeComments) {
            unsubscribeComments();
        }
        const commentsList = commentsModal.querySelector('#comments-list');
        commentsList.innerHTML = "";
    });
}

// -- Enviar un nuevo comentario --
if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const postId = commentForm.dataset.postId;
        const commentText = commentForm.querySelector('#comment-text').value;
        const user = auth.currentUser;

        if (!user) {
            alert("Debes iniciar sesión para comentar.");
            return;
        }

        if (commentText.trim() === "") return;

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const authorName = userDoc.exists() ? userDoc.data().name : "Anónimo";

            const commentData = {
                authorId: user.uid,
                authorName: authorName,
                text: commentText,
                createdAt: Timestamp.now()
            };

            await saveComment(postId, commentData);
            commentForm.reset();
        } catch (error) {
            console.error("Error al guardar el comentario:", error);
            alert("Hubo un error al enviar tu comentario.");
        }
    });
}

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