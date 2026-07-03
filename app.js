// ==========================================
// CONFIGURĂRI GLOBALE ȘI STĂRI APLICAȚIE
// ==========================================
const ADMIN_PASSWORD = "bra$ov4";
let isAdmin = false; 
let currentCategory = 'filme';
let activeFilters = {};
let currentImportMode = 'xlsx'; 

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
        console.error("Sistem: Eroare la parsarea bazei de date existente.", e);
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
// MANAGEMENT MODURI DE IMPORT (TAB-URI VIZIBILE)
// ==========================================
function switchImportMode(mode) {
    currentImportMode = mode;
    const btnXlsx = document.getElementById('import-mode-xlsx');
    const btnTxt = document.getElementById('import-mode-txt');
    const txtArea = document.getElementById('excel-paste-area');
    const infoText = document.getElementById('import-instructions-text');

    if (!btnXlsx || !btnTxt || !txtArea || !infoText) return;

    if (mode === 'xlsx') {
        btnXlsx.className = "px-4 py-2 text-xs font-bold uppercase rounded-lg bg-blue-600 text-white shadow-md transition-all cursor-pointer";
        btnTxt.className = "px-4 py-2 text-xs font-bold uppercase rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer";
        txtArea.placeholder = "Lipește rândurile copiate din Excel aici (Titlu [Tab] Actori [Tab] Gen...)....";
        infoText.innerHTML = `<i class="fa-solid fa-circle-info text-blue-400 mr-1"></i> Sistemul va asocia automat datele din tabel cu <strong>Tipul</strong> selectat în caseta de mai sus.`;
    } else {
        btnTxt.className = "px-4 py-2 text-xs font-bold uppercase rounded-lg bg-blue-600 text-white shadow-md transition-all cursor-pointer";
        btnXlsx.className = "px-4 py-2 text-xs font-bold uppercase rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer";
        txtArea.placeholder = "Lipește structura arborescentă text (Tree) generată din foldere aici...";
        infoText.innerHTML = `<i class="fa-solid fa-folder-tree text-amber-400 mr-1"></i> Mod inteligent arborescent detectat. Sistemul va citi folderele (ex: <em>Live Albums</em> devine automat Tip: <strong>Live Album</strong>, <em>Studio Albums</em> devine Tip: <strong>Studio Album</strong>) și va extrage separat Anul și Titlul.`;
    }
    txtArea.value = "";
    txtArea.focus();
}

function executeSelectedImport() {
    if (currentImportMode === 'xlsx') {
        processExcelPaste();
    } else {
        processTreeTxtPaste();
    }
}

