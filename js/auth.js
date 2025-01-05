// Ensure Firebase is initialized properly
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig); // Make sure firebase is initialized
} else {
    firebase.app(); // If already initialized, use the existing app
}

// Initialize Firebase Auth
const auth = firebase.auth();

// Handle Login Form Submission
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login successful
            const user = userCredential.user;
            console.log('User logged in:', user);
            alert('Login successful!');
            window.location.href = 'index.html'; // Redirect to index after login
        })
        .catch((error) => {
            // Handle login errors
            console.error('Error logging in:', error);
            alert('Login failed: ' + error.message);
        });
});

// Function to log out the user
function logoutUser() {
    const auth = firebase.auth();
    auth.signOut()
        .then(() => {
            alert("You have successfully logged out.");
            // Redirect to login page after logout
            window.location.href = 'login.html'; // Redirect to login page
        })
        .catch((error) => {
            console.error('Error logging out:', error);
            alert('Logout failed: ' + error.message);
        });
}