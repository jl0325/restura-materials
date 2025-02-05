document.addEventListener('DOMContentLoaded', async () => {
    const database = firebase.database();
    const materialsTableBody = document.querySelector('#materials-table tbody');
    const createMaterialForm = document.querySelector('#create-material-form');

    const materialTypes = {
        1: 'Sand Paper/Pads/Disc',
        2: 'Stains /Varnish / Oils / Polish',
        3: 'Base coat paint or mixed colors',
        4: 'Fillers',
        5: 'Spray Cans',
        6: 'Chemicals',
        7: 'Masking',
        8: 'Spray painting products',
        9: 'Spray painting complements',
        10: 'Stuff Amenities',
        11: 'Polishing',
        12: 'Others'
    };

    // Fetch and display materials
    async function fetchMaterials() {
        materialsTableBody.innerHTML = '';
        try {
            const snapshot = await database.ref('materials').once('value');
            const materials = snapshot.val();

            if (materials) {
                Object.entries(materials).forEach(([materialId, materialData]) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${materialData.code}</td>
                        <td>${materialData.name}</td>
                        <td>${materialData.description}</td>
                        <td>${materialData.unit}</td>
                        <td>$${parseFloat(materialData.price).toFixed(2)}</td>
                        <td>${materialTypes[materialData.type] || 'Unknown'}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editMaterial('${materialId}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-danger btn-sm" onclick="deleteMaterial('${materialId}')"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    `;
                    materialsTableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
            alert('Error loading materials.');
        }
    }

    // Add a new material
    createMaterialForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const code = document.getElementById('material-code').value.trim();
        const name = document.getElementById('material-name').value.trim();
        const description = document.getElementById('material-description').value.trim();
        const unit = document.getElementById('material-unit').value.trim();
        const type = document.getElementById('material-type').value.trim();
        let price = document.getElementById('material-price').value.trim();

        if (!code || !name || !description || !unit || !type || !price) {
            alert('Please fill in all fields.');
            return;
        }

        price = parseFloat(price);
        if (isNaN(price) || price < 0) {
            alert('Invalid price value.');
            return;
        }

        try {
            const newMaterialRef = database.ref('materials').push();
            await newMaterialRef.set({ name, code, description, unit, price: price.toFixed(2), type });
            alert('Material added successfully!');
            createMaterialForm.reset();
            fetchMaterials();
        } catch (error) {
            console.error('Error adding material:', error);
            alert('Failed to add material.');
        }
    });

    // Edit a material
    window.editMaterial = async function (materialId) {
        try {
            const snapshot = await database.ref(`materials/${materialId}`).once('value');
            const material = snapshot.val();

            if (!material) {
                alert('Material not found.');
                return;
            }

            const newCode = prompt('Enter new code:', material.code);
            const newName = prompt('Enter new name:', material.name);
            const newDescription = prompt('Enter new description:', material.description);
            const newUnit = prompt('Enter new unit:', material.unit);
            const newPrice = parseFloat(prompt('Enter new price (decimal allowed):', material.price)).toFixed(2);
            
            // Create a dropdown for material types
            let typeOptions = '';
            Object.entries(materialTypes).forEach(([key, value]) => {
                typeOptions += `${key}: ${value}\n`;
            });

            const newType = prompt(`Select new material type (Enter number):\n${typeOptions}`, material.type);

            if (newCode && newName && newDescription && newUnit && !isNaN(newPrice) && materialTypes[newType]) {
                await database.ref(`materials/${materialId}`).update({ 
                    code: newCode, 
                    name: newName,
                    description: newDescription,
                    unit: newUnit,
                    price: newPrice, 
                    type: newType 
                });
                alert('Material updated successfully!');
                fetchMaterials();
            } else {
                alert('Invalid input. Please try again.');
            }
        } catch (error) {
            console.error('Error editing material:', error);
            alert('Failed to update material.');
        }
    };


    // Delete a material
    window.deleteMaterial = async function (materialId) {
        if (confirm('Are you sure you want to delete this material?')) {
            try {
                await database.ref(`materials/${materialId}`).remove();
                alert('Material deleted successfully!');
                fetchMaterials();
            } catch (error) {
                console.error('Error deleting material:', error);
                alert('Failed to delete material.');
            }
        }
    };

    // Fetch materials on page load
    fetchMaterials();
});
