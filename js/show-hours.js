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
        hoursRef.off('value'); // Prevent duplicate listeners

        hoursRef.orderByChild('date').startAt(startDate).endAt(endDate).once('value')
            .then((snapshot) => {
                let filteredData = [];

                snapshot.forEach(childSnapshot => {
                    const record = childSnapshot.val();
                    const recordId = childSnapshot.key;

                    // Only show data for the logged-in user
                    if (record.userName === currentUser.name) {
                        filteredData.push({ ...record, id: recordId });
                    }
                });

                displayHours(filteredData);
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
                alert("An error occurred while retrieving data.");
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

        // Reinitialize DataTable
        if ($.fn.dataTable.isDataTable('#admin-hours-table')) {
            $('#admin-hours-table').DataTable().clear().destroy();
        }

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="12" class="text-center">No records found</td></tr>';
        } else {
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
                    <td>${record.overTime}</td>
                    <td>${record.additionals ? record.additionals : "N/A"}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${record.id}">Delete</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        }

        $('#admin-hours-table').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
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
                    filterButton.click(); // Re-fetch filtered data instead of reloading
                })
                .catch(error => {
                    console.error("Error deleting record: ", error);
                    alert("An error occurred while deleting the record.");
                });
        }
    }
});
