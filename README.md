# electron-threejs-viewer

Setup:
- Tested with noble npm package version 1.9.2-10 (later versions are broken)
- (Platform Specific BLE Setup): Follow prerequisites steps here depending on your OS: https://github.com/abandonware/noble#prerequisites
- Run this if having issues with node-usb: `./node_modules/.bin/electron-rebuild` or `./node_modules/.bin/electron-rebuild/electron-rebuild.cmd`
- `npm install` --> installs necessary npm packages
- `npm start` --> runs the viewer app
- Should be enough to get working, you can use inspect tool in the electron app to view `console.log(..)` statements


---------------------------

Object Loader:

- Import a .json using a button
- Import means overwrite the object to display file in resources directory

---------------------------

Basic Interaction Interface

- Implement the following functions
    Rotation Functions:
    1. Rotate to the right by x* 
        a) x* is hardcoded and can be tweaked
        b) void rotate_right() {
            ...
            rotate by x*
        }
    2. Rotate to the left by x*
    3. Rotate to up by x*
    4. Rotate to down by x*
    
    Scaling Functions:
    5. Zoom in by x%
    6. Zoom out by x%

    Keep in mind, the controller has 4 directions and "+", "-" buttons and implement accordingly

    - Understanding how PeppersGhostEffect.js works is critical to the implementation of the aforementioned functions

    Notes:

    1. Potentially just call the `PerspectiveCamera.zoom()` function for zooming instead of moving the camera
        a) https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
        b) https://threejs.org/docs/#api/en/math/Quaternion

    2. 1. Potentially just call the `PerspectiveCamera.setViewOffset()` function for basic interaction interface

    3. Potentially explore the ideas discussed here to manipulate cameras
        a) https://threejs.org/docs/#manual/en/introduction/Matrix-transformations

