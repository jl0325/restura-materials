document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();

    const form = document.getElementById('hours-form');
    const projectStatusSelect = document.getElementById('project-status');
    const projectSelect = document.getElementById('project');
    const startHourInput = document.getElementById("start-hour");
    const endHourInput = document.getElementById("end-hour");
    const breakTimeInput = document.getElementById("break-time");
    const transportAssistanceCheckbox = document.getElementById("transport-assistance");
    const overTimeCheckbox = document.getElementById("over-time");
    
    // New Additionals Selector & Additional Price Input
    const additionalsSelect = document.getElementById("additionals");
    const additionalPriceInput = document.getElementById("additional-price");

    // Fetch projects by status from Firebase and sort by name
    const fetchProjectsByStatus = async (status) => {
        try {
            projectSelect.innerHTML = '<option value="" disabled selected>Select Project</option>';
            projectIdMap = {};

            const snapshot = await database.ref('projects').orderByChild('status').equalTo(status).once('value');
            const projects = snapshot.val();

            if (projects) {
                // Convert projects object into an array and sort by name
                const sortedProjects = Object.values(projects).sort((a, b) => a.name.localeCompare(b.name));

                sortedProjects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = `${project.name}/${project.company} - ${project.address}`;
                    option.textContent = `${project.name}/${project.company} - ${project.address}`;
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

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const date = document.getElementById("date").value;
        const startHour = startHourInput.value;
        const endHour = endHourInput.value;
        const breakTime = parseInt(breakTimeInput.value, 10);
        const typeOfHour = document.getElementById("type-of-hour").value;
        const projectData = document.getElementById("project").value;

        const transportAssistance = transportAssistanceCheckbox.checked ? 1 : 0;
        const overTime = overTimeCheckbox.checked ? 1 : 0;

        // Capture Additionals and Additional Price
        const additionals = additionalsSelect.value;
        const additionalPrice = parseFloat(additionalPriceInput.value) || 0;

        if (!startHour || !endHour) {
            alert("Please enter start and end times.");
            return;
        }
        const projectInfo = splitProjectValue(projectData);
        const startTime = new Date(`1970-01-01T${startHour}:00`);
        const endTime = new Date(`1970-01-01T${endHour}:00`);
        const totalMinutes = (endTime - startTime) / 60000 - breakTime;
        const hoursWorked = totalMinutes / 60;

        if (hoursWorked < 0) {
            alert("End time must be later than start time.");
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('User not logged in.');
            return;
        }

        const hoursData = {
            userName: currentUser.name,
            company: projectInfo.company,
            client: projectInfo.client,
            project: projectInfo.project,
            date,
            startHour,
            endHour,
            breakTime,
            typeOfHour,
            hoursWorked: hoursWorked.toFixed(2),
            transportAssistance,
            overTime,
            additionals, // New field
            additionalPrice // New field
        };

        try {
            await database.ref("hours").push(hoursData);
            alert("Hours registered successfully!");
            form.reset();
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Failed to register hours. Please try again.");
        }
    });

    function splitProjectValue(projectValue) {
        const [nameAndCompany, address] = projectValue.split(' - ');
        const [name, company] = nameAndCompany.split('/');
        
        return {
            company: name,
            client: company,
            project: address
        };
    };    
});
