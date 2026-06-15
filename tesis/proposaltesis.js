const PROPOSAL_ADMIN_EMAILS = ["afiat@ugm.ac.id", "calvin.wijaya@mail.ugm.ac.id"];

async function loadProposalData() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = PROPOSAL_ADMIN_EMAILS.includes(currentEmail);

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
        const proposalRows = rows.filter(r => r[0]?.trim().toLowerCase() === "proposal");

        if (proposalRows.length === 0) {
            document.getElementById("proposalTesisList").innerHTML =
                `<div class="alert alert-info">Tidak ada mahasiswa ujian proposal.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        let hasVisibleCard = false;
        proposalRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judul] = r;

            const COL_LINK = 9; 
            const linkGoogleDriveProposalTesis = r[COL_LINK] || "";

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
            let colCheck = null;

            // Role assignment
            if (isKetua) {
                role = "ketuaSidang";
                colCheck = 22;
            } else if (isPenguji1) {
                role = "penguji1";
                colCheck = 34;
            } else if (isPenguji2) {
                role = "penguji2";
                colCheck = 46;
            } else if (isAdminHere) {
                role = "admin";
                colCheck = 22;
            } else {
                return; 
            }

            // Logika pengecekan apakah sudah dinilai            
            let hasBeenAssessed = false;
            
            // Variabel untuk menyimpan status teks kustom agar lebih detail (khusus Admin)
            let customStatusText = null; 

            if (role === "admin") {
                const sudahKetua   = !!r[22];
                const sudahPenguji1 = !!r[34];
                const sudahPenguji2 = !!r[46];
                
                // Status Admin: TRUE HANYA JIKA ketiganya sudah menilai
                hasBeenAssessed = (sudahKetua && sudahPenguji1 && sudahPenguji2); 
                
                // Jika belum lengkap, tapi sudah ada minimal 1 yang menilai, ubah teksnya
                if (!hasBeenAssessed && (sudahKetua || sudahPenguji1 || sudahPenguji2)) {
                    customStatusText = "NILAI BELUM LENGKAP";
                }

                // Info detail checkbox untuk Admin
                var statusDetailAdmin = `K:${sudahKetua?'✅':'❌'} P1:${sudahPenguji1?'✅':'❌'} P2:${sudahPenguji2?'✅':'❌'}`;
            
            } else if (colCheck !== null) {
                // Untuk dosen biasa, cek kolom miliknya sendiri
                hasBeenAssessed = !!r[colCheck]; 
            }

            const roleLabels = {
                "ketuaSidang": "Ketua Sidang",
                "penguji1": "Penguji 1",
                "penguji2": "Penguji 2",
                "admin": "Admin"
            };

            // Tentukan warna berdasarkan status
            // Jika 'hasBeenAssessed' = true -> Hijau
            // Jika customStatusText ada nilainya ("NILAI BELUM LENGKAP") -> Kuning/Orange (opsional)
            // Jika tidak keduanya -> Merah (BELUM DINILAI sama sekali)
            
            let statusColor = "#dc3545"; // Default Merah
            let bgColor = "#fff5f5";
            let statusText = "BELUM DINILAI";

            if (hasBeenAssessed) {
                statusColor = "#28a745"; // Hijau
                bgColor = "#e8f5e9";
                statusText = "SUDAH DINILAI";
            } else if (customStatusText) {
                statusColor = "#fd7e14"; // Orange agar terlihat "Sedang proses"
                bgColor = "#fff8e6";
                statusText = customStatusText; // "NILAI BELUM LENGKAP"
            }

            hasVisibleCard = true;

            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judul, linkGoogleDriveProposalTesis, role }).toString();

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
                                <a href="tesis/page_penilaianproposaltesis.html?${encodedParams}" 
                                   class="btn ${hasBeenAssessed ? 'btn-outline-success' : 'btn-primary'} btn-sm">
                                    <i class="bi ${hasBeenAssessed ? 'bi-pencil-square' : 'bi-check-circle'}"></i>
                                    ${hasBeenAssessed ? 'Ubah Nilai' : 'Lakukan Penilaian'}
                                </a>
                            ` : ""}

                            ${role === "ketuaSidang" || role === "admin" ? `
                                <a href="tesis/page_beritaproposaltesis.html?${encodedParams}" class="btn btn-outline-primary btn-sm shadow-sm">
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
            document.getElementById("proposalTesisList").innerHTML =
                `<div class="alert alert-info">
                    Tidak ada mahasiswa Seminar Proposal yang ditugaskan kepada Anda.
                </div>`;
            return;
        }

        document.getElementById("proposalTesisList").innerHTML = html;

    } catch (err) {
        console.error("Error loading proposal data:", err);
        document.getElementById("proposalTesisList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data proposal.</div>`;
    }
}