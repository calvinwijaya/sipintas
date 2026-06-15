const UJIANTESIS_ADMIN_EMAILS = ["afiat@ugm.ac.id"];

async function loadUjianTesisData() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = UJIANTESIS_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "1lg2tfyzMX99Ib-b5gZ31dGnHHqLHDpElQO22VMVaPbs";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        if (typeof window.loadSirismaData === 'function') {
            await window.loadSirismaData();
        }

        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values?.slice(1) || [];
        const ujiantesisRows = rows.filter(r => r[0]?.trim().toLowerCase() === "sidang akhir");

        if (ujiantesisRows.length === 0) {
            document.getElementById("ujiantesisList").innerHTML =
                `<div class="alert alert-info">Tidak ada mahasiswa ujian Tesis.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        let hasVisibleCard = false;        
        ujiantesisRows.forEach(r => {
            const [status, no, nama, nim, pembimbing] = r;
                        
            const COL_JUDUL_TESIS = 10;
            const judulTesis = r[COL_JUDUL_TESIS] || "";

            const COL_LINK = 15; 
            const linkGoogleDriveNaskahTesis = r[COL_LINK] || "";

            const COL_KETUA   = 136;
            const COL_PENGUJI1 = 137;
            const COL_PENGUJI2 = 138;

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
                colCheck = 98;
            } else if (isPenguji1) {
                role = "penguji1";
                colCheck = 109;
            } else if (isPenguji2) {
                role = "penguji2";
                colCheck = 120;
            } else if (isAdminHere) {
                role = "admin";
                colCheck = 98;
            } else {
                return; 
            }

            // Logika pengecekan apakah sudah dinilai            
            let hasBeenAssessed = false;
            let customStatusText = null; 

            if (role === "admin") {
                const sudahKetua   = !!r[98];
                const sudahPenguji1 = !!r[109];
                const sudahPenguji2 = !!r[120];
                
                // Admin: TRUE jika ketiganya sudah menilai
                hasBeenAssessed = (sudahKetua && sudahPenguji1 && sudahPenguji2); 
                
                // Jika belum komplit tapi ada yang mulai mengisi
                if (!hasBeenAssessed && (sudahKetua || sudahPenguji1 || sudahPenguji2)) {
                    customStatusText = "NILAI BELUM LENGKAP";
                }

                var statusDetailAdmin = `K:${sudahKetua?'✅':'❌'} P1:${sudahPenguji1?'✅':'❌'} P2:${sudahPenguji2?'✅':'❌'}`;
            
            } else if (colCheck !== null) {
                // Untuk dosen biasa
                hasBeenAssessed = !!r[colCheck]; 
            }

            const roleLabels = {
                "ketuaSidang": "Ketua Sidang",
                "penguji1": "Penguji 1",
                "penguji2": "Penguji 2",
                "admin": "Admin"
            };

            // Tentukan warna dan teks berdasarkan status
            let statusColor = "#dc3545"; // Merah
            let bgColor = "#fff5f5";
            let statusText = "BELUM DINILAI";

            if (hasBeenAssessed) {
                statusColor = "#28a745"; // Hijau
                bgColor = "#e8f5e9";
                statusText = "SUDAH DINILAI";
            } else if (customStatusText) {
                statusColor = "#fd7e14"; // Orange
                bgColor = "#fff8e6";
                statusText = customStatusText;
            }

            hasVisibleCard = true;

            const judul = judulTesis;
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judul, linkGoogleDriveNaskahTesis, role }).toString();

            const escapedJudul = judul ? judul.replace(/'/g, "\\'").replace(/"/g, '&quot;') : "";
            const niuParts = String(nim).split('/');
            const niu = niuParts.length > 1 ? niuParts[1] : nim;
            const isEndorsed = window.masterArtikelData && window.masterArtikelData.some(row => String(row[10]).includes(niu));

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
                            <p class="card-text mb-3"><em>${judul}</em></p>
                            
                            <div class="d-grid gap-2 d-md-block">
                            ${role !== "admin" ? `
                                <a href="tesis/page_penilaianujiantesis.html?${encodedParams}" 
                                   class="btn ${hasBeenAssessed ? 'btn-outline-success' : 'btn-primary'} btn-sm">
                                    <i class="bi ${hasBeenAssessed ? 'bi-pencil-square' : 'bi-check-circle'}"></i>
                                    ${hasBeenAssessed ? 'Ubah Nilai' : 'Lakukan Penilaian'}
                                </a>
                            ` : ""}

                            ${role === "ketuaSidang" || role === "admin" ? `
                                <a href="tesis/page_beritaujiantesis.html?${encodedParams}" class="btn btn-outline-primary btn-sm shadow-sm">
                                    Buat Berita Acara
                                </a>
                                
                                <button type="button" class="btn ${isEndorsed ? 'btn-warning' : 'btn-success'} btn-sm fw-bold ${isEndorsed ? 'text-dark' : 'text-white'} shadow-sm" 
                                    onclick="openEndorseModal('${nama}', '${nim}', '${escapedJudul}')">
                                    <i class="bi ${isEndorsed ? 'bi-pencil-square' : 'bi-journal-plus'} me-1"></i> ${isEndorsed ? 'Edit Endorse' : 'Endorse Artikel'}
                                </button>
                            ` : ""}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        if (!hasVisibleCard) {
            document.getElementById("ujiantesisList").innerHTML =
                `<div class="alert alert-info">
                    Tidak ada mahasiswa Ujian Tesis yang ditugaskan kepada Anda.
                </div>`;
            return;
        }

        document.getElementById("ujiantesisList").innerHTML = html;

    } catch (err) {
        console.error("Error loading ujian tesis data:", err);
        document.getElementById("ujiantesisList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data ujian Tesis.</div>`;
    }
}