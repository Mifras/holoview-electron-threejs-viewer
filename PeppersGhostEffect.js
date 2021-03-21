import {
  PerspectiveCamera,
  Quaternion,
  Vector3,
  MathUtils,
  Group
} from './node_modules/three/src/Three.js';

/**
 * peppers ghost effect based on http://www.instructables.com/id/Reflective-Prism/?ALLSTEPS
 * 
 * Three js angles use Euler angles, so MathUtils.degToRad is leveraged
 */

var PeppersGhostEffect = function ( renderer, initCameraDistance ) {
  // Internals
  var _halfWidth, _width, _height;

  // These camera directions are relative to how they show up on the viewer app screen itself regardless of actual rotation
  // up, down, left, right on the viewer app screen, the position of these cmaeras on the viewer app.
  var _cameraR = new PerspectiveCamera(); //front
  var _cameraL = new PerspectiveCamera(); //back
  var _cameraD = new PerspectiveCamera(); //left
  var _cameraU = new PerspectiveCamera(); //right

  var camGroup = new Group();
  var _allCameras = [_cameraR, _cameraL, _cameraD, _cameraU];
  this.cameraDistance = initCameraDistance;

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
      console.log("LOOK ME Setting cams to initial positions");
      localStorage.setItem('isFirstRender', "false");
      
      scene.remove(camGroup);
      
      camGroup = new Group();
      _cameraR = new PerspectiveCamera();
      _cameraL = new PerspectiveCamera();
      _cameraD = new PerspectiveCamera();
      _cameraU = new PerspectiveCamera();

      _allCameras = [_cameraR, _cameraL, _cameraD, _cameraU];

      // add the cam group to the scene
      scene.add(camGroup);
      camGroup.add(_cameraR)
      camGroup.add(_cameraL)
      camGroup.add(_cameraD)
      camGroup.add(_cameraU)
      
      scene.updateMatrixWorld();
      if ( camera.parent === null ) camera.updateMatrixWorld();
      camera.matrixWorld.decompose( _position, _quaternion, _scale );
      
      // initialize each cameras position and quaternion
      _allCameras.forEach(cam => {
        cam.position.copy(_position);
        cam.quaternion.copy(_quaternion)
      })
      
      // front
      _cameraR.translateX(this.cameraDistance);
      _cameraR.rotation.y = MathUtils.degToRad(90);
      _cameraR.rotation.x = MathUtils.degToRad(-90);

      // back
      _cameraL.translateX(-(this.cameraDistance));
      _cameraL.rotation.y = MathUtils.degToRad(-90);
      _cameraL.rotation.x = MathUtils.degToRad(-90);

      // left
      _cameraD.translateZ(this.cameraDistance);

      // right
      _cameraU.translateZ(-(this.cameraDistance));
      _cameraU.rotation.x = MathUtils.degToRad(-180);
      _cameraU.rotation.z = MathUtils.degToRad(0);
      
    }  

    renderer.clear();
    renderer.setScissorTest( true );

    // "Scissor" and "Viewport" are cropped areas of the viewer application window:
    //    This is the area used to render 1 view of the 3D model (1 view out of the 4 perspective cameras)
    renderer.setScissor( _halfWidth - ( _width / 2 ), 0, _width, _height );
		renderer.setViewport( _halfWidth - ( _width / 2 ), 0, _width, _height );
		renderer.render( scene, _cameraD );
		
		renderer.setScissor( _halfWidth - ( _width / 2 ), ( _height * 2 ), _width, _height );
		renderer.setViewport( _halfWidth - ( _width / 2 ), ( _height * 2 ), _width, _height);
		renderer.render( scene, _cameraU);
		
		renderer.setScissor( _halfWidth - ( _width / 2 ) - _width, _height, _width, _height);
		renderer.setViewport( _halfWidth - ( _width / 2 ) - _width, _height, _width,_height);
		renderer.render( scene, _cameraL);

		renderer.setScissor( _halfWidth + ( _width / 2 ), _height, _width, _height );
		renderer.setViewport( _halfWidth + ( _width / 2 ), _height, _width, _height );
		renderer.render( scene, _cameraR );

		renderer.setScissorTest( false );
  };


  this.rotateObjectVertical = function(direction) {
    var delta = 10 * direction;
    camGroup.rotation.x += MathUtils.degToRad(delta);
  }

  this.rotateObjectHorizontal = function(direction) {
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