// ===================================================================
// KONFIGURASI SIRISMA UNTUK SIPINTAS
// ===================================================================
// Gunakan window agar variabelnya global dan bisa diakses oleh file JS lain
window.masterMahasiswaList = []; 
window.masterDosenList = [];
window.masterArtikelData = [];
let authorCount = 0;
let studentCount = 0;

const optPeranAuthor = ["First Author", "Corresponding Author", "Co-Author"];
const optIndeksasiJurnal = [
    "Q1 - Skor SINTA 40", "Q2 - Skor SINTA 24", "Q3 - Skor SINTA 22", "Q4 - Skor SINTA 20", "Non-Q - Skor SINTA 30", 
    "Sinta 1 - Skor SINTA 25", "Sinta 2 - Skor SINTA 25", "Sinta 3 - Skor SINTA 20", "Sinta 4 - Skor SINTA 20", 
    "Sinta 5 - Skor SINTA 15", "Sinta 6 - Skor SINTA 15", "Non-Sinta - Skor SINTA 10"
];
const optIndeksasiProsiding = [
    "Internasional - Skor SINTA 30", "Nasional - Skor SINTA 10"
];
const optIndeksasiBuku = [
    "Buku Ajar - Skor SINTA 20", "Buku Referensi - Skor SINTA 40", "Buku Monograf - Skor SINTA 20"
];

const optStatusJurnal = ["Draft", "Draft Ready", "Submitted", "On Review Round 1", "Revision Round 1", "Revision Round 1 Submitted", "On Review Round 2", "Revision Round 2", "Revision Round 2 Submitted", "Accepted", "Copyediting/ Proofread", "Published"];
const optStatusProsiding = ["Draft", "Draft Ready", "Submitted", "On Review", "Revision", "Revision Submitted", "Accepted", "Presented", "Published"];

// Memuat ketiga database SIRISMA secara paralel
window.loadSirismaData = async function() {
    if (window.masterMahasiswaList.length > 0 && window.masterDosenList.length > 0 && window.masterArtikelData.length > 0) return;
    try {
        const [resMhs, resDosen, resArt] = await Promise.all([
            fetch(GAS_MAHASISWA_SIRISMA).then(r => r.json()),
            fetch(GAS_LOGIN_SIRISMA, { method: "POST", body: JSON.stringify({ action: "get_users" }) }).then(r => r.json()),
            fetch(GAS_DATABASE_SIRISMA + "?t=" + new Date().getTime()).then(r => r.json())
        ]);
        if (resMhs.status === "ok") window.masterMahasiswaList = resMhs.data;
        if (resDosen.status === "ok") window.masterDosenList = resDosen.user;
        if (resArt.status === "ok") window.masterArtikelData = resArt.data;
    } catch (err) {
        console.error("Gagal memuat data master SIRISMA:", err);
    }
};

