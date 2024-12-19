import MeuMaterial from './MeuMaterial.js';
import * as THREE from 'three';
import { GUI } from 'gui';
import Figura from './Figura.js';
let 	scene,
		camera,
		renderer,
		material;
    
const 	clock 		= new THREE.Clock();
const 	rendSize 	= new THREE.Vector2();
const cameraSize = 2.5;
function toFloat(x) {//Evita erros de tipo com o GLSL (operações entre floats e inteiros podem causar problemas, por isso converto tudo para float)
    if (Number.isInteger(x)) {
        return x + 0.0001;
    }
    return x;
}

function criaCanvas() {
	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

	rendSize.x = rendSize.y = Math.min(window.innerWidth, window.innerHeight) * 0.8;

	renderer.setSize(rendSize.x, rendSize.y);

	document.body.appendChild(renderer.domElement);

	scene 	= new THREE.Scene();

	//camera = new THREE.OrthographicCamera( -1.0, 1.0, 1.0, -1.0, -1.0, 1.0 );
    camera = new THREE.OrthographicCamera( -cameraSize, cameraSize, cameraSize, -cameraSize, -cameraSize, cameraSize );
}

    const equacoes = {
        uniforms: ["a","b","c","m","n"],
        aux: ``,
        funcX: `
            float cosU = cos(u);
            float cosV = cos(v);
            return a * sign(cosU)*pow(abs(cosU),m) * sign(cosV)*pow(abs(cosV),n);
        `,
        funcY: `
            float sinU = sin(u);
            return b * sign(sinU)*pow(abs(sinU),m);
        `,
        funcZ: `
            float cosU = cos(u);
            float sinV = sin(v);
            return c * sign(cosU)*pow(abs(cosU),m) * sign(sinV)*pow(abs(sinV),n);
        `,
        intervaloU: "position.x*pi",
        intervaloV: "position.y*pi/2.0"
    }


const ctrl = {
    amostras: 60,
    a: toFloat(2),
    b: toFloat(2),
    c: 1.6,
    m: 0.5,
    n: 0.5,
    wireframe : false,
    corUm: '#FFD662',
    corDois: '#00539C',
    centroX: 0.0,
    centroY: 0.0,
    centroZ: 0.0,
    modo: 4,
    frequencia: 320.001
 };

const supertoroide = new Figura(ctrl.amostras, equacoes.uniforms, equacoes.funcX, equacoes.funcY, equacoes.funcZ, equacoes.aux, cameraSize, equacoes.intervaloU, equacoes.intervaloV);
const meuMaterial = new MeuMaterial(ctrl.modo, ctrl.corUm, ctrl.corDois, [ctrl.centroX, ctrl.centroY, ctrl.centroZ], supertoroide.getGLSL(),cameraSize)
.updateUniforms({frequencia: {value:ctrl.frequencia},
                a: {value:ctrl.a},
                b: {value:ctrl.b},
                c: {value:ctrl.c},
                m: {value:ctrl.m},
                n: {value:ctrl.n}});
const mesh = new THREE.Mesh(supertoroide.getGeometry(), meuMaterial.getMaterial());
mesh.name = "Malha-3D";
const lilgui = new GUI();
const geometria = lilgui.addFolder("Geometria e Forma");
const visualizacao = lilgui.addFolder("Visualização");
let amostras, paramA, paramB, paramC, paramM, paramN, wire, cor1, cor2, centroX, centroY, centroZ, modo, frequencia;

