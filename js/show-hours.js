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
    } else {
        document.getElementById('user-name').textContent = currentUser.name;
    }

    // Function to fetch and filter hours (only for the logged-in user)
    function fetchHours(startDate, endDate) {
        hoursRef.orderByChild('date').startAt(startDate).endAt(endDate).on('value', (snapshot) => {
            let filteredData = [];

            snapshot.forEach(childSnapshot => {
                const record = childSnapshot.val();
                const recordId = childSnapshot.key; // Get the unique ID of the record
                // Only show data for the current logged-in user
                if (record.userName === currentUser.name) {
                    filteredData.push({ ...record, id: recordId });
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
        tableBody.innerHTML = ''; // Clear previous rows

        data.forEach(record => {
            const row = document.createElement('tr');

            // Apply background color based on typeOfHour
            row.style.backgroundColor = (record.typeOfHour === "Glass Polishing") ? "lightblue" : "white";

            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.company}</td>
                <td>${record.client}</td>
                <td>${record.project}</td>
                <td>${record.startHour}</td>
                <td>${record.endHour}</td>
                <td>${record.breakTime}</td>
                <td>${record.hoursWorked}</td>
                <td>${record.transportAssistance}</td>
                <td>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${record.id}">Delete</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Initialize DataTable with new data
        if ($.fn.dataTable.isDataTable('#admin-hours-table')) {
            $('#admin-hours-table').DataTable().clear().destroy();
        }

        $('#admin-hours-table').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
        });

        // Add event listeners to delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const recordId = e.target.getAttribute('data-id');
                deleteRecord(recordId);
            });
        });
    }

    // Function to delete a record from Firebase
    function deleteRecord(recordId) {
        const confirmation = confirm("Are you sure you want to delete this record?");
        if (confirmation) {
            hoursRef.child(recordId).remove()
                .then(() => {
                    alert('Record deleted successfully.');
                    window.location.reload(); // Reload the page to reflect the changes
                })
                .catch(error => {
                    console.error("Error deleting record: ", error);
                    alert("An error occurred while deleting the record.");
                });
        }
    }

});
