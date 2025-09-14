// Function to collect all form/page data
function collectBeritaAcaraData() {
    const data = {};

    // From query string
    const params = new URLSearchParams(window.location.search);
    data["Nama"] = params.get("nama") || "";
    data["NIM"] = params.get("nim") || "";
    data["JudulDisertasi"] = params.get("juduldisertasi") || "";

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
    data["JamAkhir"] = document.getElementById("jamAkhir").value || "";;
    data["HasilUjian"] = document.getElementById("hasil").value || "";
    data["Catatan"] = document.getElementById("catatan").value || "";

    // ✅ Calculate Lama Seminar
    if (data["JamAwal"] && data["JamAkhir"]) {
        const [h1, m1] = data["JamAwal"].split(":").map(Number);
        const [h2, m2] = data["JamAkhir"].split(":").map(Number);

        const start = h1 * 60 + m1;
        const end = h2 * 60 + m2;
        let diff = end - start;

        if (diff < 0) diff += 24 * 60; // handle if crossing midnight

        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;

        data["Lama"] = `${hours} jam ${minutes} menit`;
    } else {
        data["Lama"] = "";
    }

    // Names of examiners
    data["ketuaSidang"] = document.getElementById("ketuaSidang").textContent || "";
    data["promotor"] = document.getElementById("promotor").textContent || "";
    data["kopromotor1"] = document.getElementById("kopromotor1").textContent || "";
    data["kopromotor2"] = document.getElementById("kopromotor2").textContent || "";

    return data;
}

// Function to generate Word document from template
async function generateBeritaAcaraDoc() {
    const data = collectBeritaAcaraData();

    try {
        const response = await fetch("2_Form BA Seminar 1.docx");
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
        const fileName = `BA Seminar 1 - ${safeNama}.docx`;

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
document.getElementById("btnPrintBASeminar1").addEventListener("click", generateBeritaAcaraDoc);