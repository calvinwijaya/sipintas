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
            const c3Indices = [95, 96, 97, 106, 107, 108, 117, 118, 119];
            const d3Indices = [19, 22, 28, 31, 34, 41, 43, 46, 52, 61, 62, 63, 65, 66, 73, 74, 75, 77, 78, 85, 86, 87, 89, 90, 100, 101, 111, 112, 122, 123];
            const e1Indices = [26, 38, 50, 102, 103, 113, 114, 124, 125];
            const f1Indices = [27, 39, 51, 64, 76, 88];
            const g5Indices = [20, 21, 23, 24, 25, 32, 33, 35, 36, 37, 44, 45, 47, 48, 49, 57, 58, 59, 60, 69, 70, 71, 72, 81, 82, 83, 84, 98, 99, 109, 110, 120, 121];

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
