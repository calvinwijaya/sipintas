const REKAPTESIS_ADMIN_EMAILS = [
    "afiat@ugm.ac.id",
    "helmy@ugm.ac.id",
    "calvin.wijaya@mail.ugm.ac.id",
    "cecep.pratama@ugm.ac.id",
    "herisutanta@ugm.ac.id",
    "madeandi@ugm.ac.id"
];

async function loadRekapTesisData() {
    console.log("Script running...");
    
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = REKAPTESIS_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "1lg2tfyzMX99Ib-b5gZ31dGnHHqLHDpElQO22VMVaPbs";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values?.slice(1) || [];
        const validStatuses = ["selesai", "sidang akhir"];
        
        const COL_KETUA   = 136;
        const COL_PENGUJI1 = 137;
        const COL_PENGUJI2 = 138;

        const rekaptesisRows = rows.filter(r => {
            const status = r[0]?.trim().toLowerCase();
            if (!validStatuses.includes(status)) return false;
            if (isAdmin) return true;
            const ketua = (r[COL_KETUA] || "").toLowerCase();
            if (ketua === currentEmail) return true;
            return false;
        });

        let userRole = null;

        for (const r of rekaptesisRows) {
            const ketua = (r[COL_KETUA] || "").toLowerCase();
            const penguji1 = (r[COL_PENGUJI1] || "").toLowerCase();
            const penguji2 = (r[COL_PENGUJI2] || "").toLowerCase();

            if (ketua === currentEmail) {
                userRole = "ketuaSidang";
                break;
            }
            if (penguji1 === currentEmail || penguji2 === currentEmail) {
                userRole = "penguji";
            }
        }

        if (rekaptesisRows.length === 0) {
            document.getElementById("rekaptesisList").innerHTML = `
                <div class="alert alert-info">
                    Tidak ada mahasiswa tesis dengan status <strong>selesai</strong>
                    yang berada di bawah kewenangan Anda.
                </div>
            `;
            return;
        }

        if (!userRole && isAdmin) {
            userRole = "admin";
        }

        if (userRole === "penguji") {
            document.getElementById("rekaptesisList").innerHTML = `
                <div class="alert alert-warning">
                    Anda terdaftar sebagai <strong>Penguji</strong>.
                    Menu rekapitulasi nilai hanya dapat diakses oleh
                    <strong>Ketua Sidang</strong> atau <strong>Administrator</strong>.
                </div>
            `;
            return;
        }

        if (userRole !== "ketuaSidang" && userRole !== "admin") {
            document.getElementById("rekaptesisList").innerHTML = `
                <div class="alert alert-info">
                    Anda tidak memiliki hak akses ke menu ini.
                </div>
            `;
            return;
        }        

        if (rekaptesisRows.length === 0) {
            document.getElementById("rekaptesisList").innerHTML =
                `<div class="alert alert-info">Belum ada mahasiswa yang selesai ujian Tesis.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        rekaptesisRows.forEach(r => {
            const [status, no, nama, nim, pembimbing] = r;
            const COL_JUDUL_TESIS = 10;
            const judulTesis = r[COL_JUDUL_TESIS] || "";
            hasVisibleCard = true;
            const judul = judulTesis;
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judul, role: userRole }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text"><em>${judul}</em></p>
                            <a href="tesis/page_rekaptesis.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Rekapitulasi Nilai
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        document.getElementById("rekaptesisList").innerHTML = html;

    } catch (err) {
        console.error("Error loading rekap tesis data:", err);
        document.getElementById("rekaptesisList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data rekap Tesis.</div>`;
    }
}