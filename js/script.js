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
        const formattedFrameNumber = String(frameNumber).padStart(4, '0');

        // Base URL for NASA SVS hourly moon images (730x730 resolution)
        // Using the su_image path (a005416) which seems more reliable
        const imageBaseURL = "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005416/frames/730x730_1x1_30p/";
        const imageURL = `${imageBaseURL}moon.${formattedFrameNumber}.jpg`;

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
            name: "Moon Phase", // Keeping it generic as requested
            imagePath: imageURL,
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

    // Astronomical Calendar
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    let currentDate = new Date(); // Start with the current month

    // Curated list of astronomical events for December 2025
    const astronomicalEvents = [
        { date: '2025-12-04', name: 'Super Cold Moon (Full Moon)', type: 'moon' },
        { date: '2025-12-13', name: 'Geminid Meteor Shower Peak', type: 'meteor_shower' },
        { date: '2025-12-14', name: 'Geminid Meteor Shower (continuation)', type: 'meteor_shower' },
        { date: '2025-12-21', name: 'December Solstice', type: 'solstice' },
        { date: '2025-12-22', name: 'Ursid Meteor Shower Peak', type: 'meteor_shower' },
        { date: '2025-12-23', name: 'Ursid Meteor Shower (continuation)', type: 'meteor_shower' },
        { date: '2025-12-27', name: 'Moon-Saturn Conjunction', type: 'conjunction' },
    ];

    function renderCalendar() {
        if (!calendarGrid || !monthYearDisplay) return;

        calendarGrid.innerHTML = ''; // Clear previous days
        // const eventsList = document.getElementById('current-month-events'); // Removed
        // if (eventsList) eventsList.innerHTML = ''; // Clear previous events (removed)

        const today = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        monthYearDisplay.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`;

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const numDaysInMonth = lastDayOfMonth.getDate();
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= numDaysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.setAttribute('data-day', day);

            const date = new Date(currentYear, currentMonth, day);

            // Highlight today's date
            if (date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()) {
                dayElement.classList.add('current-day');
            }

            // Add moon phase
            const moonPhase = getMoonPhase(date);
            const moonPhaseContainer = document.createElement('div');
            moonPhaseContainer.className = 'moon-phase';
            moonPhaseContainer.innerHTML = `
                <img src="${moonPhase.imagePath}" class="moon-image">
                <span class="moon-percentage">${moonPhase.percentage}%</span>
            `;
            dayElement.appendChild(moonPhaseContainer);

            // Add astronomical events
            const dayEvents = astronomicalEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getDate() === day &&
                       eventDate.getMonth() === currentMonth &&
                       eventDate.getFullYear() === currentYear;
            });

            if (dayEvents.length > 0) {
                dayElement.classList.add('event-day');
                dayEvents.forEach(event => {
                    const eventDetails = document.createElement('div');
                    eventDetails.className = 'event-details';
                    eventDetails.textContent = event.name;
                    dayElement.appendChild(eventDetails);
                });
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    // Navigation buttons
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Initial render
    renderCalendar();
});
