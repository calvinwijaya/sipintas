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
    data["JudulProposalTesis"] = params.get("judul") || "";

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
        data["Tanggal"] = `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    } else {
        data["Tanggal"] = "";
    }
    data["JamAwal"] = document.getElementById("jamAwal").value || "";
    data["JamAkhir"] = document.getElementById("jamAkhir").value || "";
    data["Ruang"] = document.getElementById("tempat").value || "";

    // Selected "hasil"
    const hasilInput = document.querySelector("input[name='hasil']:checked");
    data["Hasil"] = hasilInput ? hasilInput.value : "";

    // Scores
    data["Skor_Penguji1"] = document.getElementById("nilaiP1").textContent || "";
    data["Skor_Pembimbing"] = document.getElementById("nilaiP2").textContent || "";
    data["Skor_Penguji2"] = document.getElementById("nilaiP3").textContent || "";
    data["Rata"] = document.getElementById("nilaiRekap").textContent || "";

    // Names of examiners
    data["NamaPenguji1"] = document.getElementById("penguji1").textContent || "";
    data["NamaPembimbing"] = document.getElementById("penguji2").textContent || "";
    data["NamaPenguji2"] = document.getElementById("penguji3").textContent || "";

    // Comments
    data["Metode"] = document.getElementById("metode").value || "";
    data["Penulisan"] = document.getElementById("penulisan").value || "";
    data["Saran"] = document.getElementById("saran").value || "";

    return data;
}

// Function to generate Word document from template
async function generateBeritaAcaraDoc() {
    const data = collectBeritaAcaraData();

    try {
        const response = await fetch("template_beritaproposaltesis.docx");
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
        const fileName = `BA_Penilaian_Proposal_Tesis-${safeNama}.docx`;

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
document.getElementById("btnPrintBAProposalTesis").addEventListener("click", generateBeritaAcaraDoc);