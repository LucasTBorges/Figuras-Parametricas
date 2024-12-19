import Vertice from './Vertice.js';
import * as THREE from 'three';

export default class MeuMaterial {
    constructor(modo, colorPrim, colorSec, centro=[0,0,0], vShader=MeuMaterial.defaultVS, cameraSize=1){
        this.cameraSize = cameraSize;
        this.centro = new Vertice(...centro);
        this.uniforms = {
            colorPrim: {value: new THREE.Color(colorPrim)},
            colorSec: {value: new THREE.Color(colorSec)},
            centro: {value: new THREE.Vector3(...centro)},
            maxDistancia: {value: this.getMaxDistancia()},
            modo: {value: modo},
            frequencia: {value: 50.01}
        };
        this.vShader = vShader;
        this.material = this.getMaterial();

    }

    static distancia(a,b){
        return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2);
    }

    getMaxDistancia(){ //Retorna a distância entre o centro e o vértice mais distante do cubo unitário
        const x = this.centro.x > 0 ? -this.cameraSize : this.cameraSize;
        const y = this.centro.y > 0 ? -this.cameraSize : this.cameraSize;
        const z = this.centro.z > 0 ? -this.cameraSize : this.cameraSize;
        const vertice = new Vertice(x,y,z);
        const max = MeuMaterial.distancia(this.centro, vertice);
        return max;
    }

    getMaterial(){ //Retorna o material
        if (this.material) return this.material;
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: MeuMaterial.getGLSL(),
            wireframe: false,
            vertexShader: this.vShader,
            side: THREE.DoubleSide
        });
        return this.material;
    }

    setVShader(vShader){
        this.vShader = vShader;
        this.material.vertexShader = vShader;
        console.log(this.material.vertexShader);
        return this;
    }

    setFrequencia(frequencia){
        this.uniforms.frequencia.value = frequencia;
        return this;
    }

    setWireframe(wireframe){
        this.material.wireframe = wireframe;
        return this;
    }

    setCentro(centro){
        this.centro = new Vertice(...centro);
        this.uniforms.centro.value = this.centro;
        this.uniforms.maxDistancia.value = this.getMaxDistancia();
        return this;
    }

    setModo(modo){
        this.uniforms.modo.value = modo;
        return this;
    }

    setCorPrim(color){
        this.uniforms.colorPrim.value = new THREE.Color(color);
        return this;
    }

    setCorSec(color){
        this.uniforms.colorSec.value = new THREE.Color(color);
        return this;
    }

    setVShader(vShader){
        this.vShader = vShader;
        this.material.vertexShader = vShader;
        return this;
    }

    updateUniforms(dict){
        Object.assign(this.material.uniforms, dict);
        return this;
    }


    static getGLSL(){
        return MeuMaterial.GLSL;
    }

    static GLSL = `
            varying vec3 pos;
            uniform vec3 colorPrim;
            uniform vec3 colorSec;
            uniform vec3 centro;
            uniform float maxDistancia;
            uniform int modo;
            uniform float frequencia;

            float distancia(in vec3 a, in vec3 b){
                return sqrt((a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y) + (a.z - b.z)*(a.z - b.z));
            }

            float zeroAteUm(in float x){
                return (x+1.0)/2.0;
            }

            float pesoSeno(){
                float dist = distancia(pos, centro);
                float peso = zeroAteUm(sin(frequencia*(dist/maxDistancia)));
                return peso;
            }

            vec3 HUEtoRGB(in float hue)
            {
                vec3 rgb = abs(hue * 6. - vec3(3, 2, 4)) * vec3(1, -1, -1) + vec3(-1, 2, 2);
                return clamp(rgb, 0., 1.);
            }

            vec3 HSLtoRGB(in vec3 hsl){
                vec3 rgb = HUEtoRGB(hsl.x);
                float c = (1. - abs(2. * hsl.z - 1.)) * hsl.y;
                return (rgb - 0.5) * c + hsl.z;
            }

            vec4 getCor0(){ //Interpola entre as cores colorPrim e colorSec
                float dist = distancia(pos, centro);
                if (modo== 0) {
                 dist *= 4.0; //Amplifica o efeito no modo de interpolação para melhor visualização
                }
                float peso = dist/maxDistancia;
                return vec4(mix(colorPrim, colorSec, peso), 1.0);
            }

            vec4 getCor1(){ //Onda senoidal baseada na distância
                return vec4(mix(colorSec, colorPrim, pesoSeno()), 1.0);
            }

            vec4 getCor2(vec3 pos){ //RGB
                return vec4(zeroAteUm(pos.x), zeroAteUm(pos.y), zeroAteUm(pos.z), 1.0);
            }

            vec4 getCor3(vec3 pos){ //HSL
                vec3 hsl = vec3(zeroAteUm(pos.x), zeroAteUm(pos.y), zeroAteUm(pos.z));
                return vec4(HSLtoRGB(hsl), 1.0);
            }

            vec4 getCor4(vec3 pos){ //Onda senoidal intercalando entre RGB e HSL
                return vec4(mix(getCor2(pos).xyz, getCor3(pos).xyz, pesoSeno()), 1.0);
            }

            vec4 getCor5(vec3 pos){ //Hue variando em função da distância
                float dist = frequencia/100.0*distancia(pos, centro);
                vec3 hsl = vec3(dist-trunc(dist),1.0, 0.5);
                return vec4(HSLtoRGB(hsl), 1.0);
        }

            vec4 getCor(vec3 pos){
                switch(modo){
                    case 1: return getCor1(); //Senoidal cor
                    case 2: return getCor2(pos); //RGB
                    case 3: return getCor3(pos); //HSL
                    case 4: return getCor4(pos); //Senoidal RGB e HSL
                    case 5: return getCor5(pos); //Distância -> Hue
                    default: return getCor0(); //Interpolado
                }
            }

            void main(){
                gl_FragColor = getCor(pos);
            }
        `;

    static defaultVS = `
        varying vec3 pos;
        void main(){
            pos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    static MODOS = {
        "Distância -> Hue":5,
        "Senoidal (RGB&HSL)":4,
        "XYZ -> RGB":2,
        "XYZ -> HSL":3,
        "Senoidal (Cor1&Cor2)":1,
        "Interpola (Cor1&Cor2)":0
    }
    static INTERPOLA = 0;
    static SENO_COR = 1;
    static RGB = 2;
    static HSL = 3;
    static SENO_RGB_HSL = 4;
    static DISTANCIA_HUE = 5;
}