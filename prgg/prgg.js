const PRGG_ADMIN_EMAILS = ["calvin.wijaya@ugm.ac.id"];

async function loadPRGGData() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = PRGG_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "1QoEaLGGlwcZelKzwyWfk5o3ztAr6cH1VhwdIR7vBkxg";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const prggRows = data.values?.slice(1) || [];

        if (prggRows.length === 0) {
            document.getElementById("prggList").innerHTML =
                `<div class="alert alert-info">Tidak ada kelompok PRGG.</div>`;
            return;
        }

        // Group students by Kelompok
        const groups = {};
        prggRows.forEach(r => {
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
            const linkGDriveProposalPRGG = rows[0][7] || "";
            const linkGDriveLapPendahuluanPRGG = rows[0][8] || "";
            const linkGDriveLapAntaraPRGG = rows[0][9] || "";
            const linkGDriveLapAkhirPRGG = rows[0][10] || "";
            const linkGDrivePosterPRGG = rows[0][11] || "";
            const linkProdukPRGG = rows[0][12] || "";

            const COL_PEMBIMBING   = 68;
            const COL_PENGUJI1 = 69;
            const COL_PENGUJI2 = 70;

            const email_pembimbing = rows[0][COL_PEMBIMBING] || "";
            const penguji1 = rows[0][COL_PENGUJI1] || "";
            const penguji2 = rows[0][COL_PENGUJI2] || "";

            const isPembimbing = (email_pembimbing || "").toLowerCase().trim() === currentEmail;
            const isPenguji1   = (penguji1 || "").toLowerCase().trim() === currentEmail;
            const isPenguji2   = (penguji2 || "").toLowerCase().trim() === currentEmail;
            const isAdminHere = isAdmin;

            let role = null;

            // Role assignment
            if (isPembimbing) role = "pembimbing";
            else if (isPenguji1) role = "penguji1";
            else if (isPenguji2) role = "penguji2";
            else if (isAdminHere) role = "admin";
            else return;

            hasVisibleCard = true;

            const encodedParams = new URLSearchParams({
                pembimbing, 
                topik, 
                linkGDriveProposalPRGG, 
                linkGDriveLapPendahuluanPRGG, 
                linkGDriveLapAntaraPRGG, 
                linkGDriveLapAkhirPRGG, 
                linkGDrivePosterPRGG,
                linkProdukPRGG,
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
                    <div class="card shadow-sm h-100">
                        <div class="card-body text-center">
                            <h4 class="fw-bold text-primary mb-1">Kelompok ${kelompok}</h4>
                            <ol class="text-start small mb-3 ps-3">
                                ${rows.map(r => `<li>${r[1]}</li>`).join("")}
                            </ol>
                            <a href="prgg/page_penilaianprgg.html?${encodedParams}"
                            class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        if (!hasVisibleCard) {
            document.getElementById("prggList").innerHTML =
                `<div class="alert alert-info">
                    Tidak ada kelompok mahasiswa PRGG yang ditugaskan kepada Anda.
                </div>`;
            return;
        }        

        html += `</div>`;
        document.getElementById("prggList").innerHTML = html;

    } catch (err) {
        console.error("Error loading PRGG data:", err);
        document.getElementById("prggList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data PRGG.</div>`;
    }
}
