
window.onload = function () {
    const container = document.querySelector(".states");

    if (!container) {
        console.error("HTML Error: Could not find <div class='states'>");
        return;
    }

    // Use window.locations to ensure it's found on Vercel
    const allData = window.locations || locations;

    if (typeof allData === "undefined") {
        alert("Data Error: location.js is not loading correctly!");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const region = params.get("region") || "usa";
    const data = allData[region];

    if (!data) {
        container.innerHTML = "<p>Region '" + region + "' not found.</p>";
        return;
    }

    container.innerHTML = "";

    // Use Object.keys for better reliability on live servers
    Object.keys(data).forEach(state => {
        const stateBlock = document.createElement("div");
        stateBlock.className = "state-group";

        const stateTitle = document.createElement("h3");
        stateTitle.textContent = state;
        stateTitle.style.borderBottom = "2px solid #ff5722";
        stateTitle.style.marginTop = "20px";
        stateBlock.appendChild(stateTitle);

        // SAFETY CHECK: Ensure the city list exists for this state
        const cities = data[state];
        if (Array.isArray(cities)) {
            cities.forEach(city => {
                const cityLink = document.createElement("a");
                cityLink.textContent = city;
                
                // Add the leading slash for Vercel routing
                cityLink.href = "/city.html?name=" + encodeURIComponent(city.trim());

                cityLink.style.display = "block";
                cityLink.style.color = "#333";
                cityLink.style.textDecoration = "none";
                cityLink.style.padding = "8px 0";
                cityLink.style.fontSize = "15px";

                cityLink.onmouseover = () => cityLink.style.color = "#ff5722";
                cityLink.onmouseout = () => cityLink.style.color = "#333";

                stateBlock.appendChild(cityLink);
            });
        }

        container.appendChild(stateBlock);
    });
};