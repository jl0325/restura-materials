document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('navbar-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    const currentUser = localStorage.getItem('currentUser');

    // Toggle Navbar for mobile view
    toggleButton.addEventListener('click', () => navbarMenu.classList.toggle('open'));

    // Base navigation links
    let navContent = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="hoursReportDropdown" role="button" data-bs-toggle="dropdown">
                Hour's Report
            </a>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="hours-form.html">Create Your Hours Report</a></li>
                <li><a class="dropdown-item" href="show-hours.html">See Your Hours Report</a></li>
            </ul>
        </li>
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="materialReportDropdown" role="button" data-bs-toggle="dropdown">
                Material's Report
            </a>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="index.html">Create Your Materials Report</a></li>
                <li><a class="dropdown-item" href="admin-forms.html">See Your Materials Report</a></li>
            </ul>
        </li>
        <li class="nav-item"><a href="user-documents.html" class="nav-link">Documents</a></li>
        <li class="nav-item"><a href="projects.html" class="nav-link">Projects</a></li>
    `;

    // Add admin-specific dropdown if the user is an admin
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        if (userData.admin === 1) {
            navContent += `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown">
                        Admin
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="admin-hours.html">Hours</a></li>
                        <li><a class="dropdown-item" href="admin-materials.html">Materials</a></li>
                        <li><a class="dropdown-item" href="admin-user.html">Users</a></li>
                        <li><a class="dropdown-item" href="companies.html">Companies</a></li>
                    </ul>
                </li>
            `;
        }
    }
    // Append Logout option at the end (aligned to the right)
    navContent += `<li class="nav-item ms-auto"><a href="logout.html" class="nav-link">Sign Out</a></li>`;

    // Insert final HTML content in one operation
    navbarMenu.innerHTML = navContent;
});
