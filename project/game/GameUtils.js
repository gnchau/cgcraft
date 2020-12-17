export const GAME_SIZE = 64;
export const GAME_MAX_HEIGHT = 128;
//export const RANDOM_SEED = 4300;

export const CLOUD=  {
    path : "assets/clouds/scene.gltf",
    position : [-GAME_SIZE, GAME_MAX_HEIGHT/7, GAME_SIZE/2],
    scale: [1,1,1]
}
export const DRAGON = {
    path : "assets/dragon/scene.gltf",
    position : [-GAME_SIZE/2, GAME_MAX_HEIGHT/5, 0],
    scale: [0.25, 0.25, 0.25]
}

export const OBJ_CLOUDS = {
    path : "assets/cloud.obj",
    position : [GAME_SIZE/2, GAME_MAX_HEIGHT/7, GAME_SIZE/2],
    scale: [0.25, 0.25, 0.25]
}

export const OBJ_BIRD = {
    path : "assets/bird/free_bird.obj",
    mat_path : "free_bird.mtl",
    position : [GAME_SIZE/2, -130, GAME_SIZE/2],
    scale: [20, 20, 20]
}

export const LIGHT_VARS = {
    color : 0xffffff,
    intensity : 0.9,
    posn : [0, 128, 128],
}

export const AMBIENT_LIGHT = new THREE.AmbientLight(LIGHT_VARS.color, LIGHT_VARS.intensity);
export const PLACEMENT_DISTANCE = 6;

// Constants for Terrain generation
export const TERRAIN_GEN = {
    frequency : 1/150,
    amp : 30,
    exp : 0.7,
    octaves : [4, 2, 8],
}

export const BLOCK_TYPES = {
    NULL : 0,
    GRASS : {id : 0},
    DIRT : {id : 1},
    STONE: {id : 2},
};

export const BLOCK_FACES = [ // left, right, bottom, top, back, front
    {
        uvRow: 0,
        dir: [-1, 0, 0],
        vertices: [
            { pos: [0, 1, 0], uv: [0, 1] },
            { pos: [0, 0, 0], uv: [0, 0] },
            { pos: [0, 1, 1], uv: [1, 1] },
            { pos: [0, 0, 1], uv: [1, 0] },
        ],
    },
    {
        uvRow: 0,
        dir: [1, 0, 0],
        vertices: [
            { pos: [1, 1, 1], uv: [0, 1] },
            { pos: [1, 0, 1], uv: [0, 0] },
            { pos: [1, 1, 0], uv: [1, 1] },
            { pos: [1, 0, 0], uv: [1, 0] },
        ],
    },
    {
        uvRow: 1,
        dir: [0, -1, 0],
        vertices: [
            { pos: [1, 0, 1], uv: [1, 0] },
            { pos: [0, 0, 1], uv: [0, 0] },
            { pos: [1, 0, 0], uv: [1, 1] },
            { pos: [0, 0, 0], uv: [0, 1] },
        ],
    },
    {
        uvRow: 2,
        dir: [0, 1, 0],
        vertices: [
            { pos: [0, 1, 1], uv: [1, 1] },
            { pos: [1, 1, 1], uv: [0, 1] },
            { pos: [0, 1, 0], uv: [1, 0] },
            { pos: [1, 1, 0], uv: [0, 0] },
        ],
    },
    {
        uvRow: 0,
        dir: [0, 0, -1],
        vertices: [
            { pos: [1, 0, 0], uv: [0, 0] },
            { pos: [0, 0, 0], uv: [1, 0] },
            { pos: [1, 1, 0], uv: [0, 1] },
            { pos: [0, 1, 0], uv: [1, 1] },
        ],
    },
    {
        uvRow: 0,
        dir: [0, 0, 1],
        vertices: [
            { pos: [0, 0, 1], uv: [0, 0] },
            { pos: [1, 0, 1], uv: [1, 0] },
            { pos: [0, 1, 1], uv: [0, 1] },
            { pos: [1, 1, 1], uv: [1, 1] },
        ],
    },
];

export const LATERAL_SPEED = 0.17;
export const Y_SPEED = 0.4;
export const BLOCK_SIDE = 64;
export const BLOCK_TEXTURE_WIDTH = 192;
export const BLOCK_TEXTURE_HEIGHT = 192;

export const BLOCK_OUTLINE = new THREE.EdgesGeometry(
    new THREE.BoxGeometry(1.01, 1.01, 1.01)
);


export const OUTLINE_MATERIAL = new THREE.LineBasicMaterial({
    color: "white",
    fog: false,
    linewidth: 60,
    opacity: 1.0,
    transparent: true,
    depthTest: true,
});

