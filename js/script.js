document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Generate stars
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
        }
    }

    // Handle form submission for newsletter
    const newsletterForm = document.querySelector('.signup-card');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const successMessage = document.getElementById('success-message');

            if (name && email) {
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    document.getElementById('name').value = '';
                    document.getElementById('email').value = '';
                }, 5000);
            } else {
                alert('Please fill in all required fields');
            }
        });
    }

    // Fetch and display news
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid) {
        const NEWS_API_ENDPOINT = '/.netlify/functions/news-fetcher'; // Relative path to your Netlify function

        async function fetchNews() {
            try {
                const response = await fetch(NEWS_API_ENDPOINT);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const news = await response.json();

                newsGrid.innerHTML = ''; // Clear loading message

                if (news.length === 0) {
                    newsGrid.innerHTML = '<p class="no-news-message">No news available at the moment. Please check back later!</p>';
                    return;
                }

                news.slice(0, 9).forEach(item => { // Limit to 9 news items
                    const newsCard = document.createElement('div');
                    newsCard.className = 'news-card';
                    newsCard.innerHTML = `
                        <div class="news-meta">
                            <span class="news-source">${item.source}</span>
                            <span class="news-date">${new Date(item.pubDate).toLocaleDateString()}</span>
                        </div>
                        <h3><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
                        <p>${item.contentSnippet}</p>
                    `;
                    newsGrid.appendChild(newsCard);
                });

            } catch (error) {
                console.error('Error fetching news:', error);
                newsGrid.innerHTML = '<p class="error-message">Failed to load news. Please try again later.</p>';
            }
        }

        fetchNews();
    }
});
