async function loadPublikasiS2Data() {
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

        const publikasiS2Rows = rows.filter(r => r[0]?.trim().toLowerCase() === "sidang akhir");
        console.log("Publikasi S2 rows:", publikasiS2Rows);

        if (publikasiS2Rows.length === 0) {
            document.getElementById("publikasiS2List").innerHTML =
                `<div class="alert alert-info">Tidak ada naskah publikasi mahasiswa magister untuk dinilai.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        publikasiS2Rows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judul] = r;
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judul }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text"><em>${judul}</em></p>
                            <a href="tesis/page_penilaianpublikasimagister.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                            <a href="tesis/page_beritapublikasimagister.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Buat Berita Acara
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById("publikasiS2List").innerHTML = html;

    } catch (err) {
        console.error("Error loading naskah publikasi data:", err);
        document.getElementById("publikasiS2List").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data naskah publikasi.</div>`;
    }
}