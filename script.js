import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

let sped = 0.01;

function animate() {
	requestAnimationFrame( animate );

	cube.rotation.y += sped;
    cube.rotation.x += sped;

    sped += 0.001;

	renderer.render( scene, camera );
}

animate();