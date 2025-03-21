// Main application script for PLY 3D Model Viewer

// Get module classes from Three.js modules
const { OrbitControls } = THREE.OrbitControls;
const { PLYLoader } = THREE.PLYLoader;

// Global variables
let scene, camera, renderer, controls;
let modelContainer;
let loadingStatus, modelInfo;
let currentModel = null;
let isLoading = false;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Get DOM elements
    modelContainer = document.getElementById('model-container');
    loadingStatus = document.getElementById('loading-status');
    modelInfo = document.getElementById('model-info');
    
    // Set up event listeners
    document.getElementById('file-input').addEventListener('change', handleLocalFileSelect);
    document.getElementById('load-url').addEventListener('click', handleUrlLoad);
    document.getElementById('reset-view').addEventListener('click', resetView);
    
    // Initialize Three.js scene
    initThreeJs();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Initial status message
    loadingStatus.textContent = 'Ready to load PLY models';
}

function initThreeJs() {
    try {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xecf0f1);
        
        // Create camera
        const containerWidth = modelContainer.clientWidth;
        const containerHeight = modelContainer.clientHeight;
        camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
        camera.position.z = 5;
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerWidth, containerHeight);
        modelContainer.appendChild(renderer.domElement);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Add OrbitControls - using the correct constructor
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI;
        controls.minDistance = 1;
        controls.maxDistance = 100;
        
        // Add grid helper for reference
        const gridHelper = new THREE.GridHelper(10, 10);
        scene.add(gridHelper);
        
        // Add axes helper for orientation
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
    } catch (error) {
        console.error('Error initializing Three.js:', error);
        loadingStatus.textContent = `Error initializing 3D viewer: ${error.message}`;
        loadingStatus.style.color = 'red';
    }
}

function handleLocalFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if file is a PLY file
    if (!file.name.toLowerCase().endsWith('.ply')) {
        loadingStatus.textContent = 'Error: Please select a PLY file';
        loadingStatus.style.color = 'red';
        return;
    }
    
    loadingStatus.textContent = 'Loading model...';
    loadingStatus.style.color = '';
    
    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file);
    
    // Load the PLY file
    loadPlyModel(fileUrl, file.name);
}

function handleUrlLoad() {
    const url = document.getElementById('url-input').value.trim();
    if (!url) {
        loadingStatus.textContent = 'Error: Please enter a URL';
        loadingStatus.style.color = 'red';
        return;
    }
    
    // Check if URL is a Google Drive link and convert if necessary
    let processedUrl = url;
    if (url.includes('drive.google.com')) {
        // Extract file ID from Google Drive URL
        const match = url.match(/[-\w]{25,}/);
        if (match) {
            const fileId = match[0];
            processedUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
    }
    
    loadingStatus.textContent = 'Loading model from URL...';
    loadingStatus.style.color = '';
    
    // Load the PLY file from URL
    loadPlyModel(processedUrl, 'Model from URL');
}

function loadPlyModel(url, modelName) {
    if (isLoading) {
        console.log('Already loading a model, please wait...');
        return;
    }
    
    isLoading = true;
    
    // Create PLY loader - using the correct constructor
    const loader = new PLYLoader();
    
    // Set timeout for loading
    const loadingTimeout = setTimeout(() => {
        if (isLoading) {
            isLoading = false;
            loadingStatus.textContent = 'Error: Loading timed out. Try another file or URL.';
            loadingStatus.style.color = 'red';
        }
    }, 30000); // 30 second timeout
    
    // Load the model
    loader.load(
        url,
        // onLoad callback
        (geometry) => {
            clearTimeout(loadingTimeout);
            isLoading = false;
            
            try {
                // Remove previous model if exists
                if (currentModel) {
                    scene.remove(currentModel);
                }
                
                // Compute vertex normals if they don't exist
                geometry.computeVertexNormals();
                
                // Create material
                const material = new THREE.MeshStandardMaterial({
                    color: 0x3498db,
                    flatShading: true,
                    side: THREE.DoubleSide
                });
                
                // Create mesh
                const mesh = new THREE.Mesh(geometry, material);
                
                // Center the model
                geometry.computeBoundingBox();
                const boundingBox = geometry.boundingBox;
                const center = new THREE.Vector3();
                boundingBox.getCenter(center);
                mesh.position.set(-center.x, -center.y, -center.z);
                
                // Scale model to fit view
                const size = new THREE.Vector3();
                boundingBox.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 5 / maxDim;
                mesh.scale.set(scale, scale, scale);
                
                // Add to scene
                scene.add(mesh);
                currentModel = mesh;
                
                // Update status
                loadingStatus.textContent = 'Model loaded successfully';
                loadingStatus.style.color = 'green';
                modelInfo.textContent = `Model: ${modelName} | Vertices: ${geometry.attributes.position.count}`;
                
                // Reset view
                resetView();
            } catch (error) {
                console.error('Error processing PLY file:', error);
                loadingStatus.textContent = `Error processing model: ${error.message}`;
                loadingStatus.style.color = 'red';
            }
        },
        // onProgress callback
        (xhr) => {
            if (xhr.lengthComputable) {
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                loadingStatus.textContent = `Loading: ${Math.round(percentComplete)}%`;
            } else {
                loadingStatus.textContent = `Loaded ${Math.round(xhr.loaded / 1024)} KB...`;
            }
        },
        // onError callback
        (error) => {
            clearTimeout(loadingTimeout);
            isLoading = false;
            console.error('Error loading PLY file:', error);
            loadingStatus.textContent = `Error loading model: ${error.message || 'Could not load file'}`;
            loadingStatus.style.color = 'red';
        }
    );
}

function resetView() {
    if (currentModel) {
        // Reset camera position
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        
        // Reset controls
        controls.reset();
    }
}

function onWindowResize() {
    const containerWidth = modelContainer.clientWidth;
    const containerHeight = modelContainer.clientHeight;
    
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(containerWidth, containerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}
