async function loadProposalSkripsiData() {
    console.log("Script running...");

    const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched data:", data);

        const rows = data.values?.slice(1) || [];
        console.log("Rows:", rows);

        const proposalSkripsiRows = rows.filter(r => r[0]?.trim().toLowerCase() === "seminar proposal");
        console.log("Proposal skripsi rows:", proposalSkripsiRows);

        if (proposalSkripsiRows.length === 0) {
            document.getElementById("proposalSkripsiList").innerHTML =
                `<div class="alert alert-info">Tidak ada mahasiswa seminar proposal skripsi.</div>`;
            return;
        }

        let html = `<div class="row g-3">`;
        proposalSkripsiRows.forEach(r => {
            const [status, no, nama, nim, pembimbing, judulproposal] = r;
            const encodedParams = new URLSearchParams({ nama, nim, pembimbing, judulproposal }).toString();

            html += `
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${nama} <small class="text-muted">(${nim})</small></h5>
                            <p class="card-text"><strong>Pembimbing:</strong> ${pembimbing}</p>
                            <p class="card-text"><em>${judulproposal}</em></p>
                            <a href="skripsi/page_penilaianproposalskripsi.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Lakukan Penilaian
                            </a>
                            <a href="skripsi/page_beritaproposalskripsi.html?${encodedParams}" class="btn btn-primary btn-sm">
                                Buat Berita Acara
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById("proposalSkripsiList").innerHTML = html;

    } catch (err) {
        console.error("Error loading proposal skripsi data:", err);
        document.getElementById("proposalSkripsiList").innerHTML =
            `<div class="alert alert-danger">Gagal memuat data proposal skripsi.</div>`;
    }
}