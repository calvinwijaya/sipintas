const ADMIN_EMAILS = [
    "afiat@ugm.ac.id",
    "helmy@ugm.ac.id",
    "calvin.wijaya@mail.ugm.ac.id",
    "cecep.pratama@ugm.ac.id",
    "herisutanta@ugm.ac.id",
    "madeandi@ugm.ac.id"
];

async function loadRekapSkripsiData() {
    console.log("Script running...");

    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();

    const isAdmin = ADMIN_EMAILS.includes(currentEmail);

    // If not admin, immediately show restricted message
    if (!isAdmin) {
        document.getElementById("rekaptesisList").innerHTML = `
        <div class="alert alert-info">
            Menu ini hanya bisa diakses oleh administrator atau enumerator.
        </div>
        `;
        return;
    }

    const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched data:", data);

        const rows = data.values?.slice(1) || [];
        console.log("Rows:", rows);

        const rekapskripsiRows = rows.filter(r => r[0]?.trim().toLowerCase() === "selesai");
        console.log("Rekap Skripsi rows:", rekapskripsiRows);

        if (rekapskripsiRows.length === 0) {
            document.getElementById("rekapskripsiList").innerHTML =
                `<div class="alert alert-info">Belum ada mahasiswa yang selesai ujian skripsi.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        rekapskripsiRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judulProposal, ketuaSidangProposal, penguji1Proposal, penguji2Proposal, linkGDriveProposal, judulskripsi] = r;
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judulProposal, judulskripsi }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text"><em>${judulskripsi}</em></p>
                            <a href="skripsi/page_rekapskripsi.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Rekapitulasi Nilai
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById("rekapskripsiList").innerHTML = html;

    } catch (err) {
        console.error("Error loading rekap skripsi data:", err);
        document.getElementById("rekapskripsiList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data rekap Skripsi.</div>`;
    }
}