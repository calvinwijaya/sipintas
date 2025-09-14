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
    // data["HasilUjian"] = document.getElementById("hasil").value || "";
    const hasilInput = document.querySelector("input[name='hasil']:checked");
    data["HasilUjian"] = hasilInput ? hasilInput.value : "";
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
    data["pembahas1"] = document.getElementById("pembahas1").textContent || "";
    data["pembahas2"] = document.getElementById("pembahas2").textContent || "";
    data["eksternal1"] = document.getElementById("eksternal1").textContent || "";
    data["eksternal2"] = document.getElementById("eksternal2").textContent || "";

    return data;
}

// Function to generate Word document from template
async function generateBeritaAcaraDoc() {
    const data = collectBeritaAcaraData();

    try {
        const response = await fetch("6_Form BA Ujian Tertutup.docx");
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
        const fileName = `BA Ujian Tertutup - ${safeNama}.docx`;

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
document.getElementById("btnPrintBAUjianTertutup").addEventListener("click", generateBeritaAcaraDoc);