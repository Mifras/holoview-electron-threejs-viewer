// import * as THREE from './node_modules/three/src/Three.js';
const noble = require('./node_modules/@abandonware/noble');  // Node BLE Library

const interactionServiceUUID = '1111';  // Unique BLE service ID set by the hologram interaction controller
const zoomCharUUID = '2222'; // BLE characterisitic for controlling zoom level on hologram 
// const horizontalCharUUID = '2223'; // 
// const verticalCharUUID = '2224'; // 
// const custom1CharUUID = '2225'; //

var BLEControls = function() {
    console.log("in BLE controls");
    
    // event handler for local BLE USB state changes
    noble.on('stateChange', async (state) => {
        // check if USB device has the BLE radio powered on
        if (state === 'poweredOn') {
            console.log("Local BLE USB is functional, scanning for bluetooth interaction controller...")
            // - search for a device that has the GATT profile service IDs in the array (1st param)
            // - don't allow duplicate findings (2nd param)
            noble.startScanning([interactionServiceUUID], false);
        } else {
            console.log("Central BLE adapter is powered off or currently starting up...")
            noble.stopScanning();
        }
    });
}

export { BLEControls };