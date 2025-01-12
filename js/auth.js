// Ensure Firebase is initialized properly
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig); // Initialize Firebase
} else {
    firebase.app(); // Use the existing app
}

// Initialize Firebase Auth and Database
const auth = firebase.auth();
const database = firebase.database();

// Redirect to login.html if no user is logged in
auth.onAuthStateChanged(async (user) => {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('login.html');
    const isSignupPage = currentPath.includes('signup.html');

    if (!user && !isLoginPage && !isSignupPage) {
        alert('Please log in to continue.');
        window.location.href = 'login.html';
    } else if (user) {
        // Fetch user data from Firebase Database and store it in localStorage
        const userRef = database.ref('users/' + user.uid);
        const snapshot = await userRef.once('value');
        if (snapshot.exists()) {
            const userData = snapshot.val();
            localStorage.setItem('currentUser', JSON.stringify(userData));
            console.log('User data stored in localStorage:', userData);
        } else {
            console.warn('User data not found in database.');
        }
    }
});

// Handle Login Form Submission
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            console.log('User logged in:', user);

            // Fetch and store user data
            const userRef = database.ref('users/' + user.uid);
            const snapshot = await userRef.once('value');
            if (snapshot.exists()) {
                const userData = snapshot.val();
                localStorage.setItem('currentUser', JSON.stringify(userData));
                alert(`Welcome, ${userData.name}!`);
            } else {
                console.warn('User data not found in database.');
            }

            window.location.href = 'index.html'; // Redirect to index after login
        })
        .catch((error) => {
            console.error('Error logging in:', error);
            alert('Login failed: ' + error.message);
        });
});

// Handle Sign Up Form Submission
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    try {
        // Check if the email is unique in the database
        const usersRef = database.ref('users');
        const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
        if (snapshot.exists()) {
            throw new Error('Email is already in use.');
        }

        // Create user in Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save user data to Firebase Database
        await database.ref('users/' + user.uid).set({
            name,
            phone,
            email,
            password,
            admin: 0
        });

        alert('Account created successfully!');
        window.location.href = 'login.html'; // Redirect to login page
    } catch (error) {
        console.error('Error signing up:', error);
        alert('Sign up failed: ' + error.message);
    }
});

// Function to log out the user
function logoutUser() {
    auth.signOut()
        .then(() => {
            alert('You have successfully logged out.');
            localStorage.removeItem('currentUser'); // Clear user data from localStorage
            window.location.href = 'login.html'; // Redirect to login page
        })
        .catch((error) => {
            console.error('Error logging out:', error);
            alert('Logout failed: ' + error.message);
        });
}

// Helper to get current user data
function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}
