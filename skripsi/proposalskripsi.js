const PROPOSALSKRIPSI_ADMIN_EMAILS = ["helmy@ugm.ac.id"];

async function loadProposalSkripsiData() {
    console.log("Script running...");

    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = PROPOSALSKRIPSI_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched data:", data);

        const rows = data.values?.slice(1) || [];
        console.log("Rows:", rows);

        const proposalSkripsiRows = rows.filter(r => r[0]?.trim().toLowerCase() === "seminar proposal");
        console.log("Proposal skripsi rows:", proposalSkripsiRows);

        if (proposalSkripsiRows.length === 0) {
            document.getElementById("proposalSkripsiList").innerHTML =
                `<div class="alert alert-info">Tidak ada mahasiswa seminar proposal skripsi.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        let hasVisibleCard = false;
        proposalSkripsiRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judulproposal] = r;

            const COL_KETUA   = 94;
            const COL_PENGUJI1 = 95;
            const COL_PENGUJI2 = 96;

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
            else return; 

            hasVisibleCard = true;            

            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judulproposal, role }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text"><em>${judulproposal}</em></p>
                            ${role !== "admin" ? `
                                <a href="skripsi/page_penilaianproposalskripsi.html?${encodedParams}" class="btn btn-primary btn-sm">
                                    Lakukan Penilaian
                                </a>
                            ` : ""}

                            ${role === "ketuaSidang" || role === "admin" ? `
                                <a href="skripsi/page_beritaproposalskripsi.html?${encodedParams}" class="btn btn-primary btn-sm">
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
            document.getElementById("proposalSkripsiList").innerHTML =
                `<div class="alert alert-info">
                    Tidak ada mahasiswa Seminar Proposal yang ditugaskan kepada Anda.
                </div>`;
            return;
        }

        document.getElementById("proposalSkripsiList").innerHTML = html;

    } catch (err) {
        console.error("Error loading proposal skripsi data:", err);
        document.getElementById("proposalSkripsiList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data proposal skripsi.</div>`;
    }
}