const callbacks = {
    setAmostras: function() {
        supertoroide.setAmostras(ctrl.amostras);
        mesh.geometry = supertoroide.getGeometry();
    },
    setA: function() {
        meuMaterial.updateUniforms({a: {value: toFloat(ctrl.a)}});
    },
    setB: function() {
        meuMaterial.updateUniforms({b: {value: toFloat(ctrl.b)}});
    },
    setC: function() {
        meuMaterial.updateUniforms({c: {value: toFloat(ctrl.c)}});
    },
    setM: function() {
        meuMaterial.updateUniforms({m: {value: toFloat(ctrl.m)}});
    },
    setN: function() {
        meuMaterial.updateUniforms({n: {value: toFloat(ctrl.n)}});
    },
    setWireframe: function() {
        meuMaterial.setWireframe(ctrl.wireframe);
    },
    setCorUm: function() {
        meuMaterial.setCorPrim(ctrl.corUm);
    },
    setCorDois: function() {
        meuMaterial.setCorSec(ctrl.corDois);
    },
    setCentro: function() {
        meuMaterial.setCentro(new THREE.Vector3(toFloat(ctrl.centroX), toFloat(ctrl.centroY), toFloat(ctrl.centroZ)));
    },
    setModo: function() {
        const newModo = ctrl.modo;
        switch (newModo) {
            case MeuMaterial.SENO_COR:
                cor1.show();
                cor2.show();
                centroX.show();
                centroY.show();
                centroZ.show();
                frequencia.show();
                break;
            case MeuMaterial.SENO_RGB_HSL:
                cor1.hide();
                cor2.hide();
                centroX.show();
                centroY.show();
                centroZ.show();
                frequencia.show();
                break;
            case MeuMaterial.RGB:
                cor1.hide();
                cor2.hide();
                centroX.hide();
                centroY.hide();
                centroZ.hide();
                frequencia.hide();
                break;
            case MeuMaterial.HSL:
                cor1.hide();
                cor2.hide();
                centroX.hide();
                centroY.hide();
                centroZ.hide();
                frequencia.hide();
                break;
            case MeuMaterial.DISTANCIA_HUE:
                cor1.hide();
                cor2.hide();
                centroX.show();
                centroY.show();
                centroZ.show();
                frequencia.show();
                break;
            default: //MeuMaterial.INTERPOLA
                cor1.show();
                cor2.show();
                centroX.show();
                centroY.show();
                centroZ.show();
                frequencia.hide();
                break;
        }
        meuMaterial.setModo(newModo);
    },
    setFrequencia: function() {
        meuMaterial.setFrequencia(toFloat(ctrl.frequencia));
    }
};

function criaGUI(gui) {
    gui.title("Controles");

    amostras = geometria.add(ctrl, 'amostras', 10, 100, 1)
        .onChange(callbacks.setAmostras)
        .name("Amostras");

    paramA = geometria.add(ctrl, 'a', 0.001, 2.0)
        .onChange(callbacks.setA)
        .name("Semidiâmetro x");

    paramB = geometria.add(ctrl, 'b', 0.001, 2.0)
        .onChange(callbacks.setB)
        .name("Semidiâmetro y");

    paramC = geometria.add(ctrl, 'c', 0.001, 2.0)
        .onChange(callbacks.setC)
        .name("Semidiâmetro z");

    paramM = geometria.add(ctrl, 'm', 0.001, 2.0)
        .onChange(callbacks.setM)
        .name("Parâmetro P1");

    paramN = geometria.add(ctrl, 'n', 0.001, 2.0)
        .onChange(callbacks.setN)
        .name("Parâmetro P2");

    wire = visualizacao.add( ctrl, 'wireframe')
        .onChange(callbacks.setWireframe)
        .name("Wireframe");

    modo = visualizacao.add(ctrl, 'modo', MeuMaterial.MODOS)
        .onChange(callbacks.setModo)
        .name("Modo");
        
    cor1 = visualizacao.addColor(ctrl, 'corUm')
        .onChange(callbacks.setCorUm)
        .name("Cor 1");

    cor2 = visualizacao.addColor(ctrl, 'corDois')
        .onChange(callbacks.setCorDois)
        .name("Cor 2");

    centroX = visualizacao.add(ctrl, 'centroX', -cameraSize, cameraSize)
        .onChange(callbacks.setCentro)
        .name("Centro.X");

    centroY = visualizacao.add(ctrl, 'centroY', -cameraSize, cameraSize)
        .onChange(callbacks.setCentro)
        .name("Centro.Y");

    centroZ = visualizacao.add(ctrl, 'centroZ', -cameraSize, cameraSize)
        .onChange(callbacks.setCentro)
        .name("Centro.Z");
    
    frequencia = visualizacao.add(ctrl, 'frequencia', 50.001, 400.001)
        .onChange(callbacks.setFrequencia)
        .name("Frequência");
    
    callbacks.setModo(MeuMaterial.SENO_RGB_HSL);
    gui.open();
}

function anime() {
	let delta = clock.getDelta();

	let obj = scene.getObjectByName("Malha-3D");

	if (obj)
		obj.rotateY(delta);

	renderer.render(scene, camera);
	requestAnimationFrame(anime);
};

function main() {
    criaCanvas();
    criaGUI(lilgui);
    scene.add(mesh);
    anime();
}

main();