// ===================================================================
// KONFIGURASI SIRISMA UNTUK SIPINTAS
// ===================================================================

// TODO: GANTI URL DI BAWAH INI SESUAI DENGAN WEB APP SIRISMA ANDA
const GAS_LOGIN = "https://script.google.com/macros/s/AKfycbyzb9CRyCDC2m-KEzp7_or8jj-hkGm1Zv1GM9xDqezYVGX0BSqPNIC8J_RcFDwWEnxo/exec";
const GAS_DATABASE = "https://script.google.com/macros/s/AKfycbxjBGq7BJ0CfSkFMqzu41WjexwKf7XxBoL42Htw9OMPNglCUduvp22ouFgSepGGe_o/exec";
const GAS_MAHASISWA = "https://script.google.com/macros/s/AKfycbywanxoTB4sJStnJmDLlrjlaNVHiaBz8DPA_LCR8sMJqE84T4B4NgyOCcZ1kuzcs8kC/exec";

let authorCount = 0;
let studentCount = 0;

const optPeranAuthor = ["First Author", "Corresponding Author", "Co-Author"];
const optIndeksasiJurnal = ["Q1", "Q2", "Q3", "Q4", "Non-Q", "Sinta 1", "Sinta 2", "Sinta 3", "Sinta 4", "Sinta 5", "Sinta 6", "Non-Sinta"];
const optIndeksasiProsiding = ["Internasional", "Nasional"];
const optStatusJurnal = ["Draft", "Draft Ready", "Submitted", "On Review Round 1", "Revision Round 1", "Revision Round 1 Submitted", "On Review Round 2", "Revision Round 2", "Revision Round 2 Submitted", "Accepted", "Copyediting/ Proofread", "Published"];
const optStatusProsiding = ["Draft", "Draft Ready", "Submitted", "On Review", "Revision", "Revision Submitted", "Accepted", "Presented", "Published"];

const UJIANSKRIPSI_ADMIN_EMAILS = ["helmy@ugm.ac.id"];
let masterMahasiswaList = []; 
let masterDosenList = [];

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

            // Escape judul agar tidak error saat dimasukkan ke parameter fungsi onclick
            const escapedJudul = judulskripsi.replace(/'/g, "\\'").replace(/"/g, '&quot;');

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

                                <button type="button" class="btn btn-success btn-sm fw-bold text-white shadow-sm" 
                                    onclick="openEndorseModal('${nama}', '${nim}', '${escapedJudul}')">
                                    <i class="bi bi-journal-plus me-1"></i> Endorse Skripsi
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

