// Authentication state observer
firebase.auth().onAuthStateChanged((user) => {
    const userInfo = document.getElementById('user-info');
    const signInBtn = document.getElementById('sign-in-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    
    if (user) {
        // User is signed in
        userInfo.textContent = `Hi, ${user.displayName || user.email}`;
        userInfo.classList.remove('d-none');
        signInBtn.classList.add('d-none');
        signOutBtn.classList.remove('d-none');
        
        // Load user data
        loadUserData(user.uid);
    } else {
        // User is signed out
        userInfo.classList.add('d-none');
        signInBtn.classList.remove('d-none');
        signOutBtn.classList.add('d-none');
        
        // Clear UI
        clearUserData();
    }
});

// Sign in with Google
document.getElementById('sign-in-btn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            // User signed in
        })
        .catch((error) => {
            console.error('Sign in error:', error);
            alert('Sign in failed. Please try again.');
        });
});

// Sign out
document.getElementById('sign-out-btn').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        // Sign-out successful
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
});

// Load user data from Firebase
function loadUserData(userId) {
    // Implement data loading from Firebase
    // This will be called from other modules
}

// Clear user data when signed out
function clearUserData() {
    // Implement clearing of UI elements
    // This will be called from other modules
}
