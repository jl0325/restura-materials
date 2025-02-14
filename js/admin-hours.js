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
            row.innerHTML = '<td colspan="11" class="text-center">No data available</td>';  // Adjusted to 11 columns
            tableBody.appendChild(row);
        } else {
            // Reinitialize DataTable only after the data update triggered by the filter button
            if ($.fn.dataTable.isDataTable('#admin-hours-table')) {
                // Check if dataTable exists and is initialized before calling clear and destroy
                if (dataTable) {
                    dataTable.clear().destroy();
                }
            }
    
            // Sort data by day (using the day of the week)
            data.sort((a, b) => new Date(a.date) - new Date(b.date));  // Sort by date ascending
    
            data.forEach(record => {
                const row = document.createElement('tr');
                row.style.backgroundColor = (record.typeOfHour === "Glass Polishing") ? "lightblue" : "white";
    
                // Select the rate based on the company
                let rateToUse = (record.company == "Restaura") ? userRate : userRateTweek;
                const transportAssistanceHour = (record.transportAssistance) ? record.transportAssistance : 0;
    
                // Calculate totals using the selected rate
                const dayTotal = rateToUse * parseFloat(record.hoursWorked);
                const transportTotal = rateToUse * parseFloat(transportAssistanceHour);
                const additionalPrice = (record.additionalPrice) ? record.additionalPrice : 0;
                totalAdditionals += additionalPrice;
                totalTransportHours += transportAssistanceHour;
                totalTransport += transportTotal;
                totalPerDay += dayTotal;
                const gst = (userGst == 1) ? (dayTotal + transportTotal) * 0.1 : 0;
                totalGst += gst;
                factureTotal +=  dayTotal + transportTotal + additionalPrice + gst;
    
                // Get the day of the week from the date
                let entryDate = new Date(record.date);
                let dayOfWeek = entryDate.toLocaleDateString('en-US', { weekday: 'long' });
    
                row.innerHTML = ` 
                    <td>${record.date}</td>
                    <td>${dayOfWeek}</td> <!-- Added the day of the week here -->
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
    
            // Initialize DataTable again after clearing old data
            if ($.fn.dataTable.isDataTable('#admin-hours-table')) {
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
                <td colspan="7" class="text-end">SubTotals</td>
                <td>${totalHours}</td>
                <td>${totalPerDay.toFixed(2)}</td>
                <td>${totalTransportHours}</td> 
                <td>${totalTransport}</td>
                <td></td>
                <td>${totalAdditionals}</td>
                <td>${totalGst}</td>
            `;
            tableBody.appendChild(subtotalRow);
    
            // Add the total row after data update
            const totalRow = document.createElement('tr');
            totalRow.style.fontWeight = 'bold';
            totalRow.innerHTML = ` 
                <td colspan="7" style="background-color: black; color: white;">Total</td>
                <td colspan="7" style="text-align: center; color: black; background-color: lightyellow;">${factureTotal}</td>
            `;
            tableBody.appendChild(totalRow);
        }
    }
    

    function fetchHoursByProject() {
        const dbRef = firebase.database().ref("hours");
    
        // Get start and end dates from input fields
        let startDate = document.getElementById("projectStart").value;
        let endDate = document.getElementById("projectEnd").value;
        let selectedCompany = document.getElementById("companyFilter").value; // Get selected company
    
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }
    
        let startTimestamp = new Date(startDate).getTime();
        let endTimestamp = new Date(endDate).getTime();
    
        dbRef.once("value")
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    console.log("No data available");
                    return;
                }
    
                let hoursByProject = {};
    
                snapshot.forEach((childSnapshot) => {
                    let data = childSnapshot.val();
                    let project = data.project || "Unknown";
                    let company = data.company || "Unknown";
                    let client = data.client || "Unknown";
                    let entryDate = new Date(data.date).getTime(); // Convert entry date to timestamp
    
                    // Filter data within the selected date range and by company
                    if (entryDate >= startTimestamp && entryDate <= endTimestamp && 
                        (selectedCompany === "All" || company === selectedCompany)) {
                        if (!hoursByProject[project]) {
                            hoursByProject[project] = {
                                client: client,  // Store client in project data
                                entries: []
                            };
                        }
    
                        hoursByProject[project].entries.push(data);
                    }
                });
    
                displayHoursByProject(hoursByProject);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }
    
    function displayHoursByProject(hoursByProject) {
        let container = document.querySelector("#admin-hours-project-container");
        container.innerHTML = "";
    
        Object.keys(hoursByProject).forEach((project) => {
            let projectData = hoursByProject[project];
            let client = projectData.client; // Get the client for the project
            let projectEntries = projectData.entries;
    
            // Sort entries by date (ascending order)
            projectEntries.sort((a, b) => {
                let dateA = new Date(a.date);
                let dateB = new Date(b.date);
                return dateA - dateB;
            });
    
            let tableHTML = `
                <h3 class="mt-4">${client} - ${project}</h3>
                <table class="table table-hover table-bordered align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>Date</th>
                            <th>Day</th>
                            <th>User</th>
                            <th>Start Hour</th>
                            <th>End Hour</th>
                            <th>Worked Hours</th>
                            <th>Break Time</th>
                            <th>Type of Hour</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
    
            projectEntries.forEach((entry) => {
                // Get the day of the week from the date
                let entryDate = new Date(entry.date);
                let dayOfWeek = entryDate.toLocaleDateString('en-US', { weekday: 'long' });
    
                tableHTML += `
                    <tr>
                        <td>${entry.date}</td>
                        <td>${dayOfWeek}</td>
                        <td>${entry.userName}</td>
                        <td>${entry.startHour}</td>
                        <td>${entry.endHour}</td>
                        <td>${entry.hoursWorked}</td>
                        <td>${entry.breakTime}</td>
                        <td>${entry.typeOfHour}</td>
                    </tr>
                `;
            });
    
            tableHTML += "</tbody></table>";
            container.innerHTML += tableHTML;
        });
    }
    
    // Attach event listener to the filter button
    document.querySelector("#filterProjectButton").addEventListener("click", fetchHoursByProject);
    
});
