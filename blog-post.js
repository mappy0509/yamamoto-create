import { db, doc, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const postContainer = document.getElementById('post-container');
    
    // Get post ID from URL
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        postContainer.innerHTML = '<p class="text-center text-red-500 py-12">記事IDが指定されていません。</p>';
        return;
    }

    try {
        // Get the specific post document from Firestore
        const postRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(postRef);

        if (docSnap.exists()) {
            const post = docSnap.data();
            const postDate = post.createdAt.toDate().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
            
            // Set page title to the post title
            document.title = `${post.title} | yamamoto create`;

            // Generate HTML for the post
            let html = `
                <div class="mb-8">
                    <a href="index.html#news" class="inline-block text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">&larr; お知らせ一覧に戻る</a>
                    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">${post.title}</h1>
                    <p class="text-sm text-gray-500 mt-3">${postDate}</p>
                </div>
            `;

            if (post.imageUrl) {
                html += `<img src="${post.imageUrl}" alt="${post.title}" class="w-full h-auto object-cover rounded-lg shadow-md mb-8">`;
            }

            // Convert newlines in the content to <br> tags
            const formattedContent = post.content.replace(/\n/g, '<br>');
            html += `<div class="prose-custom max-w-none text-gray-700">${formattedContent}</div>`;
            
            html += `
                <div class="mt-12 border-t pt-6 text-center">
                    <a href="index.html#news" class="inline-block text-gray-600 hover:text-gray-900 transition-colors">&larr; お知らせ一覧に戻る</a>
                </div>
            `;

            postContainer.innerHTML = html;
        } else {
            postContainer.innerHTML = '<p class="text-center text-red-500 py-12">指定された記事は見つかりませんでした。</p>';
        }
    } catch (error) {
        console.error("Error getting document:", error);
        postContainer.innerHTML = '<p class="text-center text-red-500 py-12">記事の読み込み中にエラーが発生しました。</p>';
    }
});

