const electron = require('electron'); 
const path = require('path'); 

// Importing dialog module using remote 
const dialog = electron.remote.dialog;

var uploadFile = document.getElementById('upload');

global.filepath = undefined;

// global var should have map for all objects instead of arr of paths
// support mac
uploadFile.addEventListener('click', () => {
    
    // account for different file structure operating systems
    var dialogProps;
    if (process.platform !== 'darwin') {
        dialogProps = ['multiSelections'];
    } else {
        dialogProps = ['multiSelections', 'openFile', 'openDirectory']; 
    }

    dialog.showOpenDialog({ 
        title: 'Select the directory containing the scene objects', 
        defaultPath: path.join(__dirname, '../assets/'), 
        buttonLabel: 'Select all scene files', 
        properties:  dialogProps
    }).then(path => { 
        // whether dialog operation was cancelled or not. 
        if (!path.canceled) { 
            // Updating directory to scene objects and grabbing the first scene
            var someScenePath = path.filePaths[0]

            // account for unix vs windows path slash
            if (process.platform !== 'darwin') {
                var lastSeenSlash = someScenePath.lastIndexOf("\\");
            } else {
                var lastSeenSlash = someScenePath.lastIndexOf("/");
            }
            var sceneDirectory = someScenePath.slice(0, lastSeenSlash + 1);
            var sortedPathsArray = path.filePaths.sort()

            var allScenesList = [];

            // create the fileToPath obj
            sortedPathsArray.forEach(filePath => {
                if (process.platform !== 'darwin') {
                    var lastSlash = filePath.lastIndexOf("\\");
                } else {
                    var lastSlash = filePath.lastIndexOf("/");
                }
                var startOfFileExtension = filePath.indexOf(".json");
                var fileName = filePath.substring(lastSlash + 1, startOfFileExtension);

                var sceneDetails = {
                    fileName: fileName,
                    filePath: filePath
                };

                allScenesList.push(sceneDetails);
            })

            localStorage.setItem('sceneDirectory', sceneDirectory);
            localStorage.setItem('allScenesList', JSON.stringify(allScenesList));
        }   
    }).catch(err => { 
        console.log(err) 
    });
})
