import {
    onGetPosts,
    savePost,
    deletePost,
    getPost,
    updatePost,
    getPosts,
} from "./firebase.js";
import {where} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
const tasksContainer = document.getElementById("tasks-container");
const tasksContainerDeportes = document.getElementById("tasks-container-deportes");
let editStatus = false;
let id = "";
window.addEventListener("DOMContentLoaded", async (e) => {
    onGetPosts((querySnapshot) => {
        tasksContainer.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const task = doc.data();

            tasksContainer.innerHTML += `    
    <div class="col-12 col-sm-6 col-md-4 me-5">
        <div class="card card-block">
            <img src="${task.imgUrl}" class="card-img-top" alt="imagenArticulo">
            <div class="card-body">
                <div class="d-flex justify-content-between mb-2 text-muted">
                    <span>${task.autor}</span>
                    <span>${task.fecha}</span>
                </div>
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <button href="#" class="btn btn-primary btn-ver">Ver</button>
                <button href="#" class="btn btn-primary btn-comment">Comentarios</button>
                <button href="#" class="btn btn-primary btn-edit create">Editar</button>
                <button href="#" class="btn btn-primary btn-delete admin">Ocultar</button>
                </div>
        </div>
    </div>
    `;
        });
    });

    onGetPosts((querySnapshot) => {
        tasksContainerDeportes.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            console.log(task); // Añade esta línea
            tasksContainerDeportes.innerHTML += `    
        <div class="col-12 col-sm-6 col-md-4 me-5">
            <div class="card card-block">
                <img src="${task.imgUrl}" class="card-img-top" alt="imagenArticulo">
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2 text-muted">
                        <span>${task.autor}</span>
                        <span>${task.fecha}</span>
                    </div>
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <button href="#" class="btn btn-primary btn-ver">Ver</button>
                    <button href="#" class="btn btn-primary btn-comment">Comentarios</button>
                    <button href="#" class="btn btn-primary btn-edit create">Editar</button>
                    <button href="#" class="btn btn-primary btn-delete admin">Ocultar</button>
                    </div>
            </div>
        </div>
        `;
        });
    }, where('section', '==', 'deportes'));
    
});


// Obtén el contenedor de los artículos
var container = document.querySelector('.row.flex-row.flex-nowrap.overflow-auto');
// Agrega controladores de eventos 'mousedown', 'mousemove', y 'mouseup' al contenedor
var mouseDown = false;
var startX, scrollLeft;
container.addEventListener('mousedown', function (e) {
    mouseDown = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
});
container.addEventListener('mouseleave', function () {
    mouseDown = false;
});
container.addEventListener('mouseup', function () {
    mouseDown = false;
});
container.addEventListener('mousemove', function (e) {
    if (!mouseDown) { return; }
    e.preventDefault();
    var x = e.pageX - container.offsetLeft;
    var walk = (x - startX) * 1; // Ajusta este valor para controlar la velocidad de desplazamiento
    container.scrollLeft = scrollLeft - walk;
});


document.querySelectorAll('.card').forEach(card => {
    var btnVer = card.querySelector('.btn-ver');
    var btnOcultar = card.querySelector('.btn-delete');
    var cardText = card.querySelector('.card-text');
    var cardBody = card.querySelector('.card-body');

    btnVer.addEventListener('click', () => {
        if (cardText.style.overflow !== 'visible') {
            cardText.style.overflow = 'visible';
            cardText.style.height = '480px';
            cardBody.style.height = '630px';
            btnVer.textContent = 'Dejar de ver';
            btnOcultar.style.display = "none";
        } else {
            cardText.style.overflow = 'hidden';
            cardBody.style.height = '220px';
            cardText.style.height = 'auto';
            btnVer.textContent = 'Ver';
            btnOcultar.style.display = "inline";
        }
    });
});