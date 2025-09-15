async function loadUjianSkripsiData() {
    console.log("Script running...");

    const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched data:", data);

        const rows = data.values?.slice(1) || [];
        console.log("Rows:", rows);

        const ujianSkripsiRows = rows.filter(r => r[0]?.trim().toLowerCase() === "seminar akhir");
        console.log("Ujian skripsi rows:", ujianSkripsiRows);

        if (ujianSkripsiRows.length === 0) {
            document.getElementById("ujianSkripsiList").innerHTML =
                `<div class="alert alert-info">Tidak ada mahasiswa seminar akhir skripsi.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        ujianSkripsiRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judulproposal, judulskripsi] = r;
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judulproposal, judulskripsi }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text"><em>${judulskripsi}</em></p>
                            <a href="skripsi/page_penilaianujianskripsi.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                            <a href="skripsi/page_beritaujianskripsi.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Buat Berita Acara
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById("ujianSkripsiList").innerHTML = html;

    } catch (err) {
        console.error("Error loading ujian skripsi data:", err);
        document.getElementById("ujianSkripsiList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data ujian skripsi.</div>`;
    }
}