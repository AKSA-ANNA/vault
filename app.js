const newFolderButton = document.getElementById("newFolder");
const fileContainer = document.getElementById("fileContainer");


// Load folders from browser storage
let folders = JSON.parse(localStorage.getItem("folders")) || [];


// Current folder
let currentFolderId = null;


// Save folders
function saveFolders() {
    localStorage.setItem("folders", JSON.stringify(folders));
}


// Display current folder
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


    // Title
    const title = document.createElement("h2");

    title.textContent =
        folderId === null
            ? "My Files"
            : "📁 " + currentFolder.name;

    fileContainer.appendChild(title);


    // Find folders inside current folder
    const currentFolders = folders.filter(
        folder => folder.parentId === folderId
    );


    // Display folders
    currentFolders.forEach(function (folder) {

        const folderElement = document.createElement("div");

        folderElement.className = "item";

        folderElement.innerHTML = `
            📁 <strong>${folder.name}</strong>
        `;


        // Open folder
        folderElement.addEventListener("click", function () {

            displayFolder(folder.id);

        });


        fileContainer.appendChild(folderElement);

    });


    // Empty message
    if (currentFolders.length === 0) {

        const message = document.createElement("p");

        message.textContent = "This folder is empty.";

        fileContainer.appendChild(message);

    }

}


// Create folder
newFolderButton.addEventListener("click", function () {

    const folderName = prompt("Enter folder name:");

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

});


// Load folders when app starts
displayFolder();