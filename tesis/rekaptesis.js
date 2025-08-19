async function loadRekapTesisData() {
    console.log("Script running...");

    const SHEET_ID = "1lg2tfyzMX99Ib-b5gZ31dGnHHqLHDpElQO22VMVaPbs";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched data:", data);

        const rows = data.values?.slice(1) || [];
        console.log("Rows:", rows);

        const rekaptesisRows = rows.filter(r => r[0]?.trim().toLowerCase() === "selesai");
        console.log("Rekap Tesis rows:", rekaptesisRows);

        if (rekaptesisRows.length === 0) {
            document.getElementById("rekaptesisList").innerHTML =
                `<div class="alert alert-info">Belum ada mahasiswa yang selesai ujian Tesis.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        rekaptesisRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judulProposal, judulTesis] = r;
            const judul = judulTesis;
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judul }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text"><em>${judul}</em></p>
                            <a href="tesis/page_rekaptesis.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Rekapitulasi Nilai
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById("rekaptesisList").innerHTML = html;

    } catch (err) {
        console.error("Error loading rekap tesis data:", err);
        document.getElementById("rekaptesisList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data rekap Tesis.</div>`;
    }
}