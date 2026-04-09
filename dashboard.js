const user = JSON.parse(sessionStorage.getItem("user"));
if (!user) {
    window.location.href = 'login.html';
}
document.getElementById("userNama").textContent = user.nama;

const sidebarUserNama = document.getElementById("sidebarUserNama");
const sidebarUserRole = document.getElementById("sidebarUserRole");
const userProfilePic = document.getElementById("userProfilePic");

if (sidebarUserNama) sidebarUserNama.textContent = user.nama;
if (sidebarUserRole) sidebarUserRole.textContent = user.status;

if (userProfilePic) {
    const nameForAvatar = user.nama.replace(/\s+/g, '+');
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=0d6efd&color=fff&rounded=true&bold=true`;

    if (user.picture) {
        userProfilePic.src = user.picture;
        // Jika foto Google gagal dimuat, ganti ke Inisial Nama
        userProfilePic.onerror = function() {
            this.onerror = null; 
            this.src = defaultAvatarUrl;
        };
    } else {
        userProfilePic.src = defaultAvatarUrl;
    }
}

const isAdmin = ADMIN_EMAILS.includes(user.email);
if (isAdmin && sidebarUserRole) {
        sidebarUserRole.innerHTML = `${user.status} <span class="badge bg-warning text-dark ms-1">Admin</span>`;
    }

document.getElementById('toggleSidebar').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');

    // Tutup semua submenu ketika sidebar dicollapse
    if (sidebar.classList.contains('collapsed')) {
        document.querySelectorAll('.sidebar .collapse.show').forEach(el => {
            const bsCollapse = bootstrap.Collapse.getInstance(el);
            if (bsCollapse) {
                bsCollapse.hide();
            } else {
                new bootstrap.Collapse(el, { toggle: false }).hide();
            }
        });
    }
});

function loadPage(page, key) {
    fetch(page)
        .then(res => res.text())
        .then(html => {
            document.getElementById("mainContent").innerHTML = html;

            if (page === "skripsi/dashboard_proposalskripsi.html") {
                loadProposalSkripsiData(); 
            } if (page === "skripsi/dashboard_ujianskripsi.html") {
                loadUjianSkripsiData(); 
            } if (page === "skripsi/dashboard_rekapskripsi.html") {
                loadRekapSkripsiData(); 
            } if (page === "tesis/dashboard_proposaltesis.html") {
                loadProposalData();
            } if (page === "tesis/dashboard_publikasitesis.html") {
                loadPublikasiS2Data(); 
            } if (page === "tesis/dashboard_ujiantesis.html") {
                loadUjianTesisData(); 
            } if (page === "tesis/dashboard_rekaptesis.html") {
                loadRekapTesisData(); 
            } if (page === "disertasi/dashboard_ujiankomprehensif.html") {
                loadQualificationAssessmentData(); 
            } if (page === "disertasi/dashboard_seminar1.html") {
                loadSeminar1Data(); 
            } if (page === "disertasi/dashboard_seminar2.html") {
                loadSeminar2Data(); 
            } if (page === "disertasi/dashboard_publikasidisertasi.html") {
                loadUjianKelayakanData(); 
            } if (page === "disertasi/dashboard_ujiantertutup.html") {
                loadujianTertutupData(); 
            } if (page === "disertasi/dashboard_naskahakhir.html") {
                loadnaskahAkhirData(); 
            } if (page === "disertasi/dashboard_kinerja.html") {
                loadKinerjaData(); 
            } if (page === "disertasi/dashboard_rekapdisertasi.html") {
                loadRekapDisertasiData(); 
            } if (page === "kemahkerja/dashboard_pretestkk.html") {
                loadPreTestKKData(); 
            } if (page === "kemahkerja/dashboard_kkshift1.html") {
                loadKKShift1Data(); 
            } if (page === "kemahkerja/dashboard_kkshift2.html") {
                loadKKShift2Data(); 
            } if (page === "kemahkerja/dashboard_kkshift3.html") {
                loadKKShift3Data(); 
            } if (page === "kemahkerja/dashboard_kkstudio.html") {
                loadKKStudioData(); 
            } if (page === "prgg/dashboard_prgg.html") {
                loadPRGGData(); 
            } if (page === "kerjapraktik/dashboard_kerjapraktik.html") {
                loadKPData(); 
            }

            history.pushState({page}, "", `?page=${key}`);
        })
        .catch(err => {
            document.getElementById("mainContent").innerHTML = "<p class='text-danger'>Gagal memuat halaman.</p>";
            console.error(err);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const pageKey = params.get("page");

    if (pageKey === "proposalskripsi") {
        loadPage("skripsi/dashboard_proposalskripsi.html", "proposalskripsi");
    } else if (pageKey === "ujianskripsi") {
        loadPage("skripsi/dashboard_ujianskripsi.html", "ujianskripsi");
    } else if (pageKey === "rekapskripsi") {
        loadPage("skripsi/dashboard_rekapskripsi.html", "rekapskripsi");
    } 
    
    else if (pageKey === "proposaltesis") {
        loadPage("tesis/dashboard_proposaltesis.html", "proposaltesis");
    } else if (pageKey === "publikasitesis") {
        loadPage("tesis/dashboard_publikasitesis.html", "publikasitesis");
    } else if (pageKey === "ujiantesis") {
        loadPage("tesis/dashboard_ujiantesis.html", "ujiantesis");
    } else if (pageKey === "rekaptesis") {
        loadPage("tesis/dashboard_rekaptesis.html", "rekaptesis");
    } else if (pageKey === "rekaptesis") {
        loadPage("tesis/dashboard_rekaptesis.html", "rekaptesis");
    } 
    
    else if (pageKey === "ujiankomprehensifdisertasi") {
        loadPage("disertasi/dashboard_ujiankomprehensif.html", "ujiankomprehensifdisertasi");
    } else if (pageKey === "disertasiseminar1") {
        loadPage("disertasi/dashboard_seminar1.html", "disertasiseminar1");
    } else if (pageKey === "disertasiseminar2") {
        loadPage("disertasi/dashboard_seminar2.html", "disertasiseminar2");
    } else if (pageKey === "publikasidisertasi") {
        loadPage("disertasi/dashboard_publikasidisertasi.html", "publikasidisertasi");
    } else if (pageKey === "ujiantertutupdisertasi") {
        loadPage("disertasi/dashboard_ujiantertutup.html", "ujiantertutupdisertasi");
    } else if (pageKey === "naskahakhirdisertasi") {
        loadPage("disertasi/dashboard_naskahakhir.html", "naskahakhirdisertasi");
    } else if (pageKey === "kinerjadisertasi") {
        loadPage("disertasi/dashboard_kinerja.html", "kinerjadisertasi");
    } else if (pageKey === "rekapdisertasi") {
        loadPage("disertasi/dashboard_rekapdisertasi.html", "rekapdisertasi");
    } 
    
    else if (pageKey === "pretestkk") {
        loadPage("kemahkerja/dashboard_pretestkk.html", "pretestkk");
    } else if (pageKey === "kkshift1") {
        loadPage("kemahkerja/dashboard_kkshift1.html", "kkshift1");
    } else if (pageKey === "kkshift2") {
        loadPage("kemahkerja/dashboard_kkshift2.html", "kkshift2");
    } else if (pageKey === "kkshift3") {
        loadPage("kemahkerja/dashboard_kkshift3.html", "kkshift3");
    } else if (pageKey === "kkstudio") {
        loadPage("kemahkerja/dashboard_kkstudio.html", "kkstudio");
    } 

    else if (pageKey === "prgg") {
        loadPage("prgg/dashboard_prgg.html", "prgg");
    }

    else if (pageKey === "kerjapraktik") {
        loadPage("kerjapraktik/dashboard_kerjapraktik.html", "kerjapraktik");
    }
    
    else {
        
    }
});

document.getElementById("btnLogout").addEventListener("click", (e) => {
    e.preventDefault();

    Swal.fire({
        title: 'Keluar dari Sistem?',
        text: "Anda harus login kembali untuk mengakses data penilaian.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545', // Bootstrap Danger color
        cancelButtonColor: '#6c757d', // Bootstrap Secondary color
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            performLogout();
        }
    });
});

function performLogout() {
    try {
        const userRaw = sessionStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        const email = user?.email;

        if (window.google?.accounts?.id) {
            google.accounts.id.disableAutoSelect();
            if (email) {
                google.accounts.id.revoke(email, () => {
                    console.log("Google session revoked");
                });
            }
        }
    } catch (err) {
        console.warn("Logout cleanup error:", err);
    }

    sessionStorage.clear();
    localStorage.clear();
    
    // Optional: Show a quick success message before redirecting
    Swal.fire({
        title: 'Berhasil Keluar',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        window.location.href = "login.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadProposalSkripsi2Data();
    loadProposalTesisData();
});

// ======================
// Skripsi
// ======================
async function loadProposalSkripsi2Data() {
    const SHEET_ID = "1THmInPem3cxfB1kJJifuC4C1MMi4cPH3zlFN20grBJA";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values?.slice(1) || [];

        // Filter status
        const proposal = rows.filter(r => r[0]?.trim().toLowerCase() === "seminar proposal").length;
        const revisiProposal = rows.filter(r => r[0]?.trim().toLowerCase() === "revisi proposal").length;
        const ujianAkhir = rows.filter(r => r[0]?.trim().toLowerCase() === "seminar akhir").length;
        const selesai = rows.filter(r => r[0]?.trim().toLowerCase() === "selesai").length;

        // Render chart
        renderChart("skripsiChart", "Skripsi", [proposal, revisiProposal, ujianAkhir, selesai]);

    } catch (err) {
        console.error("Error fetching Skripsi data:", err);
    }
}

// ======================
// Tesis
// ======================
async function loadProposalTesisData() {
    const SHEET_ID = "1lg2tfyzMX99Ib-b5gZ31dGnHHqLHDpElQO22VMVaPbs";
    const API_KEY = "AIzaSyA3Pgj8HMdb4ak9jToAiTQV0XFdmgvoYPI";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data.values?.slice(1) || [];

        const proposal = rows.filter(r => r[0]?.trim().toLowerCase() === "proposal").length;
        const revisiProposal = rows.filter(r => r[0]?.trim().toLowerCase() === "revisi proposal").length;
        const ujianAkhir = rows.filter(r => r[0]?.trim().toLowerCase() === "sidang akhir").length;
        const selesai = rows.filter(r => r[0]?.trim().toLowerCase() === "selesai").length;

        renderChart("tesisChart", "Tesis", [proposal, revisiProposal, ujianAkhir, selesai]);

    } catch (err) {
        console.error("Error fetching Tesis data:", err);
    }
}

// ======================
// Utility: Render Chart
// ======================
function renderChart(canvasId, title, data) {
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (!ctx) return;

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Proposal", "Revisi Proposal", "Ujian Akhir", "Selesai"],
            datasets: [{
                label: title,
                data: data,
                backgroundColor: [
                    "#0d6efd", // biru
                    "#ffc107", // kuning
                    "#20c997", // hijau toska
                    "#fd7e14", // oranye
                ],
                borderRadius: 8,   // bikin batang rounded
                barPercentage: 0.6, // batang lebih ramping
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // biar proporsional di card
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 20,
                        weight: "bold",
                    },
                    color: "#212529",
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    titleFont: { size: 14, weight: "bold" },
                    bodyFont: { size: 13 },
                    padding: 10
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(0,0,0,0.05)" },
                    ticks: {
                        font: { size: 13 },
                        color: "#495057"
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(0,0,0,0.05)" },
                    ticks: {
                        stepSize: 1,
                        font: { size: 13 },
                        color: "#495057"
                    },
                    title: {
                        display: true,
                        text: "Jumlah Mahasiswa",
                        font: { size: 14, weight: "bold" },
                        color: "#212529",
                        padding: { top: 10 }
                    }
                }
            }
        }
    });
}