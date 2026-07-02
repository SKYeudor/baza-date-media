// ==========================================
// CONFIGURĂRI GLOBALE ȘI STĂRI APLICAȚIE
// ==========================================
const ADMIN_PASSWORD = "bra$ov4";
let isAdmin = false; 
let currentCategory = 'filme';
let activeFilters = {};

let currentSortKey = 'titlu';
let currentSortOrder = 'asc'; 

let database = { filme: [], muzica: [], carti: [] };

const storedDb = localStorage.getItem('biblioteca_media_db');
if (storedDb) {
    try {
        const parsed = JSON.parse(storedDb);
        if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed)) {
                database.filme = parsed;
            } else {
                database.filme = Array.isArray(parsed.filme) ? parsed.filme : [];
                database.muzica = Array.isArray(parsed.muzica) ? parsed.muzica : [];
                database.carti = Array.isArray(parsed.carti) ? parsed.carti : [];
            }
        }
    } catch (e) {
        console.error("Sistem: Eroare la parsarea bazei de date. Se aplică structura curată.", e);
    }
}

if (database.filme.length === 0 && database.muzica.length === 0 && database.carti.length === 0) {
    database.filme.push({ 
        cod: "F25-001", 
        titlu: "Exemplu Catalog", 
        tip: "Film", 
        status: "Vizionat", 
        gen: "Drama", 
        an: "2025", 
        regizor: "Regizor Test", 
        durata: "120 min", 
        actori: "Actor Exemplu", 
        imdb: "https://www.imdb.com", 
        url_img: "",
        observatii: "-"
    });
    localStorage.setItem('biblioteca_media_db', JSON.stringify(database));
}

// ==========================================
// FUNCȚII GENERALE ȘI FILTRARE
// ==========================================
function resetFiltersObject() {
    activeFilters = { tip: "Toate", status: "Toate", an: "Toate", text1: "", text2: "" };
}

function switchCategory(cat) {
    currentCategory = cat;
    
    ['filme', 'muzica', 'carti'].forEach(c => {
        const btn = document.getElementById(`btn-${c}`);
        if (btn) {
            if (c === cat) {
                btn.className = "px-5 py-2 rounded-lg text-sm font-bold uppercase transition whitespace-nowrap bg-blue-600 text-white shadow-md";
            } else {
                btn.className = "px-5 py-2 rounded-lg text-sm font-bold uppercase transition whitespace-nowrap bg-gray-750 text-gray-400 hover:bg-gray-700";
            }
        }
    });

    currentSortKey = cat === 'muzica' ? 'autor' : 'titlu';
    currentSortOrder = 'asc';

    resetFiltersObject();
    buildFiltersUI();
    buildTableHeaderUI();
    renderTable();
}

function getUniqueYearsFromDB() {
    const aniSet = new Set();
    if (database && Array.isArray(database[currentCategory])) {
        database[currentCategory].forEach(item => {
            if (item.an && item.an !== "-" && item.an.toString().trim() !== "") {
                aniSet.add(item.an.toString().trim());
            }
        });
    }
    return Array.from(aniSet).sort((a, b) => b - a); 
}

