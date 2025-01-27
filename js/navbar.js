document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('navbar-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    const currentUser = localStorage.getItem('currentUser');

    // Toggle Navbar for mobile view
    toggleButton.addEventListener('click', () => {
        navbarMenu.classList.toggle('open');
    });

    if (currentUser) {
        const userData = JSON.parse(currentUser);
        if (userData.admin === 1) {
            // Add admin-specific links to the navbar
            const adminLinks = `
                <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
                <li class="nav-item"><a href="admin-forms.html" class="nav-link">Forms</a></li>
                <li class="nav-item"><a href="admin-user.html" class="nav-link">Users</a></li>
                <li class="nav-item"><a href="admin-materials.html" class="nav-link">Materials</a></li>
                <li class="nav-item" id="logout-link"><a href="logout.html" class="nav-link">Logout</a></li>
            `;
            navbarMenu.insertAdjacentHTML('beforeend', adminLinks);
        }
    } else {
        const defaultLinks = `
            <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
            <li class="nav-item"><a href="admin-forms.html" class="nav-link">Forms</a></li>
            <li class="nav-item" id="logout-link"><a href="logout.html" class="nav-link">Logout</a></li>
        `;
        navbarMenu.insertAdjacentHTML('beforeend', defaultLinks);
    }
});
