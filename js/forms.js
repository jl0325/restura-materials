document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const materialTypes = {
        0: '',
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
        12: 'Others',
        13: 'Provided By Tweek'
    };

    const form = document.getElementById('materials-form');
    const materialTypeSelect = document.getElementById('material-type');
    const materialNameSelect = document.getElementById('material-name');
    const materialsList = document.getElementById('materials-list');
    const addMaterialButton = document.getElementById('add-material');
    const projectStatusSelect = document.getElementById('project-status');
    const projectSelect = document.getElementById('project');
    let projectIdMap = {}; // Store project ID mapping
    let materialsArray = [];

    // Populate material types
    Object.entries(materialTypes).forEach(([typeId, typeName]) => {
        const option = document.createElement('option');
        option.value = typeId;
        option.textContent = typeName;
        materialTypeSelect.appendChild(option);
    });

    // Fetch projects by status from Firebase and sort by name
    const fetchProjectsByStatus = async (status) => {
        try {
            projectSelect.innerHTML = '<option value="" disabled selected>Select Project</option>';
            projectIdMap = {}; // Reset project ID map

            const snapshot = await database.ref('projects').orderByChild('status').equalTo(status).once('value');
            const projects = snapshot.val();

            if (projects) {
                const sortedProjects = Object.entries(projects)
                    .map(([id, project]) => ({ id, ...project })) // Convert to array of objects
                    .sort((a, b) => a.name.localeCompare(b.name)); // Sort by project name

                sortedProjects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id; // Store project ID as value
                    option.textContent = `${project.name}/${project.company} - ${project.address}`;
                    projectIdMap[project.id] = project; // Map project ID to details
                    projectSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No projects available for this status';
                projectSelect.appendChild(option);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            alert('Unable to fetch projects. Please try again later.');
        }
    };

    projectStatusSelect.addEventListener('change', () => {
        const selectedStatus = projectStatusSelect.value;
        if (selectedStatus) {
            fetchProjectsByStatus(selectedStatus);
        }
    });
    fetchProjectsByStatus('Open');

    materialTypeSelect.addEventListener('change', async () => {
        const selectedType = materialTypeSelect.value;
        materialNameSelect.innerHTML = '<option value="" disabled selected>Select Material</option>';

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

    addMaterialButton.addEventListener('click', async () => {
        const materialId = materialNameSelect.value;
        const materialType = materialTypes[materialTypeSelect.value];
        const materialName = materialNameSelect.options[materialNameSelect.selectedIndex]?.text || '';
        const quantity = parseFloat(document.getElementById('quantity').value);

        if (!materialType || !materialName || isNaN(quantity) || !materialId) {
            alert('All fields are required to add a material.');
            return;
        }

        try {
            const materialSnapshot = await database.ref('materials').child(materialId).once('value');
            const materialData = materialSnapshot.val();

            if (materialData) {
                const totalPrice = materialData.price * quantity;

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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const weekEnd = document.getElementById('weekEnd').value;
        const projectId = projectSelect.value;
        const projectDetails = projectIdMap[projectId];

        if (!projectId || !date || !weekEnd  || !projectDetails || materialsArray.length === 0) {
            alert('All fields and at least one material are required.');
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('User not logged in.');
            return;
        }

        const newEntry = {
            projectId,
            company: projectDetails.company,
            date,
            weekEnd,
            project: projectDetails.address,
            client: projectDetails.name,
            materials: materialsArray,
            userName: currentUser.name,
            timestamp: firebase.database.ServerValue.TIMESTAMP
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