window.openEndorseModal = async function(namaMhs, nimMhs, judulMhs) {
    if (window.masterMahasiswaList.length === 0) {
        Swal.fire({ title: 'Menyiapkan Form...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await window.loadSirismaData();
        Swal.close();
    }

    document.getElementById("formArtikel").reset();
    document.getElementById("recordId").value = "";
    document.getElementById("authorContainer").innerHTML = "";
    document.getElementById("studentContainer").innerHTML = "";

    // Ekstraksi NIU dari format NIM (misal: 22/493101/TK/53988 -> 493101)
    const niuParts = nimMhs.split('/');
    const niu = niuParts.length > 1 ? niuParts[1] : nimMhs;

    // Cek apakah mahasiswa ini sudah pernah di-endorse
    const existingArtikel = window.masterArtikelData.find(row => String(row[10]).includes(niu));

    if (existingArtikel) {
        // === MODE EDIT ENDORSE ===
        document.getElementById("modalLabel").innerHTML = `<i class="bi bi-pencil-square me-2"></i>Edit Data Endorse`;
        document.getElementById("recordId").value = existingArtikel[1];
        document.getElementById("judulArtikel").value = existingArtikel[4];
        document.getElementById("tahunTarget").value = existingArtikel[5];
        document.getElementById("rencanaSubmit").value = existingArtikel[6];

        updateDropdownOptions(existingArtikel[6]);
        
        setTimeout(() => {
            const valFromSheet = String(existingArtikel[7]).trim(); 
            const ddl = document.getElementById("targetIndeksasi");
            
            for (let i = 0; i < ddl.options.length; i++) {
                const optValueShort = ddl.options[i].value.split(" - ")[0].trim();
                if (optValueShort === valFromSheet) {
                    ddl.selectedIndex = i;
                    break;
                }
            }

            // PERBAIKAN INDEX: Status Terkini (13) & URL Publish (14)
            document.getElementById("statusTerkini").value = existingArtikel[13];
            if (existingArtikel[13] === "Published") {
                document.getElementById("containerUrlPublish").classList.remove("d-none");
                document.getElementById("urlPublish").value = existingArtikel[14];
            }
        }, 150);

        document.getElementById("namaJurnal").value = existingArtikel[8];
        
        // PERBAIKAN INDEX: Catatan Kendala (36)
        document.getElementById("catatanKendala").value = existingArtikel[36];

        const authors = String(existingArtikel[9]).split(", ");
        authors.forEach(authorText => {
            createAuthorRow(); 
            const lastRow = document.getElementById("authorContainer").lastElementChild;
            let isCorr = authorText.includes("*");
            let kode = authorText.replace("*", "");
            lastRow.querySelector('.select-nama-author').value = kode;
            lastRow.querySelector('.select-peran-author').value = isCorr ? "Corresponding Author" : "Co-Author"; 
        });

        const mhsSaved = String(existingArtikel[10]).split(",").map(s => s.trim()).filter(s => s);
        if (mhsSaved.length > 0) {
            document.getElementById("emptyStudentText").classList.add("d-none");
            mhsSaved.forEach(savedNiu => {
                const m = window.masterMahasiswaList.find(m => String(m.niu) === String(savedNiu));
                if (m) {
                    createStudentRow();
                    const lastInput = document.getElementById("studentContainer").lastElementChild.querySelector('input');
                    lastInput.value = `${m.nim} - ${m.nama}`;
                }
            });
        }
    } else {
        // === MODE ENDORSE BARU ===
        document.getElementById("modalLabel").innerHTML = `<i class="bi bi-journal-plus me-2"></i>Endorse Skripsi ke Artikel`;
        document.getElementById("judulArtikel").value = judulMhs;
        createAuthorRow(true); 

        const mhs = window.masterMahasiswaList.find(m => String(m.nim) === String(nimMhs));
        if (mhs) {
            document.getElementById("emptyStudentText").classList.add("d-none");
            createStudentRow(); 
            const lastInput = document.getElementById("studentContainer").lastElementChild.querySelector('input');
            lastInput.value = `${mhs.nim} - ${mhs.nama}`;
        } else {
            document.getElementById("emptyStudentText").classList.remove("d-none");
        }
    }

    new bootstrap.Modal(document.getElementById('modalFormArtikel')).show();
};

window.updateDropdownOptions = function(tipe) {
    const ddlIndeksasi = document.getElementById("targetIndeksasi");
    const ddlStatus = document.getElementById("statusTerkini");
    ddlIndeksasi.innerHTML = '<option value="" disabled selected>Pilih Indeksasi...</option>';
    ddlStatus.innerHTML = '<option value="" disabled selected>Pilih Status...</option>';
    if(!tipe) { ddlIndeksasi.disabled = true; ddlStatus.disabled = true; return; }

    ddlIndeksasi.disabled = false; ddlStatus.disabled = false;
    
    // PERBAIKAN: Menambahkan dukungan untuk opsi "Buku"
    let targetIndeksasiList = tipe === "Jurnal" ? optIndeksasiJurnal : (tipe === "Buku" ? optIndeksasiBuku : optIndeksasiProsiding);
    let targetStatusList = tipe === "Jurnal" ? optStatusJurnal : optStatusProsiding;

    targetIndeksasiList.forEach(opt => ddlIndeksasi.innerHTML += `<option value="${opt}">${opt}</option>`);
    targetStatusList.forEach(opt => ddlStatus.innerHTML += `<option value="${opt}">${opt}</option>`);
    
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
    window.masterDosenList.forEach(dosen => {
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
        const matchedDosen = window.masterDosenList.find(d => d.email.toLowerCase() === activeUser.email.toLowerCase() || d.nama.includes(activeUser.nama));
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

window.handleSaveArtikel = function() {
    const form = document.getElementById("formArtikel");
    if (!form.checkValidity()) { form.reportValidity(); return; }

    let listPenulis = [];
    document.querySelectorAll('.author-item').forEach(item => {
        const kode = item.querySelector('.select-nama-author').value;
        const peran = item.querySelector('.select-peran-author').value;
        if(kode && peran) {
            if (peran === "Corresponding Author") listPenulis.push(`${kode}*`);
            else listPenulis.push(kode);
        }
    });

    let listMahasiswaNiu = [];
    document.querySelectorAll('.input-mahasiswa').forEach(input => {
        const val = input.value;
        const mhs = window.masterMahasiswaList.find(m => `${m.nim} - ${m.nama}` === val);
        if (mhs && mhs.niu) listMahasiswaNiu.push(mhs.niu);
    });

    const currentUser = JSON.parse(sessionStorage.getItem("user"));
    
    // CARA BENAR MENGAMBIL SKOR SINTA DARI DROPDOWN
    const ddlTarget = document.getElementById("targetIndeksasi");
    const targetFullText = ddlTarget.options[ddlTarget.selectedIndex].text; // Misal: "Q1 - Skor SINTA 40"
    const targetShortValue = targetFullText.split(" - ")[0]; // "Q1"
    const skorSintaNum = targetFullText.includes(" - Skor SINTA ") ? parseInt(targetFullText.split(" - Skor SINTA ")[1]) : 0;

    const payloadData = {
        action: "save_artikel",
        recordId: document.getElementById("recordId").value,
        emailSubmitter: currentUser.email, // PERBAIKAN: Menambahkan email PIC
        judul: document.getElementById("judulArtikel").value,
        tahunTarget: document.getElementById("tahunTarget").value,
        rencanaSubmit: document.getElementById("rencanaSubmit").value,
        targetIndeksasi: targetShortValue, // Kirim teks pendek (Buku Ajar, Q1)
        skorSinta: skorSintaNum,           // Kirim angka skor murni (20, 40)
        sumber: document.getElementById("proposalSkripsiList") || document.getElementById("ujianSkripsiList") ? "SIPINTAS" : "SIRISMA",
        namaJurnal: document.getElementById("namaJurnal").value,
        daftarPenulis: listPenulis.join(", "),
        keterlibatanMahasiswa: listMahasiswaNiu.join(", "),
        
        // PERBAIKAN: Kirim string kosong agar array indeks GAS tidak bergeser
        penulisLuar: "",
        afiliasiLuar: "",
        
        statusTerkini: document.getElementById("statusTerkini").value,
        urlPublish: document.getElementById("urlPublish") ? document.getElementById("urlPublish").value : "",
        catatan: document.getElementById("catatanKendala").value,
    };

    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    fetch(GAS_DATABASE_SIRISMA, { method: "POST", body: JSON.stringify(payloadData) })
    .then(res => res.json())
    .then(data => {
        if(data.status === "ok") {
            Swal.fire('Berhasil!', 'Data Endorsement berhasil disimpan ke SIRISMA.', 'success')
            .then(() => {
                // Refresh data background agar State up-to-date
                window.masterArtikelData = []; 
                window.loadSirismaData().then(() => {
                    // SMART REFRESH (Aman dari null error)
                    const isProposalOpen = document.getElementById("proposalSkripsiList") !== null;
                    const isUjianOpen = document.getElementById("ujianSkripsiList") !== null;

                    if (isProposalOpen && typeof loadProposalSkripsiData === 'function') {
                        loadProposalSkripsiData();
                    } else if (isUjianOpen && typeof loadUjianSkripsiData === 'function') {
                        loadUjianSkripsiData();
                    }
                });
            });
            bootstrap.Modal.getInstance(document.getElementById('modalFormArtikel')).hide();
        } else { Swal.fire('Gagal!', data.message, 'error'); }
    })
    .catch(err => { Swal.fire('Error!', 'Terjadi kesalahan komunikasi server.', 'error'); });
};