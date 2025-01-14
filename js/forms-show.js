// Wait for the DOM content to load
document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const projectsRef = database.ref('projectMaterials');
    const projectsTableBody = document.querySelector('#projects-table tbody');
    const searchInput = document.getElementById('searchInput');
    const currentUser = getCurrentUser();

    // Check if the user is logged in and is an admin
    if (!currentUser) {
        alert('You need to log in first.');
        window.location.href = 'login.html'; // Redirect to login page if no user is logged in
        return;
    }

    // Fetch and display project materials based on user role
    if (currentUser.admin === 1) {
        // Admin: Show all projects
        projectsRef.on('value', (snapshot) => {
            displayProjects(snapshot);
        });
    } else {
        // Non-admin: Show only projects where userName matches current user's name
        projectsRef.orderByChild('userName').equalTo(currentUser.name).on('value', (snapshot) => {
            displayProjects(snapshot);
        });
    }

    // Filter table based on search input
    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        Array.from(projectsTableBody.rows).forEach((row) => {
            const cells = row.getElementsByTagName('td');
            const matches = Array.from(cells).some((cell) =>
                cell.textContent.toLowerCase().includes(filter)
            );
            row.style.display = matches ? '' : 'none';
        });
    });

    // Function to render the project data into the table
    function displayProjects(snapshot) {
        projectsTableBody.innerHTML = ''; // Clear existing rows

        const projects = snapshot.val();

        if (projects) {
            Object.entries(projects).forEach(([key, project]) => {
                const row = document.createElement('tr');

                // Create cells for each field
                const dateCell = document.createElement('td');
                dateCell.textContent = project.date;
                row.appendChild(dateCell);

                const companyCell = document.createElement('td');
                companyCell.textContent = project.company;
                row.appendChild(companyCell);

                const clientCell = document.createElement('td');
                clientCell.textContent = project.client;
                row.appendChild(clientCell);

                const projectCell = document.createElement('td');
                projectCell.textContent = project.project;
                row.appendChild(projectCell);

                const userNameCell = document.createElement('td');
                userNameCell.textContent = project.userName;
                row.appendChild(userNameCell);

                // Create actions cell
                const actionsCell = document.createElement('td');
                actionsCell.className = 'text-center';

                // View icon
                const viewIcon = document.createElement('i');
                viewIcon.className = 'bi bi-eye-fill text-primary mx-1';
                viewIcon.style.cursor = 'pointer';
                viewIcon.title = 'View';
                viewIcon.addEventListener('click', () => {
                    navigateToDetailPage(key); // Fixed to call navigateToDetailPage
                });
                actionsCell.appendChild(viewIcon);

                const deleteIcon = document.createElement('i');
                deleteIcon.className = 'bi bi-trash-fill text-danger mx-1';
                deleteIcon.style.cursor = 'pointer';
                deleteIcon.title = 'Delete';
                deleteIcon.addEventListener('click', () => {
                    deleteProject(key);
                });
                actionsCell.appendChild(deleteIcon);

                row.appendChild(actionsCell);
                projectsTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.textContent = 'No projects available';
            row.appendChild(cell);
            projectsTableBody.appendChild(row);
        }
    }

    // Function to navigate to the detail page (for View or Edit)
    function navigateToDetailPage(projectId) {
        const url = `form-detail.html?&projectId=${projectId}`; // URL updated to use correct parameter names
        window.location.href = url;
    }

    // Function to delete a project
    function deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            projectsRef.child(projectId).remove()
                .then(() => alert('Project deleted successfully!'))
                .catch((error) => alert('Failed to delete project: ' + error.message));
        }
    }

    // Function to get the current user from localStorage
    function getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
});
