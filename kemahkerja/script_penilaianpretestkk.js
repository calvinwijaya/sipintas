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
    const tbody = document.getElementById("tabelMahasiswa");
    const header = document.getElementById("headerPenilaian");
    const rowRerata = document.getElementById("rowRerata");
    const rows = document.querySelectorAll("#tabelPenilaian tr");

    // Set judul kelompok dengan nomor dari query
    const kelompok = new URLSearchParams(window.location.search).get("kelompok") || "";
    if (kelompok) {
    document.getElementById("judulKelompok").textContent = "Informasi Kelompok " + kelompok;
    }

    // --- Isi tabel mahasiswa ---
    dataMahasiswa.forEach(m => {
        tbody.innerHTML += `
        <tr>
            <td>${m.no}</td>
            <td>${m.nama}</td>
            <td>${m.nim}</td>
        </tr>`;
    });

    // --- Tambah header mahasiswa ---
    dataMahasiswa.forEach((m, idx) => {
        header.innerHTML += `<th style="width:80px;">Mhs${idx + 1}</th>`;
    });

    // --- Tambah input skor di setiap baris soal ---
    rows.forEach(row => {
    dataMahasiswa.forEach(() => {
        row.innerHTML += `
        <td class="text-center align-middle">
            <input type="number" class="form-control text-center score-input"
                min="0" max="100" style="width:80px; margin:auto;">
        </td>`;
    });
    });

        // --- Date in Bahasa Indonesia ---
    function getTanggalIndonesia() {
        const bulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const today = new Date();
        return `${today.getDate()} ${bulan[today.getMonth()]} ${today.getFullYear()}`;
    }

    // --- Tambah kolom rata-rata ---
    dataMahasiswa.forEach(() => {
        rowRerata.innerHTML += `
        <td>
            <input type="text" class="form-control text-center fw-bold bg-light rerata-col" readonly>
        </td>`;
    });

    // --- Hitung rata-rata per mahasiswa (kolom) ---
    function hitungRerata() {
        const rerataInputs = document.querySelectorAll("#rowRerata .rerata-col");

        rerataInputs.forEach((input, colIdx) => {
        let total = 0;
        let count = 0;

        rows.forEach(row => {
            const cellInput = row.querySelectorAll(".score-input")[colIdx];
            if (cellInput && cellInput.value !== "") {
            total += parseFloat(cellInput.value);
            count++;
            }
        });

        input.value = count > 0 ? (total / count).toFixed(2) : "";
        });
    }

    // Pasang listener ke semua input skor
    document.querySelectorAll(".score-input").forEach(inp => {
        inp.addEventListener("input", hitungRerata);
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

        // ✅ Show loading only here
        loadingOverlay.style.display = "flex";

        const scores = [];
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

        loadingOverlay.style.display = "flex";

        fetch("https://script.google.com/macros/s/AKfycbzhXmF-mziohYv1SNQBBNav3rtATns6n2-69QbFL1fRRsiAr_bsiJnFIiyKH5RvQxBV4g/exec", {
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
});