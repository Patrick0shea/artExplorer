// poem.js
function showLoadingBar() {
    const loadingBar = document.createElement('div');
    loadingBar.className = 'loading-bar';
    loadingBar.innerHTML = '<div class="loading-inner"></div>';
    const container = document.getElementById('poem-container');
    container.innerHTML = '';
    container.appendChild(loadingBar);
}
function hideLoadingBar() {
    const loadingBar = document.querySelector('#poem-container .loading-bar');
    if (loadingBar) loadingBar.remove();
}
async function fetchRandomPoem(maxAttempts = 10) {
    showLoadingBar();
    let poem = null;
    let attempts = 0;
    while (attempts < maxAttempts) {
        const response = await fetch('https://poetrydb.org/random');
        const data = await response.json();
        poem = data[0];
        if (poem.lines.length <= 30) break;
        attempts++;
    }
    hideLoadingBar();
    if (poem && poem.lines.length <= 30) {
        document.querySelector('h2').textContent = poem.title;
        document.querySelector('h3').textContent = 'by ' + poem.author;
        document.getElementById('poem-container').innerHTML = poem.lines.join('<br>')
        // Add Google search link
        const poemTitle = encodeURIComponent(poem.title || '');
        const authorName = encodeURIComponent(poem.author || '');
        const googleUrl = `https://www.google.com/search?q=${poemTitle}+${authorName}+poem`;
        document.querySelector('.google-link').innerHTML = `<a href="${googleUrl}" target="_blank" style="color:#00FFFF; font-size:1.1em; text-decoration:underline;">More details about the poem here</a>`;
    } else {
        document.querySelector('h2').textContent = '';
        document.querySelector('h3').textContent = '';
        document.getElementById('poem-container').innerHTML = 'Could not find a short poem. Please try again.';
        document.querySelector('.google-link').innerHTML = '';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    fetchRandomPoem();
    document.querySelector('.discover-btn').addEventListener('click', function() {
        location.reload();
    });
});
