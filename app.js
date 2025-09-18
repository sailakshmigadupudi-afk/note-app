// Helper functions for localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function setSession(username) {
  localStorage.setItem('session', username);
}
function getSession() {
  return localStorage.getItem('session');
}
function clearSession() {
  localStorage.removeItem('session');
}

// Notes helpers
function getNotes(username) {
  return JSON.parse(localStorage.getItem('notes-' + username) || '[]');
}
function setNotes(username, notes) {
  localStorage.setItem('notes-' + username, JSON.stringify(notes));
}
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// DOM elements
const authContainer = document.getElementById('auth-container');
const notesContainer = document.getElementById('notes-container');
const authTitle = document.getElementById('auth-title');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authAction = document.getElementById('auth-action');
const toggleAuth = document.getElementById('toggle-auth');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout');

const notesList = document.getElementById('notes-list');
const newNoteBtn = document.getElementById('new-note-btn');
const noteEditor = document.getElementById('note-editor');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const saveNoteBtn = document.getElementById('save-note-btn');
const deleteNoteBtn = document.getElementById('delete-note-btn');
const closeEditorBtn = document.getElementById('close-editor-btn');
const noteStatus = document.getElementById('note-status');

let isSignIn = true;
let selectedNoteId = null;

// Auth logic
toggleAuth.onclick = function() {
  isSignIn = !isSignIn;
  authTitle.textContent = isSignIn ? "Sign In" : "Sign Up";
  authAction.textContent = isSignIn ? "Sign In" : "Sign Up";
  toggleAuth.textContent = isSignIn
    ? "Don't have an account? Sign Up"
    : "Already have an account? Sign In";
  authError.textContent = "";
  usernameInput.value = "";
  passwordInput.value = "";
};

authAction.onclick = function() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) {
    authError.textContent = "Please enter username and password.";
    return;
  }
  const users = getUsers();
  if (isSignIn) {
    if (!users[username] || users[username] !== password) {
      authError.textContent = "Invalid username or password.";
      return;
    }
    setSession(username);
    showNotes();
  } else {
    if (users[username]) {
      authError.textContent = "Username already exists.";
      return;
    }
    users[username] = password;
    setUsers(users);
    setSession(username);
    showNotes();
  }
};

logoutBtn.onclick = function() {
  clearSession();
  notesContainer.style.display = "none";
  authContainer.style.display = "";
};

// Notes UI logic
function showNotes() {
  authContainer.style.display = "none";
  notesContainer.style.display = "";
  noteEditor.style.display = "none";
  renderNotesList();
}

function renderNotesList() {
  const username = getSession();
  const notes = getNotes(username);

  notesList.innerHTML = "";
  if (notes.length === 0) {
    const li = document.createElement('li');
    li.textContent = "No notes yet. Click '+ New Note' to create one!";
    li.style.color = "#888";
    notesList.appendChild(li);
    return;
  }

  notes.forEach(note => {
    const li = document.createElement('li');
    li.className = (note.id === selectedNoteId) ? "selected" : "";
    const titleSpan = document.createElement('span');
    titleSpan.className = "note-title";
    titleSpan.textContent = note.title || "(Untitled)";
    li.appendChild(titleSpan);

    const dateSpan = document.createElement('span');
    dateSpan.className = "note-date";
    dateSpan.textContent = new Date(note.updatedAt || note.createdAt).toLocaleString();
    li.appendChild(dateSpan);

    li.onclick = function() {
      openNoteEditor(note.id);
    };
    notesList.appendChild(li);
  });
}

newNoteBtn.onclick = function() {
  selectedNoteId = null;
  noteTitleInput.value = "";
  noteContentInput.value = "";
  noteEditor.style.display = "";
  noteStatus.textContent = "";
};

function openNoteEditor(noteId) {
  const username = getSession();
  const notes = getNotes(username);
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  selectedNoteId = note.id;
  noteTitleInput.value = note.title;
  noteContentInput.value = note.content;
  noteEditor.style.display = "";
  noteStatus.textContent = "";

  // Highlight selected note
  renderNotesList();
}

saveNoteBtn.onclick = function() {
  const username = getSession();
  let notes = getNotes(username);

  const title = noteTitleInput.value.trim();
  const content = noteContentInput.value;

  if (!title) {
    noteStatus.style.color = "#d04a5e";
    noteStatus.textContent = "Please enter a title for your note.";
    return;
  }

  if (selectedNoteId) {
    // Edit existing
    notes = notes.map(note =>
      note.id === selectedNoteId
        ? { ...note, title, content, updatedAt: new Date().toISOString() }
        : note
    );
    noteStatus.style.color = "#4ab07a";
    noteStatus.textContent = "Note updated!";
  } else {
    // Add new
    const newNote = {
      id: generateId(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.unshift(newNote); // Add to top
    selectedNoteId = newNote.id;
    noteStatus.style.color = "#4ab07a";
    noteStatus.textContent = "Note created!";
  }

  setNotes(username, notes);
  renderNotesList();

  // Keep editor open with updated note
  openNoteEditor(selectedNoteId);

  setTimeout(() => { noteStatus.textContent = ""; }, 1500);
};

deleteNoteBtn.onclick = function() {
  if (!selectedNoteId) return;

  const username = getSession();
  let notes = getNotes(username);

  notes = notes.filter(note => note.id !== selectedNoteId);
  setNotes(username, notes);
  selectedNoteId = null;
  noteEditor.style.display = "none";
  renderNotesList();
};

closeEditorBtn.onclick = function() {
  noteEditor.style.display = "none";
  selectedNoteId = null;
  renderNotesList();
};

// On page load, check session
window.onload = function() {
  if (getSession()) {
    showNotes();
  }
};