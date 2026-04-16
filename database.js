// ==========================
// OMNIVO MAIN SCRIPT
// ==========================

// GET URL PARAMS
function getParams() {
    const params = new URLSearchParams(window.location.search);

    return {
        city: params.get("city") || ""
    };
}


// GET ADS FROM STORAGE
function getAllAds() {
    return JSON.parse(localStorage.getItem("allAds")) || [];
}


// FILTER ADS
function getFilteredAds(city, category = "") {
    let ads = getAllAds();

    // FILTER BY CITY
    if (city) {
        let searchCity = city.toLowerCase().replace(/-/g, " ").trim();

        ads = ads.filter(ad => {
            let adCity = (ad.city || "").toLowerCase().trim();
            return adCity.includes(searchCity);
        });
    }

    // FILTER BY CATEGORY (ONLY WHEN CLICKED)
    if (category) {
        ads = ads.filter(ad => {
            let adCat = (ad.category || "").toLowerCase();
            return adCat.includes(category.toLowerCase());
        });
    }

    return ads.reverse();
}


// RENDER ADS
function renderAds(ads) {
    const container = document.getElementById("ads-container");

    if (!container) return;

    container.innerHTML = "";

    if (ads.length === 0) {
        container.innerHTML = "<p>No ads found in this city.</p>";
        return;
    }

    ads.forEach(ad => {
        const div = document.createElement("div");
        div.classList.add("ad-box");

        div.innerHTML = `
            <h3>${ad.title || "No Title"}</h3>
            <p><strong>City:</strong> ${ad.city}</p>
            <p><strong>Category:</strong> ${ad.category}</p>
            <p>${ad.description || ""}</p>
        `;

        container.appendChild(div);
    });
}


// SET CITY TITLE
function setCityTitle(city) {
    const title = document.getElementById("city-title");

    if (!title) return;

    let cleanCity = city.replace(/-/g, " ");

    title.innerText = cleanCity.toUpperCase();
}


// INITIAL LOAD
function initPage() {
    const { city } = getParams();

    if (!city) {
        alert("No city selected");
        return;
    }

    setCityTitle(city);

    // LOAD ALL ADS FOR CITY FIRST
    const ads = getFilteredAds(city);

    renderAds(ads);
}


// CATEGORY FILTER (RUNS WHEN BUTTON CLICKED)
function filterCategory(category) {
    const { city } = getParams();

    const ads = getFilteredAds(city, category);

    renderAds(ads);
}


// RUN PAGE
// document.addEventListener("DOMContentLoaded", initPage);


// ==========================
// DEBUG TOOL (OPTIONAL)
// ==========================
function clearDB() {
    localStorage.removeItem("allAds");
    alert("Database cleared");
    location.reload();
}