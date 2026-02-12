document.addEventListener("DOMContentLoaded", () => {
    const btnPrintNilaiUjianSkripsi = document.getElementById("btnPrintNilaiUjianSkripsi");
    const dosenInput = document.getElementById("dosenPenguji");

    // --- Ambil query params ---
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            nama: params.get("nama") || "",
            nim: params.get("nim") || "",
            pembimbing: params.get("pembimbing") || "",
            judulskripsi: params.get("judulskripsi") || ""
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

    // --- Calculate scores ---
    function calculateGroup(group) {
        const inputs = document.querySelectorAll(`.score-${group}`);
        let sum = 0, count = 0;

        inputs.forEach(inp => {
        const val = parseFloat(inp.value);
        if (!isNaN(val)) {
            sum += val;
            count++;
        }
        });

        const avg = count > 0 ? (sum / count) : 0;

        document.getElementById(`sum${group}`).textContent = sum;
        document.getElementById(`avg${group}`).textContent = avg.toFixed(2);

        return avg;
    }

    function calculateAll() {
        const avgA = calculateGroup("A");
        const avgB = calculateGroup("B");
        const avgC = calculateGroup("C");
        const nilai = (2 * avgA + 2 * avgB + avgC) / 5;
        
        document.getElementById("nilaiFinal").value = nilai.toFixed(2);
    }

    // attach listeners
    document.querySelectorAll(".score-input").forEach(input => {
        input.addEventListener("input", calculateAll);
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

    // --- Generate DOCX ---
    btnPrintNilaiUjianSkripsi.addEventListener("click", async () => {
        try {
            const avgA = calculateGroup("A");
            const avgB = calculateGroup("B");
            const avgC = calculateGroup("C");
            const jumlahtotal = (2 * avgA + 2 * avgB + avgC);
            
            let data = {};
            // --- collect group scores into data ---
            data["JumlahA"] = document.getElementById("sumA").textContent;
            data["RataA"] = document.getElementById("avgA").textContent;
            data["JumlahB"] = document.getElementById("sumB").textContent;
            data["RataB"] = document.getElementById("avgB").textContent;
            data["JumlahC"] = document.getElementById("sumC").textContent;
            data["RataC"] = document.getElementById("avgC").textContent;

            data["JumlahTotal"] = jumlahtotal.toFixed(2);
            data["Rerata"] = document.getElementById("nilaiFinal").value;

            // --- collect individual skor placeholders ---
            data["SkorA1"] = document.getElementById("skorA1").value || "0";
            data["SkorA2"] = document.getElementById("skorA2").value || "0";
            data["SkorA3"] = document.getElementById("skorA3").value || "0";
            data["SkorA4"] = document.getElementById("skorA4").value || "0";
            data["SkorA5"] = document.getElementById("skorA5").value || "0";
            data["SkorA6"] = document.getElementById("skorA6").value || "0";
            data["SkorA7"] = document.getElementById("skorA7").value || "0";
            data["SkorB1"] = document.getElementById("skorB1").value || "0";
            data["SkorB2"] = document.getElementById("skorB2").value || "0";
            data["SkorB3"] = document.getElementById("skorB3").value || "0";
            data["SkorC1"] = document.getElementById("skorC1").value || "0";
            data["SkorC2"] = document.getElementById("skorC2").value || "0";

            data["Tanggal"] = getTanggalIndonesia();
            data["NamaDosen"] = dosenInput.value || "";
            data["Nama"] = mahasiswaData.nama;
            data["NIM"] = mahasiswaData.nim;
            data["Pembimbing"] = mahasiswaData.pembimbing;
            data["JudulSkripsi"] = mahasiswaData.judulskripsi;

            const response = await fetch("2_Form Penilaian Ujian Skripsi.docx");
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
            const fileName = `Hasil Penilaian Ujian Skripsi - ${safeNama}.docx`;

            const link = document.createElement("a");
            link.href = URL.createObjectURL(out);
            link.download = fileName;
            link.click();

        } catch (error) {
            console.error(error);
            alert("Error generating DOCX: " + error.message);
        }
    });

    const loadingOverlay = document.getElementById("loadingOverlay");

    document.getElementById("btnKirimNilaiUjianSkripsi").addEventListener("click", async () => {
        const role = document.getElementById("role").value;
        const namaDosen = document.getElementById("dosenPenguji").value.trim();
        const nim = new URLSearchParams(window.location.search).get("nim");
        const avg = parseFloat(document.getElementById("nilaiFinal").value) || 0;

        if (!role || !namaDosen || !nim) { 
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Silakan pilih peran, isi nama dosen, dan pastikan NIM tersedia.'
            });
            return;
        }

        const scores = Array.from(document.querySelectorAll(".score-input"))
            .map(inp => parseFloat(inp.value) || 0);

        Swal.fire({
            title: "Kirim Nilai Sekarang?",
            text: "Pastikan semua parameter penilaian sudah sesuai.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, Kirim!",
            cancelButtonText: "Batal"
        }).then((result) => {
            // Jika user menekan tombol "Ya, Kirim!"
            if (result.isConfirmed) {
                jalankanPengirimanData(role, namaDosen, nim, scores, avg);
            }
        });
    });

    function jalankanPengirimanData(role, namaDosen, nim, scores, avg) {
        const data = {
            role: role,
            namaDosen: namaDosen,
            nim: nim,
            scores: scores,
            avg: avg,
            tanggal: getTanggalIndonesia()
        };

        const formBody = new URLSearchParams();
        formBody.append("data", JSON.stringify(data));

        // ✅ Show loading overlay before sending
        loadingOverlay.style.display = "flex";

        fetch("https://script.google.com/macros/s/AKfycbxYl1EMBZvqng-MoV2IzNXvfdpH5loSNoyvAxO_QJbusH8YmIiuOSRoKwaLIMjscfYg/exec", {
            method: "POST",
            body: formBody
        })
            .then(res => res.json())
            .then(result => {
                if (result.status === "success") {
                showModal({
                    type: "success",
                    title: "Nilai berhasil dikirim!",
                });
                } else {
                    showModal({
                    type: "error",
                    title: "Gagal mengirim nilai",
                    });
                }
            })
            .catch(err => {
            console.error("Error:", err);
            Swal.fire("Error", "Terjadi kesalahan saat mengirim data.", "error");
            })
            .finally(() => {
            // ✅ Hide loading overlay after process
            loadingOverlay.style.display = "none";
            });
    }

    document.getElementById("btnLoadNilaiSkripsi").addEventListener("click", () => {
        document.querySelector("#loadingOverlay div:last-child").innerText = "Mengambil data dari sistem...";
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

                showModal({
                    type: "success",
                    title: "Nilai berhasil dimuat!",
                });
            } else {
                showModal({
                    type: "error",
                    title: "Gagal memuat nilai",
                    });
            }
            } finally {
            loadingOverlay.style.display = "none";
            delete window[callbackName];
            }
        };

        const script = document.createElement("script");
        script.src =
            "https://script.google.com/macros/s/AKfycbw-6QmFiWUpTwGDSy9DcILCqyg3K01PldHNpecTCne2E-NbtzpphGom4XgvTRvzrZpH/exec" +
            `?nim=${encodeURIComponent(nim)}` +
            `&role=${encodeURIComponent(role)}` +
            `&action=loadRevisi` +
            `&callback=${callbackName}`;

        document.body.appendChild(script);
    });

    function showModal({ type, title }) {
        const modal = document.getElementById("notifyModal");
        const icon = document.getElementById("modalIcon");
        const titleEl = document.getElementById("modalTitle");

        // Reset
        icon.className = "modal-icon";
        icon.textContent = "";

        if (type === "success") {
            icon.textContent = "✔";
            icon.classList.add("success");
        } else if (type === "error") {
            icon.textContent = "✖";
            icon.classList.add("error");
        }

        titleEl.textContent = title;

        modal.classList.remove("hidden");
        }

        // Close modal
        document.getElementById("btnModalOk").addEventListener("click", () => {
        document.getElementById("notifyModal").classList.add("hidden");
        });    
});