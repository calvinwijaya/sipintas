async function loadUjianKelayakanData() {
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

        const ujiankelayakanRows = rows.filter(r => r[0]?.trim().toLowerCase() === "ujian kelayakan");
        console.log("Ujian kelayakan rows:", ujiankelayakanRows);

        if (ujiankelayakanRows.length === 0) {
            document.getElementById("ujianKelayakanList").innerHTML =
                `<div class="alert alert-info">Tidak ada mahasiswa ujian kelayakan.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        ujiankelayakanRows.forEach(r => {
            const [status, no, nama, nim, promotor, judulproposal, juduldisertasi] = r;
            const encodedParams = new URLSearchParams({ nama, nim, promotor, judulproposal, juduldisertasi }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Promotor:</strong> ${promotor}</p>
                            <p class="card-text"><em>${juduldisertasi}</em></p>
                            <div class="d-grid gap-2">
                            <a href="disertasi/page_penilaiankelayakannaskah.html?${encodedParams}" 
                                class="btn btn-primary btn-sm">
                                Lakukan Penilaian Kelayakan Naskah
                            </a>
                            <a href="disertasi/page_penilaianpublikasi.html?${encodedParams}" 
                                class="btn btn-primary btn-sm">
                                Lakukan Penilaian Publikasi
                            </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById("ujianKelayakanList").innerHTML = html;

    } catch (err) {
        console.error("Error loading ujian kelayakan data:", err);
        document.getElementById("ujianKelayakanList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data ujian kelayakan.</div>`;
    }
}