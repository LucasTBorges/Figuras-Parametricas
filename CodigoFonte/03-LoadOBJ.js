// Carregando uma malha poligonal em formato OBJ

import * as THREE 			from 'three';
import { OBJLoader } 		from 'obj-loaders';
import { GUI } from 'gui';

let 	scene,
		renderer,
		camera,
		controls;

const 	clock 			= new THREE.Clock();

const 	gui = new GUI();

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function main() {

	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

	const rendSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);

	renderer.setSize(rendSize, rendSize);

	document.body.appendChild(renderer.domElement);

	scene 	= new THREE.Scene();

	camera = new THREE.OrthographicCamera(-2.0, 2.0, 2.0, -2.0, -2.0, 2.0);
	
	controls = 	{	wireframe : true };
	
	gui.add( controls, 'wireframe').onChange(onWire);
	gui.open();

	// Load Mesh
	const loader = new OBJLoader();
	loader.load('/Assets/Models/OBJ/Classicals/cube.obj', loadMesh);

	scene.add(new THREE.AxesHelper(2.0));

	anime();
};

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function loadMesh(loadedMesh) {

	loadedMesh.traverse(function (child) {
		if (child.isMesh == true) 
			child.material = new THREE.MeshBasicMaterial(	{	color  		: new THREE.Color(Math.random(), Math.random(), Math.random()), 
																wireframe  	: true
															} );
		});

	loadedMesh.name = "MalhaPoligonal";
	scene.add(loadedMesh);
}

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************
function anime() {
	let delta = clock.getDelta();

	let obj = scene.getObjectByName("MalhaPoligonal");

	if (obj) {
		obj.rotateY(delta);
		obj.rotateZ(delta/2.0);
		obj.rotateX(delta/4.0);
		}

	renderer.render(scene, camera);
	requestAnimationFrame(anime);
};

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function onWire(checked) {

	scene.getObjectByName("MalhaPoligonal").traverse(function (child) {
		if (child.isMesh == true) 
			child.material.wireframe = checked;
		});
};

/// ***************************************************************
/// ***************************************************************
/// ***************************************************************

main();
