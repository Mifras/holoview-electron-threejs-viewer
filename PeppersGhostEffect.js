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
  var matrix = new Matrix4();
  var period = 5; 

  // @ameen - how does @this.cameraDistance even work?
  console.log("Ameen look here");
  console.log(this);
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

  this.render = function ( scene, camera ) {
    if (this.prevCameraDistance != this.cameraDistance) {
      // this is our first time rendering or model zoom level has changed
      scene.updateMatrixWorld();

      // @ameen - this ternary path is only exectued once?
      console.log("look at me, RENDER FUNCTION");

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
      _cameraB.rotation.z = 180 * ( Math.PI / 180 );

      // left
      _cameraL.position.copy( _position );
      _cameraL.quaternion.copy( _quaternion );
      _cameraL.translateX( - ( this.cameraDistance ) );
      _cameraL.lookAt( scene.position );
      _cameraL.rotation.x = 90 * ( Math.PI / 180 );

      // right
      _cameraR.position.copy( _position );
      _cameraR.quaternion.copy( _quaternion );
      _cameraR.translateX( this.cameraDistance );
      _cameraR.lookAt( scene.position );
      _cameraR.rotation.x = 90 * ( Math.PI / 180 );
      
      this.prevCameraDistance = this.cameraDistance;
    }  
    

    _rotateObjectRight(scene);

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
		renderer.render( scene, _cameraR );

		renderer.setScissor( _halfWidth + ( _width / 2 ), _height, _width, _height );
		renderer.setViewport( _halfWidth + ( _width / 2 ), _height, _width, _height );
		renderer.render( scene, _cameraL );

		renderer.setScissorTest( false );
    // console.log(_allCameras);
  };

  function _rotateObjectRight(scene) {
    matrix.makeRotationY(clock.getDelta() * 2 * Math.PI / period);
  
    _cameraF.position.applyMatrix4(matrix);
    _cameraF.lookAt( scene.position );
    
    _cameraB.position.applyMatrix4(matrix);
    _cameraB.lookAt( scene.position );
    _cameraB.rotation.z += 180 * ( Math.PI / 180 );
  
    _cameraL.position.applyMatrix4(matrix);
    _cameraL.lookAt( scene.position );
    _cameraL.rotation.x += 90 * ( Math.PI / 180 );
  
    _cameraR.position.applyMatrix4(matrix);
    _cameraR.lookAt( scene.position );
    _cameraR.rotation.x += 90 * ( Math.PI / 180 );
  }
};

export { PeppersGhostEffect };