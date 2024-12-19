export default class Vertice {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    getArray() {
        return [this.x, this.y, this.z];
    }

    static fromArray(array) {
        return new Vertice(array[0], array[1], array[2]);
    }

    static convertArray(array) {
        let vertices = [];
        for (let i = 0; i < array.length; i += 3) {
            vertices.push(new Vertice(array[i], array[i + 1], array[i + 2]));
        }
        return vertices;
    }
}