// ==========================================
// IMPORT DATE TIP ARBORE (TREE TXT)
// ==========================================
function processTreeTxtPaste() {
    const pasteArea = document.getElementById('excel-paste-area');
    if (!pasteArea) return;
    
    const txt = pasteArea.value;
    if (!txt.trim()) {
        alert("Caseta este goală! Vă rugăm să lipiți structura text.");
        return;
    }

    const artistFormular = document.getElementById('form-autor') ? document.getElementById('form-autor').value.trim() : "";
    const artistImplicit = artistFormular || "Deep Purple";

    const linii = txt.split('\n');
    let elementeAdaugate = 0;
    let tipCurentDetectat = "Studio Album"; 

    let prefix = currentCategory === 'muzica' ? 'M26-' : (currentCategory === 'carti' ? 'C26-' : 'F25-');
    let maxNum = 0;
    if (database && Array.isArray(database[currentCategory])) {
        database[currentCategory].forEach(item => {
            if (item.cod && item.cod.startsWith(prefix)) {
                const numPart = parseInt(item.cod.replace(prefix, ""));
                if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
            }
        });
    }

    linii.forEach(linie => {
        let curatata = linie.trim();
        if (!curatata) return;

        if (curatata.toLowerCase().includes('live albums')) {
            tipCurentDetectat = "Live Album";
            return;
        }
        if (curatata.toLowerCase().includes('studio albums')) {
            tipCurentDetectat = "Studio Album";
            return;
        }

        curatata = curatata.replace(/[|+\\\-]/g, '').trim();

        const regexAn = /^\[(\d{4})\](.*)$/;
        const match = curatata.match(regexAn);

        if (match) {
            const an = match[1].trim();
            const titlu = match[2].trim();

            if (titlu) {
                maxNum++;
                let noulCod = prefix + String(maxNum).padStart(3, '0');

                let obiectNou = {
                    cod: noulCod,
                    titlu: titlu,
                    tip: tipCurentDetectat,
                    gen: "-",
                    url_img: "",
                    observatii: `An lansare: ${an}`
                };

                if (currentCategory === 'muzica' || currentCategory === 'carti') {
                    obiectNou.autor = artistImplicit;
                } else {
                    obiectNou.status = "De vizionat";
                    obiectNou.an = an;
                    obiectNou.regizor = "-";
                    obiectNou.durata = "-";
                    obiectNou.actori = "-";
                    obiectNou.imdb = "-";
                }

                database[currentCategory].push(obiectNou);
                elementeAdaugate++;
            }
        }
    });

    if (elementeAdaugate > 0) {
        localStorage.setItem('biblioteca_media_db', JSON.stringify(database));
        buildFiltersUI(); 
        renderTable();
        pasteArea.value = ""; 
        closeModal();
        alert(`Import realizat cu succes! S-au adăugat ${elementeAdaugate} albume pentru artistul "${artistImplicit}".`);
    } else {
        alert("Format nerecunoscut! Asigurați-vă că textul conține linii de tipul: [An] Titlu Album.");
    }
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

    currentSortKey = 'titlu';
    currentSortOrder = 'asc';

    resetFiltersObject();
    buildFiltersUI();
    buildTableHeaderUI();
    renderTable();
}

function getUniqueYearsFromDB() {
    const aniSet = new Set();
    if (database && Array.isArray(database.filme)) {
        database.filme.forEach(f => {
            if (f.an && f.an !== "-" && f.an.toString().trim() !== "") {
                aniSet.add(f.an.toString().trim());
            }
        });
    }
    return Array.from(aniSet).sort((a, b) => b - a); 
}

