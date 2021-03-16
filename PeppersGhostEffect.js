import {
  PerspectiveCamera,
  Quaternion,
  Vector3,
  Clock,
  Matrix4
} from './node_modules/three/src/Three.js';

/**
 * peppers ghost effect based on http://www.instructables.com/id/Reflective-Prism/?ALLSTEPS
 */

var PeppersGhostEffect = function ( renderer, initCameraDistance ) {


  // this.reflectFromAbove = false; // TODO: we need to set this to true (for final product)

  // Internals
  var _halfWidth, _width, _height;

  var _cameraF = new PerspectiveCamera(); //front
  var _cameraB = new PerspectiveCamera(); //back
  var _cameraL = new PerspectiveCamera(); //left
  var _cameraR = new PerspectiveCamera(); //right

  var _allCameras = [_cameraF, _cameraB, _cameraL, _cameraR];
  
  var clock = new Clock();
  var period = 5; 

  this.cameraDistance = initCameraDistance; // initial distance of each camera from scene origin point
  this.prevCameraDistance = null; // keeps track of previously set camera distance (used for comparison)

  // Camera Properties (Respectively: Cartesian Coordinates, Rotation, Size)
  var _position = new Vector3();
  var _quaternion = new Quaternion();
  var _scale = new Vector3();

  // Effect Render Initialization
  renderer.autoClear = false;
  this.setSize = function ( width, height ) {

    _halfWidth = width / 2;
    if ( width < height ) {

      _width = width / 3;
      _height = width / 3;

    } else {

      _width = height / 3;
      _height = height / 3;

    }

    renderer.setSize( width, height );

  };


  this.render = function ( scene, camera, isFirstRender ) {
    // cameraFoV is the current field of view (zoom level of the camera)
    // if (this.prevCameraDistance != this.cameraDistance) {
    var isFirstRender = localStorage.getItem('isFirstRender');
    if (isFirstRender == "true") {
      localStorage.setItem('isFirstRender', "false");
      // this is our first time rendering or model zoom level has changed
      scene.updateMatrixWorld();

      // @ameen - what are the next two code lines actually doing, the camera referenced here is the one from viewer.js
      if ( camera.parent === null ) camera.updateMatrixWorld();
      // Decomposes this matrix into it's position, quaternion and scale components
      
      // position --> literally the position
      // quaternion --> rotation
      // scale --> ?? not even used elsewhere in this script
      camera.matrixWorld.decompose( _position, _quaternion, _scale );
      
      // front
      _cameraF.position.copy( _position );
      _cameraF.quaternion.copy( _quaternion );
      _cameraF.translateZ( this.cameraDistance );
      _cameraF.lookAt( scene.position );

      // back
      _cameraB.position.copy( _position );
      _cameraB.quaternion.copy( _quaternion );
      _cameraB.translateZ( - ( this.cameraDistance ) );
      _cameraB.lookAt( scene.position );
      _cameraB.rotation.z += 180 * ( Math.PI / 180 );

      // left
      _cameraL.position.copy( _position );
      _cameraL.quaternion.copy( _quaternion );
      _cameraL.translateX( - ( this.cameraDistance ) );
      _cameraL.lookAt( scene.position );
      _cameraL.rotation.z -= 90 * ( Math.PI / 180 );
      _cameraL.rotation.x += 180 * ( Math.PI / 180 );

      // right
      _cameraR.position.copy( _position );
      _cameraR.quaternion.copy( _quaternion );
      _cameraR.translateX( this.cameraDistance );
      _cameraR.lookAt( scene.position );
      _cameraR.rotation.z += 90 * ( Math.PI / 180 );
      _cameraR.rotation.x -= 180 * ( Math.PI / 180 );
      
      // console.log("_cameraB.position:", _cameraB.position);
      // console.log("_cameraB.rotation:", _cameraB.rotation);
      
      // console.log("\n_cameraF.position:", _cameraF.position);
      // console.log("_cameraF.rotation:", _cameraF.rotation);
      
      // console.log("\n_cameraR.position:", _cameraR.position);
      // console.log("_cameraR.rotation:", _cameraR.rotation);
      
      // console.log("\n_cameraL.position:", _cameraL.position);
      // console.log("_cameraL.rotation:", _cameraL.rotation);
    }  
    
    // this.rotateObjectHorizontal(scene);
    // this.rotateObjectVertical(scene, 1);

    renderer.clear();
    // @ameen - why is this true here and then false at the end of this function?
    renderer.setScissorTest( true );


    // "Scissor" and "Viewport" are cropped areas of the viewer application window:
    //    This is the area used to render 1 view of the 3D model (1 view out of the 4 perspective cameras)
    renderer.setScissor( _halfWidth - ( _width / 2 ), ( _height * 2 ), _width, _height );
		renderer.setViewport( _halfWidth - ( _width / 2 ), ( _height * 2 ), _width, _height );
    renderer.render( scene, _cameraB );

		renderer.setScissor( _halfWidth - ( _width / 2 ), 0, _width, _height );
		renderer.setViewport( _halfWidth - ( _width / 2 ), 0, _width, _height );
		renderer.render( scene, _cameraF );

		renderer.setScissor( _halfWidth - ( _width / 2 ) - _width, _height, _width, _height );
		renderer.setViewport( _halfWidth - ( _width / 2 ) - _width, _height, _width, _height );
		renderer.render( scene, _cameraL );

		renderer.setScissor( _halfWidth + ( _width / 2 ), _height, _width, _height );
		renderer.setViewport( _halfWidth + ( _width / 2 ), _height, _width, _height );
		renderer.render( scene, _cameraR );

		renderer.setScissorTest( false );
  };


  this.rotateObjectVertical = function(scene, direction) {
    var matrix = new Matrix4();
    var angleOfRotation = direction * Math.PI / 4; 
    matrix.makeRotationX(angleOfRotation);

    _cameraF.position.applyMatrix4(matrix);
    _cameraF.lookAt( scene.position );
    _cameraF.rotation.z = 0;
    
    _cameraB.position.applyMatrix4(matrix);
    _cameraB.lookAt( scene.position );
    _cameraB.rotation.z = 0;
  
    _cameraL.rotation.z -= angleOfRotation;
  
    _cameraR.rotation.z += angleOfRotation;
  }


  this.rotateObjectHorizontal = function(scene, direction) {
    var matrix = new Matrix4();
    var angleOfRotation = direction * Math.PI / 4;  
    matrix.makeRotationY(angleOfRotation);

    _cameraF.position.applyMatrix4(matrix);
    _cameraF.lookAt( scene.position );
    
    _cameraB.position.applyMatrix4(matrix);
    _cameraB.lookAt( scene.position );
    _cameraB.rotation.z += 180 * ( Math.PI / 180 );
  
    _cameraL.position.applyMatrix4(matrix);
    _cameraL.lookAt( scene.position );
    _cameraL.rotation.z += 90 * ( Math.PI / 180 );
  
    _cameraR.position.applyMatrix4(matrix);
    _cameraR.lookAt( scene.position );
    _cameraR.rotation.z -= 90 * ( Math.PI / 180 );
  }


  // Input: Zoom percentage number: positive for zooming in & negative for zooming out
  this.scaleObject = function(zoomPercent){
    var fraction = zoomPercent / 100;
    
    if (fraction >= 0 && fraction < 1) {
      // zoom in by narrowing cameras FoV
      _allCameras.forEach( cam => {
        cam.fov /= fraction;
        cam.updateProjectionMatrix();
      });
    } else {
      // zoom out by widening cameras FoV 
      _allCameras.forEach( cam => {
        cam.fov *= Math.abs(fraction);
        cam.updateProjectionMatrix();
      });
    } 
  }


};

export { PeppersGhostEffect };