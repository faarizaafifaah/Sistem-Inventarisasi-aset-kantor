
/* ==========================================
   PT. ZEEA - SISTEM INVENTARIS ASET
   Koneksi langsung ke Supabase
   ========================================== */

const SUPABASE_URL = "https://trozhgvjemrghfxudheq.supabase.co";
const SUPABASE_KEY = "sb_publishable_hvuj6-ywD1hJtEd1RNfquw_yVmH_5tB";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let assets = [];
let categories = [];
let disposals = [];
let currentForm = "";

const $ = (id) => document.getElementById(id);

function notify(message, isError = false) {
    const notice = $("notice");
    notice.textContent = message;
    notice.classList.toggle("error", isError);
    notice.hidden = false;
    window.setTimeout(() => { notice.hidden = true; }, 5000);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
    })[char]);
}

function formatDate(value) {
    if (!value) return "-";
    return new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

function formatMoney(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", maximumFractionDigits: 0
    }).format(Number(value || 0));
}

function endOfUsefulLife(asset) {
    const date = new Date(asset.tanggal_perolehan + "T00:00:00");
    date.setFullYear(date.getFullYear() + Number(asset.masa_manfaat_tahun || 5));
    return date;
}

function conditionBadge(condition) {
    const styles = {
        Baik: "badge",
        Rusak: "badge warning",
        Disposal: "badge danger"
    };
    return `<span class="${styles[condition] || "badge neutral"}">${escapeHTML(condition)}</span>`;
}

function emptyRow(columns, message = "Belum ada data.") {
    return `<tr><td colspan="${columns}" class="empty">${message}</td></tr>`;
}

async function loadData() {
    if (SUPABASE_URL === "ISI_PROJECT_URL" || SUPABASE_KEY === "ISI_ANON_KEY") {
        notify("Isi URL dan anon/publishable key Supabase terlebih dahulu.", true);
        return;
    }

    try {
        const results = await Promise.all([
            db.from("aset").select("*, kategori(nama_kategori)").order("created_at", { ascending: false }),
            db.from("kategori").select("*").order("nama_kategori"),
            db.from("disposal").select("*, aset(kode_aset, nama_aset)").order("tanggal_disposal", { ascending: false }),
            db.from("riwayat_kondisi").select("*").order("tanggal_laporan", { ascending: false })
        ]);

        for (const result of results) {
            if (result.error) throw result.error;
        }

        [assets, categories, disposals] = [
            results[0].data || [],
            results[1].data || [],
            results[2].data || []
        ];

        renderAll();
    } catch (error) {
        console.error(error);
        notify("Gagal memuat data Supabase: " + (error.message || "Periksa koneksi dan kebijakan database."), true);
    }
}

function renderAll() {
    renderDashboard();
    renderAssets();
    renderDisposals();
    renderDamaged();
    renderCategories();
}

function renderDashboard() {
    $("total-aset").textContent = assets.length;
    $("total-baik").textContent = assets.filter(a => a.kondisi === "Baik").length;
    $("total-rusak").textContent = assets.filter(a => a.kondisi === "Rusak").length;
    $("total-disposal").textContent = assets.filter(a => a.kondisi === "Disposal").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiring = assets
        .filter(a => a.kondisi !== "Disposal")
        .map(a => ({ ...a, endDate: endOfUsefulLife(a) }))
        .filter(a => (a.endDate - today) / 86400000 <= 180)
        .sort((a, b) => a.endDate - b.endDate);

    $("expiry-table").innerHTML = expiring.length ? expiring.map(a => {
        const days = Math.ceil((a.endDate - today) / 86400000);
        const status = days < 0
            ? '<span class="badge danger">Terlewati</span>'
            : '<span class="badge warning">Segera berakhir</span>';
        return `<tr>
            <td>${escapeHTML(a.kode_aset)}</td>
            <td>${escapeHTML(a.nama_aset)}</td>
            <td>${formatDate(a.endDate.toISOString().slice(0, 10))}</td>
            <td>${status}</td>
        </tr>`;
    }).join("") : emptyRow(4, "Tidak ada aset yang mendekati akhir masa manfaat dalam 180 hari.");
}

