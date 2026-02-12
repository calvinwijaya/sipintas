document.addEventListener("DOMContentLoaded", () => {
    const btnKirim = document.getElementById("btnKirimPI");
    if (!btnKirim) return;

    function showLoading(show) {
      const overlay = document.getElementById("loadingOverlay");
      document.getElementById("loadingText").innerText = "Mengirim data ke sistem...";
      if (overlay) {
        overlay.style.display = show ? "flex" : "none";
      }
    }

    btnKirim.addEventListener("click", async () => {
        showLoading(true);
        const params = new URLSearchParams(window.location.search);

        const nim = params.get("nim") || "";
        const nama = params.get("nama") || "";

        if (!nim) {
            alert("NIM tidak ditemukan di URL.");
            return null;
        }

        const SHEET_ID = "1lg2tfyzMX99Ib-b5gZ31dGnHHqLHDpElQO22VMVaPbs";
        const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            const rows = data.values;

            // Cari baris sesuai NIM (kolom ke-3 atau index ke-3? sesuai contohmu di row[3])
            const row = rows.find(r => r[3] && r[3].toString().trim() === nim.toString().trim());
            if (!row) {
                alert("Data untuk NIM ini tidak ditemukan.");
                return;
            }

            // helper average
            const avgFromRow = (indices) => {
                const vals = indices.map(i => parseFloat(row[i]) || 0);
                return vals.length ? (vals.reduce((a,b)=>a+b,0) / vals.length) : 0;
            };

            // === Hitung PI ===
            const c3Indices = [98, 99, 100, 109, 110, 111, 120, 121, 122];
            const d3Indices = [22, 25, 31, 34, 37, 44, 46, 49, 55, 64, 65, 66, 68, 69, 76, 77, 78, 80, 81, 88, 89, 90, 92, 93, 103, 104, 114, 115, 125, 126];
            const e1Indices = [29, 41, 53, 105, 106, 116, 117, 127, 128];
            const f1Indices = [30, 42, 54, 67, 79, 91];
            const g5Indices = [23, 24, 26, 27, 28, 35, 36, 38, 39, 40, 47, 48, 50, 51, 52, 60, 61, 62, 63, 72, 73, 74, 75, 84, 85, 86, 87, 101, 102, 112, 113, 123, 124];

            // Hitung
            const c3 = avgFromRow(c3Indices).toFixed(2);
            const d3 = avgFromRow(d3Indices).toFixed(2);
            const e1 = avgFromRow(e1Indices).toFixed(2);
            const f1 = avgFromRow(f1Indices).toFixed(2);
            const g5 = avgFromRow(g5Indices).toFixed(2);

            const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby0jyVe6oKleFIZ27SZy52Zzw7ZHpdVkgskYOP_RhTieiiFJurWxOnjUu4whyXG4EU/exec"; // ganti URL mu

            async function sendData() {
                const payload = {
                    NIM: nim,
                    Nama: nama,
                    c3, d3, e1, f1, g5
                };

                const formData = new URLSearchParams(payload);

                const res = await fetch(SCRIPT_URL, {
                    method: "POST",
                    body: formData,
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                });

                const result = await res.json();
                console.log(result);
                } 
                
            await sendData();
            Swal.fire("Berhasil", "Data berhasil dikirim!", "success");
            
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Terjadi kesalahan saat memuat data.", "error");
        } finally {
        showLoading(false);
        }
    });
});
