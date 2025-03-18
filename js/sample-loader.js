// Add sample model loading functionality
function loadSampleModel() {
    const sampleModelPath = 'models/Lucy100k.ply';
    loadingStatus.textContent = 'Loading sample model...';
    loadPlyModel(sampleModelPath, 'Lucy Sample Model');
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
