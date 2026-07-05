const ADMIN_PASSWORD = "bra$ov4";

function resetFiltersObject() {
    if (currentCategory === 'muzica' && window.resetMuzicaFiltersObject) {
        window.resetMuzicaFiltersObject();
        return;
    }
    activeFilters = { tip: "Toate", status: "Toate", an: "Toate", text1: "", text2: "" };
}

function switchCategory(cat) {
    currentCategory = cat;
    
    ['filme', 'muzica', 'carti'].forEach(c => {
        const btn = document.getElementById(`btn-${c}`);
        if (c === cat) {
            btn.className = "px-5 py-2 rounded-lg text-sm font-bold uppercase transition whitespace-nowrap bg-blue-600 text-white shadow-md";
        } else {
            btn.className = "px-5 py-2 rounded-lg text-sm font-bold uppercase transition whitespace-nowrap bg-gray-750 text-gray-400 hover:bg-gray-700";
        }
    });

    currentSortKey = (cat === 'muzica') ? 'autor' : 'titlu';
    currentSortOrder = 'asc';

    resetFiltersObject();
    buildFiltersUI();
    buildTableHeaderUI();
    renderTable();
}

function getUniqueYearsFromDB() {
    const aniSet = new Set();
    database.filme.forEach(f => {
        if (f.an && f.an !== "-") {
            aniSet.add(f.an.trim());
        }
    });
    return Array.from(aniSet).sort((a, b) => b - a); 
}

function buildFiltersUI() {
    if (currentCategory === 'muzica' && window.buildMuzicaFiltersUI) {
        window.buildMuzicaFiltersUI();
        return;
    }

    const container = document.getElementById('filters-container');
    container.innerHTML = '';

    if (currentCategory === 'filme') {
        const aniUnici = getUniqueYearsFromDB();
        let anOptionsHtml = '<option value="Toate">Toate</option>';
        aniUnici.forEach(an => { anOptionsHtml += `<option value="${an}">${an}</option>`; });

        container.innerHTML = `
            <div class="flex flex-col shrink-0 min-w-[130px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Conținut</label>
                <select id="filter-tip" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="Toate">Toate</option>
                    <option value="Film">Film</option>
                    <option value="Serial">Serial</option>
                </select>
            </div>
            <div class="flex flex-col shrink-0 min-w-[140px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status vizionare</label>
                <select id="filter-status" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="Toate">Toate</option>
                    <option value="Vizionat">Vizionat</option>
                    <option value="De vizionat">De vizionat</option>
                    <option value="In asteptare">In asteptare</option>
                </select>
            </div>
            <div class="flex flex-col shrink-0 min-w-[110px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">An lansare</label>
                <select id="filter-an" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    ${anOptionsHtml}
                </select>
            </div>
            <div class="flex flex-col flex-1 min-w-[180px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Actor</label>
                <input type="text" id="filter-text1" placeholder="Scrie actor..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col flex-1 min-w-[180px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Titlu</label>
                <input type="text" id="filter-text2" placeholder="Scrie titlu..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="flex flex-col shrink-0 min-w-[140px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Format</label>
                <select id="filter-tip" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="Toate">Toate</option>
                    <option value="Tiparit">Tiparit</option>
                    <option value="Electronic">Electronic</option>
                </select>
            </div>
            <div class="flex flex-col flex-1 min-w-[200px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Autor/Artist</label>
                <input type="text" id="filter-text1" placeholder="Scrie autor..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col flex-1 min-w-[200px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Titlu</label>
                <input type="text" id="filter-text2" placeholder="Scrie titlu..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
        `;
    }

    if (document.getElementById('filter-tip')) document.getElementById('filter-tip').value = activeFilters.tip || "Toate";
    if (document.getElementById('filter-status')) document.getElementById('filter-status').value = activeFilters.status || "Toate";
    if (document.getElementById('filter-an')) document.getElementById('filter-an').value = activeFilters.an || "Toate";
    if (document.getElementById('filter-text1')) document.getElementById('filter-text1').value = activeFilters.text1 || "";
    if (document.getElementById('filter-text2')) document.getElementById('filter-text2').value = activeFilters.text2 || "";
}

