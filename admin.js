import {
    auth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
    db, collection, addDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp, doc,
    storage, ref, uploadBytesResumable, getDownloadURL, deleteObject
} from './firebase-config.js';

// DOM Elements
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const adminPanel = document.getElementById('admin-panel');
const logoutButton = document.getElementById('logout-button');
const blogForm = document.getElementById('blog-form');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const imageInput = document.getElementById('image');
const submitButton = document.getElementById('submit-button');
const uploadProgress = document.getElementById('upload-progress');
const postList = document.getElementById('post-list');

// --- Authentication ---
onAuthStateChanged(auth, user => {
    if (user) {
        // User is signed in
        loginModal.style.display = 'none';
        adminPanel.classList.remove('hidden');
        loadPosts();
    } else {
        // User is signed out
        loginModal.style.display = 'flex';
        adminPanel.classList.add('hidden');
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.textContent = ''; // Clear previous errors
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password)
        .catch(error => {
            loginError.textContent = 'メールアドレスまたはパスワードが正しくありません。';
            console.error("Login Error:", error.code, error.message);
        });
});

logoutButton.addEventListener('click', () => {
    signOut(auth);
});

// --- Blog Post Form ---
blogForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const file = imageInput.files[0];

    if (!title || !content) {
        alert("タイトルと本文を入力してください。");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = '投稿中...';
    uploadProgress.textContent = '';

    if (file) {
        // If there is a file, upload it first
        const storageRef = ref(storage, `blog_images/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                uploadProgress.textContent = `アップロード中: ${Math.round(progress)}%`;
            }, 
            (error) => {
                console.error("Upload failed:", error);
                alert("画像のアップロードに失敗しました。");
                submitButton.disabled = false;
                submitButton.textContent = '投稿する';
            },
            () => {
                // On successful upload, get URL and save post
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    savePost(title, content, downloadURL);
                });
            }
        );
    } else {
        // If no file, save post without image URL
        savePost(title, content, '');
    }
});

async function savePost(title, content, imageUrl) {
    try {
        await addDoc(collection(db, 'posts'), {
            title: title,
            content: content,
            imageUrl: imageUrl,
            createdAt: serverTimestamp()
        });
        alert("記事を投稿しました！");
        blogForm.reset();
        loadPosts(); // Refresh post list
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("記事の投稿に失敗しました。");
    } finally {
        uploadProgress.textContent = '';
        submitButton.disabled = false;
        submitButton.textContent = '投稿する';
    }
}

// --- Post List & Deletion ---
async function loadPosts() {
    postList.innerHTML = '<p class="text-center text-gray-500">読み込み中...</p>';
    
    try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            postList.innerHTML = '<p class="text-center text-gray-500">まだ投稿がありません。</p>';
            return;
        }

        let html = '';
        querySnapshot.forEach((docRef) => {
            const post = docRef.data();
            const postDate = post.createdAt ? post.createdAt.toDate().toLocaleDateString('ja-JP') : '日付不明';
            html += `
                <div class="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                        <h3 class="font-bold text-gray-800">${post.title}</h3>
                        <p class="text-sm text-gray-500">${postDate}</p>
                    </div>
                    <button data-id="${docRef.id}" data-image-url="${post.imageUrl || ''}" class="delete-button bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-red-600 transition-colors">削除</button>
                </div>
            `;
        });
        postList.innerHTML = html;
    } catch (error) {
        console.error("Error loading posts:", error);
        postList.innerHTML = '<p class="text-center text-red-500">記事の読み込みに失敗しました。</p>';
    }
}

postList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-button')) {
        const id = e.target.dataset.id;
        const imageUrl = e.target.dataset.imageUrl;

        if (confirm("本当にこの記事を削除しますか？\nこの操作は元に戻せません。")) {
            try {
                // Delete post from Firestore
                await deleteDoc(doc(db, 'posts', id));

                // If there was an image, delete it from Storage
                if (imageUrl) {
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef).catch(error => {
                        // It's okay if the image doesn't exist, log other errors
                        if (error.code !== 'storage/object-not-found') {
                            console.error("Error deleting image:", error);
                        }
                    });
                }
                
                alert("記事を削除しました。");
                loadPosts(); // Refresh post list
            } catch (error) {
                console.error("Error removing document: ", error);
                alert("記事の削除に失敗しました。");
            }
        }
    }
});

