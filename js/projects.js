document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const companiesRef = database.ref('companies');
    const projectsRef = database.ref('projects');
    const projectsTableBody = document.querySelector('#projects-table tbody');
    const projectForm = document.getElementById('project-form');
    const projectNameInput = document.getElementById('project-name');
    const projectAddressInput = document.getElementById('project-address');
    const projectSupervisorInput = document.getElementById('project-supervisor');
    const projectPhoneInput = document.getElementById('project-phone');
    const projectStatusInput = document.getElementById('project-status');
    const projectClientSelect = document.getElementById('project-client');
    const filterCompany = document.getElementById('filter-company');
    const filterStatus = document.getElementById('filter-status');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const currentUser = getCurrentUser();

    let allProjects = []; // Store all projects for filtering
    let editingProjectId = null; // Track the project being edited

    // Check if the user is logged in
    if (!currentUser) {
        alert('You need to log in first.');
        window.location.href = 'login.html'; // Redirect to login page if no user is logged in
        return;
    }

    // Populate the client selector
    companiesRef.on('value', (snapshot) => {
        populateClients(snapshot);
    });

    // Fetch and display projects
    projectsRef.on('value', (snapshot) => {
        allProjects = snapshot.val() ? Object.entries(snapshot.val()) : [];
        displayProjects(allProjects);
    });

    // Handle form submission to create or edit a project
    projectForm.addEventListener('submit', (event) => {
        event.preventDefault();
        saveOrUpdateProject();
    });

    // Add event listeners for the filter selectors
    filterCompany.addEventListener('change', () => filterProjects());
    filterStatus.addEventListener('change', () => filterProjects());

    // Handle delete confirmation
    confirmDeleteButton.addEventListener('click', () => {
        if (editingProjectId) {
            deleteProject(editingProjectId);
        }
    });

   // Function to populate the client selector with sorted company names
    function populateClients(snapshot) {
        projectClientSelect.innerHTML = '<option value="">Select a client</option>'; // Reset the dropdown
        const companies = snapshot.val();
        if (companies) {
            const sortedCompanies = Object.values(companies).sort((a, b) => a.name.localeCompare(b.name));
            sortedCompanies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.name; // Use the company name as the value
                option.textContent = company.name; // Display the company name
                projectClientSelect.appendChild(option);
            });
        }
    }

    // Function to filter projects by company and status
    function filterProjects() {
        const companyFilter = filterCompany.value;
        const statusFilter = filterStatus.value;

        const filteredProjects = allProjects.filter(([key, project]) => {
            const companyMatch = companyFilter === 'All' || project.name === companyFilter;
            const statusMatch = statusFilter === 'All' || project.status === statusFilter;
            return companyMatch && statusMatch;
        });

        displayProjects(filteredProjects);
    }

    // Function to render the project data into the table
    function displayProjects(projects) {
        projectsTableBody.innerHTML = ''; // Clear existing rows

        if (projects.length > 0) {
            projects.forEach(([key, project]) => {
                const row = document.createElement('tr');

                // Create cells for each field
                row.appendChild(createTableCell(project.name));
                row.appendChild(createTableCell(project.address));
                row.appendChild(createTableCell(project.supervisor || 'N/A'));
                row.appendChild(createTableCell(project.phone || 'N/A'));
                row.appendChild(createTableCell(project.status));

                // Company (client) cell
                row.appendChild(createTableCell(project.company));

                // Timestamp cell
                const timestamp = project.timestamp ? new Date(project.timestamp).toLocaleString() : 'N/A';
                row.appendChild(createTableCell(timestamp));

                // Actions cell with edit and delete buttons
                const actionsCell = document.createElement('td');
                actionsCell.className = 'text-center';
                actionsCell.appendChild(createActionButton('Edit', 'btn-warning', 'fas fa-edit', () => editProject(key, project)));
                row.appendChild(actionsCell);


                // Actions cell with edit and delete buttons
                const deleteCell = document.createElement('td');
                deleteCell.className = 'text-center';
                deleteCell.appendChild(createActionButton('Delete', 'btn-danger', 'fas fa-trash-alt', () => confirmDelete(key)));
                row.appendChild(deleteCell);

                projectsTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 8; // Updated colspan to include the new timestamp column
            cell.textContent = 'No projects available';
            row.appendChild(cell);
            projectsTableBody.appendChild(row);
        }
    }

    // Function to save or update a project
    function saveOrUpdateProject() {
        const name = projectNameInput.value.trim();
        const address = projectAddressInput.value.trim();
        const supervisor = projectSupervisorInput.value.trim();
        const phone = projectPhoneInput.value.trim();
        const status = projectStatusInput.value.trim();
        const clientId = projectClientSelect.value;

        if (!name || !address || !clientId) {
            alert('Project name, address, and client are required.');
            return;
        }

        const newProject = {
            name,
            address,
            supervisor: supervisor || '',
            phone: phone || '',
            status: status || 'Open',
            company: clientId, // Storing client (company) ID
            timestamp: firebase.database.ServerValue.TIMESTAMP, // Add timestamp
        };

        if (editingProjectId) {
            // Update an existing project
            projectsRef.child(editingProjectId).update(newProject)
                .then(() => {
                    alert('Project updated successfully!');
                    resetForm();
                })
                .catch((error) => alert('Failed to update project: ' + error.message));
        } else {
            // Create a new project
            projectsRef.push(newProject)
                .then(() => {
                    alert('Project added successfully!');
                    resetForm();
                })
                .catch((error) => alert('Failed to add project: ' + error.message));
        }
    }

    // Function to edit a project
    function editProject(projectId, project) {
        projectNameInput.value = project.name;
        projectAddressInput.value = project.address;
        projectSupervisorInput.value = project.supervisor || '';
        projectPhoneInput.value = project.phone || '';
        projectStatusInput.value = project.status || 'Open';
        projectClientSelect.value = project.company || '';
        editingProjectId = projectId; // Store the ID of the project being edited
    }

    // Function to confirm deletion of a project
    function confirmDelete(projectId) {
        editingProjectId = projectId; // Store the ID of the project to delete
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
        deleteModal.show();
    }

    // Function to delete a project
    function deleteProject(projectId) {
        projectsRef.child(projectId).remove()
            .then(() => {
                alert('Project deleted successfully!');
                resetForm();
            })
            .catch((error) => alert('Failed to delete project: ' + error.message));
    }

    // Function to reset the form
    function resetForm() {
        projectForm.reset();
        editingProjectId = null;
    }

    // Helper function to create a table cell
    function createTableCell(content) {
        const cell = document.createElement('td');
        cell.textContent = content;
        return cell;
    }

    // Helper function to create an action button
    function createActionButton(label, className, iconClass, onClick) {
        const button = document.createElement('button');
        button.className = `btn btn-sm mx-1 ${className}`;
        const icon = document.createElement('i');
        icon.className = iconClass;
        button.appendChild(icon);
        button.addEventListener('click', onClick);
        return button;
    }

    // Function to get the current user from localStorage
    function getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
});