document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const projectsRef = database.ref('projectMaterials');
    const projectsTableBody = document.querySelector('#projects-table tbody');
    const currentUser = getCurrentUser();

    const weekStartInput = document.getElementById('weekStart');
    const weekEndInput = document.getElementById('weekEnd');
    const filterBtn = document.getElementById('filterBtn');

    // Check if the user is logged in and is an admin
    if (!currentUser) {
        alert('You need to log in first.');
        window.location.href = 'login.html'; // Redirect to login page if no user is logged in
        return;
    }

    // Function to fetch and display filtered project materials
    function fetchProjects(startDate, endDate) {
        let query = projectsRef;
        
        if (startDate && endDate) {
            // If dates are provided, filter projects within the date range
            query = query.orderByChild('weekEnd').startAt(startDate).endAt(endDate);
        }

        if (currentUser.admin === 1) {
            // Admin: Show all projects based on the date filter
            query.on('value', (snapshot) => {
                displayProjects(snapshot);
            });
        } else {
            // Non-admin: Show only projects where userName matches current user's name
            query
                .orderByChild('userName')
                .equalTo(currentUser.name)
                .on('value', (snapshot) => {
                    displayProjects(snapshot);
                });
        }
    }

    // Event listener for filter button
    filterBtn.addEventListener('click', () => {
        const weekStart = weekStartInput.value;
        const weekEnd = weekEndInput.value;

        // Clear previous data in table
        projectsTableBody.innerHTML = '';

        if (weekStart && weekEnd) {
            // Filter by date range if both dates are provided
            fetchProjects(weekStart, weekEnd);
        } else {
            // If no dates are selected, fetch all projects
            fetchProjects();
        }
    });

    // Function to render the project data into the table
    function displayProjects(snapshot) {
        const projects = snapshot.val();

        if (projects) {
            Object.entries(projects).forEach(([key, project]) => {
                const row = document.createElement('tr');

                // Create cells for each field
                const dateCell = document.createElement('td');
                dateCell.textContent = project.weekEnd;
                row.appendChild(dateCell);

                const companyCell = document.createElement('td');
                companyCell.textContent = project.client;
                row.appendChild(companyCell);

                const clientProjectCell = document.createElement('td');
                clientProjectCell.textContent = `${project.company} - ${project.project}`;
                row.appendChild(clientProjectCell);

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
                    navigateToDetailPage(key);
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

            // Initialize DataTable after data is loaded
            $('#projects-table').DataTable();
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
        const url = `form-detail.html?&projectId=${projectId}`;
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
