
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
  import { 
    query,
    getFirestore,
    collection,
    setDoc,
    getDocs,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    orderBy // <-- Añadido para ordenar comentarios
  } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
  import { firebaseConfig } from "./config.js";
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Initialize Firebase
  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore();

//Firstore
/**
 * Save a New Task in Firestore
 * @param {string} title the title of the Task
 * @param {string} section the description of the Task
 * @param {string} fecha the description of the Task
 * @param {string} autor the description of the Task
 * @param {string} description the description of the Task
 * @param {string} imageUrl the URL of the image for the Task
 * 
 */
export const savePost = (autor,title, description,section,fecha,imageUrl) =>
  addDoc(collection(db, "post"), { autor,title, description,section,fecha,imageUrl });

  export const onGetPosts = (callback, filter = null) => {
    let collectionRef = collection(db, "post");
    if (filter) {
        collectionRef = query(collectionRef, filter);
    }
    return onSnapshot(collectionRef, callback);
};

/**
 *
 * @param {string} idTask Task ID
 */
export const deletePost = (idTask) => deleteDoc(doc(db, "post", idTask));

export const getPost = (id) => getDoc(doc(db, "post", id));

export const updatePost = (id, newFields) =>
  updateDoc(doc(db, "post", id), newFields);

export const getPosts = () => getDocs(collection(db, "post"));

/**
 * Save a New user in Firestore
 * @param {string} idUser the name of the User
 * @param {string} name the name of the User
 * @param {string} rol the rol of the User
 */
export const saveUser = async (idUser,name, rol) => {
  await setDoc(doc(db, "users", idUser), {name, rol});
}

export const onGetUsers = (callback) =>
  onSnapshot(collection(db, "users"), callback);

// --- Funciones para Comentarios ---

/**
 * Guarda un nuevo comentario en un artículo específico.
 * @param {string} postId - El ID del artículo (post).
 * @param {object} commentData - El objeto del comentario (autor, texto, fecha).
 */
export const saveComment = (postId, commentData) => 
  addDoc(collection(db, `post/${postId}/comments`), commentData);

/**
 * Obtiene los comentarios de un artículo en tiempo real.
 * @param {string} postId - El ID del artículo (post).
 * @param {function} callback - La función que se ejecuta con los datos de los comentarios.
 */
export const onGetComments = (postId, callback) => {
  const commentsCollection = collection(db, `post/${postId}/comments`);
  const q = query(commentsCollection, orderBy("createdAt", "asc"));
  return onSnapshot(q, callback);
};
