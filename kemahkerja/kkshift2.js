const KKSHIFT2_ADMIN_EMAILS = ["sigitm@ugm.ac.id"];

async function loadKKShift2Data() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = KKSHIFT2_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "17JdVhNRwi_UsYmWk4m9GAljkveGrGkUboI_lPNrFrnU"; // only the ID
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const KKShift2Rows = data.values?.slice(1) || [];

        if (KKShift2Rows.length === 0) {
            document.getElementById("KKShift2List").innerHTML =
                `<div class="alert alert-info">Tidak ada kelompok KK Shift 2.</div>`;
            return;
        }

        // Group students by Kelompok
        const groups = {};
        KKShift2Rows.forEach(r => {
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

            const PEMBIMBING_SHIFT2_COL = 86;
            const pembimbingShift2 = (rows[0][PEMBIMBING_SHIFT2_COL] || "").toLowerCase().trim();

            const isPembimbingShift2 = pembimbingShift2 === currentEmail;
            const isAdminHere = isAdmin;

            if (!isPembimbingShift2 && !isAdminHere) return;

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
                            <a href="kemahkerja/page_penilaiankkshift2.html?${encodedParams}"
                            class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        if (!hasVisibleCard) {
            document.getElementById("KKShift2List").innerHTML =
                `<div class="alert alert-info">
                    Tidak ada mahasiswa KK Shift 2 yang ditugaskan kepada Anda.
                </div>`;
            return;
        }        

        html += `</div>`;
        document.getElementById("KKShift2List").innerHTML = html;

    } catch (err) {
        console.error("Error loading KK Shift 2 data:", err);
        document.getElementById("KKShift2List").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data KK Shift 2.</div>`;
    }
}
