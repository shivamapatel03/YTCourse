const API_KEY = 'AIzaSyA-MxwbJaW48esCW9OmthGNh2F_7dcXzE8'; // Replace with your API Key
let nextPageToken = '';
const maxResults = 10;
let user = JSON.parse(localStorage.getItem('user')) || null;
let favoriteCourses = JSON.parse(localStorage.getItem('favorites')) || {};





// Fetch Courses
async function fetchCourses(loadMore = false) {
    const category = document.getElementById('category').value;
    const query = document.getElementById('search').value || category;
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${query}&type=playlist&key=${API_KEY}`;
    
    if (loadMore && nextPageToken) {
        url += `&pageToken=${nextPageToken}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        nextPageToken = data.nextPageToken || '';
        displayCourses(data.items, loadMore);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Display Courses
function displayCourses(courses, append = false) {
    const container = document.getElementById('courses');
    if (!append) container.innerHTML = '';

    courses.forEach(course => {
        const videoId = course.id.playlistId;
        const title = course.snippet.title;
        const thumbnail = course.snippet.thumbnails.medium.url;
        const videoUrl = `https://www.youtube.com/playlist?list=${videoId}`;

        const courseHTML = `
            <div class="course">
                <img src="${thumbnail}" alt="${title}">
                <a href="${videoUrl}" target="_blank">${title}</a>
                <button class="favorite-btn" onclick="addToFavorites('${videoId}', '${title}', '${thumbnail}')">⭐</button>
            </div>
        `;
        container.innerHTML += courseHTML;
    });

    document.getElementById('loadMore').style.display = nextPageToken ? 'block' : 'none';
}

// Load More Courses
function loadMoreCourses() {
    fetchCourses(true);
}

// Add to Favorites
function addToFavorites(videoId, title, thumbnail) {
    if (!user) {
        alert('Please log in to save favorites!');
        return;
    }

    const course = { videoId, title, thumbnail };
    if (!favoriteCourses[user.username]) {
        favoriteCourses[user.username] = [];
    }
    favoriteCourses[user.username].push(course);
    localStorage.setItem('favorites', JSON.stringify(favoriteCourses));
    displayFavorites();
}

// Display Favorite Courses
function displayFavorites() {
    if (!user || !favoriteCourses[user.username]) return;
    const container = document.getElementById('favorites');
    container.innerHTML = '';

    favoriteCourses[user.username].forEach(course => {
        container.innerHTML += `
            <div class="course">
                <img src="${course.thumbnail}" alt="${course.title}">
                <a href="https://www.youtube.com/playlist?list=${course.videoId}" target="_blank">${course.title}</a>
            </div>
        `;
    });
}

// Fetch Trending Courses
async function fetchTrendingCourses() {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=5&regionCode=US&videoCategoryId=27&key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayTrendingCourses(data.items);
    } catch (error) {
        console.error('Error fetching trending courses:', error);
    }
}

function displayTrendingCourses(courses) {
    const container = document.getElementById('trending');
    container.innerHTML = '';

    courses.forEach(course => {
        const videoId = course.id;
        const title = course.snippet.title;
        const thumbnail = course.snippet.thumbnails.medium.url;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        const courseHTML = `
            <div class="course">
                <img src="${thumbnail}" alt="${title}">
                <a href="${videoUrl}" target="_blank">${title}</a>
            </div>
        `;
        container.innerHTML += courseHTML;
    });
}

// Dark Mode Toggle
// Dark Mode Toggle Function
function toggleDarkMode() {
    document.body.classList.toggle('dark');

    // Save Dark Mode State in Local Storage
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDarkMode);
}

// Apply Dark Mode on Page Load if Enabled
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }
});


// Initialize
fetchCourses();
fetchTrendingCourses();
showUser();