function renderAssets() {
    const rows = assets.filter(a => a.kondisi !== "Disposal");
    $("aset-table").innerHTML = rows.length ? rows.map(a => `<tr>
        <td>${escapeHTML(a.kode_aset)}</td>
        <td><strong>${escapeHTML(a.nama_aset)}</strong></td>
        <td>${escapeHTML(a.kategori?.nama_kategori || "-")}</td>
        <td>${escapeHTML(a.lokasi || "-")}</td>
        <td>${formatDate(a.tanggal_perolehan)}</td>
        <td>${escapeHTML(a.masa_manfaat_tahun)} tahun</td>
        <td>${conditionBadge(a.kondisi)}</td>
        <td>${a.kondisi === "Baik"
            ? `<button class="action-button" data-damage="${a.id}">Laporkan Rusak</button>`
            : `<span class="badge warning">Perlu tindakan</span>`}</td>
    </tr>`).join("") : emptyRow(8);

    document.querySelectorAll("[data-damage]").forEach(button => {
        button.addEventListener("click", () => openForm("rusak", { aset_id: button.dataset.damage }));
    });
}

function renderDisposals() {
    $("disposal-table").innerHTML = disposals.length ? disposals.map(d => `<tr>
        <td>${escapeHTML(d.aset?.kode_aset || "-")}</td>
        <td>${escapeHTML(d.aset?.nama_aset || "-")}</td>
        <td>${formatDate(d.tanggal_disposal)}</td>
        <td>${escapeHTML(d.alasan)}</td>
        <td>${formatMoney(d.nilai_disposal)}</td>
    </tr>`).join("") : emptyRow(5);
}

function renderDamaged() {
    const damaged = assets.filter(a => a.kondisi === "Rusak");
    $("rusak-table").innerHTML = damaged.length ? damaged.map(a => `<tr>
        <td>${escapeHTML(a.kode_aset)}</td>
        <td>${escapeHTML(a.nama_aset)}</td>
        <td>${escapeHTML(a.lokasi || "-")}</td>
        <td>${formatDate(a.tanggal_perolehan)}</td>
        <td>${escapeHTML(a.keterangan || "-")}</td>
    </tr>`).join("") : emptyRow(5);
}

function renderCategories() {
    $("kategori-list").innerHTML = categories.length ? categories.map((c, index) => {
        const count = assets.filter(a => a.kategori_id === c.id && a.kondisi !== "Disposal").length;
        const icons = ["▣", "▤", "▰", "✿", "◇", "▧"];
        return `<article class="category-card">
            <div class="category-icon">${icons[index % icons.length]}</div>
            <h3>${escapeHTML(c.nama_kategori)}</h3>
            <p>${escapeHTML(c.deskripsi || "Tidak ada deskripsi.")}</p>
            <small>${count} aset terdaftar</small>
        </article>`;
    }).join("") : '<div class="panel">Belum ada kategori.</div>';
}

function field(name, label, type = "text", options = {}) {
    const full = options.full ? "full" : "";
    const required = options.required === false ? "" : "required";
    let control = "";

    if (type === "select") {
        control = `<select name="${name}" ${required}>
            <option value="">Pilih ${label.toLowerCase()}</option>
            ${(options.options || []).map(o => `<option value="${escapeHTML(o.value)}">${escapeHTML(o.label)}</option>`).join("")}
        </select>`;
    } else if (type === "textarea") {
        control = `<textarea name="${name}" placeholder="${label}" ${required}></textarea>`;
    } else {
        control = `<input name="${name}" type="${type}" ${required}
            ${options.min !== undefined ? `min="${options.min}"` : ""}
            ${options.step ? `step="${options.step}"` : ""}
            ${options.value !== undefined ? `value="${escapeHTML(options.value)}"` : ""}
            placeholder="${label}">`;
    }

    return `<div class="field ${full}"><label>${label}</label>${control}</div>`;
}

function assetOptions() {
    return assets
        .filter(a => a.kondisi !== "Disposal")
        .map(a => ({ value: a.id, label: `${a.kode_aset} — ${a.nama_aset}` }));
}

