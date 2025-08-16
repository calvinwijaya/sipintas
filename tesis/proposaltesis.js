async function loadProposalData() {
    console.log("Script running...");

    const SHEET_ID = "1lg2tfyzMX99Ib-b5gZ31dGnHHqLHDpElQO22VMVaPbs";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched data:", data);

        const rows = data.values?.slice(1) || [];
        console.log("Rows:", rows);

        const proposalRows = rows.filter(r => r[0]?.trim().toLowerCase() === "proposal");
        console.log("Proposal rows:", proposalRows);

        if (proposalRows.length === 0) {
            document.getElementById("proposalList").innerHTML =
                `<div class="alert alert-info">Tidak ada mahasiswa ujian proposal.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        proposalRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judul] = r;
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judul }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text"><em>${judul}</em></p>
                            <a href="tesis/page_penilaianproposaltesis.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                            <a href="tesis/page_beritaproposaltesis.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Buat Berita Acara
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById("proposalList").innerHTML = html;

    } catch (err) {
        console.error("Error loading proposal data:", err);
        document.getElementById("proposalList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data proposal.</div>`;
    }
}