function buildFiltersUI() {
    const container = document.getElementById('filters-container');
    if (!container) return;
    container.innerHTML = '';

    const aniUnici = getUniqueYearsFromDB();
    let anOptionsHtml = '<option value="Toate">Toate</option>';
    aniUnici.forEach(an => {
        anOptionsHtml += `<option value="${an}">${an}</option>`;
    });

    if (currentCategory === 'filme') {
        container.innerHTML = `
            <div class="flex flex-col shrink-0 min-w-[130px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Conținut</label>
                <select id="filter-tip" onchange="handleSearch()" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="Toate">Toate</option>
                    <option value="Film">Film</option>
                    <option value="Serial">Serial</option>
                </select>
            </div>
            <div class="flex flex-col shrink-0 min-w-[140px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status vizionare</label>
                <select id="filter-status" onchange="handleSearch()" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="Toate">Toate</option>
                    <option value="Vizionat">Vizionat</option>
                    <option value="De vizionat">De vizionat</option>
                    <option value="In asteptare">In asteptare</option>
                </select>
            </div>
            <div class="flex flex-col shrink-0 min-w-[110px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">An lansare</label>
                <select id="filter-an" onchange="handleSearch()" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    ${anOptionsHtml}
                </select>
            </div>
            <div class="flex flex-col flex-1 min-w-[180px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Actor</label>
                <input type="text" id="filter-text1" oninput="handleSearch()" placeholder="Scrie actor..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col flex-1 min-w-[180px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Titlu</label>
                <input type="text" id="filter-text2" oninput="handleSearch()" placeholder="Scrie titlu..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
        `;
    } else if (currentCategory === 'muzica') {
        container.innerHTML = `
            <div class="flex flex-col shrink-0 min-w-[140px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Album</label>
                <select id="filter-tip" onchange="handleSearch()" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="Toate">Toate</option>
                    <option value="Album studio">Album studio</option>
                    <option value="Album live">Album live</option>
                    <option value="Single">Single</option>
                    <option value="Compilație">Compilație</option>
                </select>
            </div>
            <div class="flex flex-col shrink-0 min-w-[110px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">An lansare</label>
                <select id="filter-an" onchange="handleSearch()" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    ${anOptionsHtml}
                </select>
            </div>
            <div class="flex flex-col flex-1 min-w-[200px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Artist / Grup</label>
                <input type="text" id="filter-text1" oninput="handleSearch()" placeholder="Scrie artist..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col flex-1 min-w-[200px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Titlu</label>
                <input type="text" id="filter-text2" oninput="handleSearch()" placeholder="Scrie titlu..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
        `;
    } else if (currentCategory === 'carti') {
        container.innerHTML = `
            <div class="flex flex-col shrink-0 min-w-[140px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip format</label>
                <select id="filter-tip" onchange="handleSearch()" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="Toate">Toate</option>
                    <option value="Tipărit">Tipărit</option>
                    <option value="Electronic">Electronic</option>
                </select>
            </div>
            <div class="flex flex-col flex-1 min-w-[200px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Autor</label>
                <input type="text" id="filter-text1" oninput="handleSearch()" placeholder="Scrie autor..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col flex-1 min-w-[200px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Titlu</label>
                <input type="text" id="filter-text2" oninput="handleSearch()" placeholder="Scrie titlu..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
        `;
    }

    if (document.getElementById('filter-tip')) document.getElementById('filter-tip').value = activeFilters.tip || "Toate";
    if (document.getElementById('filter-status')) document.getElementById('filter-status').value = activeFilters.status || "Toate";
    if (document.getElementById('filter-an')) document.getElementById('filter-an').value = activeFilters.an || "Toate";
    if (document.getElementById('filter-text1')) document.getElementById('filter-text1').value = activeFilters.text1 || "";
    if (document.getElementById('filter-text2')) document.getElementById('filter-text2').value = activeFilters.text2 || "";
}

// ==========================================
// LOGICA DE SORTARE ȘI DESENARE TABEL
// ==========================================
function getSortIndicator(key) {
    if (currentSortKey !== key) return '<span class="text-gray-600 ml-1 text-[10px]">▲▼</span>';
    return currentSortOrder === 'asc' ? '<span class="text-blue-400 ml-1">▲</span>' : '<span class="text-blue-400 ml-1">▼</span>';
}

function buildTableHeaderUI() {
    const headerRow = document.getElementById('table-header-row');
    if (!headerRow) return;
    
    let actionsHtml = isAdmin ? `<th class="p-3 text-center w-24">Acțiuni</th>` : '';
    
    if (currentCategory === 'filme') {
        headerRow.innerHTML = `
            <th class="p-3 sortable" onclick="handleHeaderSort('titlu')">TITLUL ORIGINAL ${getSortIndicator('titlu')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('actori')">DISTRIBUȚIA (ACTORI) ${getSortIndicator('actori')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('regizor')">REGIZOR ${getSortIndicator('regizor')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('gen')">GEN ${getSortIndicator('gen')}</th>
            <th class="p-3 sortable w-24" onclick="handleHeaderSort('durata')">DURATA ${getSortIndicator('durata')}</th>
            <th class="p-3 text-center w-20">IMDB</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('observatii')">OBSERVAȚII ${getSortIndicator('observatii')}</th>
            ${actionsHtml}
        `;
    } else if (currentCategory === 'muzica') {
        headerRow.innerHTML = `
            <th class="p-3 sortable" onclick="handleHeaderSort('autor')">Artist / Trupă ${getSortIndicator('autor')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('titlu')">Titlu Album / Melodie ${getSortIndicator('titlu')}</th>
            <th class="p-3 sortable w-24" onclick="handleHeaderSort('an')">An Lansare ${getSortIndicator('an')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('gen')">Gen Muzical ${getSortIndicator('gen')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('observatii')">Observații ${getSortIndicator('observatii')}</th>
            <th class="p-3 text-center w-24">Copertă</th>
            ${actionsHtml}
        `;
    } else {
        headerRow.innerHTML = `
            <th class="p-3 w-20">Cod</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('autor')">Autor ${getSortIndicator('autor')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('titlu')">Titlu ${getSortIndicator('titlu')}</th>
            <th class="p-3 w-24">Tip</th>
            <th class="p-3">Domeniu</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('observatii')">Observații ${getSortIndicator('observatii')}</th>
            ${actionsHtml}
        `;
    }
}

