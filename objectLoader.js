const electron = require('electron'); 
const path = require('path'); 

// Importing dialog module using remote 
const dialog = electron.remote.dialog;

var uploadFile = document.getElementById('upload');

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

            var fileToPathMap = {};

            // create the fileToPath obj
            sortedPathsArray.forEach(str => {
                var lastSlash = str.lastIndexOf("\\");
                var startOfFileExtension = str.indexOf(".json");
                var fileName = str.substring(lastSlash + 1, startOfFileExtension);

                fileToPathMap[fileName] = str;
            })

            // create the currentScene obj
            var firstSceneName;
            for (var sceneName in fileToPathMap) {
                firstSceneName = sceneName;
                break;
            }
            
            var currentScene = {
                [firstSceneName]: fileToPathMap[firstSceneName]
            }

            localStorage.setItem('sceneDirectory', sceneDirectory);
            localStorage.setItem('allScenes', JSON.stringify(fileToPathMap));
            localStorage.setItem('currentScene', JSON.stringify(currentScene));
        }   
    }).catch(err => { 
        console.log(err) 
    });
})