function getSortIndicator(key) {
    if (currentSortKey !== key) return '<span class="text-gray-600 ml-1 text-[10px]">▲▼</span>';
    return currentSortOrder === 'asc' ? '<span class="text-blue-400 ml-1">▲</span>' : '<span class="text-blue-400 ml-1">▼</span>';
}

function buildTableHeaderUI() {
    if (currentCategory === 'muzica' && window.buildMuzicaTableHeaderUI) {
        window.buildMuzicaTableHeaderUI();
        return;
    }

    const headerRow = document.getElementById('table-header-row');
    let actionsHtml = isAdmin ? `<th class="p-3 text-center w-24">Acțiuni</th>` : '';
    
    if (currentCategory === 'filme') {
        headerRow.innerHTML = `
            <th class="p-3 sortable" onclick="handleHeaderSort('titlu')">TITLUL ORIGINAL ${getSortIndicator('titlu')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('actori')">DISTRIBUȚIA (ACTORI) ${getSortIndicator('actori')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('regizor')">REGIZOR ${getSortIndicator('regizor')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('gen')">GEN ${getSortIndicator('gen')}</th>
            <th class="p-3 sortable w-24" onclick="handleHeaderSort('durata')">DURATA ${getSortIndicator('durata')}</th>
            <th class="p-3 text-center w-20">IMDB</th>
            <th class="p-3 text-center w-24">CineMagia</th>
            ${actionsHtml}
        `;
    } else {
        headerRow.innerHTML = `
            <th class="p-3 sortable" onclick="handleHeaderSort('autor')">Autor/Artist ${getSortIndicator('autor')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('titlu')">Titlu ${getSortIndicator('titlu')}</th>
            <th class="p-3 w-24">Tip</th>
            <th class="p-3">Detalii / Domeniu</th>
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
    event.preventDefault();
    if (currentCategory === 'muzica' && window.handleMuzicaSearch) {
        window.handleMuzicaSearch();
        return;
    }
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
    if (currentCategory === 'muzica' && window.renderMuzicaTable) {
        window.renderMuzicaTable();
        return;
    }

    const tbody = document.getElementById('data-tbody');
    tbody.innerHTML = '';

    let list = [...(database[currentCategory] || [])];
    
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

        if (currentCategory === 'filme') {
            const hasImdb = item.imdb && item.imdb.trim() !== "" && item.imdb !== "-" && item.imdb.toLowerCase().startsWith('http');
            const imdbBtnClass = hasImdb ? 'imdb-btn-active' : 'imdb-btn-inactive';
            const imdbAttr = hasImdb ? `href="${item.imdb}" target="_blank"` : `onclick="alert('Fără link IMDB valid.')"`;

            const hasCineMagia = item.cinemagia && item.cinemagia.trim() !== "" && item.cinemagia !== "-" && item.cinemagia.toLowerCase().startsWith('http');
            const cmBtnClass = hasCineMagia ? 'imdb-btn-active' : 'imdb-btn-inactive';
            const cmAttr = hasCineMagia ? `href="${item.cinemagia}" target="_blank"` : `onclick="alert('Fără link CineMagia valid.')"`;

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
                <td class="p-3 text-center">
                    <a ${cmAttr} class="${cmBtnClass} px-2 py-0.5 rounded text-[10px] font-extrabold tracking-tight inline-flex items-center gap-1 transition shadow-sm cursor-pointer">
                        <i class="fa-solid fa-film text-sm"></i> CineMagia
                    </a>
                </td>
                ${actionTd}
            `;
        } else {
            tr.innerHTML = `
                <td class="p-3 font-semibold text-white">${item.autor || '-'}</td>
                <td class="p-3 text-gray-300 font-medium">${item.titlu}</td>
                <td class="p-3 text-xs">${item.tip || '-'}</td>
                <td class="p-3 text-xs text-gray-400">${item.gen || ''}</td>
                ${actionTd}
            `;
        }

        tbody.appendChild(tr);
    });

    document.getElementById('item-count').textContent = `${filteredList.length} elemente identificate`;
}

