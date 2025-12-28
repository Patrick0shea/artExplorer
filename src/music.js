// music.js
function showLoadingBar() {
    const albumCover = document.querySelector('.album-cover');
    albumCover.innerHTML = '';
    const loadingBar = document.createElement('div');
    loadingBar.className = 'loading-bar';
    loadingBar.innerHTML = '<div class="loading-inner"></div>';
    albumCover.appendChild(loadingBar);
}
function hideLoadingBar() {
    const loadingBar = document.querySelector('.album-cover .loading-bar');
    if (loadingBar) loadingBar.remove();
}
async function fetchRandomMusicBrainzAlbum(maxAttempts = 10) {
    showLoadingBar();
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let albumFound = false;
    let attempts = 0;
    let randomRelease = null;
    while (!albumFound && attempts < maxAttempts) {
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        const res = await fetch(`https://musicbrainz.org/ws/2/release/?query=release:${randomLetter}*&fmt=json&limit=100`);
        const data = await res.json();
        const releases = data.releases;
        if (releases && releases.length > 0) {
            // Shuffle releases to randomize selection
            for (let i = releases.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [releases[i], releases[j]] = [releases[j], releases[i]];
            }
            for (const release of releases) {
                if (release.id) {
                    try {
                        const coverRes = await fetch(`https://coverartarchive.org/release/${release.id}`);
                        if (coverRes.ok) {
                            const coverData = await coverRes.json();
                            if (coverData.images && coverData.images[0] && coverData.images[0].thumbnails && coverData.images[0].thumbnails.large) {
                                albumFound = true;
                                randomRelease = release;
                                randomRelease.coverUrl = coverData.images[0].thumbnails.large;
                                break;
                            }
                        }
                    } catch (e) {
                        // Ignore errors, fallback to next
                    }
                }
            }
        }
        attempts++;
    }
    hideLoadingBar();
    if (albumFound && randomRelease) {
        document.querySelector('h2').textContent = randomRelease.title || 'Untitled';
        document.querySelector('h3').textContent = randomRelease['artist-credit']?.[0]?.name ? 'by ' + randomRelease['artist-credit'][0].name : '';
        document.querySelector('.album-cover').innerHTML = `<img src="${randomRelease.coverUrl}" alt="Album cover" style="max-width:300px; border-radius:12px; box-shadow:0 2px 12px #000;">`;
        // Add Google search link
        const albumTitle = encodeURIComponent(randomRelease.title || '');
        const artistName = encodeURIComponent(randomRelease['artist-credit']?.[0]?.name || '');
        const googleUrl = `https://www.google.com/search?q=${albumTitle}+${artistName}`;
        document.querySelector('.album-cover').innerHTML += `<div style='margin-top:18px;'><a href="${googleUrl}" target="_blank" style="color:#00FFFF; font-size:1.1em; text-decoration:underline;">Listen to the album here</a></div>`;
        document.querySelector('.tracklist-section').innerHTML = '';
    } else {
        document.querySelector('h2').textContent = '';
        document.querySelector('h3').textContent = '';
        document.querySelector('.album-cover').innerHTML = 'Could not find an album with a cover image. Please try again.';
        document.querySelector('.tracklist-section').innerHTML = '';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    fetchRandomMusicBrainzAlbum();
    document.querySelector('.discover-btn').addEventListener('click', function() {
        location.reload();
    });
});
