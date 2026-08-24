// Check Login
const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first!");
    window.location.href = "login.html";
}

let yieldChartInstance = null;

async function predictYield() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "block";

    const area = document.getElementById("area").value;
    const year = document.getElementById("year").value;

    const pesticides = document.getElementById("pesticides").value;
    const ph = document.getElementById("ph").value;

    const selectedCrop = document.getElementById("cropType").value;
    const cropType = selectedCrop === "Other" ? document.getElementById("otherCrop").value : selectedCrop;

    if (!area || !year || !cropType ||  !pesticides || !ph) {
        alert("⚠ Please fill all fields before prediction.");
        if (loader) loader.style.display = "none";
        return;
    }

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/api/v1/predict-yield",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    area: area,
                    crop_type: cropType,
                    year: parseInt(year),
                    average_rain_fall_mm_per_year: 0,
                    pesticides_tonnes: parseFloat(pesticides),
                    avg_temp: 0,
                    ph: parseFloat(ph)
                })
            }
        );

        const data = await response.json();
        if (loader) loader.style.display = "none";

        if (!response.ok) {
            throw new Error(data.detail || "Prediction failed on server.");
        }

        const yieldValue = data.estimated_yield_kg_per_ha;
        const overallRisk = data.analytics.overall_risk;
        const riskAlerts = data.analytics.risk_alerts;
        const recommendations = data.analytics.recommendations;

        // --- POPULATE ALL ORIGINAL DASHBOARD OUTPUT CARDS ---

        // 1. Estimated Yield Card
        const yieldEl = document.getElementById("yield");
        if (yieldEl) yieldEl.innerHTML = `🌾 ${yieldValue.toFixed(2)} kg/ha`;

        // 2. Weather Status Card
        // 2. Weather Status Card
const weatherEl = document.getElementById("weather");

if (weatherEl) {

    const liveWeather = data.weather;

    weatherEl.innerHTML = `
        <h3>🌦 Live Weather</h3>

        📍 <b>${liveWeather.city}</b><br><br>

        🌡 Temperature :
        <b>${liveWeather.temperature}°C</b><br>

        ☁ Weather :
        <b>${liveWeather.weather_condition}</b><br>

        💧 Humidity :
        <b>${liveWeather.humidity}%</b><br>

        🌬 Wind Speed :
        <b>${liveWeather.wind_speed} m/s</b><br>

        🌧 Rainfall :
        <b>${liveWeather.rainfall} mm</b>
    `;

    weatherEl.style.color = "#2e7d32";
}

        // 3. Soil Analysis Card
        const soilEl = document.getElementById("soil");
        if (soilEl) {
            soilEl.innerHTML = `🌱 Soil pH: ${ph} (Analyzed)`;
            soilEl.style.color = "#2e7d32";
        }

        // 4. Risk Level Card
        const riskEl = document.getElementById("risk");
        if (riskEl) {
            riskEl.innerHTML = `⚠ ${overallRisk}`;
            if (overallRisk === "Low Risk") riskEl.style.color = "#2e7d32";
            else if (overallRisk === "Medium Risk") riskEl.style.color = "#ff9800";
            else riskEl.style.color = "#d32f2f";
        }

        // 5. Recommendation Card
        const recEl = document.getElementById("recommendation");
        if (recEl) {
            recEl.innerHTML = `💡 <br>` + recommendations.join("<br>");
        }

        // 6. Productivity Report Card
        const reportEl = document.getElementById("report");
        if (reportEl) {
            reportEl.innerHTML = `📈 Yield performance optimized for ${cropType} in ${area}.`;
        }

        // 7. Crop Advisory Card
        const adviceEl = document.getElementById("cropAdvice");
        if (adviceEl) {
            adviceEl.innerHTML = `🌾 ${data.crop_message}`;
        }
        // ---------------- AI Recommendation ----------------

const ai = data.ai_recommendation;

