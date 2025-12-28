// painting.js

function showLoadingBar() {
    const loadingBar = document.createElement('div');
    loadingBar.className = 'loading-bar';
    loadingBar.innerHTML = '<div class="loading-inner"></div>';
    document.querySelector('.painting-image').innerHTML = '';
    document.querySelector('.painting-image').appendChild(loadingBar);
}

function hideLoadingBar() {
    const loadingBar = document.querySelector('.loading-bar');
    if (loadingBar) loadingBar.remove();
}

async function fetchRandomPainting(maxAttempts = 10) {
    showLoadingBar();
    const searchRes = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&medium=Paintings&q=*');
    const searchData = await searchRes.json();
    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
        hideLoadingBar();
        document.querySelector('h2').textContent = '';
        document.querySelector('h3').textContent = '';
        document.querySelector('.painting-image').innerHTML = 'No paintings found.';
        return;
    }
    let paintingFound = false;
    let attempts = 0;
    let objData = null;
    while (!paintingFound && attempts < maxAttempts) {
        const randomId = searchData.objectIDs[Math.floor(Math.random() * searchData.objectIDs.length)];
        const objRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomId}`);
        objData = await objRes.json();
        if (objData.primaryImageSmall) {
            paintingFound = true;
        }
        attempts++;
    }
    hideLoadingBar();
    if (paintingFound && objData) {
        document.querySelector('h2').textContent = objData.title || 'Untitled';
        document.querySelector('h3').textContent = (objData.artistDisplayName ? 'by ' + objData.artistDisplayName : '') +
            (objData.objectDate ? ' (' + objData.objectDate + ')' : '');
        document.querySelector('.painting-image').innerHTML = `
            <div class="painting-center">
                <img src="${objData.primaryImageSmall}" alt="Painting">
                <p style="color:#D3D3D3; padding: 10px 0;">
                    Medium: ${objData.medium || 'Unknown'} // Size: ${objData.dimensions || 'Unknown'}
                </p>
            </div>
        `;
    } else {
        document.querySelector('h2').textContent = '';
        document.querySelector('h3').textContent = '';
        document.querySelector('.painting-image').innerHTML = 'Could not find a painting with an image. Please try again.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchRandomPainting();
    document.querySelector('.discover-btn').addEventListener('click', function() {
        location.reload();
    });
});
