async function loadRekapDisertasiData() {
    console.log("Script running...");

    const SHEET_ID = "14D9A0HnzBDkel5xynJr-mBXXGnIr8A06szQNw15K3sE";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched data:", data);

        const rows = data.values?.slice(1) || [];
        console.log("Rows:", rows);

        const rekapdisertasiRows = rows.filter(r => r[0]?.trim().toLowerCase() === "selesai");
        console.log("Rekap Disertasi rows:", rekapdisertasiRows);

        if (rekapdisertasiRows.length === 0) {
            document.getElementById("rekapdisertasiList").innerHTML =
                `<div class="alert alert-info">Belum ada mahasiswa yang selesai ujian Disertasi.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        rekapdisertasiRows.forEach(r => {
            const [status, no, nama, nim, promotor, judulproposal, juduldisertasi] = r;
            const encodedParams = new URLSearchParams({ nama, nim, promotor, judulproposal, juduldisertasi }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Promotor:</strong> ${promotor}</p>
                            <p class="card-text"><em>${juduldisertasi}</em></p>
                            <a href="disertasi/page_rekapdisertasi.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Rekapitulasi Nilai
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById("rekapdisertasiList").innerHTML = html;

    } catch (err) {
        console.error("Error loading rekap disertasi data:", err);
        document.getElementById("rekapdisertasiList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data rekap Disertasi.</div>`;
    }
}