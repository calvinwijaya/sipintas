async function loadRekapKPData() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentEmail = user.email.toLowerCase().trim();
    const isAdmin = KP_ADMIN_EMAILS.includes(currentEmail);

    const SHEET_ID = "1oGXhRIAonDGN4MCLLbhAKcNef-VYNVTimPw6fP-BKJM";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        // Mengabaikan 3 baris pertama (header), data ditarik mulai dari baris ke-4
        const rows = data.values?.slice(3) || []; 

        const tbody = document.getElementById("tabelRekapKp");
        if (!tbody) return;
        tbody.innerHTML = "";

        let validCount = 0;

        rows.forEach((r) => {
            const nama = r[1] || "";
            const nim = r[2] || "";
            const pembimbing = r[5] || "";
            const instansiKP = r[14] || "-";
            const tanggalKP = r[16] || "-"; // Ekstrak Tanggal dari Kolom Q (Indeks 16)
            const email_pembimbing = (r[46] || "").toLowerCase().trim();

            const isDinilaiGeodesi = !!r[22]; // Kolom W (indeks 22)
            const isDinilaiInstansi = !!r[32]; // Kolom AG (indeks 32)

            // Filter 1: Harus sudah dinilai penuh (Dosen Geodesi & Instansi)
            if (!isDinilaiGeodesi || !isDinilaiInstansi) return;

            // Filter 2: Hak Akses (Admin lihat semua, Dosen lihat bimbingannya saja)
            if (!isAdmin && email_pembimbing !== currentEmail) return;

            // Tarik nilai langsung dari spreadsheet berdasarkan indeks kolom (0-based index)
            // Kolom AC = 28, Kolom AO = 40, Kolom AR = 43, Kolom AS = 44
            const rerataGeodesi = parseFloat(r[28]) || 0;
            const rerataInstansi = parseFloat(r[40]) || 0;
            const nilaiAkhir = parseFloat(r[43]) || 0;
            const nilaiHuruf = r[44] || "-";

            validCount++;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="text-center">${validCount}</td>
                <td class="fw-bold">${nama}</td>
                <td class="text-center">${nim}</td>
                <td>${pembimbing}</td>
                <td>${instansiKP}</td>
                <td class="text-center"><small>${tanggalKP}</small></td> <td class="text-center">${rerataGeodesi.toFixed(2)}</td>
                <td class="text-center">${rerataInstansi.toFixed(2)}</td>
                <td class="text-center fw-bold text-primary">${nilaiAkhir.toFixed(2)}</td>
                <td class="text-center fw-bold fs-5">${nilaiHuruf}</td>
            `;
            tbody.appendChild(tr);
        });

        // Tampilkan/Sembunyikan Elemen
        document.getElementById("loadingRekapKp").style.display = "none";
        
        if (validCount === 0) {
            document.getElementById("rekapKpContainer").innerHTML = `
                <div class="alert alert-info">
                    Belum ada data rekapitulasi kelompok Kerja Praktik yang telah selesai dinilai sepenuhnya ${isAdmin ? '' : 'dibawah bimbingan Anda'}.
                </div>
            `;
        } else {
            document.getElementById("rekapKpContent").style.display = "block";
        }

    } catch (err) {
        console.error("Error loading rekap KP data:", err);
        document.getElementById("rekapKpContainer").innerHTML =
            `<div class="alert alert-danger">Terjadi kesalahan saat memuat data rekapitulasi.</div>`;
    }
} 

loadRekapKPData();