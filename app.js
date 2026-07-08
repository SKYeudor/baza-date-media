const ADMIN_PASSWORD = "bra$ov4";

function resetFiltersObject() {
    if (currentCategory === 'muzica' && window.resetMuzicaFiltersObject) {
        window.resetMuzicaFiltersObject();
        return;
    }
    if (currentCategory === 'carti' && window.resetCartiFiltersObject) {
        window.resetCartiFiltersObject();
        return;
    }
    activeFilters = { tip: "Toate", status: "Toate", an: "Toate", text1: "", text2: "", text3: "" };
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
    if (currentCategory === 'carti' && window.buildCartiFiltersUI) {
        window.buildCartiFiltersUI();
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
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după titlu original</label>
                <input type="text" id="filter-text2" placeholder="Scrie titlu original..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col flex-1 min-w-[180px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după titlul RO</label>
                <input type="text" id="filter-text3" placeholder="Scrie titlul RO..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col flex-1 min-w-[180px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Actor</label>
                <input type="text" id="filter-text1" placeholder="Scrie actor..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
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
    if (document.getElementById('filter-text3')) document.getElementById('filter-text3').value = activeFilters.text3 || "";
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
    if (currentCategory === 'carti' && window.buildCartiTableHeaderUI) {
        window.buildCartiTableHeaderUI();
        return;
    }

    const headerRow = document.getElementById('table-header-row');
    
    if (currentCategory === 'filme') {
        headerRow.innerHTML = `
            <th class="p-3 sortable" onclick="handleHeaderSort('titlu')">Titlu original ${getSortIndicator('titlu')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('titlu_ro')">Titlu RO ${getSortIndicator('titlu_ro')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('actori')">Actori ${getSortIndicator('actori')}</th>
            <th class="p-3 sortable w-28" onclick="handleHeaderSort('an')">An lansare ${getSortIndicator('an')}</th>
            <th class="p-3 sortable w-32" onclick="handleHeaderSort('durata')">Durata/Episoade ${getSortIndicator('durata')}</th>
            <th class="p-3 text-center w-32">Vezi detalii</th>
        `;
    } else {
        let actionsHtml = isAdmin ? `<th class="p-3 text-center w-24">Acțiuni</th>` : '';
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
    if (currentCategory === 'carti' && window.handleCartiSearch) {
        window.handleCartiSearch();
        return;
    }
    if (document.getElementById('filter-tip')) activeFilters.tip = document.getElementById('filter-tip').value;
    if (document.getElementById('filter-status')) activeFilters.status = document.getElementById('filter-status').value;
    if (document.getElementById('filter-an')) activeFilters.an = document.getElementById('filter-an').value;
    if (document.getElementById('filter-text1')) activeFilters.text1 = document.getElementById('filter-text1').value.trim().toLowerCase();
    if (document.getElementById('filter-text2')) activeFilters.text2 = document.getElementById('filter-text2').value.trim().toLowerCase();
    if (document.getElementById('filter-text3')) activeFilters.text3 = document.getElementById('filter-text3').value.trim().toLowerCase();
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
    if (currentCategory === 'carti' && window.renderCartiTable) {
        window.renderCartiTable();
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

        if (activeFilters.text3 && currentCategory === 'filme') {
            const titluRo = item.titlu_ro ? item.titlu_ro.toLowerCase() : "";
            if (!titluRo.includes(activeFilters.text3)) return false;
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
            tr.innerHTML = `
                <td class="p-3 font-semibold text-white">${item.titlu}</td>
                <td class="p-3 text-gray-300">${item.titlu_ro || '-'}</td>
                <td class="p-3 text-xs text-gray-400 italic">${item.actori || '-'}</td>
                <td class="p-3 text-xs text-gray-400">${item.an || '-'}</td>
                <td class="p-3 text-xs text-gray-400 font-mono">${item.durata || '-'}</td>
                <td class="p-3 text-center">
                    <button onclick="showDetails(${originalIndex})" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-xs font-bold rounded-lg transition cursor-pointer">
                        <i class="fa-solid fa-eye mr-1"></i> Vezi detalii
                    </button>
                </td>
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
    if (currentCategory === 'carti' && window.processCartiExcelPaste) {
        window.processCartiExcelPaste();
        return;
    }

    const txt = document.getElementById('excel-paste-area').value.trim();
    if (!txt) {
        alert("Caseta este goală! Te rog lipsește datele copiate din Excel.");
        return;
    }

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
        
        let titlu = coloane[4] ? coloane[4].trim() : "";
        if (!titlu) return; 

        maxNum++;
        let filmNou = {
            cod: "F25-" + String(maxNum).padStart(3, '0'),
            tip: coloane[0] ? coloane[0].trim() : "Film",
            status: coloane[1] ? coloane[1].trim() : "De vizionat",
            gen: coloane[2] ? coloane[2].trim() : "-",
            an: coloane[3] ? coloane[3].trim() : "-",
            titlu: titlu,
            titlu_ro: coloane[5] ? coloane[5].trim() : "",
            regizor: coloane[6] ? coloane[6].trim() : "-",
            durata: coloane[7] ? coloane[7].trim() : "-",
            actori: coloane[8] ? coloane[8].trim() : "-",
            observatii: coloane[9] ? coloane[9].trim() : "",
            imdb: "-",
            cinemagia: "-",
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
        wrapper.style.minWidth = '180px'; wrapper.style.maxWidth = '180px'; wrapper.style.width = '180px'; wrapper.style.height = '255px';
        document.getElementById('form-image-label').textContent = "Afiș (180x255)";
        document.getElementById('modal-category-badge').textContent = "Filme & Seriale";
    } else if (currentCategory === 'muzica') {
        wrapper.style.minWidth = '195px'; wrapper.style.maxWidth = '195px'; wrapper.style.width = '195px'; wrapper.style.height = '195px';
        document.getElementById('form-image-label').textContent = "Copertă (195x195)";
        document.getElementById('modal-category-badge').textContent = "MUZICĂ";
    } else {
        wrapper.style.minWidth = '175px'; wrapper.style.maxWidth = '175px'; wrapper.style.width = '175px'; wrapper.style.height = '235px';
        document.getElementById('form-image-label').textContent = "Copertă (175x235)";
        document.getElementById('modal-category-badge').textContent = "CĂRȚI";
    }
}

function generateFormFieldsHTML() {
    if (currentCategory === 'muzica' && window.generateMuzicaFormFieldsHTML) {
        window.generateMuzicaFormFieldsHTML();
        return;
    }
    if (currentCategory === 'carti' && window.generateCartiFormFieldsHTML) {
        window.generateCartiFormFieldsHTML();
        return;
    }

    const container = document.getElementById('dynamic-form-fields');
    if (currentCategory === 'filme') {
        container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip</label><select id="form-tip" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"><option value="Film">Film</option><option value="Serial">Serial</option></select></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status *</label><select id="form-status" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"><option value="Vizionat">Vizionat</option><option value="De vizionat">De vizionat</option><option value="In asteptare">In asteptare</option></select></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gen film</label><input type="text" id="form-gen" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">An lansare</label><input type="text" id="form-an" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            </div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlu original *</label><input type="text" id="form-titlu" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlul RO</label><input type="text" id="form-titlu-ro" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Regizor</label><input type="text" id="form-regizor" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Durată / Episoade</label><input type="text" id="form-durata" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            </div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">În distribuție (Actori) *</label><input type="text" id="form-actori" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Observații</label><input type="text" id="form-observatii" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col mt-2"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">URL Afiș</label><input type="url" id="form-url-img" oninput="updateImagePreview(this.value)" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Link URL IMDB</label><input type="url" id="form-imdb" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
                <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Link URL CineMagia</label><input type="url" id="form-cinemagia" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Format</label><input type="text" id="form-tip" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
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
            if (importZone) {
                importZone.innerHTML = `
                    <details class="bg-gray-900 border border-gray-700 rounded-xl p-3 transition-all">
                        <summary class="text-xs font-bold text-blue-400 uppercase tracking-wider cursor-pointer select-none flex items-center gap-1.5">
                            <i class="fa-solid fa-file-import"></i> IMPORT DATE
                        </summary>
                        <div class="mt-2 space-y-2">
                            <div class="overflow-x-auto rounded-lg border border-gray-700">
                                <table class="w-full text-[10px] text-blue-300 font-mono border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr class="bg-gray-900">
                                            <th class="p-2 border-r border-gray-700">Tip</th>
                                            <th class="p-2 border-r border-gray-700">Status</th>
                                            <th class="p-2 border-r border-gray-700">Gen film</th>
                                            <th class="p-2 border-r border-gray-700">An lansare</th>
                                            <th class="p-2 border-r border-gray-700">Titlu original</th>
                                            <th class="p-2 border-r border-gray-700">Titlu RO</th>
                                            <th class="p-2 border-r border-gray-700">Regizor</th>
                                            <th class="p-2 border-r border-gray-700">Durata/Episoade</th>
                                            <th class="p-2 border-r border-gray-700">In distributie (Actori)</th>
                                            <th class="p-2">Observații</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                            <textarea id="excel-paste-area" rows="3" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 font-mono focus:outline-none focus:border-blue-500"></textarea>
                            <div class="text-right">
                                <button type="button" onclick="processExcelPaste()" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-md">Importă datele</button>
                            </div>
                        </div>
                    </details>
                `;
                importZone.classList.remove('hidden');
            }
        } else if (currentCategory === 'muzica') {
            if (importZone) {
                importZone.innerHTML = `
                    <details class="bg-gray-900 border border-gray-700 rounded-xl p-3 transition-all">
                        <summary class="text-xs font-bold text-blue-400 uppercase tracking-wider cursor-pointer select-none flex items-center gap-1.5">
                            <i class="fa-solid fa-file-import"></i> IMPORT DATE
                        </summary>
                        <div class="mt-2 space-y-2">
                            <div class="overflow-x-auto rounded-lg border border-gray-700">
                                <table class="w-full text-[10px] text-blue-300 font-mono border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr class="bg-gray-900">
                                            <th class="p-2 border-r border-gray-700">Artist/Grup</th>
                                            <th class="p-2 border-r border-gray-700">Titlul</th>
                                            <th class="p-2 border-r border-gray-700">Forma de editare</th>
                                            <th class="p-2 border-r border-gray-700">Tip suport</th>
                                            <th class="p-2 border-r border-gray-700">Tip înregistrare</th>
                                            <th class="p-2 border-r border-gray-700">An lansare</th>
                                            <th class="p-2 border-r border-gray-700">Gen muzical</th>
                                            <th class="p-2 border-r border-gray-700">Extras din</th>
                                            <th class="p-2">Observații</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                            <textarea id="excel-paste-area" rows="3" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 font-mono focus:outline-none focus:border-blue-500"></textarea>
                            <div class="text-right">
                                <button type="button" onclick="processMuzicaExcelPaste()" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-md">Importă datele</button>
                            </div>
                        </div>
                    </details>
                `;
                importZone.classList.remove('hidden');
            }
        } else if (currentCategory === 'carti') {
            if (importZone) {
                importZone.innerHTML = `
                    <details class="bg-gray-900 border border-gray-700 rounded-xl p-3 transition-all">
                        <summary class="text-xs font-bold text-blue-400 uppercase tracking-wider cursor-pointer select-none flex items-center gap-1.5">
                            <i class="fa-solid fa-file-import"></i> IMPORT DATE
                        </summary>
                        <div class="mt-2 space-y-2">
                            <div class="overflow-x-auto rounded-lg border border-gray-700">
                                <table class="w-full text-[10px] text-blue-300 font-mono border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr class="bg-gray-900">
                                            <th class="p-2 border-r border-gray-700">Autor</th>
                                            <th class="p-2 border-r border-gray-700">Titlul</th>
                                            <th class="p-2 border-r border-gray-700">Anul apariției</th>
                                            <th class="p-2 border-r border-gray-700">Editura</th>
                                            <th class="p-2 border-r border-gray-700">Ediția</th>
                                            <th class="p-2 border-r border-gray-700">Nr.pagini</th>
                                            <th class="p-2 border-r border-gray-700">Suport fizic</th>
                                            <th class="p-2 border-r border-gray-700">Gen tematic</th>
                                            <th class="p-2 border-r border-gray-700">Observații</th>
                                            <th class="p-2">Link copertă</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                            <textarea id="excel-paste-area" rows="3" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 font-mono focus:outline-none focus:border-blue-500"></textarea>
                            <div class="text-right">
                                <button type="button" onclick="processCartiExcelPaste()" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-md">Importă datele</button>
                            </div>
                        </div>
                    </details>
                `;
                importZone.classList.remove('hidden');
            }
        } else {
            if (importZone) importZone.classList.add('hidden');
        }
        resetFormFields();
    } else if (mode === 'edit' && index !== null) {
        document.getElementById('form-edit-index').value = index;
        deleteBtn.classList.remove('hidden');
        if (importZone) importZone.classList.add('hidden'); 
        fillFormValues(index);
    }
}

function closeModal() { 
    document.getElementById('crud-modal').classList.add('hidden'); 
}

let currentDetailsIndex = null;

function showDetails(index) {
    const item = database[currentCategory][index];
    if (!item) return;

    document.getElementById('details-titlu').textContent = item.titlu || '-';

    const cover = document.getElementById('details-cover');
    if (item.url_img && item.url_img.trim() !== "" && item.url_img.toLowerCase().startsWith('http')) {
        cover.src = item.url_img.trim();
        cover.classList.remove('hidden');
    } else {
        cover.src = "";
        cover.classList.add('hidden');
    }

    const subtitle = document.getElementById('details-autor');
    const rest = document.getElementById('details-rest');

    if (currentCategory === 'filme') {
        subtitle.textContent = item.regizor ? `Regizor: ${item.regizor}` : '';
        let linkuri = '';
        if (item.imdb && item.imdb.toLowerCase().startsWith('http')) linkuri += `<p><a href="${item.imdb}" target="_blank" class="text-blue-400 underline">Link IMDB</a></p>`;
        if (item.cinemagia && item.cinemagia.toLowerCase().startsWith('http')) linkuri += `<p><a href="${item.cinemagia}" target="_blank" class="text-blue-400 underline">Link CineMagia</a></p>`;
        rest.innerHTML = `
            <p><span class="text-gray-500">Titlu RO:</span> ${item.titlu_ro || '-'}</p>
            <p><span class="text-gray-500">Tip:</span> ${item.tip || '-'}</p>
            <p><span class="text-gray-500">Status:</span> ${item.status || '-'}</p>
            <p><span class="text-gray-500">Gen:</span> ${item.gen || '-'}</p>
            <p><span class="text-gray-500">Durata/Episoade:</span> ${item.durata || '-'}</p>
            <p><span class="text-gray-500">În distribuție (Actori):</span> ${item.actori || '-'}</p>
            <p><span class="text-gray-500">Observații:</span> ${item.observatii || '-'}</p>
            ${linkuri}
        `;
    } else if (currentCategory === 'muzica') {
        subtitle.textContent = item.autor || '';
        rest.innerHTML = `
            <p><span class="text-gray-500">Forma de editare:</span> ${item.forma_editare || '-'}</p>
            <p><span class="text-gray-500">Tip suport:</span> ${item.tip_suport || '-'}</p>
            <p><span class="text-gray-500">Tip înregistrare:</span> ${item.tip_inregistrare || '-'}</p>
            <p><span class="text-gray-500">An lansare:</span> ${item.an || '-'}</p>
            <p><span class="text-gray-500">Gen muzical:</span> ${item.gen || '-'}</p>
            <p><span class="text-gray-500">Extras din:</span> ${item.extras_din || '-'}</p>
            <p><span class="text-gray-500">Observații:</span> ${item.observatii || '-'}</p>
        `;
    } else {
        subtitle.textContent = item.autor || '';
        rest.innerHTML = `
            <p><span class="text-gray-500">Anul apariției:</span> ${item.an || '-'}</p>
            <p><span class="text-gray-500">Editura:</span> ${item.editura || '-'}</p>
            <p><span class="text-gray-500">Ediția:</span> ${item.editie || '-'}</p>
            <p><span class="text-gray-500">Nr. pagini:</span> ${item.nr_pagini || '-'}</p>
            <p><span class="text-gray-500">Suport fizic:</span> ${item.suport_fizic || '-'}</p>
            <p><span class="text-gray-500">Gen tematic:</span> ${item.gen_tematic || '-'}</p>
            <p><span class="text-gray-500">Observații:</span> ${item.observatii || '-'}</p>
        `;
    }

    currentDetailsIndex = index;
    const editBtn = document.getElementById('details-edit-btn');
    if (isAdmin) {
        editBtn.classList.remove('hidden');
    } else {
        editBtn.classList.add('hidden');
    }

    document.getElementById('details-modal').classList.remove('hidden');
}

function closeDetailsModal() {
    document.getElementById('details-modal').classList.add('hidden');
}

function editFromDetails() {
    closeDetailsModal();
    openModal('edit', currentDetailsIndex);
}

function updateImagePreview(url) {
    const icon = document.getElementById('image-placeholder-icon');
    const text = document.getElementById('image-placeholder-text');
    const img = document.getElementById('image-preview-element');
    if (url && url.trim() !== "" && url.toLowerCase().startsWith('http')) {
        img.src = url.trim(); 
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
    if (currentCategory === 'carti' && window.fillCartiFormValues) {
        window.fillCartiFormValues(index);
        return;
    }

    const item = database[currentCategory][index];
    document.getElementById('form-titlu').value = item.titlu || '';
    document.getElementById('form-tip').value = item.tip || '';
    if(document.getElementById('form-gen')) document.getElementById('form-gen').value = item.gen || '';
    if(document.getElementById('form-an')) document.getElementById('form-an').value = item.an || '';
    if(document.getElementById('form-url-img')) {
        document.getElementById('form-url-img').value = item.url_img || '';
        updateImagePreview(item.url_img);
    }

    if (currentCategory === 'filme') {
        document.getElementById('form-titlu-ro').value = item.titlu_ro || '';
        document.getElementById('form-status').value = item.status || 'De vizionat';
        document.getElementById('form-regizor').value = item.regizor || '';
        document.getElementById('form-durata').value = item.durata || '';
        document.getElementById('form-actori').value = item.actori || '';
        document.getElementById('form-observatii').value = item.observatii || '';
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
    if (currentCategory === 'carti' && window.saveCartiElement) {
        window.saveCartiElement(event);
        return;
    }

    const idxStr = document.getElementById('form-edit-index').value;
    const titlu = document.getElementById('form-titlu').value.trim();
    const tip = document.getElementById('form-tip').value;
    const gen = document.getElementById('form-gen') ? document.getElementById('form-gen').value.trim() : '';
    const url_img = document.getElementById('form-url-img') ? document.getElementById('form-url-img').value.trim() : '';

    let item = { titlu, tip, gen, url_img };

    if (currentCategory === 'filme') {
        item.titlu_ro = document.getElementById('form-titlu-ro').value.trim();
        item.status = document.getElementById('form-status').value;
        item.an = document.getElementById('form-an').value.trim();
        item.regizor = document.getElementById('form-regizor').value.trim();
        item.durata = document.getElementById('form-durata').value.trim();
        item.actori = document.getElementById('form-actori').value.trim();
        item.observatii = document.getElementById('form-observatii').value.trim();
        item.imdb = document.getElementById('form-imdb').value.trim();
        item.cinemagia = document.getElementById('form-cinemagia').value.trim();
    } else {
        item.autor = document.getElementById('form-autor').value.trim();
    }

    if (idxStr === "") {
        const prefix = currentCategory === 'filme' ? "F25-" : "C26-";
        let maxNum = 0;
        database[currentCategory].forEach(x => {
            if (x.cod && x.cod.startsWith(prefix)) {
                const numPart = parseInt(x.cod.replace(prefix, ""));
                if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
            }
        });
        item.cod = prefix + String(maxNum + 1).padStart(3, '0');
        database[currentCategory].push(item);
    } else {
        item.cod = database[currentCategory][parseInt(idxStr)].cod;
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

function resetFormFields() {
    const idx = document.getElementById('form-edit-index').value;
    document.getElementById('crud-form').reset();
    document.getElementById('form-edit-index').value = idx;
    updateImagePreview("");
}