function processExcelPaste() {
    if (currentCategory === 'muzica' && window.processMuzicaExcelPaste) {
        window.processMuzicaExcelPaste();
        return;
    }

    const txt = document.getElementById('excel-paste-area').value.trim();
    if (!txt) {
        alert("Caseta este goală! Te rog lipsește datele copiate din Excel.");
        return;
    }

    const tipGlobal = document.getElementById('form-tip').value;
    const statusGlobal = document.getElementById('form-status').value;
    const anGlobal = document.getElementById('form-an').value.trim() || "-";

    const linii = txt.split('\n');
    let elementeAdaugate = 0;

    let maxNum = 0;
    database.filme.forEach(f => {
        if (f.cod && f.cod.startsWith("F25-")) {
            const numPart = parseInt(f.cod.replace("F25-", ""));
            if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
        }
    });

    linii.forEach(linie => {
        if (!linie.trim()) return;
        
        const coloane = linie.split('\t');
        
        let titlu = coloane[0] ? coloane[0].trim() : "";
        if (!titlu) return; 

        let actori = coloane[1] ? coloane[1].trim() : "-";
        let gen = coloane[2] ? coloane[2].trim() : "-";
        let durata = coloane[3] ? coloane[3].trim() : "-";
        let imdb = coloane[4] ? coloane[4].trim() : "-";
        let cinemagia = coloane[5] ? coloane[5].trim() : "-";

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
            cinemagia: cinemagia,
            url_img: ""
        };

        database.filme.push(filmNou);
        elementeAdaugate++;
    });

    if (elementeAdaugate > 0) {
        saveDatabase();
        buildFiltersUI(); 
        renderTable();
        document.getElementById('excel-paste-area').value = ""; 
        closeModal();
        alert(`Succes! S-au vărsat ${elementeAdaugate} elemente.`);
    } else {
        alert("Nu s-a putut procesa nicio linie.");
    }
}

function applyImageGeometry() {
    const wrapper = document.getElementById('image-wrapper');
    if (currentCategory === 'filme') {
        wrapper.style.minWidth = '160px'; wrapper.style.maxWidth = '160px'; wrapper.style.width = '160px'; wrapper.style.height = '225px';
        document.getElementById('form-image-label').textContent = "Afiș (160x225)";
        document.getElementById('modal-category-badge').textContent = "Filme & Seriale";
    } else if (currentCategory === 'muzica') {
        wrapper.style.minWidth = '175px'; wrapper.style.maxWidth = '175px'; wrapper.style.width = '175px'; wrapper.style.height = '175px';
        document.getElementById('form-image-label').textContent = "Copertă (175x175)";
        document.getElementById('modal-category-badge').textContent = "MUZICĂ";
    } else {
        wrapper.style.minWidth = '175px'; wrapper.style.maxWidth = '175px'; wrapper.style.width = '175px'; wrapper.style.height = '175px';
        document.getElementById('form-image-label').textContent = "Copertă (175x175)";
        document.getElementById('modal-category-badge').textContent = "CĂRȚI";
    }
}

