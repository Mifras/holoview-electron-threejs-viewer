import * as THREE from './node_modules/three/src/Three.js';
import { PeppersGhostEffect } from './PeppersGhostEffect.js';

let container;

let camera, scene, renderer, effect;
let initCameraDistance; 
// let group;

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // @ameen what is this camera exactly?
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );

  scene = new THREE.Scene();
  loadLocalScene(scene);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  container.appendChild( renderer.domElement );

  initCameraDistance = 5; // keeps track of initial zoom level; set it only once
  effect = new PeppersGhostEffect( renderer, initCameraDistance );
  effect.setSize( window.innerWidth, window.innerHeight );
  
  /* START: place holders for polling for interaction events */
  // @ameen - what is this function really doing and when is it invoked?
  scaleModel(20);
  /* END: place holders for polling for interaction events */

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  effect.setSize( window.innerWidth, window.innerHeight );

}

// This function is continously called
function animate() {
  requestAnimationFrame( animate );

  // group.rotation.y += 0.01;

  effect.render( scene, camera );

}

// Input: Zoom percentage number: positive for zooming in & negative for zooming out
function scaleModel(zoomPercent){
  var scaleFactor = zoomPercent / 100;
  
  if (scaleFactor >= 0 && scaleFactor < 1) {
    // zoom in by pushing cameras closer to origin
    effect.cameraDistance = initCameraDistance * (1 - scaleFactor); 
  } else if (scaleFactor < 0) {
    // zoom out by pulling cameras further away from origin
    scaleFactor = Math.abs(scaleFactor);
    effect.cameraDistance = initCameraDistance * (1 + scaleFactor); 
  } else {
    // cannot zoom in by more than 100%, as that places all cameras at the origin point
    console.log("Error: Invalid Zoom Level: Camera cannot be zoomed in beyond origin point...");
  }
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

// Input: Zoom percentage number: positive for zooming in & negative for zooming out
function scaleObject(zoomPercent){
  var scaleFactor = zoomPercent / 100;
  
  if (scaleFactor >= 0 && scaleFactor < 1) {
    // zoom in by pushing cameras closer to origin
    effect.cameraDistance = currCameraDistance * (1 - scaleFactor); 
    currCameraDistance = effect.cameraDistance;
  } else if (scaleFactor < 0) {
    // zoom out by pulling cameras further away from origin
    scaleFactor = Math.abs(scaleFactor);
    effect.cameraDistance = currCameraDistance * (1 + scaleFactor); 
    currCameraDistance = effect.cameraDistance;
  } else {
    // cannot zoom in by more than 100%, as that places all cameras at the origin point
    console.log("Error: Invalid Zoom Level: Camera cannot be zoomed in beyond origin point...");
  }
}


function rotateObjectRight() {
  effect.rotateObjectRight();
}