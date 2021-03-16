import * as THREE from './node_modules/three/src/Three.js';
import { PeppersGhostEffect } from './PeppersGhostEffect.js'; 
import { BLEControls } from './BLEControls.js';

let container, camera, scene, renderer, effect, controls;
let currCameraDistance; 
// let keepAliveFrameCounter = 0; // used to keep BLE connection alive
let isFirstRender;

init();
animate();


function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // @ameen what is this camera exactly?
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );

  scene = new THREE.Scene();
  loadLocalScene(scene);
  localStorage.setItem('isFirstRender', "true");

  controls = new BLEControls();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  container.appendChild( renderer.domElement );

  currCameraDistance = 5; // keeps track of initial zoom level; set it only once
  effect = new PeppersGhostEffect( renderer, currCameraDistance );
  effect.setSize( window.innerWidth, window.innerHeight );

  window.addEventListener( 'resize', onWindowResize, false );

}


/**
 * Update the currently displayed scene
 * 
 * Call loadLocalScene after updating the path to the next/ specified scene
 * @mifras implement a method to update the localStorage.currentScene path
 */
 function loadLocalScene(scene) {
  const loader = new THREE.ObjectLoader();
  
  var currentScene = JSON.parse(localStorage.getItem('currentScene'));
  var currentSceneName = Object.keys(currentScene)[0];
  var currentScenePath = currentScene[currentSceneName]

  loader.load(
     
    // resource URL
    currentScenePath,

    // onLoad callback
    // Here the loaded data is assumed to be an object
    function ( obj ) {
      // Add the loaded object to the scene
      scene.add( obj );
    },

    // onProgress callback
    function ( xhr ) {
      // console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    },

    // onError callback
    function ( err ) {
      console.error( 'An error happened' );
    }
  );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  effect.setSize( window.innerWidth, window.innerHeight );

}


// This function is continously called
function animate() {
  requestAnimationFrame( animate );

  effect.render( scene, camera );

  // // Send new object details to controller if not done before 
  // if (controls.wroteObjectDetails == false) {
  //   controls.sendObjectData("hello");
  // }

  // Check for BLE interaction notifications
  if (controls.gotNotification == true) {
    controls.gotNotification = false;

    if (controls.triggerZoom == 1) {
      effect.scaleObject(25);
    } else if (controls.triggerZoom == -1) {
      effect.scaleObject(-25);
    } else if (controls.triggerRotateHorizontal == -1) {
      effect.rotateObjectHorizontal(scene, -1);
    } else if (controls.triggerRotateHorizontal == 1) {
      effect.rotateObjectHorizontal(scene, 1);
    } else if (controls.triggerRotateVertical == -1) {
      effect.rotateObjectVertical(scene, -1);
    } else if (controls.triggerRotateVertical == 1) {
      effect.rotateObjectVertical(scene, 1);
    }
    
    controls.triggerZoom = 0;
    controls.triggerRotateHorizontal = 0;
    controls.triggerRotateVertical = 0;
  }

  // // send a keep alive BLE message to controller every 0.5 second (animate() runs at 60 FPS) 
  // if (keepAliveFrameCounter % 30 == 0) {
  //   controls.keepConnectionAlive();
  // }
  // keepAliveFrameCounter += 1;
}