function generateFormFieldsHTML() {
    if (currentCategory === 'muzica' && window.generateMuzicaFormFieldsHTML) {
        window.generateMuzicaFormFieldsHTML();
        return;
    }

    const container = document.getElementById('dynamic-form-fields');
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
            <div class="flex flex-col mt-2"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">URL Afiș</label><input type="url" id="form-url-img" oninput="updateImagePreview(this.value)" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Link URL IMDB</label><input type="url" id="form-imdb" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Link URL CineMagia</label><input type="url" id="form-cinemagia" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cod Element *</label><input type="text" id="form-cod" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Format</label><input type="text" id="form-tip" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            </div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Autor / Artist *</label><input type="text" id="form-autor" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlu *</label><input type="text" id="form-titlu" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gen / Domeniu</label><input type="text" id="form-gen" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">URL Copertă</label><input type="url" id="form-url-img" oninput="updateImagePreview(this.value)" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        `;
    }
}

function toggleAdminMode() {
    if (!isAdmin) {
        document.getElementById('password-modal').classList.remove('hidden');
        document.getElementById('password-input').value = '';
        setTimeout(() => document.getElementById('password-input').focus(), 100);
    } else {
        isAdmin = false;
        setAdminUI(false);
        buildTableHeaderUI();
        renderTable();
    }
}

function closePasswordModal() {
    document.getElementById('password-modal').classList.add('hidden');
    document.getElementById('password-input').value = '';
}

function verifyAdminPassword() {
    const pass = document.getElementById('password-input').value;
    if (pass === ADMIN_PASSWORD) {
        isAdmin = true;
        setAdminUI(true);
        closePasswordModal();
        buildTableHeaderUI();
        renderTable();
    } else {
        alert("Parolă incorectă!");
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').focus();
    }
}

function setAdminUI(enabled) {
    const toggleBtn = document.getElementById('admin-toggle-btn');
    const addBtn = document.getElementById('add-new-btn');
    const badge = document.getElementById('admin-badge');

    if (enabled) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket mr-1.5"></i> Blocare date';
        toggleBtn.className = "px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-red-950/30 whitespace-nowrap";
        addBtn.classList.remove('hidden');
        badge.classList.remove('hidden');
    } else {
        toggleBtn.innerHTML = '<i class="fa-solid fa-lock-open mr-1.5"></i> Actualizare date';
        toggleBtn.className = "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-950/30 whitespace-nowrap";
        addBtn.classList.add('hidden');
        badge.classList.add('hidden');
        closeModal();
    }
}

function openModal(mode, index = null) {
    if (!isAdmin) return;
    generateFormFieldsHTML();
    applyImageGeometry();
    
    const modal = document.getElementById('crud-modal');
    const deleteBtn = document.getElementById('form-delete-btn');
    const importZone = document.getElementById('excel-import-zone');
    
    modal.classList.remove('hidden');
    
    if (mode === 'add') {
        document.getElementById('form-edit-index').value = "";
        deleteBtn.classList.add('hidden');
        
        if (currentCategory === 'filme') {
            const codInput = document.getElementById('form-cod');
            if (codInput) {
                codInput.disabled = false;
                codInput.classList.remove('opacity-50', 'cursor-not-allowed');
                let maxNum = 0;
                database.filme.forEach(f => {
                    if (f.cod && f.cod.startsWith("F25-")) {
                        const numPart = parseInt(f.cod.replace("F25-", ""));
                        if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
                    }
                });
                codInput.value = "F25-" + String(maxNum + 1).padStart(3, '0');
            }
            if (importZone) importZone.classList.remove('hidden');
        }
        resetFormFields(false);
    } else if (mode === 'edit' && index !== null) {
        document.getElementById('form-edit-index').value = index;
        deleteBtn.classList.remove('hidden');
        if (importZone) importZone.classList.add('hidden'); 
        
        const codInput = document.getElementById('form-cod');
        if (codInput) {
            codInput.disabled = true;
            codInput.classList.add('opacity-50', 'cursor-not-allowed');
        }
        fillFormValues(index);
    }

    if (currentCategory === 'muzica' && window.onMuzicaModalOpen) {
        window.onMuzicaModalOpen(mode, index);
    }
}

function closeModal() { 
    document.getElementById('crud-modal').classList.add('hidden'); 
}

function updateImagePreview(url) {
    const icon = document.getElementById('image-placeholder-icon');
    const text = document.getElementById('image-placeholder-text');
    const img = document.getElementById('image-preview-element');
    if (url && url.trim() !== "" && url.toLowerCase().startsWith('http')) {
        let cleanUrl = url.trim();
        let proxyUrl = "https://images.weserv.nl/?url=" + encodeURIComponent(cleanUrl.replace(/^https?:\/\//i, ''));
        
        img.src = proxyUrl; 
        img.classList.remove('hidden'); 
        icon.classList.add('hidden'); 
        text.classList.add('hidden');
    } else {
        img.src = ""; 
        img.classList.add('hidden'); 
        icon.classList.remove('hidden'); 
        text.classList.remove('hidden');
    }
}

function fillFormValues(index) {
    if (currentCategory === 'muzica' && window.fillMuzicaFormValues) {
        window.fillMuzicaFormValues(index);
        return;
    }

    const item = database[currentCategory][index];
    document.getElementById('form-cod').value = item.cod || '';
    document.getElementById('form-titlu').value = item.titlu || '';
    document.getElementById('form-tip').value = item.tip || '';
    if(document.getElementById('form-gen')) document.getElementById('form-gen').value = item.gen || '';
    if(document.getElementById('form-an')) document.getElementById('form-an').value = item.an || '';
    if(document.getElementById('form-url-img')) {
        document.getElementById('form-url-img').value = item.url_img || '';
        updateImagePreview(item.url_img);
    }

    if (currentCategory === 'filme') {
        document.getElementById('form-status').value = item.status || 'De vizionat';
        document.getElementById('form-regizor').value = item.regizor || '';
        document.getElementById('form-durata').value = item.durata || '';
        document.getElementById('form-actori').value = item.actori || '';
        document.getElementById('form-imdb').value = item.imdb || '';
        document.getElementById('form-cinemagia').value = item.cinemagia || '';
    } else {
        if(document.getElementById('form-autor')) document.getElementById('form-autor').value = item.autor || '';
    }
}

function saveElement(event) {
    event.preventDefault();
    if (!isAdmin) return;

    if (currentCategory === 'muzica' && window.saveMuzicaElement) {
        window.saveMuzicaElement(event);
        return;
    }

    const idxStr = document.getElementById('form-edit-index').value;
    const cod = document.getElementById('form-cod').value.trim();
    const titlu = document.getElementById('form-titlu').value.trim();
    const tip = document.getElementById('form-tip').value;
    const gen = document.getElementById('form-gen') ? document.getElementById('form-gen').value.trim() : '';
    const url_img = document.getElementById('form-url-img') ? document.getElementById('form-url-img').value.trim() : '';

    let item = { cod, titlu, tip, gen, url_img };

    if (currentCategory === 'filme') {
        item.status = document.getElementById('form-status').value;
        item.an = document.getElementById('form-an').value.trim();
        item.regizor = document.getElementById('form-regizor').value.trim();
        item.durata = document.getElementById('form-durata').value.trim();
        item.actori = document.getElementById('form-actori').value.trim();
        item.imdb = document.getElementById('form-imdb').value.trim();
        item.cinemagia = document.getElementById('form-cinemagia').value.trim();
    } else {
        item.autor = document.getElementById('form-autor').value.trim();
    }

    if (idxStr === "") {
        if (database[currentCategory].some(x => x.cod.toLowerCase() === cod.toLowerCase())) {
            alert("Atenție! Acest Cod Element există deja în catalog."); return;
        }
        database[currentCategory].push(item);
    } else {
        database[currentCategory][parseInt(idxStr)] = item;
    }

    saveDatabase();
    buildFiltersUI();
    closeModal();
    renderTable();
}

function deleteCurrentElement() {
    if (!isAdmin) return;
    const idxStr = document.getElementById('form-edit-index').value;
    if (idxStr !== "") {
        if (confirm("Sigur doriți să ștergeți definitiv acest element?")) {
            database[currentCategory].splice(parseInt(idxStr), 1);
            saveDatabase();
            buildFiltersUI();
            closeModal();
            renderTable();
        }
    }
}

function resetFormFields(clearCod = true) {
    const idx = document.getElementById('form-edit-index').value;
    const oldCod = document.getElementById('form-cod').value;
    document.getElementById('crud-form').reset();
    document.getElementById('form-edit-index').value = idx;
    
    const codInput = document.getElementById('form-cod');
    if (codInput && !clearCod) {
        codInput.value = oldCod;
    }
    updateImagePreview("");
}
