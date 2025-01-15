document.addEventListener('DOMContentLoaded', async () => {
    // Firebase configuration and initialization
    const database = firebase.database();

    // Get the projectId from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');

    if (!projectId) {
        alert('Project ID is required!');
        return;
    }

    try {
        // Fetch the project details from Firebase
        const snapshot = await database.ref('projectMaterials').child(projectId).once('value');
        const projectData = snapshot.val();
        
        if (projectData) {
            // Populate project details
            document.getElementById('client').textContent = projectData.client;
            document.getElementById('company').textContent = projectData.company;
            document.getElementById('date').textContent = projectData.date;
            document.getElementById('project').textContent = projectData.project;
            document.getElementById('userName').textContent = projectData.userName;
            console.log(projectData);

            // Populate materials table
            const materialsTableBody = document.getElementById('materials-list');
            let totalSum = 0; // Initialize total sum

            projectData.materials.forEach((material) => {
                console.log(material);
                // Extract name and unit from materialName
                const materialNameMatch = material.materialName.match(/^(.*?)\s*\((.*?)\)$/);
                const name = materialNameMatch ? materialNameMatch[1].trim() : material.materialName;
                const unit = materialNameMatch ? materialNameMatch[2].trim() : 'N/A';

                // Create a new table row
                const row = document.createElement('tr');

                // Create table cells for each material property
                const nameCell = document.createElement('td');
                nameCell.textContent = name;
                row.appendChild(nameCell);

                const unitCell = document.createElement('td');
                unitCell.textContent = unit;
                row.appendChild(unitCell);

                const unitaryPriceCell = document.createElement('td');
                unitaryPriceCell.textContent = `$${material.price}`;
                row.appendChild(unitaryPriceCell);

                const quantityCell = document.createElement('td');
                quantityCell.textContent = material.quantity;
                row.appendChild(quantityCell);

                const totalPriceCell = document.createElement('td');
                totalPriceCell.textContent = `$${material.totalPrice}`;
                row.appendChild(totalPriceCell);

                // Append the row to the table body
                materialsTableBody.appendChild(row);

                // Add totalPrice to the total sum
                totalSum += material.totalPrice;
            });

            // Create and append the total sum row
            const totalRow = document.createElement('tr');
            totalRow.innerHTML = `
                <td colspan="4" style="text-align: right; font-weight: bold;">Total</td>
                <td style="font-weight: bold;">$${totalSum}</td>
            `;
            materialsTableBody.appendChild(totalRow);
        } else {
            alert('Project not found!');
        }
    } catch (error) {
        console.error('Error fetching project data:', error);
        alert('Failed to load project details. Please try again later.');
    }
});