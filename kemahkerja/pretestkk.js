async function loadPreTestKKData() {
    console.log("Script running...");

    const SHEET_ID = "17JdVhNRwi_UsYmWk4m9GAljkveGrGkUboI_lPNrFrnU"; // only the ID
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched data:", data);

        const rows = data.values?.slice(1) || []; // skip header row
        console.log("Rows:", rows);

        // Filter only Pre-Test rows
        const pretestKKRows = rows.filter(r => r[0]?.trim().toLowerCase() === "pre-test");
        console.log("Pre-test KK rows:", pretestKKRows);

        if (pretestKKRows.length === 0) {
            document.getElementById("pretestKKList").innerHTML =
                `<div class="alert alert-info">Tidak ada kelompok Pre-Test KK.</div>`;
            return;
        }

        // Group students by Kelompok
        const groups = {};
        pretestKKRows.forEach(r => {
            const [status, no, nama, nim, kelompok, lokasi] = r;
            if (!groups[kelompok]) groups[kelompok] = [];
            groups[kelompok].push({ nama, nim, lokasi });
        });

        // Build HTML
        let html = `<div class="row g-3">`;

        Object.entries(groups).forEach(([kelompok, members]) => {
            const lokasi = members[0].lokasi || "";

            // Build query params for this group
            const encodedParams = new URLSearchParams();
            encodedParams.append("kelompok", kelompok);
            members.forEach((m, idx) => {
                encodedParams.append("nama" + (idx+1), m.nama);
                encodedParams.append("nim" + (idx+1), m.nim);
            });

            html += `
                <div class="col-md-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body text-center">
                            <h4 class="fw-bold text-primary mb-1">Kelompok ${kelompok}</h4>
                            <p class="text-muted mb-3">
                                <strong>Lokasi:</strong> ${lokasi}
                            </p>
                            <ol class="text-start small mb-3 ps-3">
                                ${members.map(m => `<li>${m.nama}</li>`).join("")}
                            </ol>
                            <a href="kemahkerja/page_penilaianpretestkk.html?${encodedParams.toString()}" 
                               class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        document.getElementById("pretestKKList").innerHTML = html;

    } catch (err) {
        console.error("Error loading pre-test KK data:", err);
        document.getElementById("pretestKKList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data pre-test KK.</div>`;
    }
}
