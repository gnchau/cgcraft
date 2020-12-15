import World from "../game/world/World.js"
import {CameraManager} from "../game/player/CameraManager.js";
import {ControlManager} from "../game/player/ControlManager.js";
import * as utils from "../game/GameUtils.js"
import {GLTFLoader} from "../three/examples/jsm/loaders/GLTFLoader.js";
import {DRACOLoader} from "../three/examples/jsm/loaders/DRACOLoader.js";

function main() {
    const canvas = document.querySelector("#can");
    const renderer = new THREE.WebGLRenderer({canvas});
    let camera;
    let world;
    let controls;

    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();

    // I used the grass, dirt, and stone blocks from the 'OCD' tp: https://www.planetminecraft.com/texture-pack/ocd-pack/
    // TEXTURE 1 - textures.png
    const texture = textureLoader.load("assets/textures.png");
    texture.magFilter = THREE.NearestFilter
    texture.minFiler = THREE.NearestFilter

    // MESH # 1 - SKY DOME (Sphere Mesh)
    var skyGeo = new THREE.SphereGeometry(200, 25, 25);

    // TEXTURE # 2 - skydome.jpg
    var skyTexture = textureLoader.load("assets/skydome.jpg");
    var material = new THREE.MeshPhongMaterial({
        map: skyTexture,
    });
    var sky = new THREE.Mesh(skyGeo, material);
    sky.material.side = THREE.BackSide;
    scene.add(sky);


    const modelLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('../three/examples/js/libs/draco/');
    modelLoader.setDRACOLoader(dracoLoader);
    loadModelFromPath(modelLoader, utils.DRAGON.path, utils.DRAGON.position, utils.DRAGON.scale);
    loadModelFromPath(modelLoader, utils.CLOUD.path, utils.CLOUD.position, utils.CLOUD.scale);

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const unequalSize = canvas.width !== width || canvas.height !== height
        if (unequalSize) {
            renderer.setSize(width, height, false);
        }
        return unequalSize;
    }

    function init() {
        world = new World();
        camera = new CameraManager(canvas, world);
        controls = new ControlManager(camera, document.body, world, scene, canvas);
        world.setTexture(texture);
        scene.add(utils.AMBIENT_LIGHT);
        mainPlayLoop();
    }

    function mainPlayLoop() {
        requestAnimationFrame(mainPlayLoop);
        controls.advance();
        camera.updateLight(scene, world);
        world.updateTerrain(scene);

        render();
    }

    function loadModelFromPath(modelLoader, pathToFile, posn, scale) {
        // Load a glTF resource
        modelLoader.load(
            // resource URL
            pathToFile,
            // called when the resource is loaded
            function ( gltf ) {
                scene.add( gltf.scene );
                gltf.scene.scale.set(scale[0], scale[1], scale[2]);
                gltf.scene.position.set(posn[0], posn[1], posn[2])

                gltf.animations; // Array<THREE.AnimationClip>
                gltf.scene; // THREE.Group
                gltf.scenes; // Array<THREE.Group>
                gltf.cameras; // Array<THREE.Camera>
                gltf.asset; // Object
            },
        );
    }


    init();
}

main();