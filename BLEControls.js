const noble = require('./node_modules/@abandonware/noble');  // Node.js BLE Library

const interactionServiceUUID = '6e400001b5a3f393e0a9e50e24dcca9e';  // Unique BLE service ID set by the hologram interaction controller
const basicActionsCharUUID = '6e400003b5a3f393e0a9e50e24dcca9e'; // BLE characterisitic for controlling zoom level on hologram


var BLEControls = function() {  
    let self = this; // used to pass interaction values by reference, to the BLE event handlers
    self.gotNotification = false; // set to true whenever we get a BLE notification from the controller
    self.triggerZoom = 0; // -1 for zoom out, +1 for zoom in, initialized to 0
    self.triggerRotateHorizontal = 0; // -1 for rotate right, 1 for rotate left, initialized to 0
    self.triggerRotateVertical = 0; // -1 for rotate down, 1 for rotate up, initialized to 0 
    self.triggerCustomInteraction = -1; // -1 for nothing, 0 for home, 1-4 for new object loads 
    
    // event handler for local BLE USB state changes
    noble.on('stateChange', async (state) => {
        // check if USB device has the BLE radio powered on
        if (state === 'poweredOn') {
            noble.startScanning([], false);
        } else {
            noble.stopScanning();
        }
    });

    let basicActionsChar;

    noble.on('discover', async (peripheral) => {
        if (peripheral.advertisement.localName == "HoloView Controller") {
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
                        service.discoverCharacteristics([], function (err, characteristics) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            characteristics.forEach(function (characteristic) {
                                if (basicActionsCharUUID === characteristic.uuid) {
                                    basicActionsChar = characteristic;
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

                                basicActionsChar.on('data', function (data, isNotification){
                                    let dataReceived = data.toString('utf8');

                                    if (dataReceived.includes("z_in")) {
                                        self.triggerZoom = -1;
                                    } else if (dataReceived.includes("z_out")) {
                                        self.triggerZoom = 1;
                                    } else if (dataReceived.includes("r_right")) {
                                        self.triggerRotateHorizontal = 1;
                                    } else if (dataReceived.includes("r_left")) {
                                        self.triggerRotateHorizontal = -1;
                                    } else if (dataReceived.includes("r_up")) {
                                        self.triggerRotateVertical = -1;
                                    } else if (dataReceived.includes("r_down")) {
                                        self.triggerRotateVertical = 1;
                                    } else if (dataReceived.includes("c0")) {
                                        self.triggerCustomInteraction = 0;
                                    } else if (dataReceived.includes("c1")) {
                                        self.triggerCustomInteraction = 1;
                                    } else if (dataReceived.includes("c2")) {
                                        self.triggerCustomInteraction = 2;
                                    } else if (dataReceived.includes("c3")) {
                                        self.triggerCustomInteraction = 3;
                                    } else if (dataReceived.includes("c4")) {
                                        self.triggerCustomInteraction = 4;
                                    } else {
                                        console.log("Error: received an invalid basic object interaction");
                                    }

                                    self.gotNotification = true;
                                });
                            } else {
                                console.log('Cannot find the interactions characteristic on the BLE controller!');
                            }
                        });
                    });
                });
            });
        }
    });
    
}

export { BLEControls };