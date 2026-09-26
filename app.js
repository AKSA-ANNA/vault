const newFolderButton = document.getElementById("newFolder");
const addFileButton = document.getElementById("addFile");
const fileContainer = document.getElementById("fileContainer");


// ================================
// FOLDER DATA
// ================================

let folders = JSON.parse(localStorage.getItem("folders")) || [];

let currentFolderId = null;


// ================================
// INDEXEDDB SETUP
// ================================

let db;

const request = indexedDB.open("MyVaultDB", 1);


request.onupgradeneeded = function (event) {

    db = event.target.result;

    if (!db.objectStoreNames.contains("files")) {

        const fileStore = db.createObjectStore("files", {
            keyPath: "id",
            autoIncrement: true
        });

        fileStore.createIndex(
            "folderId",
            "folderId",
            { unique: false }
        );

    }

};


request.onsuccess = function (event) {

    db = event.target.result;

    displayFolder();

};


request.onerror = function () {

    console.error("Could not open database.");

};


// ================================
// SAVE FOLDERS
// ================================

function saveFolders() {

    localStorage.setItem(
        "folders",
        JSON.stringify(folders)
    );

}


// ================================
// DISPLAY CURRENT FOLDER
// ================================

function displayFolder(folderId = null) {

    currentFolderId = folderId;

    fileContainer.innerHTML = "";


    // Find current folder
    const currentFolder = folders.find(
        folder => folder.id === folderId
    );


    // Back button
    if (folderId !== null) {

        const backButton = document.createElement("button");

        backButton.textContent = "← Back";

        backButton.addEventListener("click", function () {

            displayFolder(currentFolder.parentId);

        });

        fileContainer.appendChild(backButton);

    }


    // Folder title
    const title = document.createElement("h2");

    title.textContent =
        folderId === null
            ? "My Files"
            : "📁 " + currentFolder.name;

    fileContainer.appendChild(title);


    // Find subfolders
    const currentFolders = folders.filter(
        folder => folder.parentId === folderId
    );


    // Display subfolders
    currentFolders.forEach(function (folder) {

        const folderElement = document.createElement("div");

        folderElement.className = "item";

        folderElement.innerHTML = `
            📁 <strong>${folder.name}</strong>
        `;


        folderElement.addEventListener("click", function () {

            displayFolder(folder.id);

        });


        fileContainer.appendChild(folderElement);

    });


    // Display files
    if (db) {

        displayFiles(folderId);

    }

}


// ================================
// DISPLAY FILES
// ================================

function displayFiles(folderId) {

    const transaction = db.transaction(
        ["files"],
        "readonly"
    );

    const store = transaction.objectStore("files");

    const index = store.index("folderId");

    const request = index.getAll(folderId);


    request.onsuccess = function () {

        const files = request.result;


        files.forEach(function (file) {

            const fileElement =
                document.createElement("div");

            fileElement.className = "item";


            fileElement.innerHTML = `
                📄 <strong>${file.name}</strong>
                <br>
                <small>${file.type || "Unknown file type"}</small>
            `;


            // Open file
            fileElement.addEventListener(
                "click",
                function () {

                    openFile(file);

                }
            );


            fileContainer.appendChild(fileElement);

        });

    };

}


// ================================
// CREATE FOLDER
// ================================

newFolderButton.addEventListener(
    "click",
    function () {

        const folderName =
            prompt("Enter folder name:");


        if (!folderName) {

            return;

        }


        const newFolder = {

            id: Date.now(),

            name: folderName,

            parentId: currentFolderId

        };


        folders.push(newFolder);

        saveFolders();

        displayFolder(currentFolderId);

    }
);


// ================================
// ADD FILE
// ================================

addFileButton.addEventListener(
    "click",
    function () {

        const fileInput =
            document.createElement("input");


        fileInput.type = "file";

        fileInput.multiple = true;


        fileInput.addEventListener(
            "change",
            function () {

                const selectedFiles =
                    Array.from(fileInput.files);


                selectedFiles.forEach(
                    function (file) {

                        saveFile(file);

                    }
                );

            }
        );


        fileInput.click();

    }
);


// ================================
// SAVE FILE TO INDEXEDDB
// ================================

function saveFile(file) {

    const transaction =
        db.transaction(
            ["files"],
            "readwrite"
        );


    const store =
        transaction.objectStore("files");


    const fileData = {

        name: file.name,

        type: file.type,

        size: file.size,

        folderId: currentFolderId,

        dateAdded: new Date().toISOString(),

        data: file

    };


    const request =
        store.add(fileData);


    request.onsuccess = function () {

        console.log(
            "File saved:",
            file.name
        );


        displayFolder(currentFolderId);

    };


    request.onerror = function () {

        console.error(
            "Could not save file."
        );

    };

}


// ================================
// OPEN FILE
// ================================

function openFile(file) {

    const fileURL =
        URL.createObjectURL(file.data);


    window.open(fileURL, "_blank");

}