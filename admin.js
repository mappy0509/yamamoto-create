// admin.js

document.addEventListener('DOMContentLoaded', () => {

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

    // --- 認証機能 ---
    auth.onAuthStateChanged(user => {
        if (user) {
            // ログイン済み
            loginModal.style.display = 'none';
            adminPanel.classList.remove('hidden');
            loadPosts();
        } else {
            // 未ログイン
            loginModal.style.display = 'flex';
            adminPanel.classList.add('hidden');
        }
    });

    // ログイン処理
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                loginError.textContent = 'メールアドレスまたはパスワードが正しくありません。';
                console.error("Login Error:", error);
            });
    });

    // ログアウト処理
    logoutButton.addEventListener('click', () => {
        auth.signOut();
    });

    // --- 記事投稿機能 ---
    blogForm.addEventListener('submit', async (e) => {
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

        try {
            let imageUrl = '';
            if (file) {
                // 1. 画像をStorageにアップロード
                const storageRef = storage.ref(`blog_images/${Date.now()}_${file.name}`);
                const uploadTask = storageRef.put(file);

                // アップロードの進捗を監視
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        uploadProgress.textContent = `アップロード中: ${Math.round(progress)}%`;
                    }, 
                    (error) => {
                        throw error; // エラーをcatchブロックに投げる
                    },
                    async () => {
                        // 2. アップロード完了後にURLを取得
                        imageUrl = await uploadTask.snapshot.ref.getDownloadURL();
                        // 3. Firestoreに記事を保存
                        await savePost(title, content, imageUrl);
                    }
                );
            } else {
                // 画像がない場合はそのままFirestoreに保存
                await savePost(title, content, '');
            }

        } catch (error) {
            console.error("投稿エラー: ", error);
            alert("記事の投稿に失敗しました。");
            submitButton.disabled = false;
            submitButton.textContent = '投稿する';
        }
    });
    
    // Firestoreに投稿を保存する関数
    async function savePost(title, content, imageUrl) {
        await db.collection('posts').add({
            title: title,
            content: content,
            imageUrl: imageUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert("記事を投稿しました！");
        blogForm.reset();
        uploadProgress.textContent = '';
        submitButton.disabled = false;
        submitButton.textContent = '投稿する';
        loadPosts(); // 投稿後にリストを再読み込み
    }

    // --- 記事一覧表示・削除機能 ---
    async function loadPosts() {
        postList.innerHTML = '<p class="text-center text-gray-500">読み込み中...</p>';
        
        try {
            const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
            if (snapshot.empty) {
                postList.innerHTML = '<p class="text-center text-gray-500">まだ投稿がありません。</p>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const post = doc.data();
                const postDate = post.createdAt ? post.createdAt.toDate().toLocaleDateString('ja-JP') : '日付不明';
                html += `
                    <div class="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                        <div>
                            <h3 class="font-bold text-gray-800">${post.title}</h3>
                            <p class="text-sm text-gray-500">${postDate}</p>
                        </div>
                        <button data-id="${doc.id}" data-image-url="${post.imageUrl}" class="delete-button bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-red-600 transition-colors">削除</button>
                    </div>
                `;
            });
            postList.innerHTML = html;

        } catch (error) {
            console.error("記事の読み込みエラー: ", error);
            postList.innerHTML = '<p class="text-center text-red-500">記事の読み込みに失敗しました。</p>';
        }
    }

    // 記事削除のイベントリスナー
    postList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-button')) {
            const id = e.target.dataset.id;
            const imageUrl = e.target.dataset.imageUrl;

            if (confirm("本当にこの記事を削除しますか？\nこの操作は元に戻せません。")) {
                try {
                    // Firestoreのドキュメントを削除
                    await db.collection('posts').doc(id).delete();

                    // Storageに画像があればそれも削除
                    if (imageUrl) {
                        const imageRef = storage.refFromURL(imageUrl);
                        await imageRef.delete();
                    }
                    
                    alert("記事を削除しました。");
                    loadPosts(); // リストを再読み込み
                } catch (error) {
                    console.error("削除エラー: ", error);
                    alert("記事の削除に失敗しました。");
                }
            }
        }
    });
});