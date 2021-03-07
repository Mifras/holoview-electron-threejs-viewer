const electron = require('electron'); 
const path = require('path'); 

// Importing dialog module using remote 
const dialog = electron.remote.dialog;

var uploadFile = document.getElementById('upload');
console.log("objectLoader script start");

import vars from './GlobalVariables.js';

global.filepath = undefined;

uploadFile.addEventListener('click', () => {

    dialog.showOpenDialog({ 
        title: 'Select the directory containing the scene objects', 
        defaultPath: path.join(__dirname, '../assets/'), 
        buttonLabel: 'Select this directory', 
        properties: ['openDirectory'] 
    }).then(file => { 
        // whether dialog operation was cancelled or not. 
        if (!file.canceled) { 
            // Updating the GLOBAL filepath variable  
            // to user-selected file. 
            global.filepath = file.filePaths[0].toString();
            vars.objectDirectory = global.filepath;
            // console.log(vars.objectDirectory);
        }   
    }).catch(err => { 
        console.log(err) 
    });
})

