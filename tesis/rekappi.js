document.addEventListener("DOMContentLoaded", () => {
    const btnKirim = document.getElementById("btnKirimPI");
    if (!btnKirim) return;

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
            // kolom index dimulai dari 0 → jadi 83 berarti row[83]
            const c3Indices = [83, 84, 85, 94, 95, 96, 105, 106, 107];
            const d3Indices = [7, 10, 16, 19, 22, 28, 31, 34, 40, 49, 50, 51, 53, 54, 61, 62, 63, 65, 66, 73, 74, 75, 77, 78, 88, 89, 99, 100, 110, 111];
            const e1Indices = [14, 26, 38, 90, 91, 101, 102, 112, 113];
            const f1Indices = [15, 27, 39, 52, 64, 76];
            const g5Indices = [8, 9, 11, 12, 13, 20, 21, 23, 24, 25, 32, 33, 35, 36, 37, 45, 46, 47, 48, 57, 58, 59, 60, 69, 70, 71, 72, 86, 87, 97, 98, 108, 109];

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
            alert("Data berhasil dikirim!");
            
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan saat memuat data.");
        } finally {
        showLoading(false);
        }
    });
});
