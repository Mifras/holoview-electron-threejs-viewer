// import * as THREE from './node_modules/three/src/Three.js';
const noble = require('./node_modules/@abandonware/noble');  // Node BLE Library

const interactionServiceUUID = '1111';  // Unique BLE service ID set by the hologram interaction controller
const zoomCharUUID = '2222'; // BLE characterisitic for controlling zoom level on hologram 
// const horizontalCharUUID = '2223'; // 
// const verticalCharUUID = '2224'; // 
// const custom1CharUUID = '2225'; //

var BLEControls = function() {    
    // event handler for local BLE USB state changes
    noble.on('stateChange', async (state) => {
        // check if USB device has the BLE radio powered on
        if (state === 'poweredOn') {
            console.log("Local BLE USB is functional, scanning for bluetooth interaction controller...")
            // - search for a device that has the GATT profile service IDs in the array (1st param)
            // - don't allow duplicate findings (2nd param)
            noble.startScanning([interactionServiceUUID], false);
        } else {
            console.log("Local BLE USB is powered off or currently starting up...")
            noble.stopScanning();
        }
    });

    let zoomChar = null;

    noble.on('discover', async (peripheral) => {
        // we found the holoview controller (BLE peripheral)
        noble.stopScanning();

        console.log('Found BLE interaction controller! Peripheral.advertisement: ', peripheral.advertisement);
        
        peripheral.connect(function(err) {
            if (err) {
                console.error("failed to pair with BLE interaction controller, error details: ", err);
                return;
            }

            peripheral.discoverServices([interactionServiceUUID], function (err, services) {
                if (err) {
                    console.error(err);
                    return;
                }

                services.forEach(function (service) {
                    console.log('found interaction service! service.uuid: ', service.uuid);

                    service.discoverCharacteristics([], function (err, characteristics) {
                        if (err) {
                            console.error(err);
                            return;
                        }

                        characteristics.forEach(function (characteristic) {
                        
                            console.log('found an interaction service characteristic! characteristic.uuid: ', characteristic.uuid);

                            if (zoomCharUUID === characteristic.uuid) {
                                zoomChar = characteristic;
                            }
                        });
                        
                        // Check if we found all of our "characteristics" (control values) for the holoview interaction "service"
                        if (zoomChar) {
                            console.log("got here!");
                            zoomChar.subscribe(function (err) {
                                if (err) {
                                    console.log("failed to subscribe to zoomChar, error: ", err);
                                } else {
                                    console.log("successfully subscribed to zoomChar!");
                                }
                            }); 
                            zoomChar.on('data', function (data, isNotification){
                                console.log("Zoom Value Changed to: ", data.toString('utf8'));
                            });
                            // applyInteractionsToProjection()
                            // --> set a global variable to the zoom level and apply it in render function (@ viewer.js)
                        } else {
                            console.log('Some of the required BLE interaction characteristics are missing!');
                        }
                    });
                });
            });
        });
    });

}

export { BLEControls };