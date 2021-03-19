import {
  PerspectiveCamera,
  Quaternion,
  Vector3,
  Clock,
  Matrix4,
  MathUtils,
  Group
} from './node_modules/three/src/Three.js';

/**
 * peppers ghost effect based on http://www.instructables.com/id/Reflective-Prism/?ALLSTEPS
 * 
 * Three js angles use Euler angles, so MathUtils.degToRad is leveraged
 */

var PeppersGhostEffect = function ( renderer, initCameraDistance ) {


  // this.reflectFromAbove = false; // TODO: we need to set this to true (for final product)

  // Internals
  var _halfWidth, _width, _height;

  var _cameraF = new PerspectiveCamera(); //front
  var _cameraB = new PerspectiveCamera(); //back
  var _cameraL = new PerspectiveCamera(); //left
  var _cameraR = new PerspectiveCamera(); //right

  var camGroup = new Group();

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

    var isFirstRender = localStorage.getItem('isFirstRender');
    if (isFirstRender == "true") {
      localStorage.setItem('isFirstRender', "false");
      
      // add the cam group to the scene
      scene.add(camGroup);
      camGroup.add(_cameraF)
      camGroup.add(_cameraB)
      camGroup.add(_cameraL)
      camGroup.add(_cameraR)
      
      scene.updateMatrixWorld();
      if ( camera.parent === null ) camera.updateMatrixWorld();
      camera.matrixWorld.decompose( _position, _quaternion, _scale );
      

      // initialize each cameras position and quaternion
      _allCameras.forEach(cam => {
        cam.position.copy(_position);
        cam.quaternion.copy(_quaternion)
      })
      
      // front
      _cameraF.translateX(this.cameraDistance);
      _cameraF.rotation.y = MathUtils.degToRad(90);

      // back
      _cameraB.translateX(-(this.cameraDistance));
      _cameraB.rotation.y = MathUtils.degToRad(-90);

      // left
      _cameraL.translateZ(this.cameraDistance);

      // right
      _cameraR.translateZ(-(this.cameraDistance));
      _cameraR.rotation.x = MathUtils.degToRad(-180);
      _cameraR.rotation.z = MathUtils.degToRad(-180);

      // TODO: need to rotate the cameras to respect the output on the TV

      // console.log("\n_cameraF.position:", _cameraF.position);
      // console.log("_cameraF.rotation:", _cameraF.rotation);
      
      // console.log("\n_cameraB.position:", _cameraB.position);
      // console.log("_cameraB.rotation:", _cameraB.rotation);
      
      // console.log("\n_cameraR.position:", _cameraR.position);
      // console.log("_cameraR.rotation:", _cameraR.rotation);
      
      // console.log("\n_cameraL.position:", _cameraL.position);
      // console.log("_cameraL.rotation:", _cameraL.rotation);
    }  

    renderer.clear();
    renderer.setScissorTest( true );
    

    // "Scissor" and "Viewport" are cropped areas of the viewer application window:
    //    This is the area used to render 1 view of the 3D model (1 view out of the 4 perspective cameras)
    renderer.setScissor( _halfWidth - ( _width / 2 ), 0, _width, _height );
		renderer.setViewport( _halfWidth - ( _width / 2 ), 0, _width, _height );
		renderer.render( scene, _cameraF );
		
		renderer.setScissor( _halfWidth - ( _width / 2 ), ( _height * 2 ), _width, _height );
		renderer.setViewport( _halfWidth - ( _width / 2 ), ( _height * 2 ), _width, _height);
		renderer.render( scene, _cameraB);
		
		renderer.setScissor( _halfWidth - ( _width / 2 ) - _width, _height, _width, _height);
		renderer.setViewport( _halfWidth - ( _width / 2 ) - _width, _height, _width,_height);
		renderer.render( scene, _cameraL);

		renderer.setScissor( _halfWidth + ( _width / 2 ), _height, _width, _height );
		renderer.setViewport( _halfWidth + ( _width / 2 ), _height, _width, _height );
		renderer.render( scene, _cameraR );

		renderer.setScissorTest( false );
  };


  this.rotateObjectVertical = function(scene, direction) {
    var delta = 10 * direction;
    camGroup.rotation.x += MathUtils.degToRad(delta);
  }


  this.rotateObjectHorizontal = function(scene, direction) {
    var delta = 10 * direction;
    camGroup.rotation.y += MathUtils.degToRad(delta);
  }


  // Input: Zoom percentage number: positive for zooming in & negative for zooming out
  this.scaleObject = function(zoomPercent){
    var fraction = zoomPercent / 100;
    
    if (fraction >= 0 && fraction < 1) {
      // zoom in by narrowing cameras FoV
      _allCameras.forEach( cam => {
        if (cam.fov > 150) {
          return;
        }
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