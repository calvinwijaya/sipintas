const UJIANSKRIPSI_ADMIN_EMAILS = ["helmy@ugm.ac.id"];

async function loadUjianSkripsiData() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = UJIANSKRIPSI_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values?.slice(1) || [];
        const ujianSkripsiRows = rows.filter(r => r[0]?.trim().toLowerCase() === "seminar akhir");

        if (ujianSkripsiRows.length === 0) {
            document.getElementById("ujianSkripsiList").innerHTML =
                `<div class="alert alert-info">Tidak ada mahasiswa seminar akhir skripsi.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        let hasVisibleCard = false;
        ujianSkripsiRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judulproposal] = r;

            const COL_JUDUL_SKRIPSI = 10;
            const judulskripsi = r[COL_JUDUL_SKRIPSI] || "";

            const COL_LINK = 14;
            const linkGoogleDriveSkripsi = r[COL_LINK] || "";

            const COL_KETUA   = 97;
            const COL_PENGUJI1 = 98;
            const COL_PENGUJI2 = 99;

            const ketua   = r[COL_KETUA]   || "";
            const penguji1 = r[COL_PENGUJI1] || "";
            const penguji2 = r[COL_PENGUJI2] || "";

            const isKetua   = ketua.toLowerCase() === currentEmail;
            const isPenguji1 = penguji1.toLowerCase() === currentEmail;
            const isPenguji2 = penguji2.toLowerCase() === currentEmail;
            const isAdminHere = isAdmin;

            let role = null;
            let colCheck = null;

            // Role assignment
            if (isKetua) {
                role = "ketuaSidang";
                colCheck = 48;
            } else if (isPenguji1) {
                role = "penguji1";
                colCheck = 62;
            } else if (isPenguji2) {
                role = "penguji2";
                colCheck = 76;
            } else if (isAdminHere) {
                role = "admin";
                colCheck = 48;
            } else {
                return; 
            }

            // Logika pengecekan apakah sudah dinilai            
            let hasBeenAssessed = false;
            if (colCheck !== null) {
                hasBeenAssessed = !!r[colCheck]; 
            }

            if (role === "admin") {
                const sudahKetua   = !!r[48];
                const sudahPenguji1 = !!r[62];
                const sudahPenguji2 = !!r[76];
                
                // Admin dianggap "Sudah Dinilai" jika Ketua sudah mengisi
                hasBeenAssessed = sudahKetua; 
                
                // Opsional: Tambahkan info tambahan untuk Admin nantinya
                var statusDetailAdmin = `K:${sudahKetua?'✅':'❌'} P1:${sudahPenguji1?'✅':'❌'} P2:${sudahPenguji2?'✅':'❌'}`;
            }

            const roleLabels = {
                "ketuaSidang": "Ketua Sidang",
                "penguji1": "Penguji 1",
                "penguji2": "Penguji 2",
                "admin": "Admin"
            };

            // Tentukan warna dan teks berdasarkan status
            const statusColor = hasBeenAssessed ? "#28a745" : "#dc3545"; 
            const bgColor = hasBeenAssessed ? "#e8f5e9" : "#fff5f5";    
            const statusText = hasBeenAssessed ? "SUDAH DINILAI" : "BELUM DINILAI";

            hasVisibleCard = true;                        
            
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judulproposal, judulskripsi, linkGoogleDriveSkripsi, role }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm h-100" style="border-top: 5px solid ${statusColor}; background-color: ${bgColor};">
                        <div class="card-body">

                        <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge" style="background-color: ${statusColor};">${statusText}</span>
                                <small class="text-muted fw-bold">
                                    ${role === "admin" ? statusDetailAdmin : `Sebagai: ${roleLabels[role] || role}`}
                                </small>
                            </div>

                            <h5 class="card-title fw-bold">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text mb-1"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text mb-3"><em>${judulskripsi}</em></p>
                            
                            <div class="d-grid gap-2 d-md-block">
                            ${role !== "admin" ? `
                                <a href="skripsi/page_penilaianujianskripsi.html?${encodedParams}" 
                                   class="btn ${hasBeenAssessed ? 'btn-outline-success' : 'btn-primary'} btn-sm">
                                    <i class="bi ${hasBeenAssessed ? 'bi-pencil-square' : 'bi-check-circle'}"></i>
                                    ${hasBeenAssessed ? 'Ubah Nilai' : 'Lakukan Penilaian'}
                                </a>
                            ` : ""}

                            ${role === "ketuaSidang" || role === "admin" ? `
                                <a href="skripsi/page_beritaujianskripsi.html?${encodedParams}" class="btn btn-outline-primary btn-sm">
                                    Buat Berita Acara
                                </a>
                            ` : ""}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        if (!hasVisibleCard) {
            document.getElementById("ujianSkripsiList").innerHTML =
                `<div class="alert alert-info">
                    Tidak ada mahasiswa Seminar Akhir Skripsi yang ditugaskan kepada Anda.
                </div>`;
            return;
        }        

        document.getElementById("ujianSkripsiList").innerHTML = html;

    } catch (err) {
        console.error("Error loading ujian skripsi data:", err);
        document.getElementById("ujianSkripsiList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data ujian skripsi.</div>`;
    }
}