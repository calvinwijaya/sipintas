const ADMIN_EMAILS = [
    "afiat@ugm.ac.id",
    "helmy@ugm.ac.id",
    "calvin.wijaya@mail.ugm.ac.id",
    "cecep.pratama@ugm.ac.id",
    "herisutanta@ugm.ac.id",
    "madeandi@ugm.ac.id"
];

async function loadRekapSkripsiData() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values?.slice(1) || [];
        const validStatuses = ["selesai", "seminar akhir"];
        
        const COL_KETUA = 97;
        const COL_PENGUJI1 = 98;
        const COL_PENGUJI2 = 99;

        const rekapskripsiRows = rows.filter(r => {
            const status = r[0]?.trim().toLowerCase();
            if (!validStatuses.includes(status)) return false;
            if (isAdmin) return true;
            const ketua = (r[COL_KETUA] || "").toLowerCase();
            if (ketua === currentEmail) return true;
            return false;
        });

        let userRole = null;

        // PRIORITAS 1: Admin selalu menang
        if (isAdmin) {
            userRole = "admin";
        } else {
            // PRIORITAS 2 & 3: Hanya cek Ketua/Penguji jika dia bukan Admin
            for (const r of rekapskripsiRows) {
                const ketua = (r[COL_KETUA] || "").toLowerCase();
                const penguji1 = (r[COL_PENGUJI1] || "").toLowerCase();
                const penguji2 = (r[COL_PENGUJI2] || "").toLowerCase();

                if (ketua === currentEmail) {
                    userRole = "ketuaSidang";
                    break;
                }
                if (penguji1 === currentEmail || penguji2 === currentEmail) {
                    userRole = "penguji";
                    // Jangan dibreak, karena siapa tahu di baris berikutnya dia ketua sidang
                }
            }
        }

        // Sekarang validasi alert-nya jadi lebih pasti
        if (userRole === "penguji") {
            document.getElementById("rekapskripsiList").innerHTML = `
                <div class="alert alert-warning">
                    Anda terdaftar sebagai <strong>Penguji</strong>.
                    Menu rekapitulasi nilai hanya dapat diakses oleh
                    <strong>Ketua Sidang</strong> atau <strong>Administrator</strong>.
                </div>
            `;
            return;
        }

        if (userRole !== "ketuaSidang" && userRole !== "admin") {
            document.getElementById("rekapskripsiList").innerHTML = `
                <div class="alert alert-info">
                    Anda tidak memiliki hak akses ke menu ini.
                </div>
            `;
            return;
        }

        if (rekapskripsiRows.length === 0) {
            document.getElementById("rekapskripsiList").innerHTML =
                `<div class="alert alert-info">Belum ada mahasiswa yang selesai ujian skripsi.</div>`;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-bordered table-striped align-middle table-hover">
                    <thead class="table-primary text-center">
                        <tr>
                            <th style="width: 5%">No</th>
                            <th style="width: 25%">Nama</th>
                            <th style="width: 15%">NIM</th>
                            <th style="width: 20%">Pembimbing</th>
                            <th style="width: 25%">Judul Skripsi</th>
                            <th style="width: 10%">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Looping untuk setiap baris data
        rekapskripsiRows.forEach((r, index) => {
            const [status, no, nama, nim, pembimbing, judulProposal, ketuaSidangProposal, penguji1Proposal, penguji2Proposal, linkGDriveProposal, judulskripsi] = r;

            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judulProposal, judulskripsi, role: userRole }).toString();

            // Tambahkan baris <tr> untuk setiap mahasiswa
            html += `
                        <tr>
                            <td class="text-center">${index + 1}</td>
                            <td class="fw-bold">${nama}</td>
                            <td class="text-center">${nim}</td>
                            <td>${pembimbing}</td>
                            <td><small><em>${judulskripsi}</em></small></td>
                            <td class="text-center">
                                <a href="skripsi/page_rekapskripsi.html?${encodedParams}" class="btn btn-primary btn-sm w-100">
                                    <i class="bi bi-card-checklist"></i> Lihat Nilai
                                </a>
                            </td>
                        </tr>
            `;
        });

        // Tutup tag tabel
        html += `
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById("rekapskripsiList").innerHTML = html;

    } catch (err) {
        console.error("Error loading rekap skripsi data:", err);
        document.getElementById("rekapskripsiList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data rekap Skripsi.</div>`;
    }
}