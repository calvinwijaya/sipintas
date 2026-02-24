const KP_ADMIN_EMAILS = ["cecep.pratama@ugm.ac.id"];

async function loadKPData() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = KP_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "1oGXhRIAonDGN4MCLLbhAKcNef-VYNVTimPw6fP-BKJM";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const kpRows = data.values?.slice(1) || [];

        if (kpRows.length === 0) {
            document.getElementById("kerjapraktikList").innerHTML =
                `<div class="alert alert-info">Tidak ada kelompok Kerja Praktik.</div>`;
            return;
        }

        // Group students by Kelompok
        const groups = {};
        kpRows.forEach(r => {
            const no       = r[0];
            const nama     = r[1];
            const nim      = r[2];
            const kelompok = r[3];
            const niu     = r[4];
            const pembimbing = r[5];
            const topik = r[6];
            if (!groups[kelompok]) groups[kelompok] = [];
            groups[kelompok].push(r);
        });

        // Build HTML
        let html = `<div class="row g-3">`;
        let hasVisibleCard = false;

        Object.entries(groups).forEach(([kelompok, rows]) => {
            const pembimbing = rows[0][5] || "";
            const topik = rows[0][6] || "";
            const linkGDriveProposalKP = rows[0][7] || "";
            const linkGDriveLapAkhirKP = rows[0][8] || "";

            const COL_PEMBIMBING   = 46;

            const email_pembimbing = rows[0][COL_PEMBIMBING] || "";

            // Indices for checking if scores already exist
            const COL_SCORE_PEMBIMBING = 22; // Col W

            const isPembimbing = (email_pembimbing || "").toLowerCase().trim() === currentEmail;
            const isAdminHere = isAdmin;

            let role = null;
            let hasBeenAssessed = false;

            // Role assignment
            // 2. Assign Role AND Check if already assessed
            // We check rows[0] because if one student in the group is graded, 
            // usually the whole group session is done.
            if (isPembimbing) {
                role = "pembimbing";
                hasBeenAssessed = !!rows[0][COL_SCORE_PEMBIMBING]; 
            }  else if (isAdminHere) {
                role = "admin";
            } else {
                return; // Skip if not authorized
            }

            // 3. Define Styles based on Role and Status
            const statusColor = hasBeenAssessed ? "#28a745" : "#dc3545"; // Green if done, Red if pending
            const bgColor = hasBeenAssessed ? "#e8f5e9" : "#fff5f5";    // Very light green vs light red
            const statusText = hasBeenAssessed ? "SUDAH DINILAI" : "BELUM DINILAI";

            hasVisibleCard = true;

            const encodedParams = new URLSearchParams({
                pembimbing, 
                topik, 
                linkGDriveProposalKP, 
                linkGDriveLapAkhirKP,
                kelompok,
                role
            });
            encodedParams.append("kelompok", kelompok);

            rows.forEach((r, idx) => {
                encodedParams.append("nama" + (idx + 1), r[1]);
                encodedParams.append("nim" + (idx + 1), r[2]);
                encodedParams.append("niu" + (idx + 1), r[4]);
            });

            html += `
                    <div class="col-md-4">
                        <div class="card shadow-sm h-100" style="border-top: 5px solid ${statusColor}; background-color: ${bgColor};">
                            <div class="card-body text-center">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="badge bg-secondary small">${role.toUpperCase()}</span>
                                    <span class="fw-bold small" style="color: ${statusColor};">${statusText}</span>
                                </div>
                                
                                <h4 class="fw-bold mb-1">Kelompok ${kelompok}</h4>
                                <p class="text-muted small mb-2">${topik.substring(0, 50)}...</p>
                                
                                <ol class="text-start small mb-3 ps-3">
                                    ${rows.map(r => `<li>${r[1]}</li>`).join("")}
                                </ol>
                                
                                <a href="kerjapraktik/page_penilaiankp.html?${encodedParams}"
                                class="btn ${hasBeenAssessed ? 'btn-outline-success' : 'btn-primary'} btn-sm w-100">
                                    ${hasBeenAssessed ? 'Ubah Nilai' : 'Lakukan Penilaian'}
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            });

        if (!hasVisibleCard) {
            document.getElementById("kerjapraktikList").innerHTML =
                `<div class="alert alert-info">
                    Tidak ada kelompok mahasiswa Kerja Praktik yang ditugaskan kepada Anda.
                </div>`;
            return;
        }        

        html += `</div>`;
        document.getElementById("kerjapraktikList").innerHTML = html;

    } catch (err) {
        console.error("Error loading Kerja Praktik data:", err);
        document.getElementById("kerjapraktikList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data Kerja Praktik.</div>`;
    }
}
