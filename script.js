//Setup
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color("#87ceeb")

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 3;
camera.position.z = 3;
camera.position.x = 3;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create orbital controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.disablePaning = true;
controls.enableDamping = true;
controls.dampingFactor = 0.1; // Adjust damping factor

//Lighting
const ambientLight = new THREE.AmbientLight("white", 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

let raycaster = new THREE.Raycaster();

let mouse = new THREE.Vector2();

//Initialize game logic
let dimensions = {
	w: 7,
	l: 7,
	h: 6
};

let board = {
	game: Array.from({ length: dimensions.w * dimensions.l }, () => new Array(dimensions.h).fill(0)),
	w: 3,
	l: 3,
};

let cube = {
	w: (board.w / dimensions.w),
	l: (board.l / dimensions.l),
	h: ((board.w / dimensions.w) + (board.l / dimensions.l)) / 2
};

let turn = 1 % 2;

let falling = [];

let hitboxes = [];

let locations = [];

let coordinate = {
	x: 0,
	z: 0
};

const marker = new THREE.Mesh(new THREE.BoxGeometry(cube.w, cube.h * dimensions.h, cube.l), new THREE.MeshStandardMaterial({ color: "red", opacity: 0.1, transparent: true }));
marker.position.x = ((board.w) / dimensions.w) * coordinate.x - ((board.w) / 2) + cube.w / 2;
marker.position.y = (((dimensions.h - 1) / (7/3)) - 0.8) - (cube.h * dimensions.h) / 2 + (cube.w / 2);
marker.position.z = ((board.l) / dimensions.l) * coordinate.z - ((board.l) / 2) + cube.l / 2;
scene.add(marker);

// //Testing
// const thing = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: "black" }));
// thing.position.z = 5;
// scene.add(thing);

// const thingy2 = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), new THREE.MeshStandardMaterial({ color: "black" }));
// thingy2.position.x = 5;
// scene.add(thingy2)

// const ground = new THREE.Mesh(new THREE.BoxGeometry(board.w * 1.5, 0.02, board.l * 1.5), new THREE.MeshStandardMaterial({ color: "black" }));
// ground.position.y = -1.2;
// scene.add(ground);

//Markers
for (let y = 0; y < dimensions.h; y++) {
	for (let z = 0; z < dimensions.l; z++) {
		for (let x = 0; x < dimensions.w; x++) {
			const line = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(cube.w, cube.h, cube.l)), new THREE.LineDashedMaterial({ color: "#8f8f8f", dashSize: 0.04, gapSize: 0.1, opacity: 0.25, transparent: true })); 
			line.computeLineDistances();

			//Find position according to # of cubes in the board, then center respectively
			const xP = ((board.w) / dimensions.w) * x - ((board.w) / 2) + cube.w / 2;
			const zP = ((board.l) / dimensions.l) * z - ((board.l) / 2) + cube.l / 2;

			line.position.x = xP;

			line.position.y = (y / (7/3)) - 0.8;

			line.position.z = zP;

			scene.add(line);

			if (y == dimensions.h - 1) {
				hitboxes.push([x, z]);
				locations.push([xP, zP]);
			}
		}
	}
}

function animate() {
	requestAnimationFrame(animate);

	// //Animate code
	// thing.rotation.x += 0.1;
	// thingy2.rotation.y += 0.1;

	for (let i = 0; i < falling.length; i++) {
		if (falling[i][0].position.y > falling[i][1]) {
			falling[i][0].position.y -= falling[i][2];
			falling[i][2] += 0.001;
		} else {
			falling.splice(i, 1);
		}
	}

	marker.position.x = ((board.w) / dimensions.w) * coordinate.x - ((board.w) / 2) + cube.w / 2;
	marker.position.y = (((dimensions.h - 1) / (7/3)) - 0.8) - (cube.h * dimensions.h) / 2 + (cube.w / 2);
	marker.position.z = ((board.l) / dimensions.l) * coordinate.z - ((board.l) / 2) + cube.l / 2;
	
	controls.update();

	raycaster.setFromCamera(mouse, camera); 

	renderer.render(scene, camera);
}

animate();

document.addEventListener('keydown', function(event) {
	switch (event.key) {
		case "a":
			if (coordinate.x > 0) coordinate.x--;
		break;

		case "d":
			if (coordinate.x < dimensions.w - 1) coordinate.x++;
		break;

		case "w":
			if (coordinate.z > 0) coordinate.z--;
		break;

		case "s":
			if (coordinate.z < dimensions.l - 1) coordinate.z++;
		break;

		case " ":
			const index = hitboxes.findIndex((i) => i[0] == coordinate.x && i[1] == coordinate.z);

			if (board.game[index].includes(0)) {
				const place = board.game[index].indexOf(0);

				board.game[index][place] = turn + 1;

				turn = (turn + 1) % 2;

				const lol = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: ["red", "yellow"][turn] }));
				lol.position.x = locations[index][0];
				lol.position.z = locations[index][1];
				lol.position.y = 2;
				scene.add(lol);

				falling.push([lol, ((dimensions.h - 1) / (7/3)) - 0.8 - cube.h * (dimensions.h - place - 1), 0.03]);
			}
		break;
	}
});

window.addEventListener("resize", function() {
  const canvas = document.querySelector("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