function openForm(type, preset = {}) {
    currentForm = type;
    const form = $("form-fields");
    const today = new Date().toISOString().slice(0, 10);
    let html = "";
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.nama_kategori }));

    if (type === "aset") {
        $("form-title").textContent = "Tambah Aset";
        html = field("kode_aset", "Kode Aset") +
            field("nama_aset", "Nama Aset") +
            field("kategori_id", "Kategori", "select", { options: categoryOptions }) +
            field("lokasi", "Lokasi") +
            field("tanggal_perolehan", "Tanggal Perolehan", "date", { value: today }) +
            field("harga_perolehan", "Harga Perolehan (Rp)", "number", { min: 0, step: "1000", value: 0 }) +
            field("masa_manfaat_tahun", "Masa Manfaat (tahun)", "number", { min: 1, value: 5 }) +
            field("keterangan", "Keterangan", "textarea", { full: true, required: false });
    } else if (type === "kategori") {
        $("form-title").textContent = "Tambah Kategori";
        html = field("nama_kategori", "Nama Kategori") +
            field("deskripsi", "Deskripsi", "textarea", { full: true, required: false });
    } else if (type === "disposal") {
        $("form-title").textContent = "Catat Disposal";
        html = field("aset_id", "Pilih Aset", "select", { options: assetOptions() }) +
            field("tanggal_disposal", "Tanggal Disposal", "date", { value: today }) +
            field("nilai_disposal", "Nilai Disposal (Rp)", "number", { min: 0, step: "1000", value: 0 }) +
            field("alasan", "Alasan Disposal", "textarea", { full: true });
    } else if (type === "rusak") {
        $("form-title").textContent = "Laporkan Aset Rusak";
        html = field("aset_id", "Pilih Aset", "select", {
            options: assetOptions().filter(o => !preset.aset_id || String(o.value) === String(preset.aset_id))
        }) +
            field("tanggal_laporan", "Tanggal Laporan", "date", { value: today }) +
            field("keterangan", "Keterangan Kerusakan", "textarea", { full: true });
    }

    form.innerHTML = html;
    if (preset.aset_id) {
        const select = form.querySelector('[name="aset_id"]');
        if (select) select.value = preset.aset_id;
    }
    $("form-dialog").showModal();
}

async function submitForm(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const button = event.currentTarget.querySelector('[type="submit"]');
    button.disabled = true;

    try {
        if (currentForm === "aset") {
            data.kategori_id = Number(data.kategori_id);
            data.harga_perolehan = Number(data.harga_perolehan || 0);
            data.masa_manfaat_tahun = Number(data.masa_manfaat_tahun || 5);
            data.kondisi = "Baik";
            const { error } = await db.from("aset").insert(data);
            if (error) throw error;
        } else if (currentForm === "kategori") {
            const { error } = await db.from("kategori").insert(data);
            if (error) throw error;
        } else if (currentForm === "disposal") {
            const asetId = Number(data.aset_id);
            const disposal = {
                aset_id: asetId,
                tanggal_disposal: data.tanggal_disposal,
                alasan: data.alasan,
                nilai_disposal: Number(data.nilai_disposal || 0)
            };
            const { error: insertError } = await db.from("disposal").insert(disposal);
            if (insertError) throw insertError;

            const { error: updateError } = await db.from("aset")
                .update({ kondisi: "Disposal" }).eq("id", asetId);
            if (updateError) throw updateError;

            await db.from("riwayat_kondisi").insert({
                aset_id: asetId,
                kondisi_baru: "Disposal",
                tanggal_laporan: data.tanggal_disposal,
                keterangan: data.alasan
            });
        } else if (currentForm === "rusak") {
            const asetId = Number(data.aset_id);
            const { error: updateError } = await db.from("aset")
                .update({ kondisi: "Rusak", keterangan: data.keterangan })
                .eq("id", asetId);
            if (updateError) throw updateError;

            const { error: historyError } = await db.from("riwayat_kondisi").insert({
                aset_id: asetId,
                kondisi_baru: "Rusak",
                tanggal_laporan: data.tanggal_laporan,
                keterangan: data.keterangan
            });
            if (historyError) throw historyError;
        }

        $("form-dialog").close();
        $("data-form").reset();
        notify("Data berhasil disimpan.");
        await loadData();
    } catch (error) {
        console.error(error);
        notify("Gagal menyimpan data: " + (error.message || "Periksa data dan koneksi Supabase."), true);
    } finally {
        button.disabled = false;
    }
}

document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav-button").forEach(b => b.classList.remove("active"));
        button.classList.add("active");

        document.querySelectorAll(".page").forEach(page => { page.hidden = true; });
        $(button.dataset.page).hidden = false;

        const titles = {
            dashboard: "Dashboard", aset: "Data Aset",
            disposal: "Disposal", rusak: "Aset Rusak", kategori: "Kategori"
        };
        $("page-title").textContent = titles[button.dataset.page];
    });
});

$("add-aset").addEventListener("click", () => openForm("aset"));
$("add-disposal").addEventListener("click", () => openForm("disposal"));
$("add-rusak").addEventListener("click", () => openForm("rusak"));
$("add-kategori").addEventListener("click", () => openForm("kategori"));
$("data-form").addEventListener("submit", submitForm);
$("close-dialog").addEventListener("click", () => $("form-dialog").close());
$("cancel-form").addEventListener("click", () => $("form-dialog").close());

loadData();
