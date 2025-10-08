// blog-post.js

document.addEventListener('DOMContentLoaded', () => {
    const postContainer = document.getElementById('post-container');
    
    // URLから記事IDを取得
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        postContainer.innerHTML = '<p class="text-center text-red-500 py-12">記事IDが指定されていません。</p>';
        return;
    }

    // Firestoreから該当の記事データを取得
    db.collection('posts').doc(postId).get()
        .then(doc => {
            if (doc.exists) {
                const post = doc.data();
                const postDate = post.createdAt.toDate().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
                
                // ページタイトルを記事タイトルに設定
                document.title = `${post.title} | yamamoto create`;

                // HTMLを生成
                let html = `
                    <div class="mb-8">
                        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">${post.title}</h1>
                        <p class="text-sm text-gray-500 mt-3">${postDate}</p>
                    </div>
                `;

                if (post.imageUrl) {
                    html += `<img src="${post.imageUrl}" alt="${post.title}" class="w-full h-auto object-cover rounded-lg shadow-md mb-8">`;
                }

                // 改行を<br>タグに変換して本文を表示
                const formattedContent = post.content.replace(/\n/g, '<br>');
                html += `<div class="prose-custom max-w-none text-gray-700">${formattedContent}</div>`;
                
                html += `
                    <div class="mt-12 text-center">
                        <a href="index.html#news" class="inline-block text-gray-600 hover:text-gray-900 transition-colors">&larr; お知らせ一覧に戻る</a>
                    </div>
                `;

                postContainer.innerHTML = html;
            } else {
                postContainer.innerHTML = '<p class="text-center text-red-500 py-12">指定された記事は見つかりませんでした。</p>';
            }
        })
        .catch(error => {
            console.error("Error getting document:", error);
            postContainer.innerHTML = '<p class="text-center text-red-500 py-12">記事の読み込み中にエラーが発生しました。</p>';
        });
});