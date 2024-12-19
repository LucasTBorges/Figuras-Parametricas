import * as THREE from 'three';

function disposeArray() {

	this.array = null;

}
export default class Figura {
    constructor(numAmostras=80, uniforms=[], funcX = Figura.defaultX, funcY = Figura.defaultY, funcZ = Figura.defaultZ, aux="",cameraSize=1.0, intervaloU="zeroAteUm(position.x)*2.0*pi", intervaloV="zeroAteUm(position.y)*2.0*pi") {
        this.numAmostras = numAmostras;
        this.funcX = funcX;
        this.funcY = funcY;
        this.funcZ = funcZ;
        this.geometry = this.makeGeometry(numAmostras);
        this.uniforms = uniforms;
        this.aux = aux;
        this.cameraSize = cameraSize;

        this.intervaloU = intervaloU;
        this.intervaloV = intervaloV;
    }

    makeGeometry() {
        const amostras = this.numAmostras;
        const vertices = [];
        const cor = [];
        const indices = [];
    
        const lado = 2 / (amostras-1);
    
        let y0 = -1;
        for (let linha = 0; linha < amostras; linha++) {
            let x0 = -1;
            for (let coluna = 0; coluna < amostras; coluna++) {
                vertices.push( x0 + coluna*lado, y0 + linha*lado, 0.0 );
                cor.push( linha/amostras, coluna/amostras, 1.0, 1.0 );
                }
            }
    
        for (let linha = 0; linha < amostras - 1; linha++) 
            for (let coluna = 0; coluna < amostras - 1; coluna++) {
                indices.push( coluna + linha*amostras,  coluna + (linha+1)*amostras,  (coluna+1) + linha*amostras );
                indices.push( (coluna+1) + linha*amostras,  coluna + (linha+1)*amostras,  (coluna+1) + (linha+1)*amostras );
            }
    
        const geometry = new THREE.BufferGeometry();
    
        geometry.setIndex( indices );
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ).onUpload( disposeArray ) );
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( cor, 4 ).onUpload( disposeArray ) );
        return geometry;
    }

    setAmostras(numAmostras) {
        this.numAmostras = numAmostras;
        this.geometry = this.makeGeometry();
    }

    getGeometry() {
        return this.geometry??this.makeGeometry();
    }

    getGLSL() {
        const cameraSize = this.cameraSize.toFixed(2);
        const glsl = `
        ${this.getUniforms()}
        ${this.aux}
        ${this.getX()}
        ${this.getY()}
        ${this.getZ()}
        float zeroAteUm(in float k){
            return (k+1.0)/2.0;
        }
        varying vec3 pos;
        void main() {
            float pi = ${Math.PI};
            vec3 newPos;
            float u = ${this.intervaloU};
            float v = ${this.intervaloV};
            newPos = vec3(figX(u,v), figY(u,v), figZ(u,v));
            pos = vec3(newPos.x/${cameraSize}, newPos.y/${cameraSize}, newPos.z/${cameraSize});
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0); 
        }
        `
        return glsl;
    }

    getUniforms() {
        let uniforms = "";
        for (let i = 0; i < this.uniforms.length; i++) {
            uniforms += `
            uniform float ${this.uniforms[i]};`
        }
        return uniforms;
    }


    getX() { 
        return `
            float figX(in float u, in float v){
                ${this.funcX}
            }
        `
    }

    getY() {
        return `
            float figY(in float u, in float v){
                ${this.funcY}
            }
        `
    }

    getZ() {
        return `
            float figZ(in float u, in float v){
                ${this.funcZ}
            }
        `
    }

    static defaultX=`
    return u;
    `
    static defaultY=`
    return v;
    `
    static defaultZ=`
    return 0.0;
    `



}