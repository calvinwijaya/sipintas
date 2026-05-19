// Fungsi untuk memuat Tim Penguji dari Spreadsheet Master secara otomatis
async function loadTimPengujiOtomatis() {
    const params = new URLSearchParams(window.location.search);
    const nim = params.get("nim");
    
    if (!nim) return;

    // ID Spreadsheet Master Penilaian Tesis
    const SHEET_ID = "1lg2tfyzMX99Ib-b5gZ31dGnHHqLHDpElQO22VMVaPbs";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI"; 
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values || [];

        // Cari baris yang mengandung NIM (mencari di seluruh kolom untuk keamanan)
        const row = rows.find(r => r.includes(nim));

        if (row) {
            // Tarik kode dosen dari Kolom L (11), M (12), dan N (13)
            const kodeKetua = (row[11] || "").trim();
            const kodePenguji1 = (row[12] || "").trim();
            const kodePenguji2 = (row[13] || "").trim();

            // Petakan ke nama lengkap menggunakan DOSEN_MAP (fallback ke kode aslinya jika tidak ada di map)
            // Pastikan js/config.js di-load lebih dulu di HTML agar DOSEN_MAP dikenali
            const namaKetua = DOSEN_MAP[kodeKetua] || kodeKetua || "-";
            const namaPenguji1 = DOSEN_MAP[kodePenguji1] || kodePenguji1 || "-";
            const namaPenguji2 = DOSEN_MAP[kodePenguji2] || kodePenguji2 || "-";

            // Masukkan ke DOM
            const elKetua = document.getElementById("ketuaSidang");
            const elPenguji1 = document.getElementById("penguji1");
            const elPenguji2 = document.getElementById("penguji2");

            if (elKetua) elKetua.textContent = namaKetua;
            if (elPenguji1) elPenguji1.textContent = namaPenguji1;
            if (elPenguji2) elPenguji2.textContent = namaPenguji2;
        }
    } catch (err) {
        console.error("Gagal memuat tim penguji otomatis:", err);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const hasilRadios = document.querySelectorAll('input[name="hasil"]');

    hasilRadios.forEach(radio => {
        radio.addEventListener("change", function () {
            // Remove highlight from all
            hasilRadios.forEach(r => r.parentElement.classList.remove("result-selected"));
            // Add highlight to the selected one
            if (this.checked) {
                this.parentElement.classList.add("result-selected");
            }
        });
    });

    // Jalankan fungsi fetch tim penguji saat halaman selesai dimuat
    loadTimPengujiOtomatis();
});

// Function to collect all form/page data
function collectBeritaAcaraData() {
    const data = {};

    // From query string
    const params = new URLSearchParams(window.location.search);
    data["Nama"] = params.get("nama") || "";
    data["NIM"] = params.get("nim") || "";
    data["NamaPembimbing"] = params.get("pembimbing") || "";
    data["JudulTesis"] = params.get("judul") || "";

    // From DOM
    data["Hari"] = document.getElementById("hari").textContent || "";
    
    // Format tanggal from YYYY-MM-DD → DD Month YYYY (Indonesian)
    const rawDate = document.getElementById("tanggal").value || "";
    if (rawDate) {
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const [year, month, day] = rawDate.split("-");
        // Original tanggal
        const originalDate = new Date(year, parseInt(month) - 1, day);
        data["Tanggal"] = `${parseInt(day)} ${months[originalDate.getMonth()]} ${originalDate.getFullYear()}`;

        // Tanggal revisi (+1 month)
        const revisiDate = new Date(originalDate);
        revisiDate.setMonth(revisiDate.getMonth() + 1);
        data["TanggalRevisi"] = `${revisiDate.getDate()} ${months[revisiDate.getMonth()]} ${revisiDate.getFullYear()}`;
    } else {
        data["Tanggal"] = "";
        data["TanggalRevisi"] = "";
    }
    data["JamAwal"] = document.getElementById("jamAwal").value || "";
    data["JamAkhir"] = document.getElementById("jamAkhir").value || "";
    data["Ruang"] = document.getElementById("tempat").value || "";

    // Selected "hasil"
    const hasilInput = document.querySelector("input[name='hasil']:checked");
    data["Hasil"] = hasilInput ? hasilInput.value : "";

    // Scores
    data["Skor_KetuaSidang"] = document.getElementById("nilaiP1").textContent || "";
    data["Skor_Penguji1"] = document.getElementById("nilaiP2").textContent || "";
    data["Skor_Penguji2"] = document.getElementById("nilaiP3").textContent || "";
    data["Rata"] = document.getElementById("nilaiRekap").textContent || "";

    // Names of examiners (Sekarang ditarik otomatis tanpa nunggu Load Nilai)
    data["NamaKetuaSidang"] = document.getElementById("ketuaSidang").textContent || "";
    data["NamaPenguji1"] = document.getElementById("penguji1").textContent || "";
    data["NamaPenguji2"] = document.getElementById("penguji2").textContent || "";

    // Comments
    data["JudulTesisRevisi"] = document.getElementById("judulTesisRevisi").value || "";
    data["Metode"] = document.getElementById("metode").value || "";
    data["Penulisan"] = document.getElementById("penulisan").value || "";
    data["Saran"] = document.getElementById("saran").value || "";

    return data;
}

