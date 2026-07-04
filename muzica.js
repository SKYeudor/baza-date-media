// ==========================================
// CONFIGURĂRI ȘI OPȚIUNI SPECIFICE MUZICĂ
// ==========================================
const FORMA_EDITARE_OPTIONS = ["Album", "Single", "Maxi-single", "EP (Extended Play)", "Compilație", "Best of", "Greatest Hits", "Soundtrack", "Tribute Album", "Remix Album", "Demo"];
const TIP_SUPORT_OPTIONS = ["Vinyl", "CD", "DVD", "Blu-ray", "Casetă", "MP3"];
const TIP_INREGISTRARE_OPTIONS = ["Studio", "Live", "Concert", "Radio Session", "Remaster", "Remix"];

if (!database.muzica) {
    database.muzica = [];
}

function getUniqueYearsFromMuzicaDB() {
    const aniSet = new Set();
    (database.muzica || []).forEach(m => {
        if (m.an && m.an !== "-") {
            aniSet.add(m.an.trim());
        }
    });
    return Array.from(aniSet).sort((a, b) => b - a);
}

window.buildMuzicaFiltersUI = function() {
    const container = document.getElementById('filters-container');
    const aniUnici = getUniqueYearsFromMuzicaDB();
    
    let anOptionsHtml = '<option value="Toate">Toate</option>';
    aniUnici.forEach(an => { anOptionsHtml += `<option value="${an}">${an}</option>`; });

    let formaOptionsHtml = '<option value="Toate">Toate</option>';
    FORMA_EDITARE_OPTIONS.forEach(f => { formaOptionsHtml += `<option value="${f}">${f}</option>`; });

    let suportOptionsHtml = '<option value="Toate">Toate</option>';
    TIP_SUPORT_OPTIONS.forEach(s => { suportOptionsHtml += `<option value="${s}">${s}</option>'; });

    let inregistrareOptionsHtml = '<option value="Toate">Toate</option>';
    TIP_INREGISTRARE_OPTIONS.forEach(i => { inregistrareOptionsHtml += `<option value="${i}">${i}</option>`; });

    container.innerHTML = `
        <div class="flex flex-col shrink-0 min-w-[140px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Forma de editare</label>
            <select id="filter-forma" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                ${formaOptionsHtml}
            </select>
        </div>
        <div class="flex flex-col shrink-0 min-w-[120px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip suport</label>
            <select id="filter-suport" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                ${suportOptionsHtml}
            </select>
        </div>
        <div class="flex flex-col shrink-0 min-w-[130px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip înregistrare</label>
            <select id="filter-inregistrare" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                ${inregistrareOptionsHtml}
            </select>
        </div>
        <div class="flex flex-col shrink-0 min-w-[100px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">An lansare</label>
            <select id="filter-an" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                ${anOptionsHtml}
            </select>
        </div>
        <div class="flex flex-col flex-1 min-w-[160px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Artist / Grup</label>
            <input type="text" id="filter-text1" placeholder="Caută artist..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
        </div>
        <div class="flex flex-col flex-1 min-w-[160px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlul</label>
            <input type="text" id="filter-text2" placeholder="Caută titlu..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
        </div>
    `;

    if (document.getElementById('filter-forma')) document.getElementById('filter-forma').value = activeFilters.forma || "Toate";
    if (document.getElementById('filter-suport')) document.getElementById('filter-suport').value = activeFilters.suport || "Toate";
    if (document.getElementById('filter-inregistrare')) document.getElementById('filter-inregistrare').value = activeFilters.inregistrare || "Toate";
    if (document.getElementById('filter-an')) document.getElementById('filter-an').value = activeFilters.an || "Toate";
    if (document.getElementById('filter-text1')) document.getElementById('filter-text1').value = activeFilters.text1 || "";
    if (document.getElementById('filter-text2')) document.getElementById('filter-text2').value = activeFilters.text2 || "";
};

window.handleMuzicaSearch = function() {
    activeFilters.forma = document.getElementById('filter-forma').value;
    activeFilters.suport = document.getElementById('filter-suport').value;
    activeFilters.inregistrare = document.getElementById('filter-inregistrare').value;
    activeFilters.an = document.getElementById('filter-an').value;
    activeFilters.text1 = document.getElementById('filter-text1').value.trim().toLowerCase();
    activeFilters.text2 = document.getElementById('filter-text2').value.trim().toLowerCase();
    renderTable();
};

window.resetMuzicaFiltersObject = function() {
    activeFilters = { forma: "Toate", suport: "Toate", inregistrare: "Toate", an: "Toate", text1: "", text2: "" };
};

// ==========================================
// [A] CAP DE TABEL FĂRĂ COLOANA COD
// ==========================================
window.buildMuzicaTableHeaderUI = function() {
    const headerRow = document.getElementById('table-header-row');
    let actionsHtml = isAdmin ? `<th class="p-3 text-center w-24">Acțiuni</th>` : '';
    
    headerRow.innerHTML = `
        <th class="p-3 sortable" onclick="handleHeaderSort('autor')">Artist / Grup ${getSortIndicator('autor')}</th>
        <th class="p-3 sortable" onclick="handleHeaderSort('titlu')">Titlul ${getSortIndicator('titlu')}</th>
        <th class="p-3 sortable" onclick="handleHeaderSort('gen')">Gen muzical ${getSortIndicator('gen')}</th>
        <th class="p-3 sortable" onclick="handleHeaderSort('observatii')">Observații ${getSortIndicator('observatii')}</th>
        ${actionsHtml}
    `;
};

// ==========================================
// [A] REZULTATE CAUTARE (CELE 4 COLOANE SOLICITATE)
// ==========================================
window.renderMuzicaTable = function() {
    const tbody = document.getElementById('data-tbody');
    tbody.innerHTML = '';

    let list = [...(database.muzica || [])];
    
    let filteredList = list.filter((item) => {
        if (activeFilters.forma && activeFilters.forma !== "Toate" && item.forma_editare !== activeFilters.forma) return false;
        if (activeFilters.suport && activeFilters.suport !== "Toate" && item.tip_suport !== activeFilters.suport) return false;
        if (activeFilters.inregistrare && activeFilters.inregistrare !== "Toate" && item.tip_inregistrare !== activeFilters.inregistrare) return false;
        if (activeFilters.an && activeFilters.an !== "Toate" && item.an !== activeFilters.an) return false;
        
        if (activeFilters.text1 && (!item.autor || !item.autor.toLowerCase().includes(activeFilters.text1))) return false;
        if (activeFilters.text2 && (!item.titlu || !item.titlu.toLowerCase().includes(activeFilters.text2))) return false;
        
        return true;
    });

    filteredList.sort((a, b) => {
        let valA = a[currentSortKey] ? a[currentSortKey].toString().trim() : "";
        let valB = b[currentSortKey] ? b[currentSortKey].toString().trim() : "";
        return currentSortOrder === 'asc' 
            ? valA.localeCompare(valB, 'ro', { sensitivity: 'base' })
            : valB.localeCompare(valA, 'ro', { sensitivity: 'base' });
    });

    filteredList.forEach((item) => {
        const originalIndex = database.muzica.findIndex(x => x.cod === item.cod);
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-750/40 transition border-b border-gray-700/40 align-middle";

        let actionTd = isAdmin ? `
            <td class="p-3 text-center space-x-1 whitespace-nowrap">
                <button onclick="openModal('edit', ${originalIndex})" class="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition" title="Modifică"><i class="fa-solid fa-pen-to-square"></i></button>
            </td>
        ` : '';

        tr.innerHTML = `
            <td class="p-3 font-semibold text-white">${item.autor || '-'}</td>
            <td class="p-3 text-gray-300 font-medium">${item.titlu || '-'}</td>
            <td class="p-3 text-xs text-gray-400">${item.gen || '-'}</td>
            <td class="p-3 text-xs text-gray-400 italic">${item.observatii || '-'}</td>
            ${actionTd}
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('item-count').textContent = `${filteredList.length} elemente identificate`;
};

// ==========================================
// [A] & [B] REPOZIȚIONARE ȘI DENUMIRI COMPLETE CURATE
// ==========================================
window.generateMuzicaFormFieldsHTML = function() {
    const container = document.getElementById('dynamic-form-fields');
    
    let formaOptions = "";
    FORMA_EDITARE_OPTIONS.forEach(f => { formaOptions += `<option value="${f}">${f}</option>`; });
    
    let suportOptions = "";
    TIP_SUPORT_OPTIONS.forEach(s => { suportOptions += `<option value="${s}">${s}</option>`; });
    
    let inregistrareOptions = "";
    TIP_INREGISTRARE_OPTIONS.forEach(i => { inregistrareOptions += `<option value="${i}">${i}</option>`; });

    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Artist / Grup *</label><input type="text" id="form-autor" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlul *</label><input type="text" id="form-titlu" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Forma de editare</label><select id="form-forma" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">${formaOptions}</select></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip suport</label><select id="form-suport" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">${suportOptions}</select></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip înregistrare</label><select id="form-inregistrare" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">${inregistrareOptions}</select></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">An lansare</label><input type="text" id="form-an" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gen muzical</label><input type="text" id="form-gen" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Extras din</label><input type="text" id="form-extras" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        </div>
        <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Observații</label><input type="text" id="form-observatii" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">URL Copertă</label><input type="url" id="form-url-img" oninput="updateImagePreview(this.value)" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        
        <div class="pt-2">
            <div class="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 select-none">TRACK LIST</div>
            <textarea id="form-tracklist" rows="4" placeholder="1. Nume Piesă&#10;2. Altă Piesă" class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-300 font-mono focus:outline-none focus:border-blue-500"></textarea>
        </div>

        <div id="muzica-import-container" class="pt-4 border-t border-gray-700/50 mt-4 hidden">
            <div class="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 select-none">IMPORT DATE</div>
            <textarea id="excel-paste-area" rows="4" placeholder="Artist/Grup || Titlul || Forma de editare || Tip suport || Tip inregistrare || An lansare || Gen muzical || Extras din || Observatii" class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-300 font-mono focus:outline-none focus:border-blue-500 placeholder-gray-600"></textarea>
            <div class="mt-2 text-right">
                <button type="button" onclick="processMuzicaExcelPaste()" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-md cursor-pointer">
                    Execută vărsarea datelor muzicale
                </button>
            </div>
        </div>
    `;
};

window.fillMuzicaFormValues = function(index) {
    const item = database.muzica[index];
    document.getElementById('form-autor').value = item.autor || '';
    document.getElementById('form-titlu').value = item.titlu || '';
    document.getElementById('form-forma').value = item.forma_editare || 'Album';
    document.getElementById('form-suport').value = item.tip_suport || 'CD';
    document.getElementById('form-inregistrare').value = item.tip_inregistrare || 'Studio';
    document.getElementById('form-an').value = item.an || '';
    document.getElementById('form-gen').value = item.gen || '';
    document.getElementById('form-extras').value = item.extras_din || '';
    document.getElementById('form-observatii').value = item.observatii || '';
    document.getElementById('form-url-img').value = item.url_img || '';
    
    setTimeout(() => {
        if(document.getElementById('form-tracklist')) {
            document.getElementById('form-tracklist').value = item.tracklist || '';
        }
    }, 50);

    if (item.url_img) updateImagePreview(item.url_img);
};

window.saveMuzicaElement = function(event) {
    const idxStr = document.getElementById('form-edit-index').value;
    
    const autor = document.getElementById('form-autor').value.trim();
    const titlu = document.getElementById('form-titlu').value.trim();
    const forma_editare = document.getElementById('form-forma').value;
    const tip_suport = document.getElementById('form-suport').value;
    const tip_inregistrare = document.getElementById('form-inregistrare').value;
    const an = document.getElementById('form-an').value.trim() || "-";
    const gen = document.getElementById('form-gen').value.trim() || "-";
    const extras_din = document.getElementById('form-extras').value.trim();
    const observatii = document.getElementById('form-observatii').value.trim();
    const url_img = document.getElementById('form-url-img').value.trim();
    const tracklist = document.getElementById('form-tracklist').value.trim();

    let item = { autor, titlu, forma_editare, tip_suport, tip_inregistrare, an, gen, extras_din, observatii, url_img, tracklist };

    if (idxStr === "") {
        let maxNum = 0;
        database.muzica.forEach(m => {
            if (m.cod && m.cod.startsWith("M26-")) {
                const numPart = parseInt(m.cod.replace("M26-", ""));
                if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
            }
        });
        item.cod = "M26-" + String(maxNum + 1).padStart(3, '0');
        database.muzica.push(item);
    } else {
        const idx = parseInt(idxStr);
        item.cod = database.muzica[idx].cod; 
        database.muzica[idx] = item;
    }

    localStorage.setItem('biblioteca_media_db', JSON.stringify(database));
    buildFiltersUI();
    closeModal();
    renderTable();
};

// Controlul vizibilității casetei de import doar în regimul de Adăugare ("add")
window.onMuzicaModalOpen = function(mode, index) {
    const generalImportZone = document.getElementById('excel-import-zone');
    if (generalImportZone) generalImportZone.classList.add('hidden');

    const muzicaImportContainer = document.getElementById('muzica-import-container');
    if (!muzicaImportContainer) return;

    if (mode === 'add') {
        muzicaImportContainer.classList.remove('hidden');
    } else {
        muzicaImportContainer.classList.add('hidden');
    }
};

window.processMuzicaExcelPaste = function() {
    const txt = document.getElementById('excel-paste-area').value.trim();
    if (!txt) {
        alert("Caseta este goală!");
        return;
    }

    const linii = txt.split('\n');
    let elementeAdaugate = 0;

    let maxNum = 0;
    database.muzica.forEach(m => {
        if (m.cod && m.cod.startsWith("M26-")) {
            const numPart = parseInt(m.cod.replace("M26-", ""));
            if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
        }
    });

    linii.forEach(linie => {
        if (!linie.trim()) return;
        const col = linie.split('\t');
        
        let autor = col[0] ? col[0].trim() : "";
        let titlu = col[1] ? col[1].trim() : "";
        if (!autor || !titlu) return; 

        maxNum++;
        let newElement = {
            cod: "M26-" + String(maxNum).padStart(3, '0'),
            autor: autor,
            titlu: titlu,
            forma_editare: col[2] ? col[2].trim() : "Album",
            tip_suport: col[3] ? col[3].trim() : "CD",
            tip_inregistrare: col[4] ? col[4].trim() : "Studio",
            an: col[5] ? col[5].trim() : "-",
            gen: col[6] ? col[6].trim() : "-",
            extras_din: col[7] ? col[7].trim() : "",
            observatii: col[8] ? col[8].trim() : "",
            url_img: "",
            tracklist: ""
        };

        database.muzica.push(newElement);
        elementeAdaugate++;
    });

    if (elementeAdaugate > 0) {
        localStorage.setItem('biblioteca_media_db', JSON.stringify(database));
        buildFiltersUI();
        renderTable();
        closeModal();
        alert(`Succes! S-au importat corect ${elementeAdaugate} înregistrări muzicale.`);
    } else {
        alert("Formatul rândurilor nu corespunde structurii Excel cerute.");
    }
};
