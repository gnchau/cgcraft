import World from "../game/world/World.js"
import {CameraManager} from "../game/player/CameraManager.js";
import {ControlManager} from "../game/player/ControlManager.js";
import * as utils from "../game/GameUtils.js"
import {GLTFLoader} from "../three/examples/jsm/loaders/GLTFLoader.js";
import {DRACOLoader} from "../three/examples/jsm/loaders/DRACOLoader.js";
import {OBJLoader} from "../three/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "../three/examples/jsm/loaders/MTLLoader.js";

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
    const meshLoader = new OBJLoader();
    loadMeshFromPath(meshLoader, utils.OBJ_CLOUDS.path, utils.OBJ_CLOUDS.position, utils.OBJ_CLOUDS.scale);
    var mtlLoader = new MTLLoader();
    mtlLoader.setPath('assets/bird/');
    var url = utils.OBJ_BIRD.mat_path;
    mtlLoader.load( url, function( materials ) {
        const px = utils.OBJ_BIRD.position[0];
        const py = utils.OBJ_BIRD.position[1];
        const pz = utils.OBJ_BIRD.position[2];

        const sx = utils.OBJ_BIRD.scale[0];
        const sy = utils.OBJ_BIRD.scale[1];
        const sz = utils.OBJ_BIRD.scale[2];

        materials.preload();

        var objLoader = new OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath(utils.OBJ_BIRD.path);
        objLoader.load(utils.OBJ_BIRD.name, function ( object ) {

            object.scale.set(sx, sy, sz);
            object.position.set(px, py, pz);
            scene.add( object );

        });

    });


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

    function loadMeshFromPath(meshLoader, pathToFile, posn, scale) {
        // Load a glTF resource
        meshLoader.load(
            // resource URL
            pathToFile,
            // called when the resource is loaded
            function (object) {

                object.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.material.ambient.setHex(0xFF0000);
                        child.material.color.setHex(0x00FF00);
                    }
                });
                object.scale.set(scale[0], scale[1], scale[2]);
                object.position.set(posn[0], posn[1], posn[2]);
                scene.add( object );
            },
        );
    }



    init();
}

main();