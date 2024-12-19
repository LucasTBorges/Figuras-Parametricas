// Carregando uma malha poligonal em formato glTF

import * as THREE 			from 'three';
import { GLTFLoader } 		from 'glTF-loaders';
import { GUI } 				from 'gui';

const 	clock 			= new THREE.Clock();

let 	scene,
		renderer, 
		camera,
		controls;

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

	camera = new THREE.OrthographicCamera(-100.0, 100.0, 100.0, -100.0, -100.0, 100.0);
	
	controls = 	{	wireframe : false };
	
	gui.add( controls, 'wireframe').onChange(onWire);
	gui.open();
	
	// Load Mesh
	const gltfLoader = new GLTFLoader();
	gltfLoader.load('/Assets/Models/glTF/stanford_bunny_pbr/scene.gltf', loadMesh);

	//Adiciona uma fonte de luz ambiente
	let ambLight = new THREE.AmbientLight( 0xffffff ); 
	scene.add(ambLight);

	scene.add(new THREE.AxesHelper(90));

	anime();
};
		
/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function loadMesh(loadedMesh) {
		
	const root 	= loadedMesh.scene;
	root.name 	= "MalhaPoligonal";
	scene.add(root);
};

/// ***************************************************************
/// **                                                           **
/// ***************************************************************
function anime() {
	let delta = clock.getDelta();

	let obj = scene.getObjectByName("MalhaPoligonal");

	if (obj)
		obj.rotateY(delta);

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
