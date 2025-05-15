// 📌 Replace with your Firebase Config ↓↓↓
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const authDiv = document.getElementById('auth');
const chatDiv = document.getElementById('chat');

// 🔑 Google Login
auth.onAuthStateChanged(user => {
  if (user) {
    authDiv.innerHTML = `<p>👤 ${user.displayName} <button onclick="logout()">Logout</button></p>`;
    chatDiv.style.display = 'block';
    loadMessages();
  } else {
    authDiv.innerHTML = `<button onclick="login()">Login with Google</button>`;
    chatDiv.style.display = 'none';
  }
});

function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

function logout() {
  auth.signOut();
}

// 📤 Send Message
function sendMessage() {
  const message = document.getElementById('message').value.trim();
  if (!message) return;

  const user = auth.currentUser;
  db.collection("messages").add({
    userName: user.displayName,
    userPhoto: user.photoURL,
    message: message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById('message').value = '';
}

// 📥 Load Messages in Real-time
function loadMessages() {
  db.collection("messages").orderBy("timestamp")
    .onSnapshot(snapshot => {
      const chatBox = document.getElementById('chatBox');
      chatBox.innerHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        chatBox.innerHTML += `
          <p><img src="${data.userPhoto}"><strong>${data.userName}:</strong> ${data.message}</p>`;
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    });
}
