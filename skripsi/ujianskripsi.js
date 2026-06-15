const UJIANSKRIPSI_ADMIN_EMAILS = ["helmy@ugm.ac.id"];

async function loadUjianSkripsiData() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = UJIANSKRIPSI_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    // GEMBOK KEAMANAN AWAL
    const listContainer = document.getElementById("ujianSkripsiList");
    if (!listContainer) return;

    try {
        if (typeof window.loadSirismaData === 'function') {
            await window.loadSirismaData();
        }

        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values?.slice(1) || [];
        const ujianSkripsiRows = rows.filter(r => r[0]?.trim().toLowerCase() === "seminar akhir");

        // GEMBOK KEAMANAN KEDUA (Mencegah error null setelah fetch selesai)
        const currentContainer = document.getElementById("ujianSkripsiList");
        if (!currentContainer) return; 

        if (ujianSkripsiRows.length === 0) {
            currentContainer.innerHTML = `<div class="alert alert-info">Tidak ada mahasiswa seminar akhir skripsi.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        let hasVisibleCard = false;
        
        ujianSkripsiRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judulproposal] = r;

            const judulskripsi = r[10] || "";
            const linkGoogleDriveSkripsi = r[14] || "";
            const ketua = r[97] || ""; const penguji1 = r[98] || ""; const penguji2 = r[99] || "";

            let role = null; let colCheck = null;
            if (ketua.toLowerCase() === currentEmail) { role = "ketuaSidang"; colCheck = 48; } 
            else if (penguji1.toLowerCase() === currentEmail) { role = "penguji1"; colCheck = 62; } 
            else if (penguji2.toLowerCase() === currentEmail) { role = "penguji2"; colCheck = 76; } 
            else if (isAdmin) { role = "admin"; colCheck = 48; } 
            else { return; }

            let hasBeenAssessed = colCheck !== null ? !!r[colCheck] : false;
            if (role === "admin") {
                hasBeenAssessed = !!r[48];
                var statusDetailAdmin = `K:${!!r[48]?'✅':'❌'} P1:${!!r[62]?'✅':'❌'} P2:${!!r[76]?'✅':'❌'}`;
            }

            const roleLabels = { "ketuaSidang": "Ketua Sidang", "penguji1": "Penguji 1", "penguji2": "Penguji 2", "admin": "Admin" };
            const statusColor = hasBeenAssessed ? "#28a745" : "#dc3545"; 
            const bgColor = hasBeenAssessed ? "#e8f5e9" : "#fff5f5";    
            const statusText = hasBeenAssessed ? "SUDAH DINILAI" : "BELUM DINILAI";
            
            hasVisibleCard = true;            
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judulproposal, judulskripsi, linkGoogleDriveSkripsi, role }).toString();
            const escapedJudul = judulskripsi ? judulskripsi.replace(/'/g, "\\'").replace(/"/g, '&quot;') : "";

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
                            <p class="card-text mb-3"><em>${judulskripsi}</em></p>
                            
                            <div class="d-grid gap-2 d-md-block">
                            ${role !== "admin" ? `
                                <a href="skripsi/page_penilaianujianskripsi.html?${encodedParams}" class="btn ${hasBeenAssessed ? 'btn-outline-success' : 'btn-primary'} btn-sm shadow-sm">
                                    <i class="bi ${hasBeenAssessed ? 'bi-pencil-square' : 'bi-check-circle'}"></i> ${hasBeenAssessed ? 'Ubah Nilai' : 'Lakukan Penilaian'}
                                </a>
                            ` : ""}

                            ${(role === "ketuaSidang" || role === "admin") ? `
                                <a href="skripsi/page_beritaujianskripsi.html?${encodedParams}" class="btn btn-outline-primary btn-sm shadow-sm">Buat Berita Acara</a>
                                
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
            currentContainer.innerHTML = `<div class="alert alert-info">Tidak ada mahasiswa Seminar Akhir Skripsi yang ditugaskan kepada Anda.</div>`;
        } else {
            currentContainer.innerHTML = html;
        }

    } catch (err) {
        console.error("Error loading ujian skripsi data:", err);
        const errContainer = document.getElementById("ujianSkripsiList");
        if (errContainer) {
            errContainer.innerHTML = `<div class="alert alert-danger">Gagal memuat data ujian skripsi.</div>`;
        }
    }
}