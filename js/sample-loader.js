function loadSampleModel() {
    const sampleModelPath = 'models/Lucy100k.ply';
    loadingStatus.textContent = 'Loading sample model...';
    
    // Add error handling
    const loader = new THREE.PLYLoader();
    loader.load(
        sampleModelPath,
        // Success callback
        (geometry) => {
            // Existing success code
            loadPlyModel(sampleModelPath, 'Lucy Sample Model');
        },
        // Progress callback
        (xhr) => {
            loadingStatus.textContent = `Loading: ${Math.round((xhr.loaded / xhr.total) * 100)}%`;
        },
        // Error callback
        (error) => {
            console.error('Error loading sample model:', error);
            loadingStatus.textContent = `Error loading sample model: ${error.message || 'File not found'}`;
            // Try with absolute URL as fallback
            const fallbackUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/ply/binary/Lucy100k.ply';
            loadingStatus.textContent = 'Trying fallback URL...';
            loadPlyModel(fallbackUrl, 'Lucy Sample Model (Fallback) ');
        }
    );
}
