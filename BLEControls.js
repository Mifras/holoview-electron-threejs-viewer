const noble = require('./node_modules/@abandonware/noble');  // Node BLE Library

// const interactionServiceUUID = '6e400001b5a3f393e0a9e50e24dcca9e';  // Unique BLE service ID set by the hologram interaction controller
// const basicActionsCharUUID = '6e400003b5a3f393e0a9e50e24dcca9e'; // BLE characterisitic for controlling zoom level on hologram 
// const objectNameCharUUID = '6e400004b5a3f393e0a9e50e24dcca9e'; // BLE characterisitic for controlling zoom level on hologram 

/* START: PHONE TEST VALUES */
const interactionServiceUUID = '1111';  // Unique BLE service ID set by the hologram interaction controller
const basicActionsCharUUID = '2222'; // BLE characterisitic for controlling zoom level on hologram 
const objectNameCharUUID = '2230';
const keepAliveCharUUID = '2200';
/* END: PHONE TEST VALUES */

// const customAction1_CharUUID = '';
// const customAction2_CharUUID = '';
// const customAction3_CharUUID = '';
// const customAction4_CharUUID = '';


// TODO: learn how threading works in our use case: threejs UI thread maybe seperated from logic thread?, do the "noble" package event handlers run on seperate thread async?  
var BLEControls = function() {  
    let self = this; // used to pass interaction values by reference, to the BLE event handlers
    self.gotNotification = false; // set to true whenever we get a BLE notification from the controller
    self.wroteObjectDetails = false; // set to true when we write details of a new object to controller
    self.triggerZoom = 0; // -1 for zoom out, +1 for zoom in, initialized to 0
    self.triggerRotateHorizontal = 0; // -1 for rotate right, 1 for rotate left, initialized to 0
    self.triggerRotateVertical = 0; // -1 for rotate down, 1 for rotate up, initialized to 0 
    
    // event handler for local BLE USB state changes
    noble.on('stateChange', async (state) => {
        // check if USB device has the BLE radio powered on
        if (state === 'poweredOn') {
            console.log("Local BLE USB is functional, scanning for bluetooth interaction controller...")
            noble.startScanning([], false);
        } else {
            console.log("Local BLE USB is powered off or currently starting up...")
            noble.stopScanning();
        }
    });

    let basicActionsChar, objectNameChar, keepAliveChar;

    noble.on('discover', async (peripheral) => {
        console.log('Peripheral.advertisement: ', peripheral.advertisement);
        if (peripheral.advertisement.localName == "HoloView Tarek") {
        // if (peripheral.advertisement.localName == "HoloView Controller") {
            noble.stopScanning();
            console.log("Found Our BLE Interaction Controller!");
            peripheral.connect(function(err) {
                if (err) {
                    console.error("failed to pair with BLE interaction controller, error details: ", err);
                    return;
                }
    
                peripheral.discoverServices([], function (err, services) {
                    if (err) {
                        console.error(err);
                        return;
                    }
    
                    services.forEach(function (service) {
                        console.log('found the interaction service with UUID: ', service.uuid);
    
                        service.discoverCharacteristics([], function (err, characteristics) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            characteristics.forEach(function (characteristic) {
                                console.log('found an interaction service characteristic with UUID: ', characteristic.uuid);
                                if (basicActionsCharUUID === characteristic.uuid) {
                                    basicActionsChar = characteristic;
                                } else if (objectNameCharUUID == characteristic.uuid) {
                                    objectNameChar = characteristic;
                                    self.sendObjectData("yo!");
                                } else if (keepAliveCharUUID == characteristic.uuid) {
                                    keepAliveChar = characteristic;
                                }
                            });
                            
                            // Check if we found all of our read-only "characteristics" for the holoview interaction "service"
                            if (basicActionsChar) {
                                console.log("COMPARE: Found the basic actions characteristic: ", basicActionsChar);
                                
                                basicActionsChar.subscribe(function (err) {
                                    if (err) {
                                        console.log("failed to subscribe to basicActionsChar, error: ", err);
                                    } else {
                                        console.log("successfully subscribed to basicActionsChar!");
                                    }
                                }); 

                                console.log("SEE THIS: setup subscribe() done");

                                basicActionsChar.on('data', function (data, isNotification){
                                    // data is in the form of a character array
                                    // An array of uint8 values
                                    console.log("Original data received: ", data);
                                    let dataReceived = data.toString('utf8');

                                    if (dataReceived.includes("z_in")) {
                                        self.triggerZoom = 1;
                                    } else if (dataReceived.includes("z_out")) {
                                        self.triggerZoom = -1;
                                    } else if (dataReceived.includes("r_right")) {
                                        self.triggerRotateHorizontal = -1;
                                    } else if (dataReceived.includes("r_left")) {
                                        self.triggerRotateHorizontal = 1;
                                    } else if (dataReceived.includes("r_up")) {
                                        self.triggerRotateVertical = 1;
                                    } else if (dataReceived.includes("r_down")) {
                                        self.triggerRotateVertical = -1;
                                    } else {
                                        console.log("received an invalid basic object interaction");
                                    }

                                    self.gotNotification = true;

                                    console.log("Rotate Horizontal Trigger Value is: ", self.triggerRotateHorizontal);
                                    console.log("Rotate Vertical Trigger Value is: ", self.triggerRotateHorizontal);
                                    console.log("Zoom Trigger Value is: ", self.triggerZoom);
                                });

                                console.log("SEE THIS: setup notify handler done");
                            } else {
                                console.log('Some of the required BLE interaction characteristics are missing!');
                            }
                        });
                    });
                });
            });
        }
    });


    this.sendObjectData = function (objectName) {
        if (objectNameChar == null ) { return; }
        console.log("Trying to send object details...")
        self.wroteObjectDetails = true;

        const bufSize = objectName.length;
        const buf = Buffer.alloc(bufSize);
        buf.write(objectName);
        objectNameChar.write(buf, false, function(err) {
            if (err) {
                console.log("BLE Error writing to the object name characteristic, see details: ", err);
            } else {
                console.log("Successfully sent new object name to BLE controller!");
            }
        });
    };


    // TODO: write small messages to controller to keep alive
    this.keepConnectionAlive = function() {
        if (keepAliveChar == null) { return; }

        const buf = Buffer.alloc(1);
        buf.write("x");
        keepAliveChar.write(buf, true, function(err) {
            if (err) {
                console.log("failed to keep controller BLE connection alive");
            }
        });
    };
    
}

export { BLEControls };