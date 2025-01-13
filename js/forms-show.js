// forms-show.js

// Wait for the DOM content to be loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();

    // Reference to the projectMaterials node in Firebase
    const projectsRef = database.ref('projectMaterials');

    // Reference to the table body where the rows will be inserted
    const projectsTableBody = document.querySelector('#projects-table tbody');

    // Fetch projects data from Firebase
    projectsRef.on('value', (snapshot) => {
        // Clear the table before adding new data
        projectsTableBody.innerHTML = '';

        // Get the data from Firebase
        const projects = snapshot.val();

        if (projects) {
            // Loop through the projects and create table rows
            Object.entries(projects).forEach(([key, project]) => {
                const row = document.createElement('tr');

                // Create table cells for each project field
                const companyCell = document.createElement('td');
                companyCell.textContent = project.company;
                row.appendChild(companyCell);

                const dateCell = document.createElement('td');
                dateCell.textContent = project.date;
                row.appendChild(dateCell);

                const clientCell = document.createElement('td');
                clientCell.textContent = project.client;
                row.appendChild(clientCell);

                const projectCell = document.createElement('td');
                projectCell.textContent = project.project;
                row.appendChild(projectCell);

                // Append the row to the table body
                projectsTableBody.appendChild(row);
            });
        } else {
            // Display a message if no data is available
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = 'No projects available';
            row.appendChild(cell);
            projectsTableBody.appendChild(row);
        }
    });
});
