document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const hoursRef = database.ref('hours'); 
    const tableBody = document.querySelector('#admin-hours-table tbody');
    const currentUser = getCurrentUser();

    // Date inputs
    const startDateInput = document.getElementById('weekStart');
    const endDateInput = document.getElementById('weekEnd');
    const filterButton = document.getElementById('filterButton'); 

    if (!currentUser) {
        alert('You need to log in first.');
        window.location.href = 'login.html';
        return;
    }

    // Function to fetch and filter hours (only for the logged-in user)
    function fetchHours(startDate, endDate) {
        hoursRef.orderByChild('date').startAt(startDate).endAt(endDate).on('value', (snapshot) => {
            let filteredData = [];

            snapshot.forEach(childSnapshot => {
                const record = childSnapshot.val();
                console.log(record);
                // Only show data for the current logged-in user
                if (record.userName === currentUser.name) {
                    filteredData.push(record);
                }
            });

            displayHours(filteredData);
        });
    }

    // Event listener for filtering
    filterButton.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (startDate && endDate) {
            fetchHours(startDate, endDate);
        } else {
            alert("Please select both start and end dates.");
        }
    });

    function displayHours(data) {
        tableBody.innerHTML = ''; 

        data.forEach(record => {
            const row = document.createElement('tr');

            // Apply background color based on typeOfHour
            row.style.backgroundColor = (record.typeOfHour === "Glass Polishing") ? "lightblue" : "white";

            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.company}</td>
                <td>${record.client}</td>
                <td>${record.project}</td>
                <td>${record.userName}</td>
                <td>${record.startHour}</td>
                <td>${record.endHour}</td>
                <td>${record.breakTime}</td>
                <td>${record.typeOfHour}</td>
                <td>${record.hoursWorked}</td>
            `;

            tableBody.appendChild(row);
        });

        if ($.fn.dataTable.isDataTable('#admin-hours-table')) {
            $('#admin-hours-table').DataTable().clear().destroy();
        }

        $('#admin-hours-table').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
        });
    }
});
