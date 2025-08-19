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
            const c3Indices = [89, 90, 91, 100, 101, 102, 111, 112, 113];
            const d3Indices = [13, 16, 22, 25, 28, 35, 37, 40, 46, 55, 56, 57, 59, 60, 67, 68, 69, 71, 72, 79, 80, 81, 83, 84, 94, 95, 105, 106, 116, 117];
            const e1Indices = [20, 32, 44, 96, 97, 107, 108, 118, 119];
            const f1Indices = [21, 33, 45, 58, 70, 82];
            const g5Indices = [14, 15, 17, 18, 19, 26, 27, 29, 30, 31, 38, 39, 41, 42, 43, 51, 52, 53, 54, 63, 64, 65, 66, 75, 76, 77, 78, 92, 93, 103, 104, 114, 115];

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
