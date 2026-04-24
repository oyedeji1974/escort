// ==========================
// OMNIVO MAIN SCRIPT (MONGODB VERSION)
// ==========================

// 1. GET URL PARAMS
function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        city: params.get("city") || ""
    };
}

// 2. GET ADS FROM MONGODB (The real database)
async function getAdsFromServer(city, category = "") {
    try {
        // We call your Node.js API instead of localStorage
        const response = await fetch(`http://localhost:3000/api/ads?city=${city}&cat=${category}`);
        if (!response.ok) throw new Error("Server error");
        return await response.json();
    } catch (err) {
        console.error("Database Error:", err);
        return [];
    }
}

// 3. RENDER ADS (Matching your clean "collapsed" style)
function renderAds(ads) {
    const container = document.getElementById("ads-container");
    if (!container) return;

    container.innerHTML = "";

    if (ads.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px;'>No profiles found in this area yet.</p>";
        return;
    }

    ads.forEach(ad => {
        const div = document.createElement("div");
        div.classList.add("ad-card"); // Using the style from view-ads.html

        div.innerHTML = `
            <div class="ad-title-main">${ad.title}</div>
            <div class="ad-details">
                <p><strong>Price:</strong> $${ad.price}</p>
                <p><strong>Age:</strong> ${ad.age}</p>
                <p>${ad.content || ad.description || ""}</p>
            </div>
        `;

        div.onclick = () => div.classList.toggle('active');
        container.appendChild(div);
    });
}

// 4. SET CITY TITLE
function setCityTitle(city) {
    const title = document.getElementById("city-title");
    if (!title) return;
    title.innerText = city.replace(/-/g, " ").toUpperCase();
}

// 5. INITIAL LOAD (The Start Button)
async function initPage() {
    const { city } = getParams();
    if (!city) return;

    setCityTitle(city);
    
    // Show a loading message
    const container = document.getElementById("ads-container");
    if(container) container.innerHTML = "Searching database...";

    const ads = await getAdsFromServer(city);
    renderAds(ads);
}

// 6. CATEGORY FILTER
async function filterCategory(category) {
    const { city } = getParams();
    const ads = await getAdsFromServer(city, category);
    renderAds(ads);
}

// RUN
document.addEventListener("DOMContentLoaded", initPage);