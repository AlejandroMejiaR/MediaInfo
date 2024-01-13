
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
  import { getStorage,getDownloadURL,uploadBytes, ref} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
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
    updateDoc,} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAOg8UtjafNkRmEHa7bt054neDNI2h9Gdk",
    authDomain: "mediainfo-82855.firebaseapp.com",
    projectId: "mediainfo-82855",
    storageBucket: "mediainfo-82855.appspot.com",
    messagingSenderId: "765838479600",
    appId: "1:765838479600:web:6c85fe7c9f7cc55102f235"
  };

  // Initialize Firebase
  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const storage = getStorage();
  export const db = getFirestore();


//Storage

export async function insertImage(file, filename){
  const storageRef = ref(storage, "postsImages/" + filename)
  const res = await uploadBytes(storageRef,file)
  return res;
}

export async function getImage(file, filename){
  const itemRef = ref(storage, "postsImages/" + filename)
  const response = await getDownloadURL(itemRef)
  return response;
}




//Firstore
/**
 * Save a New Task in Firestore
 * @param {string} title the title of the Task
 * @param {string} section the description of the Task
 * @param {string} fecha the description of the Task
 * @param {string} autor the description of the Task
 * @param {string} description the description of the Task
 * @param {string} imgUrl the description of the Task
 * 
 */
export const savePost = (autor,title, description,section,fecha,imgUrl) =>
  addDoc(collection(db, "post"), { autor,title, description,section,fecha,imgUrl });

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
export const saveUser = async (idUser,name, rol) =>{
  await setDoc(doc(db, "users", idUser), {name, rol});
}

export const onGetUsers = (callback) =>
  onSnapshot(collection(db, "users"), callback);