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

        const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
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

            // === Hitung PI === pakai yang Atas
            const c1Indices = [18, 27, 36, 48, 62, 76];
            const e1Indices = [19, 28, 37, 49, 63, 77];
            const j2Indices = [23, 32, 41, 50, 64, 78];
            const c3Indices = [51, 65, 79];
            const e3Indices = [22, 31, 40, 52, 66, 80];
            const h2Indices = [53, 67, 81];
            const i1Indices = [54, 68, 82];
            const k3Indices = [21, 30, 39, 55, 69, 83];
            const g2Indices = [56, 70, 84];
            const k1Indices = [20, 29, 38, 57, 71, 85];
            const g1Indices = [24, 33, 42, 58, 72, 86];
            const f2Indices = [59, 73, 87];

            // Hitung
            const c1 = avgFromRow(c1Indices).toFixed(2);
            const e1 = avgFromRow(e1Indices).toFixed(2);
            const j2 = avgFromRow(j2Indices).toFixed(2);
            const c3 = avgFromRow(c3Indices).toFixed(2);
            const e3 = avgFromRow(e3Indices).toFixed(2);
            const h2 = avgFromRow(h2Indices).toFixed(2);
            const i1 = avgFromRow(i1Indices).toFixed(2);
            const k3 = avgFromRow(k3Indices).toFixed(2);
            const g2 = avgFromRow(g2Indices).toFixed(2);
            const k1 = avgFromRow(k1Indices).toFixed(2);
            const g1 = avgFromRow(g1Indices).toFixed(2);
            const f2 = avgFromRow(f2Indices).toFixed(2);

            const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhI_DAFvxAODjJ0tgvqL4_ioCmyHorAOijsQxAB4ROOUYL8aQs13OE5B56FkAd_6AylQ/exec";

            async function sendData() {
                const payload = {
                    NIM: nim,
                    Nama: nama,
                    c1, e1, j2, c3, e3, h2, i1, k3, g2, k1, g1, f2
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
