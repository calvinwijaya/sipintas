async function loadKKStudioData() {
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
        const KKStudioRows = rows.filter(r => r[0]?.trim().toLowerCase() === "studio");
        console.log("KK Studio rows:", KKStudioRows);

        if (KKStudioRows.length === 0) {
            document.getElementById("KKStudioList").innerHTML =
                `<div class="alert alert-info">Tidak ada kelompok KK Studio.</div>`;
            return;
        }

        // Group students by Kelompok
        const groups = {};
        KKStudioRows.forEach(r => {
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
                            <a href="kemahkerja/page_penilaiankkstudio.html?${encodedParams.toString()}" 
                               class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        document.getElementById("KKStudioList").innerHTML = html;

    } catch (err) {
        console.error("Error loading KK Studio data:", err);
        document.getElementById("KKStudioList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data KK Studio.</div>`;
    }
}
