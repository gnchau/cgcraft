import * as utils from "../GameUtils.js"

export class CameraManager extends THREE.PerspectiveCamera {
    // field of view, aspect ratio, near, far
    constructor(canvas, world) {
        super(
            60,
            window.width / window.innerHeight,
            0.1,
            600,
        );

        this.position.set(
            utils.GAME_SIZE / 2,
            utils.GAME_MAX_HEIGHT / 2,
            utils.GAME_SIZE / 2,
        );

        this.canvas = canvas;
        this.world = world;

        // Get the properties of the block in your hand.
        this.blockInHand = Object.entries(utils.BLOCK_TYPES)[1][1];

        this.originVector = new THREE.Vector3();
        this.directionVector = new THREE.Vector3();
        this.toVector = new THREE.Vector3();

        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
    }

    updateLight(scene) {
        scene.add(utils.AMBIENT_LIGHT);
    }

    getLookatBlockPosn() {
        const {originVector, directionVector, toVector} = this;
        this.getWorldDirection(directionVector);
        originVector.setFromMatrixPosition(this.matrixWorld);
        toVector.addVectors(
            originVector,
            directionVector.multiplyScalar(5)
        );

        return this.rayCaster(originVector, toVector);
    }

    rayCaster(originVector, toVector) {
        let dx = toVector.x - originVector.x;
        let dy = toVector.y - originVector.y;
        let dz = toVector.z - originVector.z;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

        dx /= len;
        dy /= len;
        dz /= len;

        let t = 0.0;
        let ix = Math.floor(originVector.x);
        let iy = Math.floor(originVector.y);
        let iz = Math.floor(originVector.z);

        const stepX = dx > 0 ? 1 : -1;
        const stepY = dy > 0 ? 1 : -1;
        const stepZ = dz > 0 ? 1 : -1;

        const txDelta = Math.abs(1 / dx);
        const tyDelta = Math.abs(1 / dy);
        const tzDelta = Math.abs(1 / dz);

        const xDist = stepX > 0 ? ix + 1 - originVector.x : originVector.x - ix;
        const yDist = stepY > 0 ? iy + 1 - originVector.y : originVector.y - iy;
        const zDist = stepZ > 0 ? iz + 1 - originVector.z : originVector.z - iz;

        let txMax = txDelta < Infinity ? txDelta * xDist : Infinity;
        let tyMax = tyDelta < Infinity ? tyDelta * yDist : Infinity;
        let tzMax = tzDelta < Infinity ? tzDelta * zDist : Infinity;

        let steppedIndex = -1;

        while (t <= len) {
            const block = this.world.getBlock(ix, iy, iz);
            if (block) {
                return {
                    position: [
                        originVector.x + t * dx,
                        originVector.y + t * dy,
                        originVector.z + t * dz,
                    ],
                    normal: [
                        steppedIndex === 0 ? -stepX : 0,
                        steppedIndex === 1 ? -stepY : 0,
                        steppedIndex === 2 ? -stepZ : 0,
                    ],
                    block,
                };
            }

            if (txMax < tyMax) {
                if (txMax < tzMax) {
                    ix += stepX;
                    t = txMax;
                    txMax += txDelta;
                    steppedIndex = 0;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            } else {
                if (tyMax < tzMax) {
                    iy += stepY;
                    t = tyMax;
                    tyMax += tyDelta;
                    steppedIndex = 1;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            }
        }
        return null;
    }
}
