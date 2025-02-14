document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const projectsRef = database.ref('projectMaterials');
    const projectsTableBody = document.querySelector('#projects-table tbody');
    const currentUser = getCurrentUser();

    const weekStartInput = document.getElementById('weekStart');
    const weekEndInput = document.getElementById('weekEnd');
    const filterBtn = document.getElementById('filterBtn');

    if (!currentUser) {
        alert('You need to log in first.');
        window.location.href = 'login.html';
        return;
    }

    // Fetch all projects when the page loads
    fetchProjects();

    // Function to fetch and display filtered project materials
    function fetchProjects(startDate = null, endDate = null) {
        let query = projectsRef;

        if (startDate && endDate) {
            query = query.orderByChild('weekEnd').startAt(startDate).endAt(endDate);
        }

        if (currentUser.admin === 1) {
            query.on('value', (snapshot) => {
                displayProjects(snapshot);
            });
        } else {
            query.orderByChild('userName').equalTo(currentUser.name).on('value', (snapshot) => {
                displayProjects(snapshot);
            });
        }
    }

    // Event listener for filter button
    filterBtn.addEventListener('click', () => {
        const weekStart = weekStartInput.value;
        const weekEnd = weekEndInput.value;

        projectsTableBody.innerHTML = '';
        fetchProjects(weekStart, weekEnd);
    });

    // Function to render project data into the table
    function displayProjects(snapshot) {
        projectsTableBody.innerHTML = '';
        const projects = snapshot.val();

        if (projects) {
            Object.entries(projects).forEach(([key, project]) => {
                const row = document.createElement('tr');

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

                const actionsCell = document.createElement('td');
                actionsCell.className = 'text-center';

                const viewIcon = document.createElement('i');
                viewIcon.className = 'bi bi-eye-fill text-primary mx-1';
                viewIcon.style.cursor = 'pointer';
                viewIcon.style.padding = '5px';
                viewIcon.title = 'View';
                viewIcon.addEventListener('click', () => {
                    navigateToDetailPage(key);
                });
                actionsCell.appendChild(viewIcon);

                const deleteIcon = document.createElement('i');
                deleteIcon.className = 'bi bi-trash-fill text-danger mx-1';
                deleteIcon.style.cursor = 'pointer';
                deleteIcon.style.padding = '5px';
                deleteIcon.title = 'Delete';
                deleteIcon.addEventListener('click', () => {
                    deleteProject(key);
                });
                actionsCell.appendChild(deleteIcon);

                row.appendChild(actionsCell);
                projectsTableBody.appendChild(row);
            });

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

    function navigateToDetailPage(projectId) {
        window.location.href = `form-detail.html?&projectId=${projectId}`;
    }

    function deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            projectsRef.child(projectId).remove()
                .then(() => alert('Project deleted successfully!'))
                .catch((error) => alert('Failed to delete project: ' + error.message));
        }
    }

    function getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
});
