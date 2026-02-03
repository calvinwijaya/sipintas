const preTestKK_ADMIN_EMAILS = ["calvin.wijaya@mail.ugm.ac.id"];

async function loadPreTestKKData() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = preTestKK_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "17JdVhNRwi_UsYmWk4m9GAljkveGrGkUboI_lPNrFrnU"; // only the ID
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const pretestKKRows = data.values?.slice(1) || []; // skip header row

        if (pretestKKRows.length === 0) {
            document.getElementById("pretestKKList").innerHTML =
                `<div class="alert alert-info">Tidak ada kelompok Pre-Test KK.</div>`;
            return;
        }

        // Group students by Kelompok
        const groups = {};
        pretestKKRows.forEach(r => {
            const no       = r[0];
            const nama     = r[1];
            const nim      = r[2];
            const kelompok = r[3];
            const lokasi   = r[4]; 
            if (!groups[kelompok]) groups[kelompok] = [];
            groups[kelompok].push(r);
        });

        // Build HTML
        let html = `<div class="row g-3">`;
        let hasVisibleCard = false;        

        Object.entries(groups).forEach(([kelompok, rows]) => {
            const lokasi = rows[0][4] || "";

            const PENGUJI_PRE_TESTKK_COL = 90;
            const pengujiPreTestKK = (rows[0][PENGUJI_PRE_TESTKK_COL] || "").toLowerCase().trim();

            const isPengujiPreTestKK = pengujiPreTestKK === currentEmail;
            const isAdminHere = isAdmin;

            if (!isPengujiPreTestKK && !isAdminHere) return;

            hasVisibleCard = true;

            const encodedParams = new URLSearchParams();
            encodedParams.append("kelompok", kelompok);

            rows.forEach((r, idx) => {
                encodedParams.append("nama" + (idx + 1), r[1]);
                encodedParams.append("nim" + (idx + 1), r[2]);
            });

            html += `
                <div class="col-md-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body text-center">
                            <h4 class="fw-bold text-primary mb-1">Kelompok ${kelompok}</h4>
                            <p class="text-muted mb-3"><strong>Lokasi:</strong> ${lokasi}</p>
                            <ol class="text-start small mb-3 ps-3">
                                ${rows.map(r => `<li>${r[1]}</li>`).join("")}
                            </ol>
                            <a href="kemahkerja/page_penilaianpretestkk.html?${encodedParams}"
                            class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        if (!hasVisibleCard) {
            document.getElementById("pretestKKList").innerHTML =
                `<div class="alert alert-info">
                    Tidak ada mahasiswa Pre-Test KK yang ditugaskan kepada Anda.
                </div>`;
            return;
        }        

        html += `</div>`;
        document.getElementById("pretestKKList").innerHTML = html;

    } catch (err) {
        console.error("Error loading pre-test KK data:", err);
        document.getElementById("pretestKKList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data pre-test KK.</div>`;
    }
}
