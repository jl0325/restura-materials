document.addEventListener('DOMContentLoaded', async () => {
    const database = firebase.database();
    const usersTableBody = document.querySelector('#users-table tbody');

    // Fetch and display users from Firebase
    async function fetchUsers() {
        usersTableBody.innerHTML = ''; // Clear the table
        const snapshot = await database.ref('users').once('value');
        const users = snapshot.val();

        if (users) {
            Object.entries(users).forEach(([userId, userData]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${userData.name}</td>
                    <td>${userData.email}</td>
                    <td>${userData.phone}</td>
                    <td>${userData.rate}</td> <!-- Display rate -->
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="admin-toggle-${userId}" ${userData.admin ? 'checked' : ''} 
                                   onchange="toggleAdmin('${userId}', this.checked)">
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editUser('${userId}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser('${userId}')">Delete</button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });
        }
    }

    // Add a new user
    async function addUser(name, email, phone, rate) {
        const newUserRef = database.ref('users').push();
        await newUserRef.set({ name, email, phone, rate, admin: 0 });
        alert('User added successfully!');
        fetchUsers();
    }

    // Edit an existing user
    window.editUser = async function (userId) {
        const userSnapshot = await database.ref(`users/${userId}`).once('value');
        const userData = userSnapshot.val();

        // Show a form with the current values filled in
        const name = prompt('Enter new name:', userData.name);
        const email = prompt('Enter new email:', userData.email);
        const phone = prompt('Enter new phone:', userData.phone);
        const rate = prompt('Enter new rate:', userData.rate);

        if (name && email && phone && rate) {
            await database.ref(`users/${userId}`).update({ name, email, phone, rate });
            alert('User updated successfully!');
            fetchUsers();
        } else {
            alert('All fields are required!');
        }
    };

    // Delete a user
    window.deleteUser = async function (userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            await database.ref(`users/${userId}`).remove();
            alert('User deleted successfully!');
            fetchUsers();
        }
    };

    // Toggle admin status
    window.toggleAdmin = async function (userId, isAdmin) {
        try {
            await database.ref(`users/${userId}`).update({ admin: isAdmin ? 1 : 0 });
            alert(`User admin status updated to ${isAdmin ? 'Admin' : 'Non-Admin'}`);
        } catch (error) {
            console.error('Error updating admin status:', error);
            alert('Failed to update admin status. Please try again.');
        }
    };

    // Fetch users on page load
    fetchUsers();
});
