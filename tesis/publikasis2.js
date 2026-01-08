const PUBLIKASI_ADMIN_EMAILS = ["afiat@ugm.ac.id"];

async function loadPublikasiS2Data() {
    console.log("Script running...");

    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = PUBLIKASI_ADMIN_EMAILS.includes(currentEmail);

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
        let hasVisibleCard = false;
        publikasiS2Rows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judulProposal, ketuasidangproposal, penguji1proposal, penguji2proposal, judulTesis] = r;
            
            const COL_KETUA   = 133;
            const COL_PENGUJI1 = 134;
            const COL_PENGUJI2 = 135;

            const ketua   = r[COL_KETUA]   || "";
            const penguji1 = r[COL_PENGUJI1] || "";
            const penguji2 = r[COL_PENGUJI2] || "";

            const isKetua   = ketua.toLowerCase() === currentEmail;
            const isPenguji1 = penguji1.toLowerCase() === currentEmail;
            const isPenguji2 = penguji2.toLowerCase() === currentEmail;
            const isAdminHere = isAdmin;

            let role = null;

            // Role assignment
            if (isKetua) role = "ketuaSidang";
            else if (isPenguji1) role = "penguji1";
            else if (isPenguji2) role = "penguji2";
            else if (isAdminHere) role = "admin";
            else return; // user not related to this proposal

            hasVisibleCard = true;
            
            const judul = judulTesis;
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judul, role }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text"><em>${judul}</em></p>
                            ${role !== "admin" ? `
                                <a href="tesis/page_penilaianpublikasimagister.html?${encodedParams}" class="btn btn-primary btn-sm">
                                    Lakukan Penilaian
                                </a>
                            ` : ""}

                            ${role === "ketuaSidang" || role === "admin" ? `
                                <a href="tesis/page_beritapublikasimagister.html?${encodedParams}" class="btn btn-primary btn-sm">
                                    Buat Berita Acara
                            </a>
                            ` : ""}
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        if (!hasVisibleCard) {
            document.getElementById("publikasiS2List").innerHTML =
                `<div class="alert alert-info">
                    Tidak ada Penilaian Publikasi Mahasiswa S2 yang ditugaskan kepada Anda.
                </div>`;
            return;
        }

        document.getElementById("publikasiS2List").innerHTML = html;

    } catch (err) {
        console.error("Error loading naskah publikasi data:", err);
        document.getElementById("publikasiS2List").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data naskah publikasi.</div>`;
    }
}