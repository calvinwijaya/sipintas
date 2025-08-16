document.addEventListener("DOMContentLoaded", () => {
    const btnPrintNilaiUjianTesis = document.getElementById("btnPrintNilaiUjianTesis");
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
            judul: params.get("judul") || ""
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
        const avgD = calculateGroup("D");

        const nilai = (3 * avgA + 3 * avgB + 2 * avgC + 2 * avgD) / 10;
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
    btnPrintNilaiUjianTesis.addEventListener("click", async () => {
        try {
            let data = {};
            // --- collect group scores into data ---
            data["Jumlah_A"] = document.getElementById("sumA").textContent;
            data["Rata_A"] = document.getElementById("avgA").textContent;
            data["Jumlah_B"] = document.getElementById("sumB").textContent;
            data["Rata_B"] = document.getElementById("avgB").textContent;
            data["Jumlah_C"] = document.getElementById("sumC").textContent;
            data["Rata_C"] = document.getElementById("avgC").textContent;
            data["Jumlah_D"] = document.getElementById("sumD").textContent;
            data["Rata_D"] = document.getElementById("avgD").textContent;
            data["Rata"] = document.getElementById("nilaiFinal").value;

            // --- collect individual skor placeholders ---
            data["Skor_A1"] = document.getElementById("skorA1").value || "0";
            data["Skor_A2"] = document.getElementById("skorA2").value || "0";
            data["Skor_A3"] = document.getElementById("skorA3").value || "0";
            data["Skor_B1"] = document.getElementById("skorB1").value || "0";
            data["Skor_B2"] = document.getElementById("skorB2").value || "0";
            data["Skor_C1"] = document.getElementById("skorC1").value || "0";
            data["Skor_C2"] = document.getElementById("skorC2").value || "0";
            data["Skor_D1"] = document.getElementById("skorD1").value || "0";
            data["Skor_D2"] = document.getElementById("skorD2").value || "0";

            data["Tanggal"] = getTanggalIndonesia();
            data["NamaDosen"] = dosenInput.value || "";
            data["Nama"] = mahasiswaData.nama;
            data["NIM"] = mahasiswaData.nim;
            data["Pembimbing"] = mahasiswaData.pembimbing;
            data["JudulTesis"] = mahasiswaData.judul;

            const response = await fetch("template_penilaianujiantesis.docx");
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
            const fileName = `Hasil_Penilaian_Ujian_Tesis-${safeNama}.docx`;

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

    document.getElementById("btnKirimNilaiUjianTesis").addEventListener("click", async () => {
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

        fetch("https://script.google.com/macros/s/AKfycbxnj4qkjViavSlu5LNsNJUy2awWFTD4WR-0D7n213sk3Y7BDFY9A31aWJhBJnNcVgO-/exec", {
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