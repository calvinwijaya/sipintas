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
            kelompok: kelompok
        });
        index++;
    }
    return result;
}

document.addEventListener("DOMContentLoaded", () => {
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
    dataMahasiswa.forEach(m => {
        tbody.innerHTML += `
        <tr>
            <td>${m.no}</td>
            <td>${m.nama}</td>
            <td>${m.nim}</td>
        </tr>`;
    });

    // insert Mhs headers (Mhs-1 .. Mhs-N)
    dataMahasiswa.forEach((m, idx) => {
        const th = document.createElement("th");
        th.textContent = `Mhs-${idx + 1}`;
        th.style.width = "80px";
        headerMahasiswaRow.appendChild(th);
    });

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

    // -------------- helper to update footer colspan --------------
    let kategoriVisible = true;
    function updateRerataColspan() {
        // base columns always visible: No SO + CLO + Indikator = 3
        let baseCols = 3;
        if (kategoriVisible) baseCols += 4; // add 4 kategori columns if visible
        // set colspan on the "Rata-rata" label cell
        rerataLabel.colSpan = baseCols;
    }
    updateRerataColspan();

    // -------------- calculation of rata-rata per mahasiswa (column-wise) --------------
    function hitungRerata() {
        const rows = document.querySelectorAll("tbody.rubrik-penilaian tr");
        const rerataInputs = document.querySelectorAll("#rowRerata .rerata-col");

        rerataInputs.forEach((input, colIdx) => {
        let total = 0;
        let count = 0;

        rows.forEach(row => {
            // find all score inputs in this row (student inputs should have class "score-input")
            const inputs = row.querySelectorAll(".score-input");
            const cellInput = inputs[colIdx];
            if (cellInput && cellInput.value !== "") {
            total += parseFloat(cellInput.value) || 0;
            count++;
            }
        });

        input.value = count > 0 ? (total / count).toFixed(2) : "";
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
    const suggestionBox = document.getElementById("dosenSuggestions");
    let dosenList = [];

    fetch("../DaftarDosen.txt")
        .then(res => res.text())
        .then(text => {
            dosenList = text.split("\n").map(n => n.trim()).filter(Boolean);
        })
        .catch(err => console.error("Gagal memuat daftar dosen:", err));

    dosenInput.addEventListener("input", () => {
        const query = dosenInput.value.toLowerCase();
        suggestionBox.innerHTML = "";

        if (!query) {
            suggestionBox.style.display = "none";
            return;
        }

        const matches = dosenList
            .filter(name => name.toLowerCase().includes(query))
            .slice(0, 3);

        if (matches.length > 0) {
            matches.forEach(name => {
                const li = document.createElement("li");
                li.textContent = name;
                li.className = "list-group-item list-group-item-action";
                li.addEventListener("click", () => {
                    dosenInput.value = name;
                    suggestionBox.style.display = "none";
                });
                suggestionBox.appendChild(li);
            });
            suggestionBox.style.display = "block";
        } else {
            suggestionBox.style.display = "none";
        }
    });

    document.addEventListener("click", (e) => {
        if (!dosenInput.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.style.display = "none";
        }
    });

    // --- Kirim data ke Google Apps Script ---
    const loadingOverlay = document.getElementById("loadingOverlay");

    document.getElementById("btnKirim").addEventListener("click", async () => {
        const namaDosen = dosenInput.value.trim();
        if (!namaDosen) {
            alert("Silakan isi nama dosen.");
            return;
        }

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
            scores: scores,
            tanggal: getTanggalIndonesia()
        };

        const formBody = new URLSearchParams();
        formBody.append("data", JSON.stringify(data));

        fetch("https://script.google.com/macros/s/AKfycbyCVqBpUqHLOu50HPA_BBOABpm__bt5jxMzNKJW9iUA8lLxiu72tqqPALMIjJFHg6HM/exec", {
            method: "POST",
            body: formBody
        })
            .then(res => res.json())
            .then(result => {
                if (result.status === "success") {
                    alert("Nilai berhasil dikirim!");
                } else {
                    alert("Gagal: " + result.message);
                }
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Terjadi kesalahan saat mengirim data.");
            })
            .finally(() => {
                loadingOverlay.style.display = "none";
            });
    });

    // --- Helper: Tanggal Indonesia ---
    function getTanggalIndonesia() {
        const bulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const today = new Date();
        return `${today.getDate()} ${bulan[today.getMonth()]} ${today.getFullYear()}`;
    }
});
