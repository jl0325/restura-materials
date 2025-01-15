document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
        const userData = JSON.parse(currentUser);
        if (userData.admin === 1) {
            // Add admin-specific links to the navbar
            const adminLinks = `
                <li class="nav-item"><a href="admin-user.html"class=" nav-link">Users</a></li>
                <li class="nav-item"><a href="admin-materials.html" class="nav-link">Materials</a></li>
                <li class="nav-item" id="logout-link"><a href="logout.html" class="nav-link">Logout</a></li>
            `;
            navbar.insertAdjacentHTML('beforeend', adminLinks);
        }
    } else {
        console.warn('No user data found. Please ensure the user is logged in.');
    }
});
