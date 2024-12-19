// Criando uma malha poligonal 2D

import * as THREE from 'three';
import { GUI } from 'gui';

const 	rendSize 	= new THREE.Vector2();

let 	scene,
		camera,
		renderer, 
		controls;


const 	gui = new GUI();
		
// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function main() {

	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

	rendSize.x = 
	rendSize.y = Math.min(window.innerWidth, window.innerHeight) * 0.8;

	renderer.setSize(rendSize.x, rendSize.y);

	document.body.appendChild(renderer.domElement);

	scene 	= new THREE.Scene();

	camera = new THREE.OrthographicCamera( -1.0, 1.0, 1.0, -1.0, -1.0, 1.0 );

	controls = 	{	wireframe : true };
	
	gui.add( controls, 'wireframe').onChange(onWire);
	gui.open();

	criaObj();

	renderer.clear();
	renderer.render(scene, camera);
};

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function disposeArray() {

	this.array = null;
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function criaObj() {

	const vertices = [];
	const cor = [];
	const indices = [];

	let numAmostras = 4;

	const lado = 1.8 / (numAmostras-1);

	let y0 = -0.9;
	for (let linha = 0; linha < numAmostras; linha++) {
		let x0 = -0.9;
		for (let coluna = 0; coluna < numAmostras; coluna++) {
			vertices.push( x0 + coluna*lado, y0 + linha*lado, 0.0 );
			cor.push( linha/numAmostras, coluna/numAmostras, 1.0, 1.0 );
			}
		}

	for (let linha = 0; linha < numAmostras - 1; linha++) 
		for (let coluna = 0; coluna < numAmostras - 1; coluna++) {
			indices.push( coluna + linha*numAmostras,  coluna + (linha+1)*numAmostras,  (coluna+1) + linha*numAmostras );
			indices.push( (coluna+1) + linha*numAmostras,  coluna + (linha+1)*numAmostras,  (coluna+1) + (linha+1)*numAmostras );
		}

	const geometry = new THREE.BufferGeometry();

	geometry.setIndex( indices );
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ).onUpload( disposeArray ) );
	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( cor, 4 ).onUpload( disposeArray ) );

	let material = new THREE.MeshBasicMaterial( { 	wireframe	: true, 
													side 		: THREE.DoubleSide } );

	let mesh = new THREE.Mesh( geometry, material ); 
	mesh.name = "Malha-2D";
	mesh.material.vertexColors=true;
	scene.add( mesh );	

	scene.add(new THREE.AxesHelper(0.95));
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function onWire(checked) {

	scene.getObjectByName("Malha-2D").material.wireframe = checked;

	renderer.render(scene, camera);
};

// ******************************************************************** //
// ******************************************************************** //
// ******************************************************************** //

main();