// Function to generate Word document from template
async function generateBeritaAcaraDoc() {
    const data = collectBeritaAcaraData();

    try {
        const response = await fetch("template_beritaujiantesis.docx");
        if (!response.ok) throw new Error("Template tidak ditemukan");
        const arrayBuffer = await response.arrayBuffer();

        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater().loadZip(zip);

        doc.setData(data);
        doc.render();

        const out = doc.getZip().generate({
            type: "blob",
            mimeType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        // Nama file dinamis
        const safeNama = (data.Nama || "Mahasiswa").replace(/[^a-z0-9]/gi, "_"); 
        const fileName = `BA_Penilaian_Ujian_Tesis-${safeNama}.docx`;

        const link = document.createElement("a");
        link.href = URL.createObjectURL(out);
        link.download = fileName;
        link.click();

    } catch (error) {
        console.error(error);
        alert("Error generating DOCX: " + error.message);
    }
}

// Bind to button
document.getElementById("btnPrintBAUjianTesis").addEventListener("click", generateBeritaAcaraDoc);

// Save revisi notes
const loadingOverlay = document.getElementById("loadingOverlay");

document.getElementById("btnSaveRevisi").addEventListener("click", () => {
  document.getElementById("loadingText").innerText = "Mengirim data ke sistem...";
  const payload = {
    nim: document.getElementById("nim").textContent,
    revisiJudul: document.getElementById("judulTesisRevisi").value,
    metode: document.getElementById("metode").value,
    penulisan: document.getElementById("penulisan").value,
    saran: document.getElementById("saran").value
  };

  const formData = new URLSearchParams();
  formData.append("action", "saveRevisi");
  formData.append("data", JSON.stringify(payload));

  loadingOverlay.style.display = "flex";

  fetch("https://script.google.com/macros/s/AKfycbxnBP70qPrrEDfwLuQ0KlPj-Gqct-8GN0O4rugzmnUoiVG5EnQysV1NL7av16Ke0GQX/exec", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      Swal.fire("Berhasil", "Catatan revisi telah disimpan.", "success");
    })
    .catch(err => {
      console.error(err);
      Swal.fire("Error", "Gagal menyimpan revisi.", "error");
    })
    .finally(() => {
      loadingOverlay.style.display = "none";
    });
});

document.getElementById("btnLoadRevisi").addEventListener("click", () => {
  document.querySelector("#loadingOverlay div:last-child").innerText = "Mengambil data dari sistem...";
  const nim = document.getElementById("nim").textContent.trim();
  if (!nim) {
    Swal.fire("Error", "NIM tidak tersedia!", "error");
  }

  const callbackName = "handleRevisiResponse";
  loadingOverlay.style.display = "flex";
  window[callbackName] = function (data) {
    try {
      if (data.status === "ok") {
        document.getElementById("judulTesisRevisi").value = data.revisiJudul || "";
        document.getElementById("metode").value = data.metode || "";
        document.getElementById("penulisan").value = data.penulisan || "";
        document.getElementById("saran").value = data.saran || "";
        Swal.fire("Berhasil", "Catatan revisi berhasil dimuat", "success");
      } else {
        Swal.fire("Error", "Gagal memuat catatan revisi.", "error");
      }
    } finally {
      // HIDE loading no matter success or error
      loadingOverlay.style.display = "none";
    }
  };

  const script = document.createElement("script");
  script.src = `https://script.google.com/macros/s/AKfycbwEytGNhxIp5Wm3d0YzaGRP9Jlwkoor3BwdElM6b8gH74-9CvoCoFRfJdN9BXhrvwQz4A/exec?nim=${encodeURIComponent(nim)}&action=loadRevisi&callback=${callbackName}`;
  document.body.appendChild(script);
});