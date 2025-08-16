async function loadUjianTesisData() {
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

        const ujiantesisRows = rows.filter(r => r[0]?.trim().toLowerCase() === "sidang akhir");
        console.log("Ujian Tesis rows:", ujiantesisRows);

        if (ujiantesisRows.length === 0) {
            document.getElementById("ujiantesisList").innerHTML =
                `<div class="alert alert-info">Tidak ada mahasiswa ujian Tesis.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        ujiantesisRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judul] = r;
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judul }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text"><em>${judul}</em></p>
                            <a href="tesis/page_penilaianujiantesis.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                            <a href="tesis/page_beritaujiantesis.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Buat Berita Acara
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById("ujiantesisList").innerHTML = html;

    } catch (err) {
        console.error("Error loading ujian tesis data:", err);
        document.getElementById("ujiantesisList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data ujian Tesis.</div>`;
    }
}