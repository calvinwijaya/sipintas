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
    data["Skor_KetuaSidang"] = document.getElementById("nilaiP1").textContent || "";
    data["Skor_Penguji1"] = document.getElementById("nilaiP2").textContent || "";
    data["Skor_Penguji2"] = document.getElementById("nilaiP3").textContent || "";
    data["Rata"] = document.getElementById("nilaiRekap").textContent || "";

    // Names of examiners
    data["NamaKetuaSidang"] = document.getElementById("ketuaSidang").textContent || "";
    data["NamaPenguji1"] = document.getElementById("penguji1").textContent || "";
    data["NamaPenguji2"] = document.getElementById("penguji2").textContent || "";

    // Comments
    data["JudulProposalTesisRevisi"] = document.getElementById("judulProposalTesisRevisi").value || "";
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

// Save revisi notes
const loadingOverlay = document.getElementById("loadingOverlay");

document.getElementById("btnSaveRevisi").addEventListener("click", () => {
  const payload = {
    nim: document.getElementById("nim").textContent,
    revisiJudul: document.getElementById("judulProposalTesisRevisi").value,
    metode: document.getElementById("metode").value,
    penulisan: document.getElementById("penulisan").value,
    saran: document.getElementById("saran").value
  };

  const formData = new URLSearchParams();
  formData.append("action", "saveRevisi");
  formData.append("data", JSON.stringify(payload));

  loadingOverlay.style.display = "flex";

  fetch("https://script.google.com/macros/s/AKfycbzH_d-legJwwUYz_UlYwPLr0WLgFNE-kj1dHlbdmMUstx8TzVF9uDw_7hE33OxY7v-c/exec", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Catatan revisi berhasil disimpan");
    })
    .catch(err => {
      console.error(err);
      alert("Gagal menyimpan catatan revisi");
    })
    .finally(() => {
      loadingOverlay.style.display = "none";
    });
});

document.getElementById("btnLoadRevisi").addEventListener("click", () => {
  const nim = document.getElementById("nim").textContent.trim();
  if (!nim) {
    alert("NIM tidak tersedia!");
    return;
  }

  const callbackName = "handleRevisiResponse";
  loadingOverlay.style.display = "flex";
  window[callbackName] = function (data) {
    try {
      if (data.status === "ok") {
        document.getElementById("judulProposalTesisRevisi").value = data.revisiJudul || "";
        document.getElementById("metode").value = data.metode || "";
        document.getElementById("penulisan").value = data.penulisan || "";
        document.getElementById("saran").value = data.saran || "";
        alert("Catatan revisi berhasil dimuat");
      } else {
        alert(data.message || "Gagal memuat catatan revisi");
      }
    } finally {
      // HIDE loading no matter success or error
      loadingOverlay.style.display = "none";
    }
  };

  const script = document.createElement("script");
  script.src = `https://script.google.com/macros/s/AKfycbwNKsOCkJQJ0b4X1R_YgMxWBsTaLQ2dNnq7LN6oaW0uzzAJa6W6XaqnspRRil_DWY-F/exec?nim=${encodeURIComponent(nim)}&action=loadRevisi&callback=${callbackName}`;
  document.body.appendChild(script);
});
