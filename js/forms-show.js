// forms-show.js

// Wait for the DOM content to load
document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const projectsRef = database.ref('projectMaterials');
    const projectsTableBody = document.querySelector('#projects-table tbody');
    const searchInput = document.getElementById('searchInput');
    const currentUser = getCurrentUser();

    // Fetch projects data and render the table
    projectsRef.on('value', (snapshot) => {
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
                projectCell.textContent = project.userName;
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
                    navigateToEditPage('View', key);
                });
                actionsCell.appendChild(viewIcon);

                // Delete icon
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
            cell.colSpan = 5;
            cell.textContent = 'No projects available';
            row.appendChild(cell);
            projectsTableBody.appendChild(row);
        }
    });

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

    // Function to navigate to the edit or view page
    function navigateToEditPage(action, projectId) {
        const url = `edit-forms.html?title=${action}&id=${projectId}`;
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