window.openEndorseModal = async function(namaMhs, nimMhs, judulMhs) {
    // 1. Pastikan data master sudah terisi (Jika belum, ambil dulu dari GAS)
    if (masterMahasiswaList.length === 0 || masterDosenList.length === 0) {
        Swal.fire({ title: 'Memuat Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        try {
            // Asumsi GAS_MAHASISWA dan GAS_LOGIN sudah didefinisikan di config.js
            const [resMhs, resDosen] = await Promise.all([
                fetch(GAS_MAHASISWA).then(r => r.json()),
                fetch(GAS_LOGIN, { method: "POST", body: JSON.stringify({ action: "get_users" }) }).then(r => r.json())
            ]);
            
            if (resMhs.status === "ok") masterMahasiswaList = resMhs.data;
            if (resDosen.status === "ok") masterDosenList = resDosen.user;
            
            Swal.close();
        } catch (err) {
            Swal.fire('Error', 'Gagal memuat data master Dosen/Mahasiswa', 'error');
            return;
        }
    }

    // 2. Reset Form Modal
    document.getElementById("formArtikel").reset();
    document.getElementById("recordId").value = "";
    document.getElementById("authorContainer").innerHTML = "";
    document.getElementById("studentContainer").innerHTML = "";
    
    // 3. Autofill Judul dari parameter card SIPINTAS
    document.getElementById("judulArtikel").value = judulMhs;

    // 4. Autofill DOSEN (Author Pertama otomatis Dosen yang login)
    // Pastikan fungsi createAuthorRow() dari SIRISMA juga dicopy/tersedia di file ini
    if (typeof createAuthorRow === 'function') {
        createAuthorRow(true); 
    }

    // 5. Autofill MAHASISWA
    const mhs = masterMahasiswaList.find(m => String(m.nim) === String(nimMhs));
    if (mhs) {
        document.getElementById("emptyStudentText").classList.add("d-none");
        
        // Pastikan fungsi createStudentRow() juga tersedia di file ini
        if (typeof createStudentRow === 'function') {
            createStudentRow(); 
            const lastInput = document.getElementById("studentContainer").lastElementChild.querySelector('input');
            lastInput.value = `${mhs.nim} - ${mhs.nama}`;
        }
    } else {
        document.getElementById("emptyStudentText").classList.remove("d-none");
    }

    // 6. Tampilkan Modal
    const myModal = new bootstrap.Modal(document.getElementById('modalFormArtikel'));
    myModal.show();
};

// ===================================================================
// FUNGSI HELPER MODAL ENDORSE
// ===================================================================

window.updateDropdownOptions = function(tipe) {
    const ddlIndeksasi = document.getElementById("targetIndeksasi");
    const ddlStatus = document.getElementById("statusTerkini");
    ddlIndeksasi.innerHTML = '<option value="" disabled selected>Pilih Indeksasi...</option>';
    ddlStatus.innerHTML = '<option value="" disabled selected>Pilih Status...</option>';
    if(!tipe) { ddlIndeksasi.disabled = true; ddlStatus.disabled = true; return; }

    ddlIndeksasi.disabled = false; ddlStatus.disabled = false;
    let targetIndeksasiList = tipe === "Jurnal" ? optIndeksasiJurnal : optIndeksasiProsiding;
    let targetStatusList = tipe === "Jurnal" ? optStatusJurnal : optStatusProsiding;

    targetIndeksasiList.forEach(opt => ddlIndeksasi.innerHTML += `<option value="${opt}">${opt}</option>`);
    targetStatusList.forEach(opt => ddlStatus.innerHTML += `<option value="${opt}">${opt}</option>`);
    
    // Setup listener untuk container URL Publish
    ddlStatus.onchange = function() {
        const containerUrl = document.getElementById("containerUrlPublish");
        this.value === "Published" ? containerUrl.classList.remove("d-none") : containerUrl.classList.add("d-none");
    };
};

window.createAuthorRow = function(isDefault = false) {
    authorCount++;
    const container = document.getElementById("authorContainer");
    const rowId = `authorRow_${authorCount}`;
    
    let options = "";
    masterDosenList.forEach(dosen => {
        options += `<option value="${dosen.kode}">${dosen.nama}</option>`;
    });

    const rowHTML = `
        <div class="row g-2 align-items-center author-item" id="${rowId}">
            <div class="col-md-7">
                <select class="form-select select-nama-author" required>
                    <option value="" disabled selected>Cari / Pilih Nama Penulis...</option>
                    ${options}
                </select>
            </div>
            <div class="col-md-4">
                <select class="form-select select-peran-author" required>
                    <option value="" disabled selected>Peran Author...</option>
                    ${optPeranAuthor.map(p => `<option value="${p}">${p}</option>`).join("")}
                </select>
            </div>
            <div class="col-md-1 text-end">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="document.getElementById('${rowId}').remove()"><i class="bi bi-trash"></i></button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHTML);

    if(isDefault) {
        const rowData = document.getElementById(rowId);
        const activeUser = JSON.parse(sessionStorage.getItem("user"));
        // Coba cocokan nama login SIPINTAS dengan Kode Dosen SIRISMA
        const matchedDosen = masterDosenList.find(d => d.email.toLowerCase() === activeUser.email.toLowerCase() || d.nama.includes(activeUser.nama));
        if(matchedDosen) {
            rowData.querySelector('.select-nama-author').value = matchedDosen.kode; 
            rowData.querySelector('.select-peran-author').value = "First Author";
            rowData.querySelector('.btn-outline-danger').classList.add('d-none');
        }
    }
};

window.createStudentRow = function() {
    studentCount++;
    const container = document.getElementById("studentContainer");
    document.getElementById("emptyStudentText").classList.add("d-none");
    
    const rowId = `studentRow_${studentCount}`;
    const rowHTML = `
        <div class="row g-2 align-items-center student-item" id="${rowId}">
            <div class="col-md-11">
                <input type="text" list="mhsDataList" class="form-control input-mahasiswa" placeholder="Cari NIM / Nama Mahasiswa..." required>
            </div>
            <div class="col-md-1 text-end">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="document.getElementById('${rowId}').remove()"><i class="bi bi-trash"></i></button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHTML);
};

// ===================================================================
// FUNGSI SIMPAN DATA KE DATABASE SIRISMA
// ===================================================================

window.handleSaveArtikel = function() {
    const form = document.getElementById("formArtikel");
    if (!form.checkValidity()) { form.reportValidity(); return; }

    // Ekstrak Penulis (Kode Dosen)
    let listPenulis = [];
    document.querySelectorAll('.author-item').forEach(item => {
        const kode = item.querySelector('.select-nama-author').value;
        const peran = item.querySelector('.select-peran-author').value;
        if(kode && peran) {
            if (peran === "Corresponding Author") listPenulis.push(`${kode}*`);
            else listPenulis.push(kode);
        }
    });

    // Ekstrak NIU Mahasiswa
    let listMahasiswaNiu = [];
    document.querySelectorAll('.input-mahasiswa').forEach(input => {
        const val = input.value;
        const mhs = masterMahasiswaList.find(m => `${m.nim} - ${m.nama}` === val);
        if (mhs && mhs.niu) listMahasiswaNiu.push(mhs.niu);
    });

    const currentUser = JSON.parse(sessionStorage.getItem("user"));
    const payloadData = {
        action: "save_artikel",
        recordId: "", // Selalu buat data baru
        emailSubmitter: currentUser.email,
        judul: document.getElementById("judulArtikel").value,
        tahunTarget: document.getElementById("tahunTarget").value,
        rencanaSubmit: document.getElementById("rencanaSubmit").value,
        targetIndeksasi: document.getElementById("targetIndeksasi").value,
        namaJurnal: document.getElementById("namaJurnal").value,
        daftarPenulis: listPenulis.join(", "),
        keterlibatanMahasiswa: listMahasiswaNiu.join(", "),
        statusTerkini: document.getElementById("statusTerkini").value,
        urlPublish: document.getElementById("urlPublish") ? document.getElementById("urlPublish").value : "",
        catatan: document.getElementById("catatanKendala").value,
    };

    Swal.fire({ title: 'Mengirim Endorsement...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    fetch(GAS_DATABASE, { method: "POST", body: JSON.stringify(payloadData) })
    .then(res => res.json())
    .then(data => {
        if(data.status === "ok") {
            Swal.fire('Berhasil!', 'Skripsi telah sukses di-endorse ke SIRISMA.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalFormArtikel')).hide();
        } else { Swal.fire('Gagal!', data.message, 'error'); }
    })
    .catch(err => { Swal.fire('Error!', 'Terjadi kesalahan komunikasi server.', 'error'); });
};