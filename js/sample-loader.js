// Add sample model loading functionality with fallback options
function loadSampleModel() {
    // Primary path to the sample model
    const sampleModelPath = 'models/Lucy100k.ply';
    loadingStatus.textContent = 'Loading sample model...';
    
    // Create PLY loader with error handling
    const loader = new THREE.PLYLoader();
    
    // Set loading flag
    isLoading = true;
    
    // Set timeout for loading
    const loadingTimeout = setTimeout(() => {
        if (isLoading) {
            isLoading = false;
            tryFallbackModel();
        }
    }, 10000); // 10 second timeout
    
    // Try to load the model
    loader.load(
        sampleModelPath,
        // Success callback
        (geometry) => {
            clearTimeout(loadingTimeout);
            isLoading = false;
            
            try {
                // Remove previous model if exists
                if (currentModel) {
                    scene.remove(currentModel);
                }
                
                // Process geometry and display model
                processModelGeometry(geometry, 'Lucy Sample Model');
            } catch (error) {
                console.error('Error processing sample model:', error);
                loadingStatus.textContent = `Error processing model: ${error.message}`;
                loadingStatus.style.color = 'red';
                tryFallbackModel();
            }
        },
        // Progress callback
        (xhr) => {
            if (xhr.lengthComputable) {
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                loadingStatus.textContent = `Loading: ${Math.round(percentComplete)}%`;
            } else {
                loadingStatus.textContent = `Loaded ${Math.round(xhr.loaded / 1024)} KB...`;
            }
        },
        // Error callback
        (error) => {
            clearTimeout(loadingTimeout);
            isLoading = false;
            console.error('Error loading sample model:', error);
            loadingStatus.textContent = 'Local sample model not found. Trying fallback...';
            tryFallbackModel();
        }
    );
}

// Function to process model geometry
function processModelGeometry(geometry, modelName) {
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
}

// Function to try loading from fallback URL
function tryFallbackModel() {
    loadingStatus.textContent = 'Trying to load from external source...';
    loadingStatus.style.color = '';
    
    // Fallback URL from Three.js repository
    const fallbackUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/ply/binary/Lucy100k.ply';
    
    // Load from fallback URL
    const loader = new THREE.PLYLoader();
    
    // Set loading flag
    isLoading = true;
    
    loader.load(
        fallbackUrl,
        // Success callback
        (geometry) => {
            isLoading = false;
            try {
                // Process geometry and display model
                processModelGeometry(geometry, 'Lucy Sample Model (Fallback)');
            } catch (error) {
                console.error('Error processing fallback model:', error);
                loadingStatus.textContent = `Error processing fallback model: ${error.message}`;
                loadingStatus.style.color = 'red';
            }
        },
        // Progress callback
        (xhr) => {
            if (xhr.lengthComputable) {
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                loadingStatus.textContent = `Loading fallback: ${Math.round(percentComplete)}%`;
            } else {
                loadingStatus.textContent = `Loaded ${Math.round(xhr.loaded / 1024)} KB...`;
            }
        },
        // Error callback
        (error) => {
            isLoading = false;
            console.error('Error loading fallback model:', error);
            loadingStatus.textContent = 'Could not load any sample model. Please try uploading your own PLY file.';
            loadingStatus.style.color = 'red';
        }
    );
}

// Add sample model button to the existing init function
document.addEventListener('DOMContentLoaded', function() {
    // Existing init code will run
    
    // Add sample model button
    const sampleButton = document.createElement('button');
    sampleButton.id = 'load-sample';
    sampleButton.textContent = 'Load Sample Model';
    sampleButton.addEventListener('click', loadSampleModel);
    
    // Insert after reset view button
    const resetButton = document.getElementById('reset-view');
    resetButton.parentNode.insertBefore(sampleButton, resetButton.nextSibling);
    resetButton.parentNode.insertBefore(document.createElement('br'), sampleButton);
});
