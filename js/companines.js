// Wait for the DOM content to load
document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const companiesRef = database.ref('companies');
    const companiesTableBody = document.querySelector('#companies-table tbody');
    const companyForm = document.getElementById('company-form');
    const companyNameInput = document.getElementById('company-name');
    const companyPhoneInput = document.getElementById('company-phone');
    const companyEmailInput = document.getElementById('company-email');
    const currentUser = getCurrentUser();

    // Check if the user is logged in
    if (!currentUser) {
        alert('You need to log in first.');
        window.location.href = 'login.html'; // Redirect to login page if no user is logged in
        return;
    }

    // Fetch and display companies
    companiesRef.on('value', (snapshot) => {
        displayCompanies(snapshot);
    });

    // Handle form submission to create or edit a company
    companyForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = companyNameInput.value.trim();
        const phone = companyPhoneInput.value.trim();
        const email = companyEmailInput.value.trim();

        if (!name) {
            alert('Company name is required.');
            return;
        }

        const newCompany = {
            name,
            phone: phone || '',
            email: email || '',
        };

        const companyId = companyForm.dataset.editingId;

        if (companyId) {
            // Edit an existing company
            companiesRef.child(companyId).update(newCompany)
                .then(() => {
                    alert('Company updated successfully!');
                    resetForm();
                })
                .catch((error) => alert('Failed to update company: ' + error.message));
        } else {
            // Create a new company
            companiesRef.push(newCompany)
                .then(() => {
                    alert('Company added successfully!');
                    resetForm();
                })
                .catch((error) => alert('Failed to add company: ' + error.message));
        }
    });

    // Function to render the company data into the table
    function displayCompanies(snapshot) {
        companiesTableBody.innerHTML = ''; // Clear existing rows

        const companies = snapshot.val();

        if (companies) {
            Object.entries(companies).forEach(([key, company]) => {
                const row = document.createElement('tr');

                // Create cells for each field
                const nameCell = document.createElement('td');
                nameCell.textContent = company.name;
                row.appendChild(nameCell);

                const phoneCell = document.createElement('td');
                phoneCell.textContent = company.phone || 'N/A';
                row.appendChild(phoneCell);

                const emailCell = document.createElement('td');
                emailCell.textContent = company.email || 'N/A';
                row.appendChild(emailCell);

                // Create actions cell
                const actionsCell = document.createElement('td');
                actionsCell.className = 'text-center';

                // Edit button
                const editButton = document.createElement('button');
                editButton.className = 'btn btn-warning btn-sm mx-1';
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => {
                    editCompany(key, company);
                });
                actionsCell.appendChild(editButton);

                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-danger btn-sm mx-1';
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    deleteCompany(key);
                });
                actionsCell.appendChild(deleteButton);

                row.appendChild(actionsCell);
                companiesTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = 'No companies available';
            row.appendChild(cell);
            companiesTableBody.appendChild(row);
        }
    }

    // Function to edit a company
    function editCompany(companyId, company) {
        companyNameInput.value = company.name;
        companyPhoneInput.value = company.phone || '';
        companyEmailInput.value = company.email || '';
        companyForm.dataset.editingId = companyId; // Store the ID of the company being edited
    }

    // Function to delete a company
    function deleteCompany(companyId) {
        if (confirm('Are you sure you want to delete this company?')) {
            companiesRef.child(companyId).remove()
                .then(() => alert('Company deleted successfully!'))
                .catch((error) => alert('Failed to delete company: ' + error.message));
        }
    }

    // Function to reset the form
    function resetForm() {
        companyNameInput.value = '';
        companyPhoneInput.value = '';
        companyEmailInput.value = '';
        delete companyForm.dataset.editingId;
    }

    // Function to get the current user from localStorage
    function getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
});
