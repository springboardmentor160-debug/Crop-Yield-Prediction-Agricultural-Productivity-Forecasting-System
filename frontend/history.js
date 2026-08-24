async function loadHistory() {

    try {

        const response = await fetch("http://127.0.0.1:8000/api/v1/predictions");

        const data = await response.json();

        const tbody = document.querySelector("#historyTable tbody");

        tbody.innerHTML = "";

        data.forEach(item => {

            tbody.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.crop}</td>
                    <td>${item.estimated_yield}</td>
                    <td>${item.risk}</td>
                    <td>${new Date(item.created_at).toLocaleString()}</td>
                </tr>
            `;

        });

    } catch (error) {

        console.error(error);

        alert("Failed to load prediction history.");

    }

}

loadHistory();