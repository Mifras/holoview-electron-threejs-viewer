const noble = require('./node_modules/@abandonware/noble');  // Node BLE Library

const interactionServiceUUID = '1111';  // Unique BLE service ID set by the hologram interaction controller
const zoomCharUUID = '2222'; // BLE characterisitic for controlling zoom level on hologram 
// const horizontalCharUUID = '2223'; // 
// const verticalCharUUID = '2224'; // 
// const custom1CharUUID = '2225'; //

const nameCharUUID = '2230';

const keepAliveCharUUID = '2200';


// TODO: learn how threading works in our use case: threejs UI thread maybe seperated from logic thread?, do the "noble" package event handlers run on seperate thread async?  
var BLEControls = function(initTriggerZoom) {  
    let self = this; // used to pass interaction values by reference, to the BLE event handlers
    self.triggerZoom = initTriggerZoom; // -1 for zoom out, +1 for zoom in, initialized to 0
    self.gotNotification = false; // set to true whenever we get a BLE notification from the controller
    self.wroteObjectDetails = false; // set to true when we write details of a new object to controller
    
    // event handler for local BLE USB state changes
    noble.on('stateChange', async (state) => {
        // check if USB device has the BLE radio powered on
        if (state === 'poweredOn') {
            console.log("Local BLE USB is functional, scanning for bluetooth interaction controller...")
            noble.startScanning([interactionServiceUUID], false);
        } else {
            console.log("Local BLE USB is powered off or currently starting up...")
            noble.stopScanning();
        }
    });

    let zoomChar, nameChar, keepAliveChar;

    noble.on('discover', async (peripheral) => {
        // console.log('Peripheral.advertisement: ', peripheral.advertisement);
        console.log('Found BLE interaction controller!');
        noble.stopScanning();
        
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
                    console.log('found the interaction service with UUID: ', service.uuid);

                    service.discoverCharacteristics([], function (err, characteristics) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        characteristics.forEach(function (characteristic) {
                            console.log('found an interaction service characteristic with UUID: ', characteristic.uuid);
                            if (zoomCharUUID === characteristic.uuid) {
                                zoomChar = characteristic;
                            } else if (nameCharUUID == characteristic.uuid) {
                                nameChar = characteristic;
                            } else if (keepAliveCharUUID == characteristic.uuid) {
                                keepAliveChar = characteristic;
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
        self.wroteObjectDetails = true;

        const buf = Buffer.alloc(256);
        buf.write(objectName);
        nameChar.write(buf, false, function(err) {
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