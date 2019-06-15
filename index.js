let meca3 = require("meca3");
let THREE = require("three");

// INITIALIZATION OF 3D SCENE

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// The points in simulation are represented as spheres of different colors.
let geometry = new THREE.SphereGeometry(5);
let colors = [0xffff00, 0x00ffff, 0xff00ff];
let materials = colors.map((color) => new THREE.MeshBasicMaterial({color: color}));
let spheres = materials.map((material) => new THREE.Mesh(geometry, material));
scene.add(...spheres);

// INITIALIZATION OF THE SIMULATION

const zeros = meca3.Vector3.zeros;
let a = 10; // length of the equilateral triangle
let framerate = 60; // framerate of animation in frame/s
let delta = 1 / framerate; // time step of animation in s
let dt = delta / 1024; // time step = delta / number of samples per frame
let freq = 1 / 2, pulse = freq * 2 * Math.PI; // frequency and pulsation of oscillation in Hz resp. rad/s
let points = [meca3.Point.zeros(1), q = meca3.Point.zeros(1), r = meca3.Point.zeros(2)]; // points in the field

// initial positions of points above
let u0 = [meca3.Vector3.ex.mul(a), meca3.Vector3.ex.mul(-a), meca3.Vector3.ey.mul(a * Math.sqrt(3) / 2)];

// oscillating field, each point is linked to the other with a spring of given pulsation
let makeField = (points) =>
    (u) => points.reduce((acc, point) => acc.add(point.position.sub(u).mul(pulse ** 2)), meca3.Vector3.zeros);

let solver = new Solver(makeField(points), dt);
let field = new meca3.Field(points, solver, points[0], true);
let time = 0;

// initializing each point with given position and no speed
points.forEach((point, index) => {point.init(u0[index], zeros.copy())});

camera.position.x = 0;
camera.position.y = a * Math.sqrt(3) / 4;
camera.position.z = 100;

// SIMULATION LOOP

function animate() {

    // updating spheres position in sphere according to current position of points in field
    spheres.forEach((sphere, index) => {
        sphere.position.x = field.points[index].x;
        sphere.position.y = field.points[index].y;
        sphere.position.z = field.points[index].z;
        console.log(`points[${index}](${time}) = ${field.points[index].position.toString()}`);
    });

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // updating the position of the points in field
    for (let t = 0; t < delta; t += dt) {
        field.update();
    }

    time += delta;
}

animate();