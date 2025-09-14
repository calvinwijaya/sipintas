async function loadQualificationAssessmentData() {
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

        const qualificationAssessmentRows = rows.filter(r => r[0]?.trim().toLowerCase() === "ujian komprehensif");
        console.log("Ujian Komprehensif rows:", qualificationAssessmentRows);

        if (qualificationAssessmentRows.length === 0) {
            document.getElementById("ujianKomprehensifList").innerHTML =
                `<div class="alert alert-info">Tidak ada mahasiswa ujian komprehensif.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        qualificationAssessmentRows.forEach(r => {
            const [status, no, nama, nim, promotor, judul] = r;
            const encodedParams = new URLSearchParams({ nama, nim, promotor, judul }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Promotor:</strong> ${promotor}</p>
                            <p class="card-text"><em>${judul}</em></p>
                            <a href="disertasi/page_penilaianujiankomprehensif.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                            <a href="disertasi/page_beritaujiankomprehensif.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Buat Berita Acara
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById("ujianKomprehensifList").innerHTML = html;

    } catch (err) {
        console.error("Error loading qualification assessment data:", err);
        document.getElementById("ujianKomprehensifList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data ujian komprehensif.</div>`;
    }
}