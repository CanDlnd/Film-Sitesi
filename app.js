// DOM Elements
const mediaTypeSelect = document.getElementById('mediaType');
const genreSelect = document.getElementById('genre');
const recommendBtn = document.getElementById('recommendBtn');
const recommendationsDiv = document.getElementById('recommendations');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('modal-details');
const closeModal = document.querySelector('.close');

// Event Listeners
mediaTypeSelect.addEventListener('change', loadGenres);
recommendBtn.addEventListener('click', getRecommendation);
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// Load genres when page loads
document.addEventListener('DOMContentLoaded', loadGenres);

// Load genres for movies/TV shows
async function loadGenres() {
    const mediaType = mediaTypeSelect.value;
    try {
        const response = await fetch(`${BASE_URL}/genre/${mediaType}/list?api_key=${API_KEY}&language=tr-TR`);
        const data = await response.json();

        // Clear existing options except first one
        genreSelect.innerHTML = '<option value="">Tür Seçin</option>';

        // Add new genre options
        data.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Türler yüklenirken hata:', error);
    }
}

// Get recommendation based on selected options
async function getRecommendation() {
    const mediaType = mediaTypeSelect.value;
    const genreId = genreSelect.value;

    if (!genreId) {
        alert('Lütfen bir tür seçin!');
        return;
    }

    try {
        // Get top rated content for selected genre
        let url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&language=tr-TR&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=1000`;

        const response = await fetch(url);
        const data = await response.json();

        // Randomly select 3 items from top 20
        const topItems = data.results.slice(0, 20);
        const recommendations = [];

        while (recommendations.length < 3 && topItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * topItems.length);
            recommendations.push(topItems[randomIndex]);
            topItems.splice(randomIndex, 1);
        }

        displayRecommendations(recommendations);
    } catch (error) {
        console.error('Öneriler yüklenirken hata:', error);
    }
}

// Display recommendations
function displayRecommendations(items) {
    recommendationsDiv.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => showDetails(item);

        const image = item.poster_path
            ? `${IMAGE_BASE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image';

        card.innerHTML = `
            <img src="${image}" alt="${item.title || item.name}">
            <div class="movie-info">
                <h3>${item.title || item.name}</h3>
                <span class="rating">⭐ ${item.vote_average.toFixed(1)}</span>
            </div>
        `;

        recommendationsDiv.appendChild(card);
    });

    // Scroll to recommendations
    recommendationsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Show details in modal
async function showDetails(item) {
    const mediaType = mediaTypeSelect.value;
    try {
        const response = await fetch(
            `${BASE_URL}/${mediaType}/${item.id}?api_key=${API_KEY}&language=tr-TR`
        );
        const details = await response.json();

        const backdropImage = details.backdrop_path
            ? `${IMAGE_BASE_URL}${details.backdrop_path}`
            : 'https://via.placeholder.com/800x450?text=No+Image';

        modalDetails.innerHTML = `
            <img src="${backdropImage}" alt="${details.title || details.name}" style="width: 100%; border-radius: 12px; margin-bottom: 1.5rem;">
            <h2>${details.title || details.name}</h2>
            <p><strong>Çıkış Tarihi:</strong> ${details.release_date || details.first_air_date}</p>
            <p><strong>IMDB Puanı:</strong> ⭐ ${details.vote_average.toFixed(1)}</p>
            <p><strong>Özet:</strong> ${details.overview || 'Özet bulunmuyor.'}</p>
            ${details.genres ? `<p><strong>Türler:</strong> ${details.genres.map(g => g.name).join(', ')}</p>` : ''}
        `;

        modal.style.display = 'block';
    } catch (error) {
        console.error('Detaylar yüklenirken hata:', error);
    }
}