function handleHeaderSort(key) {
    if (currentSortKey === key) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortKey = key;
        currentSortOrder = 'asc';
    }
    buildTableHeaderUI();
    renderTable();
}

function handleSearch(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    
    if (document.getElementById('filter-tip')) activeFilters.tip = document.getElementById('filter-tip').value;
    if (document.getElementById('filter-status')) activeFilters.status = document.getElementById('filter-status').value;
    if (document.getElementById('filter-an')) activeFilters.an = document.getElementById('filter-an').value;
    if (document.getElementById('filter-text1')) activeFilters.text1 = document.getElementById('filter-text1').value.trim().toLowerCase();
    if (document.getElementById('filter-text2')) acceptSearchInput2();
    
    renderTable();
}

function acceptSearchInput2() {
    if (document.getElementById('filter-text2')) {
        activeFilters.text2 = document.getElementById('filter-text2').value.trim().toLowerCase();
    }
}

function resetCriteria() {
    resetFiltersObject();
    buildFiltersUI();
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('data-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let list = [];
    if (database && Array.isArray(database[currentCategory])) {
        list = [...database[currentCategory]];
    }
    
    let filteredList = list.filter((item) => {
        if (activeFilters.tip && activeFilters.tip !== "Toate" && item.tip !== activeFilters.tip) return false;
        
        if (currentCategory === 'filme') {
            if (activeFilters.status && activeFilters.status !== "Toate" && item.status !== activeFilters.status) return false;
        }
        
        if (currentCategory === 'filme' || currentCategory === 'muzica') {
            if (activeFilters.an && activeFilters.an !== "Toate" && item.an !== activeFilters.an) return false;
        }
        
        if (activeFilters.text1) {
            const fieldText = item.autor ? item.autor.toLowerCase() : (item.actori ? item.actori.toLowerCase() : "");
            if (!fieldText.includes(activeFilters.text1)) return false;
        }

        if (activeFilters.text2) {
            const titlu = item.titlu ? item.titlu.toLowerCase() : "";
            if (!titlu.includes(activeFilters.text2)) return false;
        }
        return true;
    });

    filteredList.sort((a, b) => {
        let valA = a[currentSortKey] ? a[currentSortKey].toString().trim() : "";
        let valB = b[currentSortKey] ? b[currentSortKey].toString().trim() : "";

        if (currentSortKey === 'durata' || currentSortKey === 'an') {
            let numA = parseInt(valA) || 0;
            let numB = parseInt(valB) || 0;
            return currentSortOrder === 'asc' ? numA - numB : numB - numA;
        }

        return currentSortOrder === 'asc' 
            ? valA.localeCompare(valB, 'ro', { sensitivity: 'base' })
            : valB.localeCompare(valA, 'ro', { sensitivity: 'base' });
    });

    filteredList.forEach((item) => {
        const originalIndex = database[currentCategory].findIndex(x => x.cod === item.cod);
        
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-750/40 transition border-b border-gray-700/40 align-middle";

        let actionTd = isAdmin ? `
            <td class="p-3 text-center space-x-1 whitespace-nowrap">
                <button onclick="openModal('edit', ${originalIndex})" class="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition" title="Modifică"><i class="fa-solid fa-pen-to-square"></i></button>
            </td>
        ` : '';

        const obsAfisat = item.observatii || "-";

        if (currentCategory === 'filme') {
            const hasImdb = item.imdb && item.imdb.trim() !== "" && item.imdb !== "-" && item.imdb.toLowerCase().startsWith('http');
            const imdbBtnClass = hasImdb ? 'imdb-btn-active' : 'imdb-btn-inactive';
            const imdbAttr = hasImdb ? `href="${item.imdb}" target="_blank"` : `onclick="alert('Fără link IMDB valid.')"`;

            tr.innerHTML = `
                <td class="p-3 font-semibold text-white">${item.titlu}</td>
                <td class="p-3 text-xs text-gray-400 italic">${item.actori || '-'}</td>
                <td class="p-3 text-xs text-gray-400">${item.regizor || '-'}</td>
                <td class="p-3 text-xs text-gray-400">${item.gen || '-'}</td>
                <td class="p-3 text-xs text-gray-400 font-mono">${item.durata || '-'}</td>
                <td class="p-3 text-center">
                    <a ${imdbAttr} class="${imdbBtnClass} px-2 py-0.5 rounded text-[10px] font-extrabold tracking-tight inline-flex items-center gap-1 transition shadow-sm cursor-pointer">
                        <i class="fa-brands fa-imdb text-sm"></i> IMDB
                    </a>
                </td>
                <td class="p-3 text-xs text-gray-400 max-w-xs truncate" title="${obsAfisat}">${obsAfisat}</td>
                ${actionTd}
            `;
        } else if (currentCategory === 'muzica') {
            const hasImg = item.url_img && item.url_img.trim() !== "" && item.url_img !== "-" && item.url_img.toLowerCase().startsWith('http');
            let imgHtml = '<span class="text-xs text-gray-600">Fără imagine</span>';
            if (hasImg) {
                let proxyUrl = "https://images.weserv.nl/?url=" + encodeURIComponent(item.url_img.trim().replace(/^https?:\/\//i, ''));
                imgHtml = `<img src="${proxyUrl}" class="w-10 h-10 object-cover rounded mx-auto shadow-sm" alt="Copertă">`;
            }

            tr.innerHTML = `
                <td class="p-3 font-semibold text-white">${item.autor || '-'}</td>
                <td class="p-3 text-gray-300 font-medium">${item.titlu || '-'}</td>
                <td class="p-3 text-xs text-gray-400 font-mono">${item.an || '-'}</td>
                <td class="p-3 text-xs text-gray-400">${item.gen || '-'}</td>
                <td class="p-3 text-xs text-gray-400 max-w-xs truncate" title="${obsAfisat}">${obsAfisat}</td>
                <td class="p-2 text-center">${imgHtml}</td>
                ${actionTd}
            `;
        } else {
            tr.innerHTML = `
                <td class="p-3 font-mono text-xs text-blue-400 font-bold">${item.cod || ''}</td>
                <td class="p-3 font-semibold text-white">${item.autor || '-'}</td>
                <td class="p-3 text-gray-300 font-medium">${item.titlu}</td>
                <td class="p-3 text-xs">${item.tip || '-'}</td>
                <td class="p-3 text-xs text-gray-400">${item.gen || ''}</td>
                <td class="p-3 text-xs text-gray-400 max-w-xs truncate" title="${obsAfisat}">${obsAfisat}</td>
                ${actionTd}
            `;
        }

        tbody.appendChild(tr);
    });

    const countEl = document.getElementById('item-count');
    if (countEl) countEl.textContent = `${filteredList.length} elemente identificate`;
}

// ==========================================
// EXPORT / PRELUARE DATE EXCEL
// ==========================================
function processExcelPaste() {
    const pasteArea = document.getElementById('excel-paste-area');
    if (!pasteArea) return;
    
    const txt = pasteArea.value.trim();
    if (!txt) {
        alert("Caseta este goală! Te rog lipsește datele copiate din Excel.");
        return;
    }

    const tipGlobal = document.getElementById('form-tip') ? document.getElementById('form-tip').value : "Album studio";
    const statusGlobal = document.getElementById('form-status') ? document.getElementById('form-status').value : "De vizionat";
    const anGlobal = (document.getElementById('form-an') && document.getElementById('form-an').value.trim()) || "-";

    const linii = txt.split('\n');
    let elementeAdaugate = 0;

    if (currentCategory === 'filme') {
        let maxNum = 0;
        if (database && Array.isArray(database.filme)) {
            database.filme.forEach(f => {
                if (f.cod && f.cod.startsWith("F25-")) {
                    const numPart = parseInt(f.cod.replace("F25-", ""));
                    if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
                }
            });
        }

        linii.forEach(linie => {
            if (!linie.trim()) return;
            const coloane = linie.split('\t');
            let titlu = coloane[0] ? coloane[0].trim() : "";
            if (!titlu) return; 

            let actori = coloane[1] ? coloane[1].trim() : "-";
            let gen = coloane[2] ? coloane[2].trim() : "-";
            let durata = coloane[3] ? coloane[3].trim() : "-";
            let imdb = coloane[4] ? coloane[4].trim() : "-";

            maxNum++;
            let noulCod = "F25-" + String(maxNum).padStart(3, '0');

            database.filme.push({
                cod: noulCod, titlu, tip: tipGlobal, status: statusGlobal, gen, an: anGlobal,
                regizor: "-", durata, actori, imdb, url_img: "", observatii: "-"
            });
            elementeAdaugate++;
        });
    } else if (currentCategory === 'muzica') {
        let maxNum = 0;
        let prefix = "M26-";
        if (database && Array.isArray(database.muzica)) {
            database.muzica.forEach(m => {
                if (m.cod && m.cod.startsWith(prefix)) {
                    const numPart = parseInt(m.cod.replace(prefix, ""));
                    if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
                }
            });
        }

        linii.forEach(linie => {
            if (!linie.trim()) return;
            const coloane = linie.split('\t');
            let artist = coloane[0] ? coloane[0].trim() : "";
            let titlu = coloane[1] ? coloane[1].trim() : "";
            if (!artist && !titlu) return;

            let anLinie = coloane[2] ? coloane[2].trim() : anGlobal;
            let gen = coloane[3] ? coloane[3].trim() : "-";

            maxNum++;
            let noulCod = prefix + String(maxNum).padStart(3, '0');

            database.muzica.push({
                cod: noulCod, autor: artist, titlu: titlu, tip: tipGlobal,
                an: anLinie, gen: gen, url_img: "", observatii: "-"
            });
            elementeAdaugate++;
        });
    }

    if (elementeAdaugate > 0) {
        localStorage.setItem('biblioteca_media_db', JSON.stringify(database));
        buildFiltersUI(); 
        renderTable();
        pasteArea.value = ""; 
        closeModal();
        alert(`Succes! S-au exportat ${elementeAdaugate} elemente noi în baza de date.`);
    } else {
        alert("Nu s-a putut procesa nicio linie validă.");
    }
}

// ==========================================
// MANAGEMENT DINAMIC FORMULAR & MODALE (CRUD)
// ==========================================
function applyImageGeometry() {
    const wrapper = document.getElementById('image-wrapper');
    if (!wrapper) return;
    
    if (currentCategory === 'filme') {
        wrapper.style.minWidth = '160px'; wrapper.style.maxWidth = '160px'; wrapper.style.width = '160px'; wrapper.style.height = '225px';
        if (document.getElementById('form-image-label')) document.getElementById('form-image-label').textContent = "Afiș (160x225)";
        if (document.getElementById('modal-category-badge')) document.getElementById('modal-category-badge').textContent = "Filme & Seriale";
    } else if (currentCategory === 'muzica') {
        wrapper.style.minWidth = '175px'; wrapper.style.maxWidth = '175px'; wrapper.style.width = '175px'; wrapper.style.height = '175px';
        if (document.getElementById('form-image-label')) document.getElementById('form-image-label').textContent = "Copertă (175x175)";
        if (document.getElementById('modal-category-badge')) document.getElementById('modal-category-badge').textContent = "Muzică";
    } else {
        wrapper.style.minWidth = '175px'; wrapper.style.maxWidth = '175px'; wrapper.style.width = '175px'; wrapper.style.height = '175px';
        if (document.getElementById('form-image-label')) document.getElementById('form-image-label').textContent = "Copertă (175x175)";
        if (document.getElementById('modal-category-badge')) document.getElementById('modal-category-badge').textContent = "Cărți";
    }
}

function generateFormFieldsHTML() {
    const container = document.getElementById('dynamic-form-fields');
    if (!container) return;
    
    if (currentCategory === 'filme') {
        container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cod Element *</label><input type="text" id="form-cod" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip</label><select id="form-tip" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"><option value="Film">Film</option><option value="Serial">Serial</option></select></div>
                    <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status *</label><select id="form-status" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"><option value="Vizionat">Vizionat</option><option value="De vizionat">De vizionat</option><option value="In asteptare">In asteptare</option></select></div>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gen film</label><input type="text" id="form-gen" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">An lansare</label><input type="text" id="form-an" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            </div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlu original *</label><input type="text" id="form-titlu" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Regizor</label><input type="text" id="form-regizor" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Durată / Episoade</label><input type="text" id="form-durata" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            </div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">În distribuție (Actori) *</label><input type="text" id="form-actori" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">URL Afiș</label><input type="url" id="form-url-img" oninput="updateImagePreview(this.value)" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Link URL IMDB</label><input type="url" id="form-imdb" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            </div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Observații</label><input type="text" id="form-observatii" placeholder="Adaugă observații..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        `;
    } else if (currentCategory === 'muzica') {
        container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cod Element *</label><input type="text" id="form-cod" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Album</label><select id="form-tip" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"><option value="Album studio">Album studio</option><option value="Album live">Album live</option><option value="Single">Single</option><option value="Compilație">Compilație</option></select></div>
            </div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Artist / Trupă *</label><input type="text" id="form-autor" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlu Album / Melodie *</label><input type="text" id="form-titlu" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">An lansare</label><input type="text" id="form-an" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gen Muzical</label><input type="text" id="form-gen" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            </div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">URL Copertă</label><input type="url" id="form-url-img" oninput="updateImagePreview(this.value)" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Observații</label><input type="text" id="form-observatii" placeholder="Adaugă observații..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        `;
    } else {
        container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cod Element *</label><input type="text" id="form-cod" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip format</label><select id="form-tip" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"><option value="Tipărit">Tipărit</option><option value="Electronic">Electronic</option></select></div>
            </div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Autor *</label><input type="text" id="form-autor" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlu *</label><input type="text" id="form-titlu" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Domeniu</label><input type="text" id="form-gen" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">URL Copertă</label><input type="url" id="form-url-img" oninput="updateImagePreview(this.value)" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Observații</label><input type="text" id="form-observatii" placeholder="Adaugă observații..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        `;
    }
}

function toggleAdminMode() {
    if (!isAdmin) {
        const pass = prompt("Introduceți parola de administrare pentru securizarea datelor:");
        if (pass === null) return;
        
        if (pass === ADMIN_PASSWORD) {
            isAdmin = true;
            setAdminUI(true);
        } else {
            alert("Parolă incorectă!");
        }
    } else {
        isAdmin = false;
        setAdminUI(false);
    }
    buildTableHeaderUI();
    renderTable();
}

function setAdminUI(enabled) {
    const toggleBtn = document.getElementById('admin-toggle-btn');
    const addBtn = document.getElementById('add-new-btn');
    const badge = document.getElementById('admin-badge');

    if (enabled) {
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket mr-1.5"></i> Blocare date';
            toggleBtn.className = "px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-red-950/30 whitespace-nowrap";
        }
        if (addBtn) addBtn.classList.remove('hidden');
        if (badge) badge.classList.remove('hidden');
    } else {
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fa-solid fa-lock-open mr-1.5"></i> Actualizare date';
            toggleBtn.className = "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-950/30 whitespace-nowrap";
        }
        if (addBtn) addBtn.classList.add('hidden');
        if (badge) badge.classList.add('hidden');
        closeModal();
    }
}

function openModal(mode, index = null) {
    if (!isAdmin) return;
    generateFormFieldsHTML();
    applyImageGeometry();
    
    const modal = document.getElementById('crud-modal');
    const deleteBtn = document.getElementById('form-delete-btn');
    const codInput = document.getElementById('form-cod');
    const importZone = document.getElementById('excel-import-zone');
    const excelTitle = document.getElementById('excel-zone-title');
    const excelDesc = document.getElementById('excel-zone-desc');
    
    if (modal) modal.classList.remove('hidden');
    
    if (mode === 'add') {
        if (document.getElementById('form-edit-index')) document.getElementById('form-edit-index').value = "";
        if (deleteBtn) deleteBtn.classList.add('hidden');
        if (codInput) {
            codInput.disabled = false;
            codInput.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        
        if (currentCategory === 'filme') {
            if (importZone) importZone.classList.remove('hidden');
            if (excelTitle) excelTitle.innerHTML = '<i class="fa-solid fa-file-import"></i> Caseta de Export Date Excel (Filme & Seriale)';
            if (excelDesc) excelDesc.innerHTML = 'Sistemul va asocia automat datele importate cu <strong>Tipul</strong>, <strong>Statusul</strong> și <strong>Anul</strong> selectate în casetele de mai sus. (Structură obligatorie: Col. A: Titlu, Col. B: Distribuție, Col. C: Gen, Col. D: Durată, Col. E: IMDB).';
            
            let maxNum = 0;
            if (database && Array.isArray(database.filme)) {
                database.filme.forEach(f => {
                    if (f.cod && f.cod.startsWith("F25-")) {
                        const numPart = parseInt(f.cod.replace("F25-", ""));
                        if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
                    }
                });
            }
            if (codInput) codInput.value = "F25-" + String(maxNum + 1).padStart(3, '0');
        } else if (currentCategory === 'muzica') {
            if (importZone) importZone.classList.remove('hidden');
            if (excelTitle) excelTitle.innerHTML = '<i class="fa-solid fa-file-import"></i> Caseta de Export Date Excel (Muzică)';
            if (excelDesc) excelDesc.innerHTML = 'Sistemul va genera automat codurile. (Structură obligatorie: Col. A: Artist / Trupă, Col. B: Titlu Album / Melodie, Col. C: An Lansare, Col. D: Gen Muzical). Opțiunea selectată la "Tip Album" de mai sus va fi aplicată global.';
            
            let maxNum = 0;
            if (database && Array.isArray(database.muzica)) {
                database.muzica.forEach(m => {
                    if (m.cod && m.cod.startsWith("M26-")) {
                        const numPart = parseInt(m.cod.replace("M26-", ""));
                        if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
                    }
                });
            }
            if (codInput) codInput.value = "M26-" + String(maxNum + 1).padStart(3, '0');
        } else {
            if (importZone) importZone.classList.add('hidden');
            let maxNum = 0;
            if (database && Array.isArray(database.carti)) {
                database.carti.forEach(c => {
                    if (c.cod && c.cod.startsWith("C26-")) {
                        const numPart = parseInt(c.cod.replace("C26-", ""));
                        if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
                    }
                });
            }
            if (codInput) codInput.value = "C26-" + String(maxNum + 1).padStart(3, '0');
        }
        
        resetFormFields(false);
    } else if (mode === 'edit' && index !== null) {
        if (document.getElementById('form-edit-index')) document.getElementById('form-edit-index').value = index;
        if (deleteBtn) deleteBtn.classList.remove('hidden');
        if (importZone) importZone.classList.add('hidden'); 
        if (codInput) {
            codInput.disabled = true;
            codInput.classList.add('opacity-50', 'cursor-not-allowed');
        }
        fillFormValues(index);
    }
}

function closeModal() { 
    const modal = document.getElementById('crud-modal');
    if (modal) modal.classList.add('hidden'); 
}

function updateImagePreview(url) {
    const icon = document.getElementById('image-placeholder-icon');
    const text = document.getElementById('image-placeholder-text');
    const img = document.getElementById('image-preview-element');
    
    if (!img) return;

    if (url && url.trim() !== "" && url.toLowerCase().startsWith('http')) {
        let cleanUrl = url.trim();
        let proxyUrl = "https://images.weserv.nl/?url=" + encodeURIComponent(cleanUrl.replace(/^https?:\/\//i, ''));
        
        img.src = proxyUrl; 
        img.classList.remove('hidden'); 
        if (icon) icon.classList.add('hidden'); 
        if (text) text.classList.add('hidden');
    } else {
        img.src = ""; 
        img.classList.add('hidden'); 
        if (icon) icon.classList.remove('hidden'); 
        if (text) text.classList.remove('hidden');
    }
}

function fillFormValues(index) {
    if (!database[currentCategory] || !database[currentCategory][index]) return;
    const item = database[currentCategory][index];
    
    if (document.getElementById('form-cod')) document.getElementById('form-cod').value = item.cod || '';
    if (document.getElementById('form-titlu')) document.getElementById('form-titlu').value = item.titlu || '';
    if (document.getElementById('form-tip')) document.getElementById('form-tip').value = item.tip || '';
    if (document.getElementById('form-gen')) document.getElementById('form-gen').value = item.gen || '';
    if (document.getElementById('form-an')) document.getElementById('form-an').value = item.an || '';
    if (document.getElementById('form-url-img')) {
        document.getElementById('form-url-img').value = item.url_img || '';
        updateImagePreview(item.url_img);
    }
    if (document.getElementById('form-observatii')) document.getElementById('form-observatii').value = item.observatii || '';

    if (currentCategory === 'filme') {
        if (document.getElementById('form-status')) document.getElementById('form-status').value = item.status || 'De vizionat';
        if (document.getElementById('form-regizor')) document.getElementById('form-regizor').value = item.regizor || '';
        if (document.getElementById('form-durata')) document.getElementById('form-durata').value = item.durata || '';
        if (document.getElementById('form-actori')) document.getElementById('form-actori').value = item.actori || '';
        if (document.getElementById('form-imdb')) document.getElementById('form-imdb').value = item.imdb || '';
    } else {
        if (document.getElementById('form-autor')) document.getElementById('form-autor').value = item.autor || '';
    }
}

function saveElement(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (!isAdmin) return;

    const idxStr = document.getElementById('form-edit-index') ? document.getElementById('form-edit-index').value : "";
    const cod = document.getElementById('form-cod') ? document.getElementById('form-cod').value.trim() : "";
    const titlu = document.getElementById('form-titlu') ? document.getElementById('form-titlu').value.trim() : "";
    const tip = document.getElementById('form-tip') ? document.getElementById('form-tip').value : "";
    const gen = document.getElementById('form-gen') ? document.getElementById('form-gen').value.trim() : '';
    const url_img = document.getElementById('form-url-img') ? document.getElementById('form-url-img').value.trim() : '';
    const observatii = document.getElementById('form-observatii') ? document.getElementById('form-observatii').value.trim() : '-';
    const an = document.getElementById('form-an') ? document.getElementById('form-an').value.trim() : '';

    let item = { cod, titlu, tip, gen, an, url_img, observatii };

    if (currentCategory === 'filme') {
        item.status = document.getElementById('form-status') ? document.getElementById('form-status').value : 'De vizionat';
        item.regizor = document.getElementById('form-regizor') ? document.getElementById('form-regizor').value.trim() : '';
        item.durata = document.getElementById('form-durata') ? document.getElementById('form-durata').value.trim() : '';
        item.actori = document.getElementById('form-actori') ? document.getElementById('form-actori').value.trim() : '';
        item.imdb = document.getElementById('form-imdb') ? document.getElementById('form-imdb').value.trim() : '';
    } else {
        item.autor = document.getElementById('form-autor') ? document.getElementById('form-autor').value.trim() : '';
    }

    if (!database[currentCategory]) {
        database[currentCategory] = [];
    }

    if (idxStr === "") {
        if (database[currentCategory].some(x => x.cod && x.cod.toLowerCase() === cod.toLowerCase())) {
            alert("Atenție! Acest Cod Element există deja în catalog."); return;
        }
        database[currentCategory].push(item);
    } else {
        database[currentCategory][parseInt(idxStr)] = item;
    }

    localStorage.setItem('biblioteca_media_db', JSON.stringify(database));
    buildFiltersUI();
    closeModal();
    renderTable();
}

function deleteCurrentElement() {
    if (!isAdmin) return;
    const idxStr = document.getElementById('form-edit-index') ? document.getElementById('form-edit-index').value : "";
    if (idxStr !== "") {
        if (confirm("Sigur doriți să ștergeți definitiv acest element?")) {
            database[currentCategory].splice(parseInt(idxStr), 1);
            localStorage.setItem('biblioteca_media_db', JSON.stringify(database));
            buildFiltersUI();
            closeModal();
            renderTable();
        }
    }
}

function resetFormFields(clearCod = true) {
    const form = document.getElementById('crud-form');
    if (!form) return;
    
    const idx = document.getElementById('form-edit-index') ? document.getElementById('form-edit-index').value : "";
    const oldCod = document.getElementById('form-cod') ? document.getElementById('form-cod').value : "";
    
    form.reset();
    
    if (document.getElementById('form-edit-index')) document.getElementById('form-edit-index').value = idx;
    if (!clearCod && document.getElementById('form-cod')) {
        document.getElementById('form-cod').value = oldCod;
    }
    updateImagePreview("");
}

// ==========================================
// INIȚIALIZARE EVENIMENTE LA PORNIRE
// ==========================================
resetFiltersObject();
switchCategory('filme');
