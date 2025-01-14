document.addEventListener('DOMContentLoaded', async () => {
    // Firebase configuration and initialization
    const database = firebase.database();

    // Get the projectId from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');
    console.log(projectId);

    if (!projectId) {
        alert('Project ID is required!');
        return;
    }

    try {
        // Fetch the project details from Firebase
        const snapshot = await database.ref('projectMaterials').child(projectId).once('value');
        const projectData = snapshot.val();
        console.log(projectData.materials);
        
        if (projectData) {
            // Populate project details
            document.getElementById('client').textContent = projectData.client;
            document.getElementById('company').textContent = projectData.company;
            document.getElementById('date').textContent = projectData.date;
            document.getElementById('project').textContent = projectData.project;
            document.getElementById('userName').textContent = projectData.userName;

            // Populate materials table
            const materialsTableBody = document.getElementById('materials-list');
            projectData.materials.forEach((material) => {
                // Create a new table row
                const row = document.createElement('tr');

                // Create table cells for each material property
                const materialNameCell = document.createElement('td');
                materialNameCell.textContent = material.materialName;
                row.appendChild(materialNameCell);

                const materialTypeCell = document.createElement('td');
                materialTypeCell.textContent = material.materialType;
                row.appendChild(materialTypeCell);

                const quantityCell = document.createElement('td');
                quantityCell.textContent = material.quantity.toFixed(2);
                row.appendChild(quantityCell);

                const totalPriceCell = document.createElement('td');
                totalPriceCell.textContent = `$${material.totalPrice.toFixed(2)}`;
                row.appendChild(totalPriceCell);

                // Append the row to the table body
                materialsTableBody.appendChild(row);
            });
        } else {
            alert('Project not found!');
        }
    } catch (error) {
        console.error('Error fetching project data:', error);
        alert('Failed to load project details. Please try again later.');
    }
});
