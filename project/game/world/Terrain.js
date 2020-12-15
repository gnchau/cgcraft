import * as utils from "../GameUtils.js"
import {BLOCK_TYPES} from "../GameUtils.js";

export default class Terrain {
    constructor(mat) {
        this.blocks = new Array(utils.GAME_SIZE * utils.GAME_SIZE * utils.GAME_MAX_HEIGHT);
        this.blocks.fill(0);
        this.rendered = false;

        this.mat = mat;
        this.mesh
        this.mesher = this.meshCubes();
    }

    // x - row, z - column, y - height
    getIndex(px, py, pz) {

        if (px < 0 || py < 0 || pz < 0 || px > utils.GAME_SIZE ||
            py > utils.GAME_MAX_HEIGHT || pz >= utils.GAME_SIZE) {
            return null;
        }

        return px + pz * utils.GAME_SIZE + py * utils.GAME_SIZE * utils.GAME_SIZE;
    }

    getBlock(px, py, pz) {
        let ind = this.getIndex(px, py, pz);
        if (ind == null) {
            return
        }

        return this.blocks[ind];
    }

    computeHeight(px, pz) {
        return px + pz * utils.GAME_SIZE;
    }

    placeBlock(px, py, pz, type) {
        const ind = this.getIndex(px, py, pz);
        if (ind == null) {
            return;
        }

        this.blocks[ind] = type;
    }

    getBlockType(surface, y) {
        let type = BLOCK_TYPES.STONE;

        // top layer
        if (y >= surface - 1) {
            type = utils.BLOCK_TYPES.GRASS
        } else if (y > surface - 4) {
            type = utils.BLOCK_TYPES.DIRT
        }

        return type;
    }

    getNeighbors(x, y, z) {
        if (x >= 0 && x < utils.GAME_SIZE && y >= 0 && z >= 0 && z < utils.GAME_SIZE) {
            return this.getBlock(x, y, z);
        }
        if (y < 0) {
            return this.getBlock(x, 0, z);
        }
        if (y > utils.GAME_MAX_HEIGHT) {
            return null;
        }
        return true;
    }


    generateSurface() {
        const freq = utils.TERRAIN_GEN.frequency;
        const amp = utils.TERRAIN_GEN.amp;
        const exp = utils.TERRAIN_GEN.exp;

        // https://www.redblobgames.com/maps/terrain-from-noise/
        for (let x = 0; x < utils.GAME_SIZE; x++) {
            for (let z = 0; z < utils.GAME_SIZE; z++) {
                let e = 0;
                for (const octave of utils.TERRAIN_GEN.octaves) {
                    e += (1 / octave) * noise.simplex2(octave * x * freq,
                        octave * z * freq);
                }
                e = Math.pow(e, exp);
                const height = Math.floor(e * amp);

                if (height > 0) {
                    for (let y = 0; y < height; y++) {
                        this.placeBlock(x, y, z, this.getBlockType(height, y));
                    }
                }
            }
        }
    }

    meshCubes() {
        // arrays with vertices to buffer
        const positions_1 = [];
        const normals_1 = [];
        const indices_1 = [];
        const uvs_1 = [];

        const geometry = new THREE.BufferGeometry();

        for (let y = 0; y < utils.GAME_MAX_HEIGHT; ++y) {
            for (let z = 0; z < utils.GAME_SIZE; ++z) {
                for (let x = 0; x < utils.GAME_SIZE; ++x) {
                    const block = this.getBlock(x, y, z);
                    if (block) {
                        for (const { uvRow, dir, vertices } of utils.BLOCK_FACES) {
                            const neighbor = this.getNeighbors(x + dir[0], y + dir[1], z + dir[2], block);
                            if (!neighbor) {
                                const ndx = positions_1.length / 3;

                                //add to arrays for input into the buffer geometry
                                for (const { pos, uv } of vertices) {

                                    positions_1.push(x + pos[0], y + pos[1], z + pos[2]);
                                    normals_1.push(...dir);
                                    uvs_1.push(
                                        ((block.id + uv[0]) * utils.BLOCK_SIDE) /
                                        utils.BLOCK_TEXTURE_WIDTH,
                                        1 -
                                        ((uvRow + 1 - uv[1]) * utils.BLOCK_SIDE) /
                                        utils.BLOCK_TEXTURE_HEIGHT
                                    );
                                }
                                indices_1.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                            }
                        }
                    }
                }
            }
        }
        const positionNumComponents = 3;
        const normalNumComponents = 3;
        const uvNumComponents = 2;
        this.setGeoAttribs(geometry, positions_1, positionNumComponents, normals_1, normalNumComponents, uvs_1, uvNumComponents, indices_1);

        return geometry;
    }

    setGeoAttribs(geometry, posns, posnNumber, normals, normalNumber, uvs, uvNumber, indices) {
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(posns), posnNumber));
        geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), normalNumber));
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), uvNumber));
        geometry.setIndex(indices);
    }

    updateMesh() {
        const geometry = this.meshCubes();
        const { mat } = this;

        if (!this.mesh) {
            // MESH #2 - Cubes
            this.mesh = new THREE.Mesh(geometry, mat);
        } else {
            this.mesh.geometry = geometry;
        }
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

    }
}