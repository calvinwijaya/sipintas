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

    // --- Ambil data dosen dari autentikasi ---
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user) {
        alert("Sesi login tidak ditemukan. Silakan login ulang.");
        window.location.href = "../login.html";
        return;
    }

    // Set nama dosen otomatis
    dosenInput.value = user.nama || user.name || "";

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

        fetch("https://script.google.com/macros/s/AKfycbyjMzhrDyfpWx_uWv7RQQM9DiW-S32gnDVQgedk2h-dgkh8DGiwqagJecjYn1b4anHA/exec", {
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

    // document.getElementById("btnLoadNilai").addEventListener("click", () => {
    //     const namaDosen = dosenInput.value.trim();
    //     if (!namaDosen) {
    //         alert("Nama dosen belum tersedia.");
    //         return;
    //     }

    //     loadingOverlay.style.display = "flex";

    //     const payload = {
    //         namaDosen: namaDosen,
    //         mahasiswa: dataMahasiswa
    //     };

    //     const callbackName = "handleLoadNilai_" + Date.now();

    //     window[callbackName] = function (result) {
    //         try {
    //         if (result.status !== "ok") {
    //             alert(result.message || "Gagal memuat nilai");
    //             return;
    //         }

    //         const rows = document.querySelectorAll("tbody.rubrik-penilaian tr");

    //         rows.forEach((row, rIndex) => {
    //             const inputs = row.querySelectorAll(".score-input");
    //             inputs.forEach((inp, cIndex) => {
    //             inp.value = result.data?.scores?.[rIndex]?.[cIndex] ?? "";
    //             });
    //         });

    //         alert("Nilai berhasil dimuat.");
    //         } finally {
    //         loadingOverlay.style.display = "none";
    //         delete window[callbackName];
    //         }
    //     };

    //     const script = document.createElement("script");
    //     script.src =
    //         "https://script.google.com/macros/s/AKfycbxC-c4Zn2JemsXFRrNAlCQKx3ZU8UhlVQScg298oVYi_KkGT5ryZCqUuULInyWjVoq8qQ/exec" +
    //         `?action=loadNilai` +
    //         `&data=${encodeURIComponent(JSON.stringify(payload))}` +
    //         `&callback=${callbackName}`;

    //     document.body.appendChild(script);
    //     });

});