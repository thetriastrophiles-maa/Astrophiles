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

    // Function to fetch and display NASA news
    async function fetchNasaNews() {
        const rssUrl = 'https://www.nasa.gov/rss/dyn/breaking_news.rss';
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        const newsFeedContainer = document.getElementById('news-feed');

        if (!newsFeedContainer) return;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status === 'ok') {
                let newsHtml = '';
                data.items.slice(0, 6).forEach(item => { // Limit to 6 news items
                    const pubDate = new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    newsHtml += `
                        <div class="news-card">
                            <h3><a href="${item.link}" target="_blank" rel="noopener">${item.title}</a></h3>
                            <p class="news-date">${pubDate}</p>
                            <p>${item.description.substring(0, 150)}...</p>
                            <a href="${item.link}" target="_blank" rel="noopener" class="read-more">Read More →</a>
                        </div>
                    `;
                });
                newsFeedContainer.innerHTML = newsHtml;
            } else {
                newsFeedContainer.innerHTML = '<p>Failed to load NASA news. Please try again later.</p>';
                console.error('Error fetching NASA news:', data.message);
            }
        } catch (error) {
            newsFeedContainer.innerHTML = '<p>Failed to load NASA news. Please check your internet connection.</p>';
            console.error('Error fetching NASA news:', error);
        }
    }

    // Call the function to fetch NASA news when the page loads
    fetchNasaNews();
});
