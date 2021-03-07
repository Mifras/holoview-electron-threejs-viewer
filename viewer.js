import * as THREE from './node_modules/three/src/Three.js';
import { PeppersGhostEffect } from './PeppersGhostEffect.js'; 
import { BLEControls } from './BLEControls.js';

// let group;
let container, camera, scene, renderer, effect;
let initCameraDistance; 

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );

  scene = new THREE.Scene();
  loadLocalScene(scene);

  BLEControls();

  /*
  group = new THREE.Group();
  // scene.add( group );

  // Cube

  const geometry = new THREE.BoxBufferGeometry().toNonIndexed(); // ensure unique vertices for each triangle

  const position = geometry.attributes.position;
  const colors = [];
  const color = new THREE.Color();

  // generate for each side of the cube a different color

  for ( let i = 0; i < position.count; i += 6 ) {

    color.setHex( Math.random() * 0xffffff );

    // first face

    colors.push( color.r, color.g, color.b );
    colors.push( color.r, color.g, color.b );
    colors.push( color.r, color.g, color.b );

    // second face

    colors.push( color.r, color.g, color.b );
    colors.push( color.r, color.g, color.b );
    colors.push( color.r, color.g, color.b );

  }

  geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

  const material = new THREE.MeshBasicMaterial( { vertexColors: true } );

  for ( let i = 0; i < 10; i ++ ) {

    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = Math.random() * 2 - 1;
    cube.position.y = Math.random() * 2 - 1;
    cube.position.z = Math.random() * 2 - 1;
    cube.scale.multiplyScalar( Math.random() + 0.5 );
    group.add( cube );

  }
  */

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  container.appendChild( renderer.domElement );

  initCameraDistance = 5; // keeps track of initial zoom level; set it only once
  effect = new PeppersGhostEffect( renderer, initCameraDistance );
  effect.setSize( window.innerWidth, window.innerHeight );
  
  /* START: place holders for polling for interaction events */
  scaleModel(20);
  /* END: place holders for polling for interaction events */

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  effect.setSize( window.innerWidth, window.innerHeight );

}

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

function loadLocalScene(scene) {
  const loader = new THREE.ObjectLoader();

  loader.load(
    // resource URL
    "./resources/scene2.json",

    // onLoad callback
    // Here the loaded data is assumed to be an object
    function ( obj ) {
      // Add the loaded object to the scene
      scene.add( obj );
    },

    // onProgress callback
    function ( xhr ) {
      console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    },

    // onError callback
    function ( err ) {
      console.error( 'An error happened' );
    }
  );

}