// DOM Elements
const mediaTypeSelect = document.getElementById('mediaType');
const genreSelect = document.getElementById('genre');
const recommendBtn = document.getElementById('recommendBtn');
const recommendationsDiv = document.getElementById('recommendations');
const loadingAnimation = document.getElementById('loading');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('modal-details');
const closeModal = document.querySelector('.close');

// Event Listeners
mediaTypeSelect.addEventListener('change', loadGenres);
recommendBtn.addEventListener('click', getRecommendation);

// Close modal when clicking close button or outside
function closeModalHandler() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Wait for animation to finish before hiding
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

closeModal.onclick = closeModalHandler;

window.onclick = (event) => {
    if (event.target === modal) {
        closeModalHandler();
    }
};

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
        // Show loading animation
        loadingAnimation.classList.add('active');
        recommendationsDiv.innerHTML = '';

        // Add button animation
        const btnContent = recommendBtn.querySelector('.btn-content');
        btnContent.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Arıyorum...';
        recommendBtn.disabled = true;

        // Get top rated content for selected genre
        let url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&language=tr-TR&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=1000`;

        const response = await fetch(url);
        const data = await response.json();

        // Simulate loading for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Randomly select 3 items from top 20
        const topItems = data.results.slice(0, 20);
        const recommendations = [];

        while (recommendations.length < 3 && topItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * topItems.length);
            recommendations.push(topItems[randomIndex]);
            topItems.splice(randomIndex, 1);
        }

        // Hide loading animation
        loadingAnimation.classList.remove('active');
        btnContent.innerHTML = '<i class="fas fa-magic"></i> Bana Öner!';
        recommendBtn.disabled = false;

        displayRecommendations(recommendations);
    } catch (error) {
        console.error('Öneriler yüklenirken hata:', error);
        loadingAnimation.classList.remove('active');
        const btnContent = recommendBtn.querySelector('.btn-content');
        btnContent.innerHTML = '<i class="fas fa-magic"></i> Bana Öner!';
        recommendBtn.disabled = false;
    }
}

// Display recommendations
function displayRecommendations(items) {
    recommendationsDiv.innerHTML = '';

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.animationDelay = `${index * 0.2}s`;
        card.onclick = () => showDetails(item);

        const image = item.poster_path
            ? `${IMAGE_BASE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image';

        card.innerHTML = `
            <img src="${image}" alt="${item.title || item.name}">
            <div class="movie-info">
                <h3>${item.title || item.name}</h3>
                <span class="rating">
                    <i class="fas fa-star"></i>
                    ${item.vote_average.toFixed(1)}
                </span>
            </div>
        `;

        recommendationsDiv.appendChild(card);
    });

    // Scroll to recommendations with a slight delay
    setTimeout(() => {
        recommendationsDiv.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// Show details in modal
async function showDetails(item) {
    try {
        let url;
        if (item.media_type === 'tv' || mediaTypeSelect.value === 'tv') {
            url = `${BASE_URL}/tv/${item.id}?api_key=${API_KEY}&language=tr-TR`;
        } else {
            url = `${BASE_URL}/movie/${item.id}?api_key=${API_KEY}&language=tr-TR`;
        }
        
        const response = await fetch(url);
        const details = await response.json();
        
        const backdropImage = details.backdrop_path
            ? `${IMAGE_BASE_URL}${details.backdrop_path}`
            : 'https://via.placeholder.com/800x450?text=No+Image';
        
        modalDetails.innerHTML = `
            <img src="${backdropImage}" alt="${details.title || details.name}">
            <h2>${details.title || details.name}</h2>
            <p><strong>Çıkış Tarihi:</strong> ${details.release_date || details.first_air_date}</p>
            <p><strong>IMDB Puanı:</strong> <i class="fas fa-star"></i> ${details.vote_average.toFixed(1)}</p>
            <p><strong>Açıklama:</strong> ${details.overview || 'Açıklama bulunamadı.'}</p>
        `;
        
        modal.style.display = 'block';
        // Trigger reflow for animation
        modal.offsetHeight;
        modal.classList.add('active');
        
        // Add scroll lock to body
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Detaylar yüklenirken hata:', error);
    }
}
