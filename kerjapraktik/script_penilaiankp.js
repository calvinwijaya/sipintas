// --- Ambil mahasiswa dari query string ---
function getMahasiswaFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const kelompok = params.get("kelompok") || "";

    let result = [];
    let index = 1;
    while (params.get("nama" + index) && params.get("nim" + index)) {
        result.push({
            no: index,
            nama: params.get("nama" + index),
            nim: params.get("nim" + index),
            studentID: params.get("niu" + index),
            kelompok: kelompok
        });
        index++;
    }
    return result;
}

function getKelompokInfoFromQuery() {
    const params = new URLSearchParams(window.location.search);

    return {
        kelompok: params.get("kelompok") || "",
        pembimbing: params.get("pembimbing") || "",
        topikusulan: params.get("topikusulan") || "",
        instansiKP: params.get("instansiKP") || "",
        linkGDriveProposalKP: params.get("linkGDriveProposalKP") || "",
        linkGDriveLapAkhirKP: params.get("linkGDriveLapAkhirKP") || "",
    };
}

async function fetchPhotoURL(studentID) {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbx04fxpy-KNCmvxtGwYqJTfDNuPDmaZGPIsIm57Z_JFE5Tsm1JDGsvg1KzKSi4NgXYcRQ/exec";
    try {
        const res = await fetch(
            `${GAS_URL}?action=getPhoto&studentID=${encodeURIComponent(studentID)}`
        );
        const data = await res.json();
        
        // CHANGE THIS LINE: use data.image_data instead of data.url
        return data.status === "ok" ? data.image_data : null;
        
    } catch (err) {
        console.warn("Photo fetch failed:", studentID, err);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const dataMahasiswa = getMahasiswaFromQuery(); 

    // DOM refs dasar
    const tbody = document.getElementById("tabelMahasiswa");

    // -------------- build mahasiswa list (tabel paling atas) ----------------
    tbody.innerHTML = "";

    const photoPromises = dataMahasiswa.map(async (m) => {
        if (m.studentID) {
            try {
                const url = await fetchPhotoURL(m.studentID);
                if (url) return `<img src="${url}" style="width:60px;height:80px;object-fit:cover;border-radius:4px">`;
                return '<img src="../assets/default.jpeg" style="width:60px;height:60px;object-fit:cover;border-radius:4px">';
            } catch (err) {
                console.error("Photo fetch error for", m.studentID, err);
                return "Error";
            }
        }
        return "—";
    });

    const photos = await Promise.all(photoPromises);

    dataMahasiswa.forEach((m, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${m.no}</td>
            <td>${m.nama}</td>
            <td>${m.nim}</td>
            <td>${photos[idx]}</td>
            <td><input type="text" class="form-control input-keterangan" placeholder="Pindah kelompok, dll..." style="width:100%; min-width:150px;"></td>
        `;
        tbody.appendChild(tr);
    });

    // -------------- populate kelompok info ---------------- 
    const kelompokInfo = getKelompokInfoFromQuery();

    document.getElementById("kelompok").textContent = kelompokInfo.kelompok;
    document.getElementById("pembimbing").textContent = kelompokInfo.pembimbing;
    document.getElementById("judulUsulanTopikKP").textContent = kelompokInfo.topikusulan;
    
    // Pastikan ID instansiKP ada di HTML
    const instansiEl = document.getElementById("instansiKP");
    if(instansiEl) instansiEl.textContent = kelompokInfo.instansiKP;

    setLink("linkGoogleDriveProposalKP", kelompokInfo.linkGDriveProposalKP);
    setLink("linkGoogleDriveLaporanAkhirKP", kelompokInfo.linkGDriveLapAkhirKP);

    // --- FUNGSI HELPER UNTUK SETUP KEDUA TABEL PENILAIAN ---
    function setupTabelPenilaian(tbodyId, rowRerataId, rowNilaiHurufId, headerRowId, mergedHeaderId) {
        const rubrikRows = document.querySelectorAll(`#${tbodyId} tr`);
        const rowRerata = document.getElementById(rowRerataId);
        const rowNilaiHuruf = document.getElementById(rowNilaiHurufId);
        const headerRow = document.getElementById(headerRowId);
        const mergedHeader = document.getElementById(mergedHeaderId);

        // A. Merge kolom "Penilaian Mahasiswa"
        if(mergedHeader) {
            mergedHeader.colSpan = dataMahasiswa.length;
        }

        // B. Inject Header "Mhs-1", "Mhs-2" dll
        if(headerRow) {
            dataMahasiswa.forEach((m, idx) => {
                const th = document.createElement("th");
                th.textContent = `Mhs-${idx + 1}`;
                th.style.width = "80px";
                th.className = "text-center align-middle";
                headerRow.appendChild(th);
            });
        }

        // C. Inject input scores ke tiap baris rubrik
        rubrikRows.forEach(row => {
            // Beri class col-kategori ke sel kategori (kolom index 3,4,5,6) 
            for (let c = 2; c < 6; c++) { 
                if(row.cells[c]) row.cells[c].classList.add("col-kategori");
            }

            dataMahasiswa.forEach(() => {
                const td = document.createElement("td");
                // Class untuk meratakan form ke tengah kotak
                td.className = "align-middle text-center"; 
                td.innerHTML = `<input type="number" min="0" max="100" class="form-control text-center score-input mx-auto" style="width:80px">`;
                row.appendChild(td);
            });
        });

        // D. Setup Rerata & Nilai Huruf
        Array.from(rowRerata.children).forEach(ch => {
            if (!ch.id || !ch.id.includes("Label")) ch.remove();
        });
        dataMahasiswa.forEach(() => {
            const td = document.createElement("td");
            td.className = "align-middle text-center";
            td.innerHTML = `<input type="text" class="form-control text-center fw-bold bg-light rerata-col mx-auto" readonly style="width:80px">`;
            rowRerata.appendChild(td);
        });

        Array.from(rowNilaiHuruf.children).forEach(ch => {
            if (!ch.id || !ch.id.includes("Label")) ch.remove();
        });
        dataMahasiswa.forEach(() => {
            const td = document.createElement("td");
            td.className = "align-middle text-center";
            td.innerHTML = `<input type="text" class="form-control text-center fw-bold bg-light nilai-huruf-col mx-auto" readonly style="width:80px">`;
            rowNilaiHuruf.appendChild(td);
        });
    }

    // Eksekusi setup untuk Tabel 1 (Dosen)
    setupTabelPenilaian("tabelPenilaian", "rowRerata", "rowNilaiHuruf", "headerMahasiswa", "penilaianMahasiswaHeader");
    
    // Eksekusi setup untuk Tabel 2 (Instansi)
    setupTabelPenilaian("tabelPenilaianInstansi", "rowRerataInstansi", "rowNilaiHurufInstansi", "headerMahasiswaInstansi", "penilaianMahasiswaHeaderInstansi");


    // --- FUNGSI HITUNG RERATA (Tetap Sama) ---
    function hitungRerataUntukTabel(tbodyId, rowRerataId, rowNilaiHurufId) {
        const rows = document.querySelectorAll(`#${tbodyId} tr`);
        const rerataInputs = document.querySelectorAll(`#${rowRerataId} .rerata-col`);
        const nilaiHurufInputs = document.querySelectorAll(`#${rowNilaiHurufId} .nilai-huruf-col`);

        rerataInputs.forEach((input, colIdx) => {
            let total = 0;
            let count = 0;

            rows.forEach(row => {
                const inputs = row.querySelectorAll(".score-input"); 
                if (inputs[colIdx] && inputs[colIdx].value !== "") {
                    total += parseFloat(inputs[colIdx].value) || 0;
                    count++;
                }
            });

            if (count > 0) {
                const avg = total / count;
                input.value = avg.toFixed(2);
                if (nilaiHurufInputs[colIdx]) {
                    nilaiHurufInputs[colIdx].value = konversiNilaiHuruf(avg);
                }
            } else {
                input.value = "";
                if (nilaiHurufInputs[colIdx]) nilaiHurufInputs[colIdx].value = "";
            }
        });
    }

    // Listener Input
    document.querySelectorAll(".score-input").forEach(inp => {
        inp.addEventListener("input", (e) => {
            const tbody = e.target.closest("tbody").id;
            if (tbody === "tabelPenilaian") {
                hitungRerataUntukTabel("tabelPenilaian", "rowRerata", "rowNilaiHuruf");
            } else if (tbody === "tabelPenilaianInstansi") {
                hitungRerataUntukTabel("tabelPenilaianInstansi", "rowRerataInstansi", "rowNilaiHurufInstansi");
            }
        });
    });


    // -------------- TOGGLE KATEGORI UNTUK KEDUA TABEL --------------
    let kategoriVisible = true;

    function updateRerataColspan() {
        let baseCols = 2; 
        if (kategoriVisible) baseCols += 4;
        
        // Update colspan di semua label footer
        ["rerataLabel", "nilaiHurufLabel", "rerataLabelInstansi", "nilaiHurufLabelInstansi"].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.colSpan = baseCols;
        });
    }
    updateRerataColspan();

    // Ambil SEMUA tombol toggle (berdasarkan id yang mengandung kata toggleKategori)
    const toggleBtns = document.querySelectorAll("[id^='toggleKategori']");
    
    toggleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            kategoriVisible = !kategoriVisible;

            // Toggle merged header di kedua tabel
            const katH1 = document.getElementById("kategoriHeader");
            const katH2 = document.getElementById("kategoriHeaderInstansi");
            if(katH1) katH1.style.display = kategoriVisible ? "" : "none";
            if(katH2) katH2.style.display = kategoriVisible ? "" : "none";

            // Toggle semua cell kategori di kedua tabel
            document.querySelectorAll(".col-kategori").forEach(el => {
                el.style.display = kategoriVisible ? "" : "none";
            });

            updateRerataColspan();

            // Ubah teks di semua tombol toggle secara bersamaan
            toggleBtns.forEach(b => {
                b.textContent = kategoriVisible ? "▼ Sembunyikan Kategori" : "▶ Tampilkan Kategori";
            });
        });
    });

    // --- Autocomplete Dosen ---
    const dosenInput = document.getElementById("dosenPenguji");

    // --- Ambil data dosen dari autentikasi ---
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user) {
        alert("Sesi login tidak ditemukan. Silakan login ulang.");
        window.location.href = "../login.html";
        return;
    }

    // Set nama dosen otomatis
    dosenInput.value = user.nama || user.name || "";

    // Set role otomatis
    const roleSelect = document.getElementById("role");
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");

    if (!role) {
        alert("Role tidak ditemukan. Akses tidak valid.");
        window.location.href = "../index.html";
        return;
    }
    roleSelect.value = role;
    roleSelect.disabled = true;    

    // --- Kirim data ke Google Apps Script ---
    const loadingOverlay = document.getElementById("loadingOverlay");

    document.getElementById("btnKirim").addEventListener("click", async () => {
        const role = document.getElementById("role").value;
        const namaDosen = document.getElementById("dosenPenguji").value.trim();

        if (!namaDosen) {
            Swal.fire({
                icon: 'warning',
                title: 'Nama Dosen Kosong',
                text: 'Silakan isi nama dosen penguji terlebih dahulu.'
            });
            return;
        }

        Swal.fire({
            title: "Kirim Nilai Sekarang?",
            text: "Pastikan semua nilai yang Anda masukkan sudah benar.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, Kirim!",
            cancelButtonText: "Batal"
        }).then((result) => {
            // Jika user menekan tombol "Ya, Kirim!"
            if (result.isConfirmed) {
                jalankanKirimData(role, namaDosen);
            }
        });
    });

    function jalankanKirimData(role, namaDosen) {
        const loadingText = document.getElementById("loadingText");
        if (loadingText) loadingText.innerText = "Mengirim data ke sistem...";

        loadingOverlay.style.display = "flex";

        const scores = [];
        const rows = document.querySelectorAll("tbody.rubrik-penilaian tr");
        rows.forEach(row => {
            const inputs = row.querySelectorAll(".score-input");
            scores.push(Array.from(inputs).map(inp => parseFloat(inp.value) || 0));
        });

        const judulRealisasiEl = document.getElementById("inputJudulRealisasi");
        const judulRealisasi = judulRealisasiEl ? judulRealisasiEl.value.trim() : "";

        const keteranganInputs = document.querySelectorAll(".input-keterangan");
        const mahasiswaLengkap = dataMahasiswa.map((m, idx) => {
            return {
                ...m,
                keterangan: keteranganInputs[idx] ? keteranganInputs[idx].value.trim() : ""
            };
        });

        const data = {
            namaDosen: namaDosen,
            mahasiswa: mahasiswaLengkap,
            role: role,
            scores: scores,
            tanggal: getTanggalIndonesia(),
            judulRealisasi: judulRealisasi,
        };

        const formBody = new URLSearchParams();
        formBody.append("data", JSON.stringify(data));

        fetch("https://script.google.com/macros/s/AKfycbxz_hVWK5DpATV0ME_vmA7Tus36Xn1wWyhpgCuX5uueMcvMhUSBEDnrbDHaRtjQW3iq/exec", {
            method: "POST",
            body: formBody
        })
            .then(res => res.json())
            .then(result => {
                if (result.status === "success") {
                      Swal.fire({
                        icon: 'success',
                        title: 'Nilai Berhasil Dikirim!',
                        html: 'Silakan kembali ke <strong>Dashboard</strong> dan lakukan penilaian ke kelompok berikutnya.',
                    });
                } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'Gagal Mengirim Nilai',
                        text: result.message || "Terjadi kesalahan pada sistem."
                    });
                }
            })
            .catch(err => {
                console.error("Error:", err);
                Swal.fire("Error", "Terjadi kesalahan saat mengirim data.", "error");
            })
            .finally(() => {
                loadingOverlay.style.display = "none";
            });
    }

    // --- KIRIM DATA INSTANSI KP ---
    const btnKirimInstansi = document.getElementById("btnKirimInstansi");
    if (btnKirimInstansi) {
        btnKirimInstansi.addEventListener("click", () => {
            const namaPembimbingInstansi = document.getElementById("inputPembimbingInstansi").value.trim();

            if (!namaPembimbingInstansi) {
                Swal.fire('Peringatan', 'Nama Pembimbing Instansi belum diisi.', 'warning');
                return;
            }

            Swal.fire({
                title: "Kirim Nilai Instansi KP?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Ya, Kirim!"
            }).then((result) => {
                if (result.isConfirmed) {
                    jalankanKirimDataInstansi(namaPembimbingInstansi);
                }
            });
        });
    }

    function jalankanKirimDataInstansi(namaPembimbingInstansi) {
        loadingOverlay.style.display = "flex";

        const scoresInstansi = [];
        const rowsInstansi = document.querySelectorAll("#tabelPenilaianInstansi tr");
        rowsInstansi.forEach(row => {
            const inputs = row.querySelectorAll(".score-input");
            scoresInstansi.push(Array.from(inputs).map(inp => parseFloat(inp.value) || 0));
        });

        // Ingat, kita tidak perlu mengirim judulRealisasi atau keterangan lagi
        const data = {
            namaPembimbingInstansi: namaPembimbingInstansi,
            mahasiswa: dataMahasiswa, 
            scores: scoresInstansi,
            tanggal: getTanggalIndonesia()
        };

        const formBody = new URLSearchParams();
        formBody.append("data", JSON.stringify(data));

        fetch("https://script.google.com/macros/s/AKfycbyru-pbVpsf-1JqGK_1YdmOOZMD6WxNg9FNX-YqywesSPYIob3FKfCJ3I0efdu6eI6LKA/exec", { 
            method: "POST",
            body: formBody
        })
        .then(res => res.json())
        .then(result => {
             if (result.status === "success") {
                 Swal.fire('Berhasil', 'Nilai Instansi berhasil dikirim!', 'success');
             } else {
                 Swal.fire('Gagal', result.message, 'error');
             }
        })
        .catch(err => Swal.fire('Error', 'Gagal mengirim data instansi.', 'error'))
        .finally(() => loadingOverlay.style.display = "none");
    }

    // --- Helper: Tanggal Indonesia ---
    function getTanggalIndonesia() {
        const bulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const today = new Date();
        return `${today.getDate()} ${bulan[today.getMonth()]} ${today.getFullYear()}`;
    }

    
    function showModal({ type, title, message }) {
        const modal = document.getElementById("notifyModal");
        const icon = document.getElementById("modalIcon");
        const titleEl = document.getElementById("modalTitle");
        const msgEl = document.getElementById("modalMessage");

        // Reset
        icon.className = "modal-icon";
        icon.textContent = "";

        if (type === "success") {
            icon.textContent = "✔";
            icon.classList.add("success");
        } else if (type === "error") {
            icon.textContent = "✖";
            icon.classList.add("error");
        }

        titleEl.textContent = title;
        msgEl.innerHTML = message.replace(/\n/g, "<br>");

        modal.classList.remove("hidden");
        }

        // Close modal
        document.getElementById("btnModalOk").addEventListener("click", () => {
        document.getElementById("notifyModal").classList.add("hidden");
        });

        // Redirect
        document.getElementById("btnModalDashboard").addEventListener("click", () => {
        window.location.href = "../index.html?page=kerjapraktik";
        });

    function konversiNilaiHuruf(rerata) {
        if (rerata >= 80) return "A";
        if (rerata >= 77.5) return "A-";
        if (rerata >= 75) return "A/B";
        if (rerata >= 72.5) return "B+";
        if (rerata >= 70) return "B";
        if (rerata >= 67.5) return "B-";
        if (rerata >= 65) return "B/C";
        if (rerata >= 62.5) return "C+";
        if (rerata >= 60) return "C";
        if (rerata >= 57.5) return "C-";
        if (rerata >= 55) return "C/D";
        if (rerata >= 52.5) return "D+";
        if (rerata >= 50) return "D";
        return "E";
        }

    function setLink(elementId, url) {
        const el = document.getElementById(elementId);
        if (!el) return;

        if (url) {
            el.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        } else {
            el.textContent = "-";
        }
    }
});
