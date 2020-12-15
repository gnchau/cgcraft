import * as utils from "../GameUtils.js"
import { PointerLockControls } from "../../three/examples/jsm/controls/PointerLockControls.js";

export class ControlManager extends PointerLockControls {
    constructor(camera, domElement, world, scene) {
        super(camera, domElement);
        this.camera = camera;
        this.world = world;

        // Lock mouse onto middle of screen
        this.addEventListener("lock", function(){});
        this.addEventListener("unlock", function(){});

        this.selectionOutline = new THREE.LineSegments(utils.BLOCK_OUTLINE,
            utils.OUTLINE_MATERIAL);
        this.selectionOutline.visible = false;

        scene.add(this.selectionOutline);

        // Lock when clicked on body
        const controls = this;
        document.body.addEventListener("click", function() {
            controls.lock();
        });

        // Log the inputs from the keyboard
        this.kbInputs = [];
        document.addEventListener("keydown", (e) => {
            controls.kbInputs.push(e.code);
        });
        document.addEventListener("keyup", (e) => {
            const arr = [];
            for (let i = 0; i < controls.kbInputs.length; i++) {
                if (controls.kbInputs[i] !== e.code) {
                    arr.push(controls.kbInputs[i]);
                }
            }
            controls.kbInputs = arr;
        });

        // mouse controls
        window.addEventListener(
            "mousedown",
            (event) => {
                event.preventDefault();

                // left click
                if (event.button === 0)
                    window.addEventListener(
                        "mouseup",
                        this.handleClick(false),
                    );

                if (event.button === 2)
                    window.addEventListener(
                        "mouseup",
                        this.handleClick(true),
                    );
            },
            { passive: false }
        );

        this.materialSelector = document.querySelectorAll("input.block");
        const materials = this.materialSelector;

        for (const material of materials) {
            material.addEventListener("click", (event) => {
                event.preventDefault();
            });

            if (material.id === camera.blockInHand.id) {
                material.seelcted = true;
            }
        }

        const box = new THREE.BoxGeometry(0.8, 1.75, 0.8);
        const boxMaterial = new THREE.MeshBasicMaterial({
            color: "white",
            side: THREE.FrontSide,
        });
        this.hitBox = new THREE.Mesh(box, boxMaterial);
        this.moveHitBox();
        scene.add(this.hitBox);

    }

    handleClick(inHand) {
        if (inHand) {
            this.placeBlock(this.camera.blockInHand)
        } else {
            this.placeBlock(utils.BLOCK_TYPES.NULL);
        }
    }

    advance() {
        // movement controls
        const { kbInputs, camera } = this;
        const currPosition = camera.position.clone();

        if (kbInputs.includes('KeyW')) {
            this.moveForward(utils.LATERAL_SPEED);
        }
        else if (kbInputs.includes('KeyA')) {
            this.moveRight(-1 * utils.LATERAL_SPEED);
        }
        else if (kbInputs.includes('KeyS')) {
            this.moveForward(-1 * utils.LATERAL_SPEED);
        }
        else if (kbInputs.includes('KeyD')) {
            this.moveRight(utils.LATERAL_SPEED);
        }
        else if (kbInputs.includes('Space')) {
            this.getObject().position.y += utils.Y_SPEED;
        }

        else if (kbInputs.includes('ShiftLeft')) {
            this.getObject().position.y -= utils.Y_SPEED;
        }
        else if (kbInputs.includes('Digit1')) {
            this.changeMaterials(1);
        }

        else if (kbInputs.includes('Digit2')) {
            this.changeMaterials(2);
        }

        else if (kbInputs.includes('Digit3')) {
            this.changeMaterials(3);
        }

        const newPosition = camera.position;
        this.invalidMovement(currPosition, newPosition);
        this.moveHitBox();
        this.manageOutOfBounds();

        const intersection = camera.getLookatBlockPosn();
        if (intersection) {
            const pos = intersection.position.map((v, ndx) => {
                return Math.ceil(v + intersection.normal[ndx] * -0.5) - 0.5;
            });
            this.selectionOutline.visible = true;
            this.selectionOutline.position.set(...pos);
        } else {
            this.selectionOutline.visible = false;
        }
    }

    changeMaterials(n) {
        if (n < 1 || n > 3) {
            return
        }
        const materials = this.materialSelector;
        for (const material of materials) {
            if (material.checked) {
                material.checked = false;
            }
        }

        const newMaterial = materials[n - 1];
        this.camera.blockInHand = Object.entries(
            utils.BLOCK_TYPES)
            [parseInt(newMaterial.id) + 1][1];
        newMaterial.checked = true;

    }

    moveHitBox() {
        const { hitBox, camera } = this;
        hitBox.position.set(
            camera.position.x,
            camera.position.y - 0.75,
            camera.position.z
        );
    }

    manageOutOfBounds() {
        const { camera } = this;
        if(camera.position.x > utils.GAME_SIZE || camera.position.z > utils.GAME_SIZE ||
            camera.position.x < 0 || camera.position.z < 0
            || camera.position.y > utils.GAME_MAX_HEIGHT || camera.position.y < 0) {
            this.teleportToOrigin();
        }
    }

    teleportToOrigin() {
        const {camera } = this;
        camera.position.set(
            utils.GAME_SIZE/2,
            utils.GAME_MAX_HEIGHT/5,
            utils.GAME_SIZE/2,
        );
        this.moveHitBox();
    }

    invalidMovement(currPosition, newPosition) {
        const { world, hitBox } = this;

        const dx = newPosition.x - currPosition.x;
        const dy = newPosition.y - currPosition.y;
        const dz = newPosition.z - currPosition.z;

        let canMoveX = true;
        let canMoveY = true;
        let canMoveZ = true;

        for (const vertex of hitBox.geometry.vertices) {
            const copy = vertex.clone();
            hitBox.localToWorld(copy);

            const nx = copy.x + dx;
            const ny = copy.y + dy;
            const nz = copy.z + dz;

            const ix = copy.x;
            const iy = copy.y;
            const iz = copy.z;

            if (canMoveX) {
                const block = world.getBlock(nx, iy, iz);
                if (block)
                    canMoveX = false;
            }
            if (canMoveY) {
                const block = world.getBlock(ix, ny, iz);
                if (block)
                    canMoveY = false;
            }
            if (canMoveZ) {
                const block = world.getBlock(ix, iy, nz);
                if (block)
                    canMoveZ = false;
            }
        }

        if (!canMoveX) this.getObject().position.x -= dx;
        if (!canMoveY) this.getObject().position.y -= dy;
        if (!canMoveZ) this.getObject().position.z -= dz;
    }

    placeBlock(block) {
        const { camera, world, hitBox } = this;
        const blockPosn = camera.getLookatBlockPosn();
        if (blockPosn) {
            const pos = blockPosn.position.map((v, ndx) => {
                return v + blockPosn.normal[ndx] * (block ? 0.5 : -0.5);
            });
            const fPos = pos.map((x) => {
                return Math.floor(x);
            });

            let canPlaceBlock = true;
            for (const vertex of hitBox.geometry.vertices) {
                const copy = vertex.clone();
                hitBox.localToWorld(copy);

                const vertPos = Object.values(copy).map(
                    (x) => { return Math.floor(x); });

                if (JSON.stringify(fPos) === JSON.stringify(vertPos))
                    canPlaceBlock = false;
            }

            if (canPlaceBlock) world.placeBlock(...pos, block);
        }
    }

}