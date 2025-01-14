document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const materialTypes = {
        1: 'Sand Paper',
        2: 'Base coat paint or mixed colors',
        3: 'Spray Cans',
        4: 'Fillers',
        5: 'Chemicals',
        6: 'Masking',
        7: 'Stuff Amenities',
        8: 'Others'
    };

    const form = document.getElementById('materials-form');
    const materialTypeSelect = document.getElementById('material-type');
    const materialNameSelect = document.getElementById('material-name');
    const materialsList = document.getElementById('materials-list');
    const addMaterialButton = document.getElementById('add-material');

    let materialsArray = [];

    // Populate material types
    Object.entries(materialTypes).forEach(([typeId, typeName]) => {
        const option = document.createElement('option');
        option.value = typeId;
        option.textContent = typeName;
        materialTypeSelect.appendChild(option);
    });

    // Fetch materials by type from Firebase when the type dropdown changes
    materialTypeSelect.addEventListener('change', async () => {
        const selectedType = materialTypeSelect.value;

        // Clear existing options in the material name dropdown
        materialNameSelect.innerHTML = '<option value="" disabled selected>Select Material</option>';

        // Fetch materials of the selected type from Firebase
        try {
            const snapshot = await database.ref('materials').orderByChild('type').equalTo(selectedType).once('value');
            const materials = snapshot.val();

            if (materials) {
                Object.entries(materials).forEach(([id, material]) => {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = `${material.name} (${material.unit})`;
                    materialNameSelect.appendChild(option);
                });
            } else {
                // If no materials found, display a message
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No materials available for this type';
                materialNameSelect.appendChild(option);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
            alert('Unable to fetch materials. Please try again later.');
        }
    });

    // Add material to the list
    addMaterialButton.addEventListener('click', async () => {
        const materialId = materialNameSelect.value;
        const materialType = materialTypes[materialTypeSelect.value];
        const materialName = materialNameSelect.options[materialNameSelect.selectedIndex]?.text || '';
        const quantity = parseFloat(document.getElementById('quantity').value); // Parse quantity as float

        if (!materialType || !materialName || isNaN(quantity) || !materialId) {
            alert('All fields are required to add a material.');
            return;
        }

        try {
            // Fetch the material price from Firebase
            const materialSnapshot = await database.ref('materials').child(materialId).once('value');
            const materialData = materialSnapshot.val();

            if (materialData) {
                const totalPrice = materialData.price * quantity; // Calculate total price

                // Add material to the list with total price
                materialsArray.push({
                    materialType,
                    materialName,
                    quantity,
                    price: materialData.price,
                    totalPrice
                });

                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.textContent = `${materialName} (${materialType}) - Quantity: ${quantity.toFixed(2)}`;
                
                // Remove button for the material
                const removeButton = document.createElement('button');
                removeButton.className = 'btn btn-danger btn-sm';
                removeButton.textContent = 'Remove';
                removeButton.addEventListener('click', () => {
                    materialsArray = materialsArray.filter((m) => m.materialName !== materialName || m.quantity !== quantity);
                    listItem.remove();
                });
                listItem.appendChild(removeButton);
                materialsList.appendChild(listItem);
            } else {
                alert('Material not found.');
            }
        } catch (error) {
            console.error('Error fetching material price:', error);
            alert('Unable to fetch material price. Please try again later.');
        }
    });

    // Save form data and materials list to Firebase
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const company = document.getElementById('company').value;
        const date = document.getElementById('date').value;
        const project = document.getElementById('project').value.trim();
        const client = document.getElementById('client').value.trim();

        if (!company || !date || !project || !client || materialsArray.length === 0) {
            alert('All fields and at least one material are required.');
            return;
        }

        // Get the current user's data from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('User not logged in.');
            return;
        }

        const newEntry = {
            company,
            date,
            project,
            client,
            materials: materialsArray,
            userName: currentUser.name // Save user name
        };

        try {
            await database.ref('projectMaterials').push(newEntry);
            alert('Materials saved successfully!');
            materialsArray = [];
            form.reset();
            materialsList.innerHTML = '';
        } catch (error) {
            console.error('Error saving materials:', error);
            alert('Failed to save materials. Please try again.');
        }
    });
});
