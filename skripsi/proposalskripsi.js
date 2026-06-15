const PROPOSALSKRIPSI_ADMIN_EMAILS = ["helmy@ugm.ac.id"];

async function loadProposalSkripsiData() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = PROPOSALSKRIPSI_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        // TUNGGU DATA SIRISMA SEBELUM RENDER CARD
        if (typeof window.loadSirismaData === 'function') {
            await window.loadSirismaData();
        }

        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values?.slice(1) || [];
        const proposalSkripsiRows = rows.filter(r => r[0]?.trim().toLowerCase() === "seminar proposal");

        const listContainer = document.getElementById("proposalSkripsiList");
        if (!listContainer) return; // Keamanan DOM SPA

        if (proposalSkripsiRows.length === 0) {
            listContainer.innerHTML = `<div class="alert alert-info">Tidak ada mahasiswa seminar proposal skripsi.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        let hasVisibleCard = false;
        
        proposalSkripsiRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judulproposal] = r;

            const COL_LINK = 9; 
            const linkGoogleDriveProposal = r[COL_LINK] || "";
            const ketua = r[93] || ""; const penguji1 = r[94] || ""; const penguji2 = r[95] || "";

            let role = null; let colCheck = null;
            if (ketua.toLowerCase() === currentEmail) { role = "ketuaSidang"; colCheck = 18; } 
            else if (penguji1.toLowerCase() === currentEmail) { role = "penguji1"; colCheck = 27; } 
            else if (penguji2.toLowerCase() === currentEmail) { role = "penguji2"; colCheck = 36; } 
            else if (isAdmin) { role = "admin"; colCheck = 18; } 
            else { return; }

            let hasBeenAssessed = colCheck !== null ? !!r[colCheck] : false;
            if (role === "admin") {
                hasBeenAssessed = !!r[18];
                var statusDetailAdmin = `K:${!!r[18]?'✅':'❌'} P1:${!!r[27]?'✅':'❌'} P2:${!!r[36]?'✅':'❌'}`;
            }

            const roleLabels = { "ketuaSidang": "Ketua Sidang", "penguji1": "Penguji 1", "penguji2": "Penguji 2", "admin": "Admin" };
            const statusColor = hasBeenAssessed ? "#28a745" : "#dc3545"; 
            const bgColor = hasBeenAssessed ? "#e8f5e9" : "#fff5f5";    
            const statusText = hasBeenAssessed ? "SUDAH DINILAI" : "BELUM DINILAI";
            
            hasVisibleCard = true;            
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judulproposal, linkGoogleDriveProposal, role }).toString();
            const escapedJudul = judulproposal ? judulproposal.replace(/'/g, "\\'").replace(/"/g, '&quot;') : "";

            // DETEKSI STATUS ENDORSEMENT DARI SIRISMA
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
                            <p class="card-text mb-3"><em>${judulproposal}</em></p>
                            
                            <div class="d-grid gap-2 d-md-block">
                            ${role !== "admin" ? `
                                <a href="skripsi/page_penilaianproposalskripsi.html?${encodedParams}" class="btn ${hasBeenAssessed ? 'btn-outline-success' : 'btn-primary'} btn-sm shadow-sm">
                                    <i class="bi ${hasBeenAssessed ? 'bi-pencil-square' : 'bi-check-circle'}"></i> ${hasBeenAssessed ? 'Ubah Nilai' : 'Lakukan Penilaian'}
                                </a>
                            ` : ""}

                            ${(role === "ketuaSidang" || role === "admin") ? `
                                <a href="skripsi/page_beritaproposalskripsi.html?${encodedParams}" class="btn btn-outline-primary btn-sm shadow-sm">Buat Berita Acara</a>
                                
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
            listContainer.innerHTML = `<div class="alert alert-info">Tidak ada mahasiswa Seminar Proposal yang ditugaskan kepada Anda.</div>`;
        } else {
            listContainer.innerHTML = html;
        }

    } catch (err) {
        console.error("Error loading proposal skripsi data:", err);
        const listContainer = document.getElementById("proposalSkripsiList");
        if (listContainer) {
            listContainer.innerHTML = `<div class="alert alert-danger">Gagal memuat data proposal skripsi.</div>`;
        }
    }
}