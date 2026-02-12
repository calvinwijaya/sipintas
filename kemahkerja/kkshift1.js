const KKSHIFT1_ADMIN_EMAILS = ["sigitm@ugm.ac.id"];

async function loadKKShift1Data() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = KKSHIFT1_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "17JdVhNRwi_UsYmWk4m9GAljkveGrGkUboI_lPNrFrnU"; // only the ID
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const KKShift1Rows = data.values?.slice(1) || [];

        if (KKShift1Rows.length === 0) {
            document.getElementById("KKShift1List").innerHTML =
                `<div class="alert alert-info">Tidak ada kelompok KK Shift 1.</div>`;
            return;
        }

        // Group students by Kelompok
        const groups = {};
        KKShift1Rows.forEach(r => {
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

            const PEMBIMBING_SHIFT1_COL = 86;
            const pembimbingShift1 = (rows[0][PEMBIMBING_SHIFT1_COL] || "").toLowerCase().trim();

            const isPembimbingShift1 = pembimbingShift1 === currentEmail;
            const isAdminHere = isAdmin;

            if (!isPembimbingShift1 && !isAdminHere) return;

            const col_score_pembimbingShift1 = 23;
            let hasBeenAssessed = false;
            if (hasBeenAssessed = !!rows[0][col_score_pembimbingShift1]) {
                hasBeenAssessed = true;
            }

            const statusColor = hasBeenAssessed ? "#28a745" : "#dc3545"; // Green if done, Red if pending
            const bgColor = hasBeenAssessed ? "#e8f5e9" : "#fff5f5";    // Very light green vs light red
            const statusText = hasBeenAssessed ? "SUDAH DINILAI" : "BELUM DINILAI";

            hasVisibleCard = true;

            const encodedParams = new URLSearchParams();
            encodedParams.append("kelompok", kelompok);

            rows.forEach((r, idx) => {
                encodedParams.append("nama" + (idx + 1), r[1]);
                encodedParams.append("nim" + (idx + 1), r[2]);
            });

            html += `
                <div class="col-md-4">
                    <div class="card shadow-sm h-100" style="border-top: 5px solid ${statusColor}; background-color: ${bgColor};">
                        <div class="card-body text-center">
                            
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold small" style="color: ${statusColor};">${statusText}</span>
                            </div>

                            <h4 class="fw-bold text-primary mb-1">Kelompok ${kelompok}</h4>
                                <p class="text-muted mb-3"><strong>Lokasi:</strong> ${lokasi}</p>
                                <ol class="text-start small mb-3 ps-3">
                                    ${rows.map(r => `<li>${r[1]}</li>`).join("")}
                                </ol>
                                <a href="kemahkerja/page_penilaiankkshift1.html?${encodedParams}"
                                class="btn ${hasBeenAssessed ? 'btn-outline-success' : 'btn-primary'} btn-sm w-100">
                                    ${hasBeenAssessed ? 'Ubah Nilai' : 'Lakukan Penilaian'}
                                </a>
                        </div>
                    </div>
                </div>
            `;
        });

        if (!hasVisibleCard) {
            document.getElementById("KKShift1List").innerHTML =
                `<div class="alert alert-info">
                    Tidak ada mahasiswa KK Shift 1 yang ditugaskan kepada Anda.
                </div>`;
            return;
        }        

        html += `</div>`;
        document.getElementById("KKShift1List").innerHTML = html;

    } catch (err) {
        console.error("Error loading KK Shift 1 data:", err);
        document.getElementById("KKShift1List").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data KK Shift 1.</div>`;
    }
}
