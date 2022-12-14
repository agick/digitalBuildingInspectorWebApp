const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000000 );

//const stlModel = new THREE.STLLoader("/Users/andreasgoricke/CLionProjects/masterthesis/geometry/elephant_solid.stl");
const positionNumComponents = 3;
const normalNumComponents = 3;
const uvNumComponents = 2;
const colorNumComponents = 3;

window.api.receive("fromMain", (received) => {
    console.log(`Received ${received} from main process`);

    if(received.type == "geometry"){
        console.log("test");
        const positions = new Float32Array(received.data.vertices * positionNumComponents);
        const normals = new Float32Array(received.data.vertices * normalNumComponents);
        const uvs = new Float32Array(received.data.vertices * uvNumComponents);
        const colors = new Float32Array(received.data.vertices * colorNumComponents);
        positions.set(received.data.positions, 0);
        colors.set(received.data.colors,0);
        
        console.log(colors);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, positionNumComponents));
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(normals, normalNumComponents));
        geometry.setAttribute(
            'uvs',
            new THREE.BufferAttribute(uvs, uvNumComponents));
        geometry.setAttribute(
            'color',
            new THREE.BufferAttribute(colors, colorNumComponents));
        
        geometry.computeVertexNormals();
        const material = new THREE.MeshBasicMaterial({vertexColors: true, transparent: true, opacity: 0.2 });
        const mesh = new THREE.Mesh(geometry, material);
        
        scene.add( mesh );
    }
    
    
});

camera.position.set(0,0,2);
camera.lookAt(0,10000,0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xdddddd, 0);
document.body.appendChild( renderer.domElement );


const geometry = new THREE.BoxGeometry();

//scene.add(cube);
//const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
//scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 100, 100, 100 );
scene.add(new THREE.HemisphereLight(0xffffff,0xffffff,1.0))
scene.add( directionalLight );

const planeGeometry = new THREE.PlaneGeometry( 1000000, 1000000 );
const planeMaterial = new THREE.MeshBasicMaterial( {color: 0x888888, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
scene.add( plane );


const controls = new THREE.FlyControls( camera, renderer.domElement );
controls.dragToLook = true;
controls.movementSpeed = 10;
controls.rollSpeed = 1;



var lt = new Date();
function animate() {
    var now = new Date(),
    secs = (now - lt) / 1000;
    lt = now;
    requestAnimationFrame( animate );
    // UPDATE CONTROLS
    controls.update(1 * secs);

	renderer.render( scene, camera );
}
animate();



var loadTexture = function (url) {
    var textureLoader = new THREE.TextureLoader();
    return new Promise(function (resolve, reject) {
        var onDone = function (texture) {
            resolve(texture);
        };
        var onError = function (err) {
            reject(err)
        };
        textureLoader.load(url, onDone, function () {}, onError);
    });
};

/*process.dlopen = () => {
    throw new Error('Load native module is not safe')
  }
  const generateDistanceFieldWorkers = new Worker('js/workers/generateDistanceFieldWorker.js')
*/


const elephantSolidSTLPath = "/Users/andreasgoricke/CLionProjects/masterthesis/geometry/elephant_solid.stl";
const buildingSolidSTLPath = "/Users/andreasgoricke/CLionProjects/masterthesis/geometry/alignedIFCfile.stl";
const cottageSTLPath = "/Users/andreasgoricke/CLionProjects/masterthesis/geometry/alignedIFCfile.stl";
const loader = new STLLoader()


//Load new object

