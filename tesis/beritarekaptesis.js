function collectBeritaAcara() {
    const data = {};

    // From query string
    const params = new URLSearchParams(window.location.search);
    data["Nama"] = params.get("nama") || "";
    data["NIM"] = params.get("nim") || "";
    data["Pembimbing"] = params.get("pembimbing") || "";
    data["JudulTesis"] = params.get("judul") || "";

    // Scores
    data["Skor_Proposal"] = document.getElementById("nilaiProposal").textContent || "";
    data["Skor_Seminar"] = document.getElementById("nilaiSeminar").textContent || "";
    data["Skor_Publikasi"] = document.getElementById("nilaiPublikasi").textContent || "";
    data["Rata"] = document.getElementById("nilaiAkhir").textContent || "";
    data["NilaiHuruf"] = document.getElementById("nilaiHuruf").textContent || "";

    // Names of examiners
    data["NamaPenguji1"] = document.getElementById("penguji1").textContent || "";
    data["NamaPembimbing"] = document.getElementById("penguji3").textContent || "";
    data["NamaPenguji2"] = document.getElementById("penguji2").textContent || "";

    // --- Tanggal in Indonesian format ---
    const bulanIndo = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const today = new Date();
    const tgl = today.getDate();
    const bln = bulanIndo[today.getMonth()];
    const thn = today.getFullYear();

    data["Tanggal"] = `${tgl} ${bln} ${thn}`;

    return data;
}

// Function to generate Word document from template
async function generateBeritaAcaraDoc() {
    const data = collectBeritaAcara();

    try {
        const response = await fetch("template_NATesis.docx");
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
        const fileName = `Nilai_Akhir_Tesis-${safeNama}.docx`;

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
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnPrintRekapTesis").
        addEventListener("click", generateBeritaAcaraDoc);

});
