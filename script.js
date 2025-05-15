// 1) Firebase 초기화
const firebaseConfig = {
  apiKey: "AIzaSyA6C9AQ1kUtxTILR6v8mmlQkuz9UTHjHv0",
  authDomain: "notion-chat-c7ff1.firebaseapp.com",
  projectId: "notion-chat-c7ff1",
  storageBucket: "notion-chat-c7ff1.appspot.com",
  messagingSenderId: "1052307211297",
  appId: "1:1052307211297:web:aa81f9649cf607202c8f60"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

// 2) DOM 요소
const loginScreen = document.getElementById('loginScreen');
const chatApp     = document.getElementById('chatApp');
const loginBtn    = document.getElementById('loginBtn');
const authDiv     = document.getElementById('auth');
const chatBox     = document.getElementById('chatBox');
const inputArea   = document.getElementById('inputArea');
const messageField= document.getElementById('message');
const sendBtn     = document.getElementById('sendBtn');

// 3) 로그인/로그아웃
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
auth.onAuthStateChanged(user => {
  if (user) {
    loginScreen.style.display = 'none';
    chatApp.style.display     = 'flex';
    authDiv.innerHTML = `
      <span>👤 ${user.displayName}</span>
      <button id="logoutBtn">Logout</button>`;
    document.getElementById('logoutBtn')
            .addEventListener('click', () => auth.signOut());
    loadMessages();
  } else {
    loginScreen.style.display = 'flex';
    chatApp.style.display     = 'none';
  }
});

// 4) 로그인 버튼
loginBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
});

// 5) 메시지 전송
function sendMessage() {
  const text = messageField.value.trim();
  if (!text) return;
  const user = auth.currentUser;
  db.collection("messages").add({
    userName:  user.displayName,
    userPhoto: user.photoURL,
    message:   text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    messageField.value = '';
  });
}
sendBtn.addEventListener('click', sendMessage);
messageField.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// 6) 포맷 헬퍼
function formatDate(d) {
  return d.toLocaleDateString('ko-KR', {
    year:'numeric', month:'long', day:'numeric'
  });
}
function formatTime(d) {
  return d.getHours() + ':' + d.getMinutes().toString().padStart(2,'0');
}

// 7) 실시간 로드 & 날짜/사용자 그룹핑
function loadMessages() {
  db.collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = '';
      let lastDate = '';
      let lastKey  = '';

      snapshot.forEach(doc => {
        const d = doc.data();
        if (!d.timestamp) return;
        const dateObj = d.timestamp.toDate();
        const dateStr = formatDate(dateObj);
        const timeStr = formatTime(dateObj);
        const key     = `${d.userName}|${timeStr}`;

        // 날짜가 바뀌면 Separator 추가
        if (dateStr !== lastDate) {
          chatBox.innerHTML += `
            <div class="date-separator"><span>${dateStr}</span></div>`;
          lastDate = dateStr;
          lastKey  = ''; 
        }

        // 새로운 시간·사용자 그룹
        if (key !== lastKey) {
          chatBox.innerHTML += `
            <div class="message-group">
              <img class="profile-pic" src="${d.userPhoto}" alt="Profile">
              <div class="content">
                <div>
                  <span class="username">${d.userName}</span>
                  <span class="timestamp">${timeStr}</span>
                </div>
                <div class="message">${d.message}</div>
              </div>
            </div>`;
          lastKey = key;
        } else {
          // 같은 그룹 → 들여쓰기만
          chatBox.innerHTML += `
            <div class="message-group" style="margin-left:40px;">
              <div class="content">
                <div class="message">${d.message}</div>
              </div>
            </div>`;
        }
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}
