// Scene setup
let scene, camera, renderer;
let particleNets = [];
let wind = { x: 0, y: 0, z: 0 };
let windDecay = 0.95;
let time = 0;

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 50;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create particle nets
    createParticleNets();

    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Start animation
    animate();
}

// Create multiple particle net-like 3D objects
function createParticleNets() {
    const count = 15; // Number of particle nets

    for (let i = 0; i < count; i++) {
        const particleNet = createSingleParticleNet();

        // Random position
        particleNet.userData.originalPosition = {
            x: (Math.random() - 0.5) * 80,
            y: (Math.random() - 0.5) * 80,
            z: (Math.random() - 0.5) * 80
        };

        particleNet.position.set(
            particleNet.userData.originalPosition.x,
            particleNet.userData.originalPosition.y,
            particleNet.userData.originalPosition.z
        );

        // Random rotation speed for regular movement
        particleNet.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        };

        // Wind influence properties
        particleNet.userData.velocity = { x: 0, y: 0, z: 0 };
        particleNet.userData.mass = 0.5 + Math.random() * 0.5;
        particleNet.userData.originalVertices = [];

        scene.add(particleNet);
        particleNets.push(particleNet);
    }
}

// Create a single particle net (wireframe sphere with deformable geometry)
function createSingleParticleNet() {
    const geometry = new THREE.IcosahedronGeometry(2, 1);

    // Store original vertices for deformation
    const positions = geometry.attributes.position;
    const originalVertices = [];
    for (let i = 0; i < positions.count; i++) {
        originalVertices.push({
            x: positions.getX(i),
            y: positions.getY(i),
            z: positions.getZ(i)
        });
    }

    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.originalVertices = originalVertices;

    return mesh;
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Keyboard controls for wind
const keys = {};

function onKeyDown(event) {
    keys[event.key] = true;
    updateWind();
}

function onKeyUp(event) {
    keys[event.key] = false;
    updateWind();
}

function updateWind() {
    const windStrength = 0.5;

    // Reset wind
    wind.x = 0;
    wind.y = 0;
    wind.z = 0;

    // Arrow keys control wind direction
    if (keys['ArrowUp']) {
        wind.y = windStrength;
    }
    if (keys['ArrowDown']) {
        wind.y = -windStrength;
    }
    if (keys['ArrowLeft']) {
        wind.x = -windStrength;
    }
    if (keys['ArrowRight']) {
        wind.x = windStrength;
    }

    // Update UI
    updateWindInfo();
}

function updateWindInfo() {
    const windInfo = document.getElementById('windInfo');
    if (wind.x === 0 && wind.y === 0 && wind.z === 0) {
        windInfo.textContent = 'None';
    } else {
        const directions = [];
        if (keys['ArrowUp']) directions.push('Up');
        if (keys['ArrowDown']) directions.push('Down');
        if (keys['ArrowLeft']) directions.push('Left');
        if (keys['ArrowRight']) directions.push('Right');
        windInfo.textContent = directions.join(' + ');
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Update each particle net
    particleNets.forEach((particleNet, index) => {
        const userData = particleNet.userData;

        // Check if wind is active
        const isWindActive = wind.x !== 0 || wind.y !== 0 || wind.z !== 0;

        if (isWindActive) {
            // Apply wind force
            const force = {
                x: wind.x / userData.mass,
                y: wind.y / userData.mass,
                z: wind.z / userData.mass
            };

            userData.velocity.x += force.x;
            userData.velocity.y += force.y;
            userData.velocity.z += force.z;

            // Apply velocity to position
            particleNet.position.x += userData.velocity.x;
            particleNet.position.y += userData.velocity.y;
            particleNet.position.z += userData.velocity.z;

            // Deform the mesh based on wind
            deformMeshByWind(particleNet, wind);

            // Add rotation based on wind
            particleNet.rotation.x += wind.y * 0.01;
            particleNet.rotation.y += wind.x * 0.01;

        } else {
            // Regular movement - gentle floating and rotation
            const floatOffset = {
                x: Math.sin(time + index) * 0.1,
                y: Math.cos(time + index * 0.5) * 0.1,
                z: Math.sin(time * 0.7 + index * 0.3) * 0.1
            };

            particleNet.position.x = userData.originalPosition.x + floatOffset.x;
            particleNet.position.y = userData.originalPosition.y + floatOffset.y;
            particleNet.position.z = userData.originalPosition.z + floatOffset.z;

            // Regular rotation
            particleNet.rotation.x += userData.rotationSpeed.x;
            particleNet.rotation.y += userData.rotationSpeed.y;
            particleNet.rotation.z += userData.rotationSpeed.z;

            // Reset velocity
            userData.velocity.x *= 0.9;
            userData.velocity.y *= 0.9;
            userData.velocity.z *= 0.9;

            // Restore original shape gradually
            restoreMeshShape(particleNet);
        }

        // Keep particles within bounds
        const bound = 100;
        if (Math.abs(particleNet.position.x) > bound) {
            particleNet.position.x = userData.originalPosition.x;
            userData.velocity.x = 0;
        }
        if (Math.abs(particleNet.position.y) > bound) {
            particleNet.position.y = userData.originalPosition.y;
            userData.velocity.y = 0;
        }
        if (Math.abs(particleNet.position.z) > bound) {
            particleNet.position.z = userData.originalPosition.z;
            userData.velocity.z = 0;
        }
    });

    // Rotate camera slightly for better view
    camera.position.x = Math.sin(time * 0.1) * 5;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Deform mesh vertices based on wind direction
function deformMeshByWind(mesh, wind) {
    const geometry = mesh.geometry;
    const positions = geometry.attributes.position;
    const originalVertices = mesh.userData.originalVertices;

    const windMagnitude = Math.sqrt(wind.x * wind.x + wind.y * wind.y + wind.z * wind.z);

    if (windMagnitude > 0) {
        for (let i = 0; i < positions.count; i++) {
            const orig = originalVertices[i];

            // Calculate how much this vertex should be affected by wind
            // Vertices on the windward side get pushed more
            const dotProduct = (orig.x * wind.x + orig.y * wind.y + orig.z * wind.z);
            const influence = Math.max(0, dotProduct) * 0.3;

            // Deform vertex
            const newX = orig.x + wind.x * influence;
            const newY = orig.y + wind.y * influence;
            const newZ = orig.z + wind.z * influence;

            positions.setXYZ(i, newX, newY, newZ);
        }

        positions.needsUpdate = true;
    }
}

// Restore mesh to original shape
function restoreMeshShape(mesh) {
    const geometry = mesh.geometry;
    const positions = geometry.attributes.position;
    const originalVertices = mesh.userData.originalVertices;

    const restoreSpeed = 0.1;

    for (let i = 0; i < positions.count; i++) {
        const orig = originalVertices[i];
        const currentX = positions.getX(i);
        const currentY = positions.getY(i);
        const currentZ = positions.getZ(i);

        // Lerp back to original position
        const newX = currentX + (orig.x - currentX) * restoreSpeed;
        const newY = currentY + (orig.y - currentY) * restoreSpeed;
        const newZ = currentZ + (orig.z - currentZ) * restoreSpeed;

        positions.setXYZ(i, newX, newY, newZ);
    }

    positions.needsUpdate = true;
}

// Start the application
init();
