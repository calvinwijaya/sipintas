document.addEventListener("DOMContentLoaded", () => {
    loadProposalSkripsi2Data();
    loadProposalTesisData();
});

// ======================
// Skripsi
// ======================
async function loadProposalSkripsi2Data() {
    const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values?.slice(1) || [];

        // Filter status
        const proposal = rows.filter(r => r[0]?.trim().toLowerCase() === "seminar proposal").length;
        const revisiProposal = rows.filter(r => r[0]?.trim().toLowerCase() === "revisi proposal").length;
        const ujianAkhir = rows.filter(r => r[0]?.trim().toLowerCase() === "seminar akhir").length;
        const selesai = rows.filter(r => r[0]?.trim().toLowerCase() === "selesai").length;

        // Render chart
        renderChart("skripsiChart", "Skripsi", [proposal, revisiProposal, ujianAkhir, selesai]);

    } catch (err) {
        console.error("Error fetching Skripsi data:", err);
    }
}

// ======================
// Tesis
// ======================
async function loadProposalTesisData() {
    const SHEET_ID = "1lg2tfyzMX99Ib-b5gZ31dGnHHqLHDpElQO22VMVaPbs";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values?.slice(1) || [];

        const proposal = rows.filter(r => r[0]?.trim().toLowerCase() === "proposal").length;
        const revisiProposal = rows.filter(r => r[0]?.trim().toLowerCase() === "revisi proposal").length;
        const ujianAkhir = rows.filter(r => r[0]?.trim().toLowerCase() === "sidang akhir").length;
        const selesai = rows.filter(r => r[0]?.trim().toLowerCase() === "selesai").length;

        renderChart("tesisChart", "Tesis", [proposal, revisiProposal, ujianAkhir, selesai]);

    } catch (err) {
        console.error("Error fetching Tesis data:", err);
    }
}

// ======================
// Utility: Render Chart
// ======================
function renderChart(canvasId, title, data) {
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (!ctx) return;

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Proposal", "Revisi Proposal", "Ujian Akhir", "Selesai"],
            datasets: [{
                label: title,
                data: data,
                backgroundColor: [
                    "#0d6efd", // biru
                    "#ffc107", // kuning
                    "#20c997", // hijau toska
                    "#fd7e14", // oranye
                ],
                borderRadius: 8,   // bikin batang rounded
                barPercentage: 0.6, // batang lebih ramping
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // biar proporsional di card
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 20,
                        weight: "bold",
                    },
                    color: "#212529",
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    titleFont: { size: 14, weight: "bold" },
                    bodyFont: { size: 13 },
                    padding: 10
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(0,0,0,0.05)" },
                    ticks: {
                        font: { size: 13 },
                        color: "#495057"
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(0,0,0,0.05)" },
                    ticks: {
                        stepSize: 1,
                        font: { size: 13 },
                        color: "#495057"
                    },
                    title: {
                        display: true,
                        text: "Jumlah Mahasiswa",
                        font: { size: 14, weight: "bold" },
                        color: "#212529",
                        padding: { top: 10 }
                    }
                }
            }
        }
    });
}