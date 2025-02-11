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
                userRateTweek = user.rateTweek || 0; // Default to 0 if no rate is defined
                userGst = user.gst || 0; // Default to 0 if no rate is defined
            });
        });
    }

    function fetchHours(userName, startDate, endDate) {
        hoursRef.orderByChild('date').startAt(startDate).endAt(endDate).once('value', (snapshot) => {
            let filteredData = [];
            let totalHours = 0;
            let totalTransport = 0;
            let totalPerDay = 0;
            let totalTransportHours = 0;
            let totalAdditionals = 0;
            let totalGst = 0;
            let factureTotal = 0;

            snapshot.forEach(childSnapshot => {
                const record = childSnapshot.val();
                const recordId = childSnapshot.key;

                if (record.userName === userName) {
                    filteredData.push({ ...record, id: recordId });
                    totalHours += parseFloat(record.hoursWorked);
                }
            });

            displayHours(filteredData, totalHours, totalTransport, totalPerDay, userName, totalTransportHours, totalAdditionals, totalGst, factureTotal );
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

    function displayHours(data, totalHours, totalTransport, totalPerDay, userName, totalTransportHours, totalAdditionals, totalGst, factureTotal) {
        // Clear the existing table data
        tableBody.innerHTML = '';
        
        // Check if there's data available
        if (data.length === 0) {
            // If no data, show "No data available" in a row
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="10" class="text-center">No data available</td>';  // Adjusted to 10 columns
            tableBody.appendChild(row);
        } else {
            // Reinitialize DataTable only after the data update triggered by the filter button
            if ($.fn.dataTable.isDataTable('#admin-hours-table')) {
                // Check if dataTable exists and is initialized before calling clear and destroy
                if (dataTable) {
                    dataTable.clear().destroy();
                }
            }
            data.forEach(record => {
                const row = document.createElement('tr');
                row.style.backgroundColor = (record.typeOfHour === "Glass Polishing") ? "lightblue" : "white";
                 // Select the rate based on the company
                let rateToUse = (record.company == "Restaura") ? userRate : userRateTweek;
                const transportAssistanceHour = (record.transportAssistance)? record.transportAssistance : 0;
                // Calculate totals using the selected rate
                const dayTotal = rateToUse * parseFloat(record.hoursWorked);
                const transportTotal = rateToUse * parseFloat(transportAssistanceHour);
                const additionalPrice = (record.additionalPrice)? record.additionalPrice : 0;
                totalAdditionals += additionalPrice;
                totalTransportHours += transportAssistanceHour;
                totalTransport += transportTotal;
                totalPerDay += dayTotal;
                const gst = (userGst == 1) ? (dayTotal + transportTotal) * 0.1 : 0;
                totalGst += gst;

                
                factureTotal += dayTotal + transportTotal + totalAdditionals + totalGst;
        
                row.innerHTML = ` 
                    <td>${record.date}</td>
                    <td>${record.company}</td>
                    <td>${record.client} - ${record.project}</td>
                    <td>${record.startHour}</td>
                    <td>${record.endHour}</td>
                    <td>${record.breakTime}</td>
                    <td>${record.hoursWorked}</td>
                    <td>${dayTotal.toFixed(2)}</td>
                    <td>${record.transportAssistance}</td>
                    <td>${transportTotal}</td>
                    <td>${record.additionals !== undefined ? record.additionals : 'N/A'}</td>
                    <td>${additionalPrice}</td>
                    <td>${gst}</td>
                `;

                tableBody.appendChild(row);
            });
        }
        
        if ($.fn.dataTable.isDataTable('#admin-hours-table')) {
            // Initialize the DataTable again after clearing old data
            dataTable = $('#admin-hours-table').DataTable({
                dom: 'Bfrtip',
                searching: false,  // Hide search bar
                buttons: ['copy', 'csv', 'excel', 'pdf', 'print']  // Enable export buttons
            });
        }
        // Add the subtotal row after data update
        const subtotalRow = document.createElement('tr');
        subtotalRow.style.fontWeight = 'bold';
        subtotalRow.innerHTML = ` 
            <td colspan="6" class="text-end">SubTotals</td>
            <td>${totalHours}</td>
            <td>${totalPerDay.toFixed(2)}</td>
            <td>${totalTransportHours}</td> 
            <td>${totalTransport}</td>
            <td></td>
            <td>${totalAdditionals}</td>
            <td>${totalGst}</td>
        `;
        tableBody.appendChild(subtotalRow);3

        
        // Add the subtotal row after data update
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.innerHTML = ` 
            <td colspan="6" style="background-color: black; color: white;" >Total</td>
            <td colspan="7" style="text-align: center; color: black; background-color: lightyellow;">${factureTotal}</td>

        `;
        tableBody.appendChild(totalRow);
    }
    
});
