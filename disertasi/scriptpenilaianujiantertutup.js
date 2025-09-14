document.addEventListener("DOMContentLoaded", () => {
    const scoreInputs = document.querySelectorAll(".score-input");
    const avgInput = document.getElementById("average");
    const btnPrint = document.getElementById("btnPrint");
    const dosenInput = document.getElementById("dosenPenguji");
    const suggestionBox = document.getElementById("dosenSuggestions");
    let dosenList = [];

    // --- Ambil query params ---
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            nama: params.get("nama") || "",
            nim: params.get("nim") || "",
            promotor: params.get("promotor") || "",
            juduldisertasi: params.get("juduldisertasi") || ""
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
            let data = {};
            scoreInputs.forEach((inp, i) => {
                data[`Skor${i+1}`] = inp.value || "0";
            });
            data["Rata"] = avgInput.value;
            data["Tanggal"] = getTanggalIndonesia();
            data["NamaDosen"] = dosenInput.value || "";
            data["Nama"] = mahasiswaData.nama;
            data["NIM"] = mahasiswaData.nim;
            data["JudulDisertasi"] = mahasiswaData.juduldisertasi;
            // Selected "hasil"
            const hasilInput = document.querySelector("input[name='hasil']:checked");
            data["HasilUjian"] = hasilInput ? hasilInput.value : "";

            // Komentar dan saran
            data["Komentar"] = document.getElementById("komentar").value || "";
            data["Saran"] = document.getElementById("saran").value || "";
            data["Alasan"] = document.getElementById("alasan").value || "";

            const response = await fetch("6_Form Penilaian Ujian Tertutup.docx");
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
            const fileName = `Penilaian Ujian Tertutup - ${safeNama}.docx`;

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

    document.getElementById("btnKirim").addEventListener("click", async () => {
        const role = document.getElementById("role").value;
        const namaDosen = document.getElementById("dosenPenguji").value.trim();
        const nim = new URLSearchParams(window.location.search).get("nim");

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
            tanggal: getTanggalIndonesia()
        };

        const formBody = new URLSearchParams();
        formBody.append("data", JSON.stringify(data));

        // ✅ Show loading overlay before sending
        loadingOverlay.style.display = "flex";

        fetch("https://script.google.com/macros/s/AKfycbxD8J-AZzMFFd2l_xHDga2I9kUuqZ9Dv_k_C14bGdM86IF4qelRwPnaMp5ruZmduzcGjQ/exec", {
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