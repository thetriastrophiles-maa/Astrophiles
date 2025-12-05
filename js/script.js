document.addEventListener('DOMContentLoaded', () => {

    // Helper function to calculate moon phase and its corresponding NASA SVS image URL
    function getMoonPhase(date) {
        const year = date.getFullYear();
        const month = date.getMonth(); // Month is 0-indexed
        const day = date.getDate();

        // To get a representative moon phase for the day, we'll use noon (12:00 UTC)
        const middayDate = new Date(Date.UTC(year, month, day, 12, 0, 0));

        // Calculate hours since the beginning of the year for frame number calculation
        const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const hoursSinceYearStart = Math.floor((middayDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60));

        // Frame numbers start at 1, so add 1 to the hours since year start
        const frameNumber = hoursSinceYearStart + 1;

        // Try multiple URL patterns for NASA SVS images
        // Pattern 1: phase_full format (print resolution)
        const imageBaseURL1 = "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005415/";
        const imageURL1 = `${imageBaseURL1}phase_full.${frameNumber}_print.jpg`;

        // Pattern 2: hourly frames format (730x730 resolution)
        const formattedFrameNumber = String(frameNumber).padStart(4, '0');
        const imageBaseURL2 = "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005416/frames/730x730_1x1_30p/";
        const imageURL2 = `${imageBaseURL2}moon.${formattedFrameNumber}.jpg`;

        // Pattern 3: Alternative path
        const imageBaseURL3 = "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005415/frames/730x730_1x1_30p/";
        const imageURL3 = `${imageBaseURL3}moon.${formattedFrameNumber}.jpg`;

        // Use the first URL pattern as primary, with fallbacks
        const imageURL = imageURL1;

        // Re-calculate illumination based on the midday date for consistency with image
        let new_moon_date_utc = new Date(Date.UTC(2000, 0, 6, 18, 38, 0)); // Reference new moon (UTC)
        let phase_length = 29.53058867; // Synodic month length in days

        let days_since_new_moon_midday = (middayDate.getTime() - new_moon_date_utc.getTime()) / (1000 * 60 * 60 * 24);
        let current_phase_days_midday = days_since_new_moon_midday % phase_length;

        if (current_phase_days_midday < 0) {
            current_phase_days_midday += phase_length;
        }

        const illumination = Math.round((0.5 * (1 - Math.cos(2 * Math.PI * current_phase_days_midday / phase_length))) * 100);

        return {
            name: "Moon Phase",
            imagePath: imageURL,
            fallbackPaths: [imageURL2, imageURL3],
            percentage: illumination
        };
    }

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
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const successMessage = document.getElementById('success-message');
            const errorMessage = document.getElementById('error-message');
            const submitBtn = newsletterForm.querySelector('.newsletter-submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnIcon = submitBtn.querySelector('.btn-icon');

            // Hide previous messages
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';

            if (!name || !email) {
                errorMessage.querySelector('span').textContent = 'Please fill in all required fields';
                errorMessage.style.display = 'flex';
                return;
            }

            // Disable submit button and show loading state
            submitBtn.disabled = true;
            btnText.textContent = 'Subscribing...';
            btnIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            try {
                const response = await fetch('/.netlify/functions/newsletter-subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    successMessage.style.display = 'flex';
                    newsletterForm.reset();
                    
                    // Reset button after 3 seconds
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        btnText.textContent = 'Subscribe Now';
                        btnIcon.innerHTML = '<i class="fas fa-paper-plane"></i>';
                        successMessage.style.display = 'none';
                    }, 5000);
                } else {
                    throw new Error(data.error || 'Failed to subscribe');
                }
            } catch (error) {
                console.error('Newsletter subscription error:', error);
                errorMessage.querySelector('span').textContent = error.message || 'There was an error processing your subscription. Please try again later.';
                errorMessage.style.display = 'flex';
                submitBtn.disabled = false;
                btnText.textContent = 'Subscribe Now';
                btnIcon.innerHTML = '<i class="fas fa-paper-plane"></i>';
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
                    newsCard.onclick = () => window.open(item.link, '_blank'); // Make the whole card clickable
                    newsCard.innerHTML = `
                        <div class="news-meta">
                            <span class="news-source">${item.source}</span>
                            <span class="news-date">${new Date(item.pubDate).toLocaleDateString()}</span>
                        </div>
                        <h3>${item.title}</h3> <!-- Removed anchor tag from here -->
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

    // Today's Moon Phase
    const todayMoonPhaseContainer = document.getElementById('today-moon-phase');
    if (todayMoonPhaseContainer) {
        const today = new Date();
        const moonPhase = getMoonPhase(today);
        
        const moonPhaseCard = document.createElement('div');
        moonPhaseCard.className = 'moon-phase-card';
        
        const moonPhaseImageContainer = document.createElement('div');
        moonPhaseImageContainer.className = 'moon-phase-image-container';
        
        const moonPhaseImage = document.createElement('img');
        moonPhaseImage.alt = "Today's Moon Phase";
        moonPhaseImage.className = 'moon-phase-image';
        
        // Function to try loading image with fallbacks
        function loadMoonImage(urls, index = 0) {
            if (index >= urls.length) {
                console.error('All moon phase image URLs failed to load. URLs tried:', urls);
                // Use a placeholder or generate a simple moon phase visualization
                moonPhaseImageContainer.innerHTML = `
                    <div style="color: #cbd5e1; text-align: center; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                        <div style="width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle at ${moonPhase.percentage > 50 ? '30%' : '70%'} 50%, #f0f0f0 ${moonPhase.percentage}%, transparent ${moonPhase.percentage}%), #1e293b; border: 2px solid #6366f1;"></div>
                        <p style="margin-top: 1rem; font-size: 0.9rem;">Moon Phase Visualization</p>
                    </div>
                `;
                return;
            }
            
            console.log(`Attempting to load moon image (${index + 1}/${urls.length}): ${urls[index]}`);
            moonPhaseImage.src = urls[index];
            moonPhaseImage.onerror = () => {
                console.warn(`Failed to load moon image from: ${urls[index]}`);
                // Try next fallback URL
                if (index < urls.length - 1) {
                    loadMoonImage(urls, index + 1);
                } else {
                    loadMoonImage(urls, urls.length); // Trigger error handling
                }
            };
            moonPhaseImage.onload = () => {
                console.log(`Successfully loaded moon image from: ${urls[index]}`);
            };
        }
        
        // Try loading with primary URL and fallbacks
        const allUrls = [moonPhase.imagePath, ...(moonPhase.fallbackPaths || [])];
        console.log('Moon phase data:', { percentage: moonPhase.percentage, urls: allUrls });
        loadMoonImage(allUrls);
        
        moonPhaseImageContainer.appendChild(moonPhaseImage);
        
        const moonPhaseInfo = document.createElement('div');
        moonPhaseInfo.className = 'moon-phase-info';
        moonPhaseInfo.innerHTML = `
            <h3>${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            <p class="moon-illumination">Illumination: ${moonPhase.percentage}%</p>
        `;
        
        moonPhaseCard.appendChild(moonPhaseImageContainer);
        moonPhaseCard.appendChild(moonPhaseInfo);
        todayMoonPhaseContainer.appendChild(moonPhaseCard);
    }
});
