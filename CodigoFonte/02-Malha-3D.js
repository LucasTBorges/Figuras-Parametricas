/// Criando uma malha poligonal 3D
import MeuMaterial from './MeuMaterial.js';
import * as THREE from 'three';
import { GUI } from 'gui';

let 	scene,
		camera,
		renderer,
		controls;

const 	clock 		= new THREE.Clock();
const 	rendSize 	= new THREE.Vector2();

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

	anime();
};

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function criaObj() {

	const vertices = [];
	const cor = [];
	const indices = [];

	let numAmostras = 80;

	const lado = Math.PI / numAmostras;

	for (let v = 0;  v <= Math.PI; v+=lado) {
		for (let u = 0; u <= Math.PI; u+=lado) {
			let x = Math.cos(v) * Math.sqrt(Math.abs(Math.sin(2*u)))*Math.cos(u);
			let y = Math.cos(v) * Math.sqrt(Math.abs(Math.sin(2*u)))*Math.sin(u);
			let z = x*x - y*y + 2*x*y*Math.tan(v)*Math.tan(v);
			vertices.push( x, y, z );
			cor.push( x, y, z, 1.0 );
			}
		}

	for (let linha = 0; linha < numAmostras; linha++) 
		for (let coluna = 0; coluna < numAmostras; coluna++) {
			indices.push( coluna + linha*numAmostras,  coluna + (linha+1)*numAmostras,  (coluna+1) + linha*numAmostras );
			indices.push( (coluna+1) + linha*numAmostras,  coluna + (linha+1)*numAmostras,  (coluna+1) + (linha+1)*numAmostras );
		}

	const geometry = new THREE.BufferGeometry();
	
	geometry.setIndex( indices );
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ).onUpload( disposeArray ) );
	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( cor, 4 ).onUpload( disposeArray ) );

	let material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe:true, side: THREE.DoubleSide } );
	//let material = new MeuMaterial(4,0xff0000, 0x0ffff, [0,0,0]).getMaterial();
	material.side = THREE.DoubleSide;
	material.wireframe = true;

	let mesh = new THREE.Mesh( geometry, material ); 
	mesh.name = "Malha-3D";
	mesh.material.vertexColors=true;
	scene.add( mesh );	

	scene.add(new THREE.AxesHelper(0.95));
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //

function disposeArray() {

	this.array = null;

}

/// ***************************************************************
/// ***                                                          **
/// ***************************************************************
function anime() {
	let delta = clock.getDelta();

	let obj = scene.getObjectByName("Malha-3D");

	if (obj)
		obj.rotateY(delta);

	renderer.render(scene, camera);
	requestAnimationFrame(anime);
};

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function onWire(checked) {

	scene.getObjectByName("Malha-3D").material.wireframe = checked;

};

// ******************************************************************** //
// ******************************************************************** //
// ******************************************************************** //

main();
