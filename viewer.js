import * as THREE from './node_modules/three/src/Three.js';
import { PeppersGhostEffect } from './PeppersGhostEffect.js'; 
import { BLEControls } from './BLEControls.js';


const FILENAME = "fileName";
const FILEPATH = "filePath";

let container, camera, scene, renderer, effect, controls;
let oldObj = null;

localStorage.setItem("keyPress", "empty");
init();
animate();


function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );

  scene = new THREE.Scene();
  loadLocalScene(scene);

  // on initialization of a set of scenes, all cameraes should be placed in a specific location
  localStorage.setItem('isFirstRender', "true");

  controls = new BLEControls();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  container.appendChild( renderer.domElement );

  const initCameraDistance = 5;
  effect = new PeppersGhostEffect( renderer, initCameraDistance );
  effect.setSize( window.innerWidth, window.innerHeight );

  window.addEventListener( 'resize', onWindowResize, false );

}


/**
 * Update the currently displayed scene
 * 
 * intent mapping:
 * 
 * 0 - 3 = load the scene at this index in the 'allScenes' object
 *    - if this is out of 'allScenes' index, do nothing
 */
function loadLocalScene(scene, intent = 0) {
  const loader = new THREE.ObjectLoader();
  
  var allScenesList = JSON.parse(localStorage.getItem('allScenesList'));
  
  var currentSceneName;
  var currentScenePath;

  if (intent >= allScenesList.length) {
    console.log("requested model does not exist in allScenesList")
    return
  } else {
    currentSceneName = allScenesList[intent][FILENAME];
    currentScenePath = allScenesList[intent][FILEPATH];
    
    //@AMEEN this line is concerning, implications are scary
    // can we kill everything apart from the cameras in the scene? (optimal)
    // save camera state, kill the scene, reload the camera state

    // scene = new THREE.Scene();
  }

  loader.load(
     
    // resource URL
    currentScenePath,

    // onLoad callback
    // Here the loaded data is assumed to be an object
    function ( obj ) {
      // Add the loaded object to the scene
      if (oldObj != null) {
        scene.remove(oldObj)
      }
      scene.add( obj )
      oldObj = obj
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

  // Check for BLE interaction notifications
  if (controls.gotNotification == true) {
    controls.gotNotification = false;

    if (controls.triggerZoom == 1) {
      effect.scaleObject(90);
    } else if (controls.triggerZoom == -1) {
      effect.scaleObject(-90);
    } else if (controls.triggerRotateHorizontal == -1) {
      effect.rotateObjectHorizontal(-3);
    } else if (controls.triggerRotateHorizontal == 1) {
      effect.rotateObjectHorizontal(3);
    } else if (controls.triggerRotateVertical == -1) {
      effect.rotateObjectVertical(-3);
    } else if (controls.triggerRotateVertical == 1) {
      effect.rotateObjectVertical(3);
    } else if (controls.triggerCustomInteraction == 1) {
      console.log("0 model");
      loadLocalScene(scene, 0);
    } else if (controls.triggerCustomInteraction == 2) {
      console.log("1 model");
      loadLocalScene(scene, 1);
    } else if (controls.triggerCustomInteraction == 3) {
      console.log("2 model");
      loadLocalScene(scene, 2);
    } else if (controls.triggerCustomInteraction == 4) {
      console.log("3 model");
      loadLocalScene(scene, 3);
    } else if (controls.triggerCustomInteraction == 0) {
      console.log("home button pressed: restting current object to initial/default state");
      localStorage.setItem('isFirstRender', "true");
    }
    
    // reset all controls to disabled/off state after receiving notification
    controls.triggerZoom = 0;
    controls.triggerRotateHorizontal = 0;
    controls.triggerRotateVertical = 0;
    controls.triggerCustomInteraction = -1;
  }

  let keyPressed = localStorage.getItem("keyPress");
  if (keyPressed != "empty") {
    if (keyPressed == "w") {
      effect.rotateObjectVertical(1);
    } else if (keyPressed == "s") {
      effect.rotateObjectVertical(-1);
    } else if (keyPressed == "a") {
      effect.rotateObjectHorizontal(1);
    } else if (keyPressed == "d") {
      effect.rotateObjectHorizontal(-1);
    } else if (keyPressed == "q") {
      effect.scaleObject(-90);
    } else if (keyPressed == "e") {
      effect.scaleObject(90);
    } else if (keyPressed == "0") {
      console.log("0 model")
      loadLocalScene(scene, 0)
    } else if (keyPressed == "1") {
      console.log("1 model")
      loadLocalScene(scene, 1)
    } else if (keyPressed == "2") {
      console.log("2 model")
      loadLocalScene(scene, 2)
    } else if (keyPressed == "3") {
      console.log("3 model")
      loadLocalScene(scene, 3)
    } else if (keyPressed == "h") {
      console.log("home button pressed: attempting to reset cameras...");
      localStorage.setItem('isFirstRender', "true");
    }

    localStorage.setItem("keyPress", "empty");
  }
}



