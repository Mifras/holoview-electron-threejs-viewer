const noble = require('./node_modules/@abandonware/noble');  // Node BLE Library

const interactionServiceUUID = '1111';  // Unique BLE service ID set by the hologram interaction controller
const zoomCharUUID = '2222'; // BLE characterisitic for controlling zoom level on hologram 
// const horizontalCharUUID = '2223'; // 
// const verticalCharUUID = '2224'; // 
// const custom1CharUUID = '2225'; //

const nameCharUUID = '2230';


// TODO: check how to keep BLE connection alive (after 1-2 mins of inactivity, subscription to zoom level characterisitic expires currently it seems)
// TODO: learn how threading works in our use case: threejs UI thread maybe seperated from logic thread?, do the "noble" package event handlers run on seperate thread async?  
var BLEControls = function(initTriggerZoom) {  
    let self = this; // used to pass interaction values by reference, to the BLE event handlers
    this.triggerZoom = initTriggerZoom; // -1 for zoom out, +1 for zoom in, initialized to 0
    this.gotNotification = false; // set to true whenever we get a BLE notification from the controller
    this.wroteObjectDetails = false; // set to true when we write details of a new object to controller
    
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

    let zoomChar, nameChar;

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
                            } else if (nameCharUUID == characteristic.uuid) {
                                nameChar = characteristic;
                            }
                        });
                        
                        // Check if we found all of our read-only "characteristics" for the holoview interaction "service"
                        if (zoomChar) {
                            zoomChar.subscribe(function (err) {
                                if (err) {
                                    console.log("failed to subscribe to zoomChar, error: ", err);
                                } else {
                                    console.log("successfully subscribed to zoomChar!");
                                }
                            }); 
                            zoomChar.on('data', function (data, isNotification){
                                let dataReceived = data.toString('utf8');

                                if (dataReceived == 'z_in') {
                                    self.triggerZoom = 1;
                                    self.gotNotification = true;
                                } else if (dataReceived == 'z_out') {
                                    self.triggerZoom = -1;
                                    self.gotNotification = true;
                                }

                                console.log("Zoom Trigger Value is: ", self.triggerZoom);
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


    this.sendObjectData = function (objectName) {
        if (nameChar == null ) { return; }

        const buf = Buffer.alloc(256);
        buf.write(objectName);
        nameChar.write(buf, false, function(err) {
            if (err) {
                console.log("BLE Error writing to the object name characteristic, see details: ", err);
            } else {
                console.log("Successfully sent new object name to BLE controller!");
                self.wroteObjectDetails = true;
            }
        });
    }


    this.keepConnectionAlive = function() {
        // TODO: write small messages to controller to keep alive
        return;
    };
    
}

export { BLEControls };