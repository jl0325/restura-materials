document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
        const userData = JSON.parse(currentUser);

        // Check if the user is an admin
        console.log(currentUser)
        if (userData.admin === 1) {
            // Add admin-specific links to the navbar
            const adminLinks = `
                <li><a href="admin-user.html">Users</a></li>
                <li><a href="admin-materials.html">Materials</a></li>
                <li id="logout-link"><a href="logout.html">Logout</a></li>
            `;
            navbar.insertAdjacentHTML('beforeend', adminLinks);
        }
    } else {
        console.warn('No user data found. Please ensure the user is logged in.');
    }
});
