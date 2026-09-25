const newFolderButton = document.getElementById("newFolder");
const fileContainer = document.getElementById("fileContainer");

let folders = JSON.parse(localStorage.getItem("folders")) || [];

function displayFolders() {

    fileContainer.innerHTML = "";

    folders.forEach(function(folder) {

        const folderElement = document.createElement("div");

        folderElement.className = "item";

        folderElement.innerHTML = `
            📁 <strong>${folder}</strong>
        `;

        fileContainer.appendChild(folderElement);

    });

}


newFolderButton.addEventListener("click", function() {

    const folderName = prompt("Enter folder name:");

    if (!folderName) {
        return;
    }

    folders.push(folderName);

    localStorage.setItem(
        "folders",
        JSON.stringify(folders)
    );

    displayFolders();

});


displayFolders();