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

    // Get the current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isAdmin = currentUser.admin === 1;

    try {
        // Fetch the project details from Firebase
        const snapshot = await database.ref('projectMaterials').child(projectId).once('value');
        const projectData = snapshot.val();

        if (!projectData) {
            alert('Project not found!');
            return;
        }

        // Populate project details
        populateProjectDetails(projectData);

        // Populate materials table based on user role
        populateMaterialsTable(projectData.materials, isAdmin, projectId);
    } catch (error) {
        console.error('Error fetching project data:', error);
    }
});

/**
 * Populates the project details section with data.
 * @param {Object} projectData - The project data object.
 */
function populateProjectDetails(projectData) {
    document.getElementById('client').textContent = projectData.client || 'N/A';
    document.getElementById('company').textContent = projectData.company || 'N/A';
    document.getElementById('date').textContent = projectData.date || 'N/A';
    document.getElementById('project').textContent = projectData.project || 'N/A';
    document.getElementById('userName').textContent = projectData.userName || 'N/A';
}

/**
 * Populates the materials table with data.
 * @param {Array} materials - The array of materials.
 * @param {boolean} isAdmin - Whether the user is an admin.
 * @param {string} projectId - The project ID.
 */
function populateMaterialsTable(materials, isAdmin, projectId) {
    const materialsTableBody = document.getElementById('materials-list'); // Table element
    const materialsTableHead = document.getElementById('materials-head'); // Table head
    materialsTableBody.innerHTML = ''; // Clear previous content
    let totalSum = 0; // Initialize total sum

    // Define table headers based on user role
    materialsTableHead.innerHTML = isAdmin
        ? `<tr>
            <th>Name</th>
            <th>Unit</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Action</th>
          </tr>`
        : `<tr>
            <th>Name</th>
            <th>Unit</th>
            <th>Quantity</th>
            <th>Action</th>
          </tr>`;

    materials.forEach((material, index) => {
        // Extract name and unit from materialName
        const { name, unit } = extractMaterialDetails(material.materialName);

        // Create a new table row
        const row = document.createElement('tr');

        // Create table cells for each material property
        const cells = [
            createTableCell(name),
            createTableCell(unit),
        ];
        // Add additional columns for admins
        if (isAdmin) {
            cells.push(createTableCell(`$${material.price}`));
            cells.push(createEditableQuantityCell(material.quantity, index, projectId));
            cells.push(createTableCell(`$${material.totalPrice.toFixed(2)}`));
            cells.push(createDeleteButtonCell(index, projectId));
        } else {
            cells.push(createEditableQuantityCell(material.quantity, index, projectId));
            cells.push(createDeleteButtonCell(index, projectId));
        }

        // Append cells to the row
        cells.forEach((cell) => row.appendChild(cell));

        // Append the row to the table body
        materialsTableBody.appendChild(row);

        // Add totalPrice to the total sum
        totalSum += material.totalPrice || 0;
    });

    // Append the total sum row
    appendTotalRow(materialsTableBody, totalSum, isAdmin);
}

/**
 * Extracts the name and unit from the materialName string.
 * @param {string} materialName - The material name string.
 * @returns {Object} - An object containing the name and unit.
 */
function extractMaterialDetails(materialName) {
    const materialNameMatch = materialName.match(/^(.*?)\s*\((.*?)\)$/);
    return {
        name: materialNameMatch ? materialNameMatch[1].trim() : materialName,
        unit: materialNameMatch ? materialNameMatch[2].trim() : 'N/A',
    };
}

/**
 * Creates a table cell with the given content.
 * @param {string} content - The content for the cell.
 * @returns {HTMLElement} - The created table cell.
 */
function createTableCell(content) {
    const cell = document.createElement('td');
    cell.textContent = content;
    return cell;
}

/**
 * Creates an editable quantity cell with an input field.
 * @param {number} quantity - The initial quantity.
 * @param {number} index - The index of the material in the array.
 * @param {string} projectId - The project ID.
 * @returns {HTMLElement} - The created table cell.
 */
function createEditableQuantityCell(quantity, index, projectId) {
    const cell = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'number';
    input.value = quantity;
    input.min = 0;
    input.classList.add('form-control');

    // Update quantity in Firebase when the input changes
    input.addEventListener('change', async () => {
        const newQuantity = parseFloat(input.value);
        if (!isNaN(newQuantity) && newQuantity >= 0) {
            try {
                const database = firebase.database();
                const snapshot = await database.ref('projectMaterials').child(projectId).once('value');
                const projectData = snapshot.val();
                projectData.materials[index].quantity = newQuantity;
                projectData.materials[index].totalPrice = newQuantity * projectData.materials[index].price;

                // Update Firebase
                await database.ref('projectMaterials').child(projectId).set(projectData);
                alert('Quantity updated successfully!');
                location.reload(); // Refresh the page to reflect changes
            } catch (error) {
                console.error('Error updating quantity:', error);
                alert('Failed to update quantity. Please try again later.');
            }
        } else {
            alert('Invalid quantity!');
        }
    });

    cell.appendChild(input);
    return cell;
}

/**
 * Creates a delete button cell.
 * @param {number} index - The index of the material in the array.
 * @param {string} projectId - The project ID.
 * @returns {HTMLElement} - The created table cell.
 */
function createDeleteButtonCell(index, projectId) {
    const cell = document.createElement('td');
    const button = document.createElement('button');
    // Add Font Awesome trash icon
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-trash'); // Font Awesome trash icon classes
    button.appendChild(icon); // Add the icon to the button

    // Add Bootstrap button classes
    button.classList.add('btn', 'btn-danger', 'btn-sm');

    // Delete the material when the button is clicked
    button.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this material?')) {
            try {
                const database = firebase.database();
                const snapshot = await database.ref('projectMaterials').child(projectId).once('value');
                const projectData = snapshot.val();
                projectData.materials.splice(index, 1); // Remove the material

                // Update Firebase
                await database.ref('projectMaterials').child(projectId).set(projectData);
                alert('Material deleted successfully!');
                location.reload(); // Refresh the page to reflect changes
            } catch (error) {
                console.error('Error deleting material:', error);
                alert('Failed to delete material. Please try again later.');
            }
        }
    });

    cell.appendChild(button);
    return cell;
}

/**
 * Appends a total sum row to the materials table.
 * @param {HTMLElement} tableBody - The table body element.
 * @param {number} totalSum - The total sum of all materials.
 * @param {boolean} isAdmin - Whether the user is an admin.
 */
function appendTotalRow(tableBody, totalSum, isAdmin) {
    if (isAdmin == 1) {
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td colspan="4" style="text-align: right; font-weight: bold;">Total</td>
            <td style="font-weight: bold;">$${totalSum.toFixed(2)}</td>
            <td style="font-weight: bold;"></td>
        `;
        tableBody.appendChild(totalRow);
    }
}