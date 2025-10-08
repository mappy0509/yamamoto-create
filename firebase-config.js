// firebase-config.js

// ▼▼▼ あなたのFirebaseプロジェクトの設定をここに貼り付けてください ▼▼▼
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:XXXXXXXXXXXXXXXXXXXXXX"
};
// ▲▲▲ あなたのFirebaseプロジェクトの設定をここに貼り付けてください ▲▲▲

// Firebaseの初期化
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 各サービスへの参照をエクスポート（今回はグローバルアクセスなので不要ですが、モジュール化の際に便利）
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();