function buildFiltersUI() {
    const container = document.getElementById('filters-container');
    if (!container) return;
    container.innerHTML = '';

    if (currentCategory === 'filme') {
        const aniUnici = getUniqueYearsFromDB();
        let anOptionsHtml = '<option value="Toate">Toate</option>';
        aniUnici.forEach(an => {
            anOptionsHtml += `<option value="${an}">${an}</option>`;
        });

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
    } else {
        container.innerHTML = `
            <div class="flex flex-col shrink-0 min-w-[140px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Format</label>
                <select id="filter-tip" onchange="handleSearch()" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="Toate">Toate</option>
                    <option value="Album">Album</option>
                    <option value="Live Album">Live Album</option>
                    <option value="Studio Album">Studio Album</option>
                    <option value="Single">Single</option>
                    <option value="Tiparit">Tiparit</option>
                    <option value="Electronic">Electronic</option>
                </select>
            </div>
            <div class="flex flex-col flex-1 min-w-[200px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Autor/Artist</label>
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
    } else {
        headerRow.innerHTML = `
            <th class="p-3 w-20">Cod</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('autor')">Autor/Artist ${getSortIndicator('autor')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('titlu')">Titlu ${getSortIndicator('titlu')}</th>
            <th class="p-3 w-32">Tip</th>
            <th class="p-3">Detalii / Domeniu</th>
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
    if (document.getElementById('filter-text2')) activeFilters.text2 = document.getElementById('filter-text2').value.trim().toLowerCase();
    
    renderTable();
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
            if (activeFilters.an && activeFilters.an !== "Toate" && item.an !== activeFilters.an) return false;
        }
        
        if (activeFilters.text1) {
            if (currentCategory === 'filme') {
                const actori = item.actori ? item.actori.toLowerCase() : "";
                if (!actori.includes(activeFilters.text1)) return false;
            } else {
                const autor = item.autor ? item.autor.toLowerCase() : "";
                if (!autor.includes(activeFilters.text1)) return false;
            }
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

        if (currentSortKey === 'durata') {
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
        } else {
            tr.innerHTML = `
                <td class="p-3 font-mono text-xs text-blue-400 font-bold">${item.cod || ''}</td>
                <td class="p-3 font-semibold text-white">${item.autor || '-'}</td>
                <td class="p-3 text-gray-300 font-medium">${item.titlu}</td>
                <td class="p-3 text-xs text-blue-300 font-semibold">${item.tip || '-'}</td>
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
// IMPORT CLASIC DATE EXCEL (TAB-SEPARATED)
// ==========================================
function processExcelPaste() {
    const pasteArea = document.getElementById('excel-paste-area');
    if (!pasteArea) return;
    
    const txt = pasteArea.value.trim();
    if (!txt) {
        alert("Caseta este goală! Vă rugăm să lipiți datele copiate din Excel.");
        return;
    }

    const tipGlobal = document.getElementById('form-tip') ? document.getElementById('form-tip').value : "Film";
    const statusGlobal = document.getElementById('form-status') ? document.getElementById('form-status').value : "De vizionat";
    const anGlobal = (document.getElementById('form-an') && document.getElementById('form-an').value.trim()) || "-";

    const linii = txt.split('\n');
    let elementeAdaugate = 0;

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

        let filmNou = {
            cod: noulCod,
            titlu: titlu,
            tip: tipGlobal,
            status: statusGlobal,
            gen: gen,
            an: anGlobal,
            regizor: "-", 
            durata: durata,
            actori: actori,
            imdb: imdb,
            url_img: "",
            observatii: "-"
        };

        database.filme.push(filmNou);
        elementeAdaugate++;
    });

    if (elementeAdaugate > 0) {
        localStorage.setItem('biblioteca_media_db', JSON.stringify(database));
        buildFiltersUI(); 
        renderTable();
        pasteArea.value = ""; 
        closeModal();
        alert(`Succes! S-au importat ${elementeAdaugate} elemente.`);
    }
}

// ==========================================
// MANAGEMENT DINAMIC FORMULAR & MODALE (CRUD)
// ==========================================
function toggleAdminMode() {
    if (!isAdmin) {
        const pModal = document.getElementById('password-modal');
        const pInput = document.getElementById('password-input');
        if (pModal) pModal.classList.remove('hidden');
        if (pInput) {
            pInput.value = '';
            pInput.focus();
        }
    } else {
        isAdmin = false;
        setAdminUI(false);
        buildTableHeaderUI();
        renderTable();
    }
}

function closePasswordModal() {
    const pModal = document.getElementById('password-modal');
    if (pModal) pModal.classList.add('hidden');
}

function verifyAdminPassword() {
    const pInput = document.getElementById('password-input');
    if (!pInput) return;
    const pass = pInput.value;
    if (pass === ADMIN_PASSWORD) {
        isAdmin = true;
        setAdminUI(true);
        closePasswordModal();
        buildTableHeaderUI();
        renderTable();
    } else {
        alert("Parolă incorectă!");
        pInput.value = '';
        pInput.focus();
    }
}

function applyImageGeometry() {
    const wrapper = document.getElementById('image-wrapper');
    if (!wrapper) return;
    
    if (currentCategory === 'filme') {
        wrapper.style.minWidth = '160px'; wrapper.style.maxWidth = '160px'; wrapper.style.width = '160px'; wrapper.style.height = '225px';
        if (document.getElementById('form-image-label')) document.getElementById('form-image-label').textContent = "Afiș (160x225)";
        if (document.getElementById('modal-category-badge')) document.getElementById('modal-category-badge').textContent = "Filme & Seriale";
    } else {
        wrapper.style.minWidth = '175px'; wrapper.style.maxWidth = '175px'; wrapper.style.width = '175px'; wrapper.style.height = '175px';
        if (document.getElementById('form-image-label')) document.getElementById('form-image-label').textContent = "Copertă (175x175)";
        if (document.getElementById('modal-category-badge')) document.getElementById('modal-category-badge').textContent = "Media";
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
    } else {
        container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cod Element *</label><input type="text" id="form-cod" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Format (Album, Single, etc.)</label><input type="text" id="form-tip" placeholder="Ex: Album Studio" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            </div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Autor / Artist *</label><input type="text" id="form-autor" required placeholder="Ex: Deep Purple" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlu *</label><input type="text" id="form-titlu" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gen / Domeniu</label><input type="text" id="form-gen" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">URL Copertă</label><input type="url" id="form-url-img" oninput="updateImagePreview(this.value)" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Observații</label><input type="text" id="form-observatii" placeholder="Adaugă observații..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        `;
    }
}

function setAdminUI(enabled) {
    const toggleBtn = document.getElementById('admin-toggle-btn');
    const addBtn = document.getElementById('add-new-btn');
    const badge = document.getElementById('admin-badge');

    if (enabled) {
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket mr-1.5"></i> Blocare date';
            toggleBtn.className = "px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-red-950/30 whitespace-nowrap cursor-pointer";
        }
        if (addBtn) addBtn.classList.remove('hidden');
        if (badge) badge.classList.remove('hidden');
    } else {
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fa-solid fa-lock-open mr-1.5"></i> Actualizare date';
            toggleBtn.className = "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-950/30 whitespace-nowrap cursor-pointer";
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
    switchImportMode('xlsx'); 
    
    const modal = document.getElementById('crud-modal');
    const deleteBtn = document.getElementById('form-delete-btn');
    const codInput = document.getElementById('form-cod');
    const importZone = document.getElementById('excel-import-zone');
    
    if (modal) modal.classList.remove('hidden');
    
    if (mode === 'add') {
        if (document.getElementById('form-edit-index')) document.getElementById('form-edit-index').value = "";
        if (deleteBtn) deleteBtn.classList.add('hidden');
        if (importZone) importZone.classList.remove('hidden');
        if (codInput) {
            codInput.disabled = false;
            codInput.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        
        let prefix = currentCategory === 'filme' ? 'F25-' : (currentCategory === 'muzica' ? 'M26-' : 'C26-');
        let maxNum = 0;
        if (database && Array.isArray(database[currentCategory])) {
            database[currentCategory].forEach(item => {
                if (item.cod && item.cod.startsWith(prefix)) {
                    const numPart = parseInt(item.cod.replace(prefix, ""));
                    if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
                }
            });
        }
        if (codInput) codInput.value = prefix + String(maxNum + 1).padStart(3, '0');
        
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
    if (document.getElementById('form-url-img')) {
        document.getElementById('form-url-img').value = item.url_img || '';
        updateImagePreview(item.url_img);
    }
    if (document.getElementById('form-observatii')) document.getElementById('form-observatii').value = item.observatii || '';

    if (currentCategory === 'filme') {
        if (document.getElementById('form-status')) document.getElementById('form-status').value = item.status || 'De vizionat';
        if (document.getElementById('form-an')) document.getElementById('form-an').value = item.an || '';
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

    let item = { cod, titlu, tip, gen, url_img, observatii };

    if (currentCategory === 'filme') {
        item.status = document.getElementById('form-status') ? document.getElementById('form-status').value : 'De vizionat';
        item.an = document.getElementById('form-an') ? document.getElementById('form-an').value.trim() : '';
        item.regizor = document.getElementById('form-regizor') ? document.getElementById('form-regizor').value.trim() : '';
        item.durata = document.getElementById('form-durata') ? document.getElementById('form-durata').value.trim() : '';
        item.actori = document.getElementById('form-actori') ? document.getElementById('form-actori').value.trim() : '';
        item.imdb = document.getElementById('form-imdb') ? document.getElementById('form-imdb').value.trim() : '';
    } else {
        item.autor = document.getElementById('form-autor') ? document.getElementById('form-autor').value.trim() : '';
    }

    if (!database[currentCategory]) database[currentCategory] = [];

    if (idxStr === "") {
        if (database[currentCategory].some(x => x.cod && x.cod.toLowerCase() === cod.toLowerCase())) {
            alert("Atenție! Acest Cod Element există deja."); return;
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
// INIȚIALIZARE APLICAȚIE
// ==========================================
resetFiltersObject();
switchCategory('filme');
