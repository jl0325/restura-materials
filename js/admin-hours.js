document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const hoursRef = database.ref('hours');
    const usersRef = database.ref('users');
    const tableBody = document.querySelector('#admin-hours-table tbody');
    const currentUser = getCurrentUser();

    const startDateInput = document.getElementById('weekStart');
    const endDateInput = document.getElementById('weekEnd');
    const userSelectInput = document.getElementById('user-name');
    const filterButton = document.getElementById('filterButton');

    if (!currentUser) {
        alert('You need to log in first.');
        window.location.href = 'login.html';
        return;
    } else {
        document.getElementById('user-name').textContent = currentUser.name;
    }

    let userRate = 0;  // Store the user rate here
    let dataTable;

    usersRef.once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
            const user = childSnapshot.val();
            const option = document.createElement('option');
            option.value = user.name;
            option.textContent = user.name;
            userSelectInput.appendChild(option);
        });
    });

    // Fetch user rate when the user is selected
    function fetchUserRate(userName) {
        usersRef.orderByChild('name').equalTo(userName).once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                const user = childSnapshot.val();
                userRate = user.rate || 0; // Default to 0 if no rate is defined
            });
        });
    }

    function fetchHours(userName, startDate, endDate) {
        hoursRef.orderByChild('date').startAt(startDate).endAt(endDate).once('value', (snapshot) => {
            let filteredData = [];
            let totalHours = 0;
            let totalTransport = 0;
            let totalPerDay = 0;

            snapshot.forEach(childSnapshot => {
                const record = childSnapshot.val();
                const recordId = childSnapshot.key;

                if (record.userName === userName) {
                    filteredData.push({ ...record, id: recordId });
                    totalHours += parseFloat(record.hoursWorked);
                }
            });

            displayHours(filteredData, totalHours, totalTransport, totalPerDay, userName);
        });
    }

    filterButton.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const userName = userSelectInput.value;

        if (startDate && endDate && userName) {
            fetchUserRate(userName);  // Fetch user rate when filter button is clicked
            fetchHours(userName, startDate, endDate);
        } else {
            alert("Please select a user, start date, and end date.");
        }
    });

    function displayHours(data, totalHours, totalTransport, totalPerDay, userName) {
        // Clear the existing table data
        tableBody.innerHTML = '';
        // Reinitialize DataTable only after the data update triggered by the filter button
        if ($.fn.dataTable.isDataTable('#admin-hours-table')) {
            dataTable.clear().destroy();
        }
        if (data.length === 0) {
            // If there's no data, show a message in the table
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="11" class="text-center">No data available</td>';
            tableBody.appendChild(row);
        }
    
        data.forEach(record => {
            const row = document.createElement('tr');
            row.style.backgroundColor = (record.typeOfHour === "Glass Polishing") ? "lightblue" : "white";
            
            // Calculate totals and append rows
            const dayTotal = userRate * parseFloat(record.hoursWorked);
            const transportTotal = userRate * parseFloat(record.transportAssistance);
    
            totalTransport += transportTotal;
            totalPerDay += dayTotal;
    
            row.innerHTML = ` 
                <td>${record.date}</td>
                <td>${record.company}</td>
                <td>${record.client}</td>
                <td>${record.project}</td>
                <td>${record.startHour}</td>
                <td>${record.endHour}</td>
                <td>${record.breakTime}</td>
                <td>${record.hoursWorked}</td>
                <td>${dayTotal.toFixed(2)}</td>
                <td>${record.transportAssistance}</td>
                <td>${transportTotal}</td>
            `;
            tableBody.appendChild(row);
        });
    
        dataTable = $('#admin-hours-table').DataTable({
            dom: 'Bfrtip',
            searching: false,  // Hide search bar
            buttons: ['copy', 'csv', 'excel', 'pdf', 'print']  // Enable export buttons
        });
    
        // Add the total row after data update
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.innerHTML = ` 
            <td colspan="7" class="text-end">Total</td>
            <td>${totalHours}</td>
            <td>${totalPerDay.toFixed(2)}</td>
            <td></td>
            <td>${totalTransport}</td>
        `;
        tableBody.appendChild(totalRow);
    }
    
});
