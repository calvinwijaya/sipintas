document.addEventListener("DOMContentLoaded", () => {
    const btnPrintNilaiUjianSkripsi = document.getElementById("btnPrintNilaiUjianSkripsi");
    const dosenInput = document.getElementById("dosenPenguji");
    const suggestionBox = document.getElementById("dosenSuggestions");
    let dosenList = [];

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

    // --- Load daftar dosen from TXT ---
    fetch("../DaftarDosen.txt")
        .then(res => res.text())
        .then(text => {
            dosenList = text.split("\n").map(n => n.trim()).filter(Boolean);
        })
        .catch(err => console.error("Gagal memuat daftar dosen:", err));

    // --- Autocomplete search ---
    dosenInput.addEventListener("input", () => {
        const query = dosenInput.value.toLowerCase();
        suggestionBox.innerHTML = "";

        if (!query) {
            suggestionBox.style.display = "none";
            return;
        }

        // Filter and limit to 3 matches
        const matches = dosenList
            .filter(name => name.toLowerCase().includes(query))
            .slice(0, 3);

        if (matches.length > 0) {
            matches.forEach(name => {
                const li = document.createElement("li");
                li.textContent = name;
                li.className = "list-group-item list-group-item-action";
                li.addEventListener("click", () => {
                    dosenInput.value = name;
                    suggestionBox.style.display = "none";
                });
                suggestionBox.appendChild(li);
            });
            suggestionBox.style.display = "block";
        } else {
            suggestionBox.style.display = "none";
        }
    });

    // Hide suggestions if clicked outside
    document.addEventListener("click", (e) => {
        if (!dosenInput.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.style.display = "none";
        }
    });

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
            const fileName = `Hasil Penilaian Ujian Tesis - ${safeNama}.docx`;

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
            avg: avg,
            tanggal: getTanggalIndonesia()
        };

        const formBody = new URLSearchParams();
        formBody.append("data", JSON.stringify(data));

        // ✅ Show loading overlay before sending
        loadingOverlay.style.display = "flex";

        fetch("https://script.google.com/macros/s/AKfycbyiwhE6o-S_mTe4aXGwqAHXR1QHj4rW8EwE2e3ZDeeVtHnhqKvR9lpPU1UjpmcTMqiA/exec", {
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
});