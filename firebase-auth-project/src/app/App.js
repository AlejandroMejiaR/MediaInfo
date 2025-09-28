import { onGetPosts, saveComment, onGetComments } from "./firebase.js";
import { where, doc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { auth, db } from './firebase.js';

const tasksContainer = document.getElementById("tasks-container");
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
            loadPosts();
        });
    });
});

const loadPosts = () => {
    onGetPosts((querySnapshot) => {
        let html = "";
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            html += renderTask(doc.id, task);
        });
        tasksContainer.innerHTML = html;
    });
};

const renderTask = (id, task) => {
    const isAuthor = currentUserId && currentUserId === task.authorId;
    const editButton = isAuthor 
        ? `<button class="btn btn-primary btn-edit">Editar</button>`
        : '';

    return `
    <div class="col-12 col-md-6 col-lg-4 mb-4" data-id="${id}">
        <div class="card h-100"> 
            <img src="${task.imageUrl}" class="card-img-top" alt="imagenArticulo" style="height: 200px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between mb-2 text-muted">
                    <span>${task.autor}</span>
                    <span>${task.fecha}</span>
                </div>
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description.substring(0, 100)}...</p>
                <div class="mt-auto d-flex justify-content-between">
                    <div>
                        <button class="btn btn-secondary btn-comment" data-bs-toggle="modal" data-bs-target="#commentsModal">Comentarios</button>
                    </div>
                    <div>
                        ${editButton}
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
let unsubscribeComments; 

if (commentsModal) {
    commentsModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget;
        const card = button.closest('[data-id]');
        const postId = card.dataset.id;
        commentForm.dataset.postId = postId;

        const commentsList = commentsModal.querySelector('#comments-list');

        unsubscribeComments = onGetComments(postId, (querySnapshot) => {
            commentsList.innerHTML = ''; 
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

    commentsModal.addEventListener('hide.bs.modal', () => {
        if (unsubscribeComments) {
            unsubscribeComments();
        }
        const commentsList = commentsModal.querySelector('#comments-list');
        commentsList.innerHTML = "";
    });
}

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