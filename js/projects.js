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
    const currentUser = getCurrentUser();

    // Check if the user is logged in
    if (!currentUser) {
        alert('You need to log in first.');
        window.location.href = 'login.html'; // Redirect to login page if no user is logged in
        return;
    }

    // Populate the client selector (previously 'company')
    companiesRef.on('value', (snapshot) => {
        populateClients(snapshot);
    });

    // Fetch and display projects
    projectsRef.on('value', (snapshot) => {
        displayProjects(snapshot);
    });

    // Handle form submission to create or edit a project
    projectForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = projectNameInput.value.trim();
        const address = projectAddressInput.value.trim();
        const supervisor = projectSupervisorInput.value.trim();
        const phone = projectPhoneInput.value.trim();
        const status = projectStatusInput.value.trim();
        const clientId = projectClientSelect.value;  // Changed to 'clientId'

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
            company: clientId,  // Storing client (company) ID
        };

        const projectId = projectForm.dataset.editingId;

        if (projectId) {
            // Edit an existing project
            projectsRef.child(projectId).update(newProject)
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
    });

    // Function to render the project data into the table
    function displayProjects(snapshot) {
        projectsTableBody.innerHTML = ''; // Clear existing rows

        const projects = snapshot.val();
        console.log(projects);
        if (projects) {
            Object.entries(projects).forEach(([key, project]) => {
                const row = document.createElement('tr');

                // Create cells for each field
                const nameCell = document.createElement('td');
                nameCell.textContent = project.name;
                row.appendChild(nameCell);

                const addressCell = document.createElement('td');
                addressCell.textContent = project.address;
                row.appendChild(addressCell);

                const supervisorCell = document.createElement('td');
                supervisorCell.textContent = project.supervisor || 'N/A';
                row.appendChild(supervisorCell);

                const phoneCell = document.createElement('td');
                phoneCell.textContent = project.phone || 'N/A';
                row.appendChild(phoneCell);

                const statusCell = document.createElement('td');
                const statusToggle = document.createElement('input');
                statusToggle.type = 'checkbox';
                statusToggle.checked = project.status === 'Open';
                statusToggle.className = 'form-check-input';
                statusToggle.addEventListener('change', () => updateProjectStatus(key, statusToggle.checked));
                statusCell.appendChild(statusToggle);
                row.appendChild(statusCell);

                const companyCell = document.createElement('td');
                companyCell.textContent = project.company; // Using 'company' as client
                row.appendChild(companyCell);

                // Create actions cell
                const actionsCell = document.createElement('td');
                actionsCell.className = 'text-center';

                // Edit button
                const editButton = document.createElement('button');
                editButton.className = 'btn btn-warning btn-sm mx-1';
                const editIcon = document.createElement('i');
                editIcon.className = 'fas fa-edit'; // Bootstrap icon for "Edit"
                editButton.appendChild(editIcon);
                editButton.addEventListener('click', () => {
                    editProject(key, project);
                });
                actionsCell.appendChild(editButton);

                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-danger btn-sm mx-1';
                const deleteIcon = document.createElement('i');
                deleteIcon.className = 'fas fa-trash-alt'; // Bootstrap icon for "Delete"
                deleteButton.appendChild(deleteIcon);
                deleteButton.addEventListener('click', () => {
                    deleteProject(key);
                });
                actionsCell.appendChild(deleteButton);

                row.appendChild(actionsCell);
                projectsTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 7;
            cell.textContent = 'No projects available';
            row.appendChild(cell);
            projectsTableBody.appendChild(row);
        }
    }

    // Function to populate the client selector (previously 'company')
    function populateClients(snapshot) {
        projectClientSelect.innerHTML = '<option value="">Select a client</option>';  // Changed label
        const companies = snapshot.val();
        if (companies) {
            Object.entries(companies).forEach(([key, company]) => {
                const option = document.createElement('option');
                option.value = company.name;
                option.textContent = company.name;  // Assuming the company name is stored in the 'name' field
                projectClientSelect.appendChild(option);
            });
        }
    }

    // Function to edit a project
    function editProject(projectId, project) {
        projectNameInput.value = project.name;
        projectAddressInput.value = project.address;
        projectSupervisorInput.value = project.supervisor || '';
        projectPhoneInput.value = project.phone || '';
        projectStatusInput.value = project.status || 'Pending';
        projectClientSelect.value = project.company || '';  // Updated to reflect 'company' -> 'client'
        projectForm.dataset.editingId = projectId; // Store the ID of the project being edited
    }

    // Function to delete a project
    function deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            projectsRef.child(projectId).remove()
                .then(() => alert('Project deleted successfully!'))
                .catch((error) => alert('Failed to delete project: ' + error.message));
        }
    }

    // Function to update the project status
    function updateProjectStatus(projectId, isOpen) {
        const newStatus = isOpen ? 'Open' : 'Closed';
        projectsRef.child(projectId).update({ status: newStatus })
            .then(() => alert('Project status updated successfully!'))
            .catch((error) => alert('Failed to update project status: ' + error.message));
    }

    // Function to reset the form
    function resetForm() {
        projectNameInput.value = '';
        projectAddressInput.value = '';
        projectSupervisorInput.value = '';
        projectPhoneInput.value = '';
        projectStatusInput.value = '';
        projectClientSelect.value = '';  // Reset client (company) selector
        delete projectForm.dataset.editingId;
    }

    // Function to get the current user from localStorage
    function getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
});
