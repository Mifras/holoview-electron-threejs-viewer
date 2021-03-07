const electron = require('electron'); 
const path = require('path'); 

// Importing dialog module using remote 
const dialog = electron.remote.dialog;

var uploadFile = document.getElementById('upload');
console.log("objectLoader script start");

global.filepath = undefined;

// global var should have map for all objects instead of arr of paths
// support mac
uploadFile.addEventListener('click', () => {

    dialog.showOpenDialog({ 
        title: 'Select the directory containing the scene objects', 
        defaultPath: path.join(__dirname, '../assets/'), 
        buttonLabel: 'Select all scene files', 
        properties: ['multiSelections'] 
    }).then(path => { 
        // only works for windows atm
        // whether dialog operation was cancelled or not. 
        if (!path.canceled) { 
            // Updating directory to scene objects and grabbing the first scene
            var someScenePath = path.filePaths[0].split("/").toString();
            // assuming all scenes in one directory ofcourse
            var lastSeenSlash = someScenePath.lastIndexOf("\\");
            var sceneDirectory = someScenePath.slice(0, lastSeenSlash + 1);
            var sortedPathsArray = path.filePaths.sort()

            localStorage.setItem('sceneDirectory', sceneDirectory);
            localStorage.setItem('allScenes', sortedPathsArray);
            localStorage.setItem('currentScene', sortedPathsArray[0]);
        }   
    }).catch(err => { 
        console.log(err) 
    });
})

