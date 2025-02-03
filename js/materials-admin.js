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
                    <td>${materialTypes[materialData.type]}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editMaterial('${materialId}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteMaterial('${materialId}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                materialsTableBody.appendChild(row);
            });
        }
    }

    // Add a new material
    createMaterialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('material-code').value;
        const description = document.getElementById('material-description').value;
        const name = document.getElementById('material-name').value;
        const unit = document.getElementById('material-unit').value;
        const price = parseFloat(document.getElementById('material-price').value).toFixed(2);
        const type = document.getElementById('material-type').value;

        const newMaterialRef = database.ref('materials').push();
        await newMaterialRef.set({ name,code, description, unit, price, type });
        alert('Material added successfully!');
        createMaterialForm.reset();
        fetchMaterials();
    });

    // Edit a material
    window.editMaterial = async function (materialId) {
        const code = prompt('Enter new code:');
        const price = parseFloat(prompt('Enter new price (decimal allowed):')).toFixed(2);

        if ( !isNaN(price) && code) {
            await database.ref(`materials/${materialId}`).update({ code, price });
            alert('Material updated successfully!');
            fetchMaterials();
        } else {
            alert('Invalid input. Please try again.');
        }
    };

    // Delete a material
    window.deleteMaterial = async function (materialId) {
        if (confirm('Are you sure you want to delete this material?')) {
            await database.ref(`materials/${materialId}`).remove();
            alert('Material deleted successfully!');
            fetchMaterials();
        }
    };

    // Fetch materials on page load
    fetchMaterials();
});
