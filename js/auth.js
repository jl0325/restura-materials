// auth.js

const auth = firebase.auth();

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
        })
        .catch((error) => {
            // Handle login errors
            console.error('Error logging in:', error);
            alert('Login failed: ' + error.message);
        });
});
