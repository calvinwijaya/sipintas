document.addEventListener("DOMContentLoaded", () => {
    const scoreInputs = document.querySelectorAll(".score-input");
    const avgInput = document.getElementById("average");
    const btnPrint = document.getElementById("btnPrint");
    const dosenInput = document.getElementById("dosenPenguji");

    // --- Ambil query params ---
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            nama: params.get("nama") || "",
            nim: params.get("nim") || "",
            pembimbing: params.get("pembimbing") || "",
            judul: params.get("judul") || ""
        };
    }
    const mahasiswaData = getQueryParams();

    // --- Ambil data dosen dari autentikasi ---
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user) {
        alert("Sesi login tidak ditemukan. Silakan login ulang.");
        window.location.href = "../login.html";
        return;
    }

    // Set nama dosen otomatis
    dosenInput.value = user.nama || user.name || "";

    // Set role otomatis
    const roleSelect = document.getElementById("role");
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");

    if (!role) {
        alert("Role tidak ditemukan. Akses tidak valid.");
        window.location.href = "../index.html";
        return;
    }
    roleSelect.value = role;
    roleSelect.disabled = true;

    // --- Date in Bahasa Indonesia ---
    function getTanggalIndonesia() {
        const bulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const today = new Date();
        return `${today.getDate()} ${bulan[today.getMonth()]} ${today.getFullYear()}`;
    }

    // --- Average calculator ---
    scoreInputs.forEach(input => {
        input.addEventListener("input", () => {
            const scores = Array.from(scoreInputs).map(inp => parseFloat(inp.value) || 0);
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            avgInput.value = avg.toFixed(2);
        });
    });

    // --- Generate DOCX ---
    btnPrint.addEventListener("click", async () => {
        try {

            const jenisPublikasiSelect = document.getElementById("jenisPublikasi");
            const publikasi = jenisPublikasiSelect.value ? 
                jenisPublikasiSelect.options[jenisPublikasiSelect.selectedIndex].text : "";

            const statusPublikasiSelect = document.getElementById("statusPublikasi");
            const status = statusPublikasiSelect.value ? 
                statusPublikasiSelect.options[statusPublikasiSelect.selectedIndex].text : "";

            const namajurnal = document.getElementById("namaPublikasi").value.trim();

            let data = {};
            scoreInputs.forEach((inp, i) => {
                data[`Skor${i+1}`] = inp.value || "0";
            });
            data["Rata"] = avgInput.value;
            data["Tanggal"] = getTanggalIndonesia();
            data["NamaDosen"] = dosenInput.value || "";
            data["Nama"] = mahasiswaData.nama;
            data["NIM"] = mahasiswaData.nim;
            data["Pembimbing"] = mahasiswaData.pembimbing;
            data["JudulTesis"] = mahasiswaData.judul;
            data["statusPublikasi"] = status;
            data["namaPublikasi"] = namajurnal;
            data["jenisPublikasi"] = publikasi;

            const response = await fetch("template_penilaianpublikasimagister.docx");
            if (!response.ok) throw new Error("Template file not found");
            const arrayBuffer = await response.arrayBuffer();

            const zip = new PizZip(arrayBuffer);
            const doc = new window.docxtemplater().loadZip(zip);
            doc.setData(data);
            doc.render();

            const out = doc.getZip().generate({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });

            // Nama file dinamis
            const safeNama = mahasiswaData.nama.replace(/[^a-z0-9]/gi, "_"); 
            const fileName = `Hasil_Penilaian_Publikasi_Magister-${safeNama}.docx`;

            const link = document.createElement("a");
            link.href = URL.createObjectURL(out);
            link.download = fileName;
            link.click();

        } catch (error) {
            console.error(error);
            alert("Error generating DOCX: " + error.message);
        }
    });
});
const loadingOverlay = document.getElementById("loadingOverlay");

document.getElementById("btnKirim").addEventListener("click", async () => {
  const role = document.getElementById("role").value;
  const namaDosen = document.getElementById("dosenPenguji").value.trim();
  const nim = new URLSearchParams(window.location.search).get("nim");
  const jenisPublikasiSelect = document.getElementById("jenisPublikasi");
  const publikasi = jenisPublikasiSelect.value ? 
    jenisPublikasiSelect.options[jenisPublikasiSelect.selectedIndex].text : "";
  const statusPublikasiSelect = document.getElementById("statusPublikasi");
  const status = statusPublikasiSelect.value ? 
    statusPublikasiSelect.options[statusPublikasiSelect.selectedIndex].text : "";
  const namajurnal = document.getElementById("namaPublikasi").value.trim();

  const scores = Array.from(document.querySelectorAll(".score-input"))
    .map(inp => parseFloat(inp.value) || 0);

  if (!role || !namaDosen || !nim) { 
    alert("Silakan pilih peran, isi nama dosen, dan pastikan NIM tersedia."); 
    return;
  }

  const data = {
    role: role,
    namaDosen: namaDosen,
    nim: nim,
    scores: scores,
    publikasi: publikasi,
    status: status,
    namajurnal: namajurnal
  };

  const formBody = new URLSearchParams();
  formBody.append("data", JSON.stringify(data));

  // ✅ Show loading overlay before sending
  loadingOverlay.style.display = "flex";

  fetch("https://script.google.com/macros/s/AKfycbyGNFdnlGQUFX8GmI-hj25gk91vBNZV71xcCVoHarCFuW1bZdXjPYmUVyiGP0azdObxbg/exec", {
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
      // ✅ Hide loading overlay after process
      loadingOverlay.style.display = "none";
    });
});

document.getElementById("btnLoadNilaiPublikasiTesis").addEventListener("click", () => {
    const nim = document.getElementById("nim").textContent.trim();
    const role = document.getElementById("role").value;

    if (!nim || !role) {
        alert("NIM atau peran belum tersedia!");
        return;
    }

    const callbackName = "handleLoadNilaiResponse_" + Date.now();
    loadingOverlay.style.display = "flex";

    window[callbackName] = function (data) {
        try {
        if (data.status === "ok") {
            const inputs = document.querySelectorAll(".score-input");

            inputs.forEach((inp, i) => {
                inp.value = data.scores[i] !== undefined ? data.scores[i] : "";
            });

            alert("Nilai berhasil dimuat.");
        } else {
            alert(data.message || "Gagal memuat nilai.");
        }
        } finally {
        loadingOverlay.style.display = "none";
        delete window[callbackName];
        }
    };

    const script = document.createElement("script");
    script.src =
        "https://script.google.com/macros/s/AKfycbyWtlgujhqx-RMAO3Nfv6yUyxxL2WWfZ4VKyyDgPPgUYrDhkApQ8xErCxnxsZqGoVmf/exec" +
        `?nim=${encodeURIComponent(nim)}` +
        `&role=${encodeURIComponent(role)}` +
        `&action=loadRevisi` +
        `&callback=${callbackName}`;

    document.body.appendChild(script);
  });