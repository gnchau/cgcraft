import terrain from "./Terrain.js"

export default class World {
    constructor() {
        this.texture;
        noise.seed(Math.random());
        this.mat1 = new THREE.MeshPhongMaterial({
            transparent: false,
            opacity: 0.3,
        });

        this.terrain = new terrain(this.mat1);
        this.terrain.generateSurface();
    }

    setTexture(texture) {
        this.texture = texture;
        this.mat1.map = texture;
    }

    placeBlock(px, py, pz, type) {
        const posx = Math.floor(px);
        const posy = Math.floor(py);
        const posz = Math.floor(pz);

        this.terrain.placeBlock(posx, posy, posz, type);
        this.terrain.updateMesh();
    }

    getBlock(x, y, z) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fz = Math.floor(z);

        return this.terrain.getBlock(fx, fy, fz);
    }

    updateTerrain(scene) {
        if (!this.terrain.mesh) {
            this.updateTerrainMesh();
        }
        scene.add(this.terrain.mesh)
    }

    updateTerrainMesh() {
        this.terrain.updateMesh();
    }
}

