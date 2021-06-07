# holoview-electron-threejs-viewer

This repo includes source code for our ECE 2021 Final Year Design Project @ University of Waterloo. 

Project Demo: https://www.youtube.com/watch?v=T_HPYSjxnfI&ab_channel=MifrasNazeer

Symposium: Group 64: https://www.eng.uwaterloo.ca/2021-capstone-design/electrical-computer/participants-11/

Setup:
- Tested with noble npm package version 1.9.2-10 (later versions are broken)
- (Platform Specific BLE Setup): Follow prerequisites steps here depending on your OS: https://github.com/abandonware/noble#prerequisites
- Run this if having issues with node-usb: `./node_modules/.bin/electron-rebuild` or `./node_modules/.bin/electron-rebuild.cmd`
- `npm install` --> installs necessary npm packages
- `npm start` --> runs the viewer app
- Should be enough to get working, you can use inspect tool in the electron app to view `console.log(..)` statements