if (ai) {

    const recommendationBox = document.getElementById("aiRecommendation") || document.getElementById("recommendation");
    const reasonList = document.getElementById("aiReason");
    const adviceList = document.getElementById("farmerAdvice");

    if (recommendationBox) {

        recommendationBox.innerHTML = `
            <p><strong>🌾 Recommended Crop:</strong> ${ai.recommended_crop}</p>
            <p><strong>🎯 Confidence:</strong> ${ai.confidence}%</p>

            <p><strong>🧠 Reason:</strong></p>
            <ul id="aiReason"></ul>

            <p><strong>👨‍🌾 Farmer Advice:</strong></p>
            <ul id="farmerAdvice"></ul>
        `;

        const newReasonList = document.getElementById("aiReason");
        ai.reason.forEach(item => {
            newReasonList.innerHTML += `<li>${item}</li>`;
        });

        const newAdviceList = document.getElementById("farmerAdvice");
        ai.farmer_advice.forEach(item => {
            newAdviceList.innerHTML += `<li>${item}</li>`;
        });

    }
}

        // 8. Summary Box
        const summaryBox = document.getElementById("summary");
        if (summaryBox) {
            summaryBox.innerHTML = `
            <b>🤖 AI Prediction Summary</b><br><br>
            🌾 Crop: <b>${cropType}</b><br><br>
            🌾 Estimated Yield: <b>${yieldValue.toFixed(2)} kg/ha</b><br><br>
            ⚠ Risk Level: <b>${overallRisk}</b><br><br>
            💡 Recommendations:<br>${recommendations.join("<br>")}
            `;
        }

        loadDashboardStats();
        loadYieldChart();

    } catch (error) {
        console.error(error);
        if (loader) loader.style.display = "none";
        alert("Prediction failed! Check backend connection.");
    }
}

function toggleOtherCrop() {
    const cropSelect = document.getElementById("cropType");
    const otherCrop = document.getElementById("otherCrop");

    if (cropSelect.value === "Other") {
        otherCrop.style.display = "block";
    } else {
        otherCrop.style.display = "none";
        otherCrop.value = "";
    }
}

const username = localStorage.getItem("name");
const usernameEl = document.getElementById("username");
if (usernameEl) usernameEl.innerText = "👤 " + username;

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

const name = localStorage.getItem("name");
const role = localStorage.getItem("role");

const welcomeMsg = document.getElementById("welcomeMessage");
if (welcomeMsg) welcomeMsg.innerHTML = "Welcome Back, " + name + " 👋";

const welcomeRole = document.getElementById("welcomeRole");
if (welcomeRole) welcomeRole.innerHTML = "Role : " + role;

async function loadDashboardStats() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/dashboard-stats");
        const data = await response.json();

        const totalEl = document.getElementById("totalPredictions");
        if (totalEl) totalEl.innerHTML = data.total_predictions;

        const yieldEl = document.getElementById("averageYield");
        if (yieldEl) yieldEl.innerHTML = data.average_yield.toFixed(2);

        const bestCropEl = document.getElementById("bestCrop");
        if (bestCropEl) bestCropEl.innerHTML = data.best_crop;

        const currentRiskEl = document.getElementById("currentRisk");
        if (currentRiskEl) currentRiskEl.innerHTML = data.current_risk;
    } catch(error) {
        console.log(error);
    }
}
loadDashboardStats();

async function loadYieldChart() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/predictions");
        const predictions = await response.json();

        const crops = predictions.map(p => p.crop);
        const yields = predictions.map(p => p.estimated_yield);

        const canvas = document.getElementById("yieldChart");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (yieldChartInstance) {
            yieldChartInstance.destroy();
        }

        yieldChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: crops,
                datasets: [{
                    label: "Estimated Yield (kg/ha)",
                    data: yields,
                    borderWidth: 1,
                    backgroundColor: "rgba(76, 175, 80, 0.6)",
                    borderColor: "rgba(56, 142, 60, 1)"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch(error) {
        console.log(error);
    }
}
loadYieldChart();
function downloadPDF() {

    // Fill PDF Data

    document.getElementById("pdfArea").innerText =
        document.getElementById("area").value;

    document.getElementById("pdfCrop").innerText =
        document.getElementById("cropType").value;

    document.getElementById("pdfYield").innerText =
        document.getElementById("yield").innerText;

    document.getElementById("pdfWeather").innerText =
        document.getElementById("weather").innerText;

    document.getElementById("pdfRisk").innerText =
        document.getElementById("risk").innerText;

    document.getElementById("pdfRecommendation").innerHTML =
        document.getElementById("aiRecommendation").innerHTML;

    document.getElementById("pdfAdvice").innerHTML =
        document.getElementById("cropAdvice").innerHTML;
    document.getElementById("pdfUser").innerText =
        localStorage.getItem("name");

    document.getElementById("pdfDate").innerText =
         new Date().toLocaleString();
    // Show Report

    const report = document.getElementById("pdfReport");

    report.style.display = "block";

    const options = {

        margin: 0.5,

        filename: "YieldSense_AI_Report.pdf",

        image: {

            type: "jpeg",

            quality: 1

        },

        html2canvas: {

            scale: 2

        },

        jsPDF: {

            unit: "in",

            format: "a4",

            orientation: "portrait"

        }

    };

    html2pdf()

        .set(options)

        .from(report)

        .save()

        .then(() => {

            report.style.display = "none";

        });

}