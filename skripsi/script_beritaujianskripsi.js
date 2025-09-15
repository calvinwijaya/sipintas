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
});

// Function to collect all form/page data
function collectBeritaAcaraData() {
    const data = {};

    // From query string
    const params = new URLSearchParams(window.location.search);
    data["Nama"] = params.get("nama") || "";
    data["NIM"] = params.get("nim") || "";
    data["Pembimbing"] = params.get("pembimbing") || "";
    data["JudulSkripsi"] = params.get("judulskripsi") || "";

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
    data["Skor_Pembimbing"] = document.getElementById("nilaiP1").textContent || "";
    data["Skor_Penguji1"] = document.getElementById("nilaiP2").textContent || "";
    data["Skor_Penguji2"] = document.getElementById("nilaiP3").textContent || "";

    const jumlahtotal = (2 * parseFloat(data["Skor_Pembimbing"] || 0) + parseFloat(data["Skor_Penguji1"] || 0) + parseFloat(data["Skor_Penguji2"] || 0));
    data["JumlahTotal"] = jumlahtotal.toFixed(2);

    data["Rerata"] = document.getElementById("nilaiRekap").textContent || "";

    // Names of examiners
    data["NamaPembimbing"] = document.getElementById("pembimbingskripsi").textContent || "";
    data["NamaPenguji1"] = document.getElementById("penguji1").textContent || "";
    data["NamaPenguji2"] = document.getElementById("penguji2").textContent || "";

    // Comments
    data["JudulSkripsiRevisi"] = document.getElementById("judulSkripsiRevisi").value || "";
    data["Metode"] = document.getElementById("metode").value || "";
    data["Penulisan"] = document.getElementById("penulisan").value || "";
    data["Saran"] = document.getElementById("saran").value || "";

    return data;
}

// Function to generate Word document from template
async function generateBeritaAcaraDoc() {
    const data = collectBeritaAcaraData();

    try {
        const response = await fetch("2_Form BA Ujian Skripsi.docx");
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
        const fileName = `BA Penilaian Ujian Skripsi - ${safeNama}.docx`;

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

document.getElementById("btnPrintBAUjianSkripsi").addEventListener("click", generateBeritaAcaraDoc);
