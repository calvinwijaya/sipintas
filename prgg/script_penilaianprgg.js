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
        topik: params.get("topik") || "",
        linkGDriveProposalPRGG: params.get("linkGDriveProposalPRGG") || "",
        linkGDriveLapPendahuluanPRGG: params.get("linkGDriveLapPendahuluanPRGG") || "",
        linkGDriveLapAntaraPRGG: params.get("linkGDriveLapAntaraPRGG") || "",
        linkGDriveLapAkhirPRGG: params.get("linkGDriveLapAkhirPRGG") || "",
        linkGDrivePosterPRGG: params.get("linkGDrivePosterPRGG") || "",
        linkProdukPRGG: params.get("linkProdukPRGG") || ""
    };
}

async function fetchPhotoURL(studentID) {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzhS6pwUUbbiiDLMWxNVlu3WCNokw95Ryot7RrcB99rLEg-TJB9jCZL128PgucD2Dw1Zg/exec";
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

    // DOM refs
    const tbody = document.getElementById("tabelMahasiswa");
    const headerMahasiswaRow = document.getElementById("headerMahasiswa"); // row for second header
    const penilaianHeader = document.getElementById("penilaianMahasiswaHeader"); // merged "Penilaian Mahasiswa" cell
    const rowRerata = document.getElementById("rowRerata");
    const rerataLabel = document.getElementById("rerataLabel");
    const toggleBtn = document.getElementById("toggleKategori");
    const kategoriHeader = document.getElementById("kategoriHeader");

    // -------------- build mahasiswa list & header Mhs ----------------
    // isi tabel mahasiswa (no, nama, nim)
    tbody.innerHTML = "";

    // Prepare all fetch promises
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

    // Wait for all photos to be fetched
    const photos = await Promise.all(photoPromises);

    // Build table rows
    dataMahasiswa.forEach((m, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${m.no}</td>
            <td>${m.nama}</td>
            <td>${m.nim}</td>
            <td>${photos[idx]}</td>
        `;
        tbody.appendChild(tr);

        // Build Mhs headers
        const th = document.createElement("th");
        th.textContent = `Mhs-${idx + 1}`;
        th.style.width = "80px";
        headerMahasiswaRow.appendChild(th);
    });

    // -------------- populate kelompok info ---------------- 
    const kelompokInfo = getKelompokInfoFromQuery();

    document.getElementById("kelompok").textContent = kelompokInfo.kelompok;
    document.getElementById("pembimbing").textContent = kelompokInfo.pembimbing;
    document.getElementById("judulTopikPRGG").textContent = kelompokInfo.topik;

    setLink("linkGoogleDriveProposalPRGG", kelompokInfo.linkGDriveProposalPRGG);
    setLink("linkGoogleDriveLaporanPendahuluanPRGG", kelompokInfo.linkGDriveLapPendahuluanPRGG);
    setLink("linkGoogleDriveLaporanAntaraPRGG", kelompokInfo.linkGDriveLapAntaraPRGG);
    setLink("linkGoogleDriveLaporanAkhirPRGG", kelompokInfo.linkGDriveLapAkhirPRGG);
    setLink("linkGoogleDrivePosterPRGG", kelompokInfo.linkGDrivePosterPRGG);
    setLink("linkProdukPRGG", kelompokInfo.linkProdukPRGG);   

    // set the merged "Penilaian Mahasiswa" colspan to number of students
    penilaianHeader.colSpan = dataMahasiswa.length;

    // -------------- ensure body kategori cells have class "col-kategori" --------------
    // assume kategori columns are at index 3..(3+4-1) -> adjust if layout different
    const bodyRows = document.querySelectorAll("tbody.rubrik-penilaian tr");
    bodyRows.forEach(row => {
        for (let c = 3; c < 3 + 4; c++) {
        const cell = row.cells[c];
        if (cell) cell.classList.add("col-kategori");
        }
    });
    // Also ensure header th for kategori already have class col-kategori (your HTML probably already does)

    // -------------- inject input box for each mahasiswa di setiap baris rubrik --------------
    const rubrikRows = document.querySelectorAll("#tabelPenilaian tr");
    rubrikRows.forEach(row => {
    dataMahasiswa.forEach(() => {
        const td = document.createElement("td");
        td.innerHTML = `<input type="number" min="0" max="100" 
                        class="form-control text-center score-input" style="width:80px">`;
        row.appendChild(td);
    });
    });

    // -------------- add rerata columns (one per mahasiswa) --------------
    // remove existing appended rerata cells first (safe if re-run)
    Array.from(rowRerata.children).forEach(ch => {
        if (!ch.id || ch.id !== "rerataLabel") ch.remove();
    });
    dataMahasiswa.forEach(() => {
        const td = document.createElement("td");
        td.innerHTML = `<input type="text" class="form-control text-center fw-bold bg-light rerata-col" readonly style="width:80px">`;
        rowRerata.appendChild(td);
    });

    // -------------- add nilaiHuruf columns (one per mahasiswa) --------------
    const rowNilaiHuruf = document.getElementById("rowNilaiHuruf");

    Array.from(rowNilaiHuruf.children).forEach(ch => {
    if (!ch.id || ch.id !== "nilaiHurufLabel") ch.remove();
    });

    dataMahasiswa.forEach(() => {
    const td = document.createElement("td");
    td.innerHTML = `<input type="text" class="form-control text-center fw-bold bg-light nilai-huruf-col" readonly style="width:80px">`;
    rowNilaiHuruf.appendChild(td);
    });

    // -------------- helper to update footer colspan --------------
    let kategoriVisible = true;
    function updateRerataColspan() {
        // base columns always visible: No SO + CLO + Indikator = 3
        let baseCols = 3;
        if (kategoriVisible) baseCols += 4; // add 4 kategori columns if visible
        // set colspan on the "Rata-rata" label cell
        rerataLabel.colSpan = baseCols;
        document.getElementById("nilaiHurufLabel").colSpan = baseCols;
    }
    updateRerataColspan();

    // -------------- calculation of rata-rata per mahasiswa (column-wise) --------------
    function hitungRerata() {
        const rows = document.querySelectorAll("tbody.rubrik-penilaian tr");
        const rerataInputs = document.querySelectorAll("#rowRerata .rerata-col");
        const nilaiHurufInputs = document.querySelectorAll("#rowNilaiHuruf .nilai-huruf-col");

        rerataInputs.forEach((input, colIdx) => {
            let total = 0;
            let count = 0;

            rows.forEach(row => {
            const inputs = row.querySelectorAll(".score-input");
            const cellInput = inputs[colIdx];
            if (cellInput && cellInput.value !== "") {
                total += parseFloat(cellInput.value) || 0;
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

    // ensure all student inputs have .score-input (adds class if missing)
    document.querySelectorAll("tbody.rubrik-penilaian tr").forEach(row => {
        // student inputs start after the first 3 + 4 kategori columns (index 7...), but simpler:
        row.querySelectorAll("td input[type='number']").forEach(inp => {
        if (!inp.classList.contains("score-input")) inp.classList.add("score-input");
        });
    });

    // attach listener to score inputs
    document.querySelectorAll(".score-input").forEach(inp => {
        inp.addEventListener("input", hitungRerata);
    });
    // initial calc
    hitungRerata();

    // -------------- toggle kategori handler --------------
    toggleBtn.addEventListener("click", () => {
        kategoriVisible = !kategoriVisible;

        // toggle merged header text cell
        kategoriHeader.style.display = kategoriVisible ? "" : "none";

        // toggle all category cells (header & body) that have .col-kategori
        document.querySelectorAll("#penilaianTable .col-kategori").forEach(el => {
        el.style.display = kategoriVisible ? "" : "none";
        });

        // update footer colspan
        updateRerataColspan();

        // update button label
        toggleBtn.textContent = kategoriVisible ? "▼ Sembunyikan Kategori" : "▶ Tampilkan Kategori";
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

        const data = {
            namaDosen: namaDosen,
            mahasiswa: dataMahasiswa,
            role: role,
            scores: scores,
            tanggal: getTanggalIndonesia()
        };

        const formBody = new URLSearchParams();
        formBody.append("data", JSON.stringify(data));

        fetch("https://script.google.com/macros/s/AKfycbywY0_4T-XtpNg3D4nEdz3szPI3L6wvAAq_8DFNMORuXHcRWVdHk350aKso5AtVy9AR/exec", {
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
        window.location.href = "../index.html?page=prgg";
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
