// Carregando uma malha poligonal em formato OBJ com descrição de Material

import * as THREE 			from 'three';
import { MTLLoader } 		from 'mtl-loaders';
import { OBJLoader } 		from 'obj-loaders';
import { GUI } 				from 'gui';

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

	camera = new THREE.OrthographicCamera(-200.0, 200.0, 200.0, -200.0, -400.0, 400.0);

	controls = 	{	wireframe : false };
	
	gui.add( controls, 'wireframe').onChange(onWire);
	gui.open();

	// Load MTL
	const MTL_loader = new MTLLoader();
	MTL_loader.load('/Assets/Models/OBJ/AtlasModels/bunny.mtl', loadMTL);

	//Adiciona uma fonte de luz ambiente
	let ambLight = new THREE.AmbientLight( 0xffffff ); 
	scene.add(ambLight);

	scene.add(new THREE.AxesHelper(300));

	anime();
};

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function loadMTL(materials) {

	materials.preload();

	// Load Mesh
	const OBJ_loader = new OBJLoader();
	OBJ_loader.setMaterials( materials );
	OBJ_loader.load('/Assets/Models/OBJ/AtlasModels/bunny.obj', loadMesh);

}

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************

function loadMesh(loadedMesh) {

	loadedMesh.name = "MalhaPoligonal";
	scene.add(loadedMesh);
}

/// ***************************************************************
/// ***                                                          **
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
