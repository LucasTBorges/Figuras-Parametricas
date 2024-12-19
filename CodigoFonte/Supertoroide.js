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
const cameraSize = 3.0;
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
    uniforms: ["s","t","a","b"],
    aux: `
    float C(in float epsilon, in float theta){
        return sign(cos(theta)) * pow(abs(cos(theta)), epsilon);
    }

    float S(in float epsilon, in float theta){
        return sign(sin(theta)) * pow(abs(sin(theta)), epsilon);
    }
    `,
    funcX: "return (a + C(s,u))*C(t,v);",
    funcY: "return (b + C(s,u))*S(t,v);",
    funcZ: "return S(s,u);"
}

const ctrl = {
    amostras: 60,
    paramS: toFloat(2),
    paramT: 0.5,
    raioX: 1.7,
    raioY: 1.7,
    wireframe : false,
    corUm: '#FFD662',
    corDois: '#00539C',
    centroX: 0.0,
    centroY: 0.0,
    centroZ: 0.0,
    modo: 4,
    frequencia: 230.0001
 };

const supertoroide = new Figura(ctrl.amostras, equacoes.uniforms, equacoes.funcX, equacoes.funcY, equacoes.funcZ, equacoes.aux, cameraSize);
const meuMaterial = new MeuMaterial(ctrl.modo, ctrl.corUm, ctrl.corDois, [ctrl.centroX, ctrl.centroY, ctrl.centroZ], supertoroide.getGLSL(),cameraSize)
.updateUniforms({frequencia: {value:ctrl.frequencia},
                a: {value:ctrl.raioX},
                b: {value:ctrl.raioY},
                s: {value:2.0},
                t: {value:0.50}});
const mesh = new THREE.Mesh(supertoroide.getGeometry(), meuMaterial.getMaterial());
mesh.name = "Malha-3D";
const lilgui = new GUI();
const geometria = lilgui.addFolder("Geometria e Forma");
const visualizacao = lilgui.addFolder("Visualização");
let amostras, raioX, raioY, wire, cor1, cor2, centroX, centroY, centroZ, modo, frequencia, paramS, paramT;

const callbacks = {
    setAmostras: function() {
        supertoroide.setAmostras(ctrl.amostras);
        mesh.geometry = supertoroide.getGeometry();
    },
    setParamS: function() {
        meuMaterial.updateUniforms({s: {value: toFloat(ctrl.paramS)}});
    },
    setParamT: function() {
        meuMaterial.updateUniforms({t: {value: toFloat(ctrl.paramT)}});
    },
    setRaioX: function() {
        meuMaterial.updateUniforms({a: {value: toFloat(ctrl.raioX)}});
    },
    setRaioY: function() {
        meuMaterial.updateUniforms({b: {value: toFloat(ctrl.raioY)}});
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

    paramS = geometria.add(ctrl, 'paramS', 0.5, 3)
        .onChange(callbacks.setParamS)
        .name("Parâmetro P1");

    paramT = geometria.add(ctrl, 'paramT', 0.5, 3)
        .onChange(callbacks.setParamT)
        .name("Parâmetro P2");        ;

    raioX = geometria.add(ctrl, 'raioX', 1, 2.0)
        .onChange(callbacks.setRaioX)
        .name("Raio.X");

    raioY = geometria.add(ctrl, 'raioY', 1, 2.0)
        .onChange(callbacks.setRaioY)
        .name("Raio.Y");

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