document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('navbar-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    const currentUser = localStorage.getItem('currentUser');

    // Toggle Navbar for mobile view
    toggleButton.addEventListener('click', () => {
        navbarMenu.classList.toggle('open');
    });

    // Always visible links (except Logout)
    const defaultLinks = `
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="hoursReportDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Hour's Report
        </a>
        <ul class="dropdown-menu" aria-labelledby="hoursReportDropdown">
            <li><a class="dropdown-item" href="hours-form.html">Create Your Hours Report</a></li>
            <li><a class="dropdown-item" href="show-hours.html">See Your Hours Report</a></li>
        </ul>
    </li>
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="materialReportDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Material's Report
        </a>
        <ul class="dropdown-menu" aria-labelledby="materialReportDropdown">
            <li><a class="dropdown-item" href="index.html">Create Your Materials Report</a></li>
            <li><a class="dropdown-item" href="admin-forms.html">See Your Materials Report</a></li>
        </ul>
    </li>
    <li class="nav-item"><a href="user-documents.html" class="nav-link">Documents</a></li>
    <li class="nav-item"><a href="projects.html" class="nav-link">Projects</a></li>
    `;
    navbarMenu.insertAdjacentHTML('beforeend', defaultLinks);

    // Add admin-specific dropdown if the user is an admin
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        if (userData.admin === 1) {
            const adminDropdown = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Admin
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="adminDropdown">
                        <li><a class="dropdown-item" href="admin-hours.html">Hours</a></li>
                        <li><a class="dropdown-item" href="admin-materials.html">Materials</a></li>
                        <li><a class="dropdown-item" href="admin-user.html">Users</a></li>
                        <li><a class="dropdown-item" href="companies.html">Companies</a></li>
                    </ul>
                </li>
            `;
            navbarMenu.insertAdjacentHTML('beforeend', adminDropdown);
        }
    }

    // Add Logout as the last option
    const logoutLink = `
        <li class="nav-item" id="logout-link"><a href="logout.html" class="nav-link">Logout</a></li>
    `;
    navbarMenu.insertAdjacentHTML('beforeend', logoutLink);
});
