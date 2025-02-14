document.addEventListener("DOMContentLoaded", () => {
    const database = firebase.database();
    const storage = firebase.storage();
    const uploadBtn = document.getElementById("uploadBtn");

    function uploadFile() {
        const file = document.getElementById("fileInput").files[0];
        const company = document.getElementById("company").value;
        const client = document.getElementById("client").value;
        const project = document.getElementById("project").value;
        const weekStart = document.getElementById("weekStart").value;
        const weekEnd = document.getElementById("weekEnd").value;

        if (!file || !company || !client || !project || !weekStart || !weekEnd) {
            document.getElementById("status").innerText = "Please fill all fields and select a file!";
            return;
        }

        const user = firebase.auth().currentUser;
        if (!user) {
            document.getElementById("status").innerText = "You must be logged in to upload files.";
            return;
        }

        const userId = user.uid;
        const storageRef = storage.ref(`project_docs/${userId}/${file.name}`);
        const uploadTask = storageRef.put(file);

        document.getElementById("progressContainer").classList.remove("d-none");

        uploadTask.on("state_changed", (snapshot) => {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                document.getElementById("progressBar").style.width = `${progress.toFixed(2)}%`;
                document.getElementById("progressText").innerText = `Uploading: ${progress.toFixed(2)}%`;
            },
            (error) => {
                document.getElementById("status").innerText = "Upload failed: " + error.message;
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    database.ref(`projectDocs`).push({
                        userId,
                        company,
                        client,
                        project,
                        weekStart,
                        weekEnd,
                        fileName: file.name,
                        fileUrl: downloadURL,
                        uploadedAt: new Date().toISOString()
                    });

                    document.getElementById("status").innerHTML = `Upload Successful! <a href="${downloadURL}" target="_blank">${file.name}</a>`;
                    displayFiles();
                    document.getElementById("fileInput").value = "";
                    document.getElementById("progressBar").style.width = "0%";
                    document.getElementById("progressText").innerText = "";
                    document.getElementById("progressContainer").classList.add("d-none");
                });
            }
        );
    }

    function displayFiles() {
        const fileList = document.getElementById("fileList");
        fileList.innerHTML = "";

        database.ref("projectDocs").once("value", (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const fileData = childSnapshot.val();
                const fileKey = childSnapshot.key;

                const listItem = document.createElement("li");
                listItem.className = "list-group-item d-flex justify-content-between align-items-center";
                listItem.innerHTML = `
                    <strong>${fileData.company} - ${fileData.client} - ${fileData.project}</strong> <br>
                    <small>${fileData.weekStart} to ${fileData.weekEnd}</small><br>
                    <a href="${fileData.fileUrl}" target="_blank">${fileData.fileName}</a>
                    <button class="btn btn-sm btn-danger delete-btn" data-key="${fileKey}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                fileList.appendChild(listItem);
            });

            document.querySelectorAll(".delete-btn").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const fileKey = e.target.closest("button").getAttribute("data-key");
                    deleteFile(fileKey);
                });
            });
        });
    }

    function deleteFile(fileKey) {
        database.ref(`projectDocs/${fileKey}`).remove().then(() => {
            displayFiles();
        });
    }

    uploadBtn.addEventListener("click", uploadFile);
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            displayFiles();
        }
    });
});