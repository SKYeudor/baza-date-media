// ==========================================
// MODUL INDEPENDENT: CATEGORIA MUZICĂ (ALBUME / SINGLE-URI)
// ==========================================

(function() {
    // Salvăm funcțiile originale din app.js pentru a le reda controlul când nu suntem pe 'muzica'
    const _origBuildFiltersUI = window.buildFiltersUI;
    const _origBuildTableHeaderUI = window.buildTableHeaderUI;
    const _origRenderTable = window.renderTable;
    const _origGenerateFormFieldsHTML = window.generateFormFieldsHTML;
    const _origFillFormValues = window.fillFormValues;
    const _origApplyImageGeometry = window.applyImageGeometry;
    const _origProcessExcelPaste = window.processExcelPaste;
    const _origOpenModal = window.openModal;

    // Funcție auxiliară locală pentru extragerea anilor unici din baza de date de muzică
    function getUniqueYearsFromMusicDB() {
        const aniSet = new Set();
        if (window.database && Array.isArray(window.database.muzica)) {
            window.database.muzica.forEach(m => {
                if (m.an && m.an !== "-" && m.an.toString().trim() !== "") {
                    aniSet.add(m.an.toString().trim());
                }
            });
        }
        return Array.from(aniSet).sort((a, b) => b - a);
    }

    // 1. FILTRE SPECIFICE PENTRU CATEGORIA MUZICĂ (FĂRĂ STATUS)
    window.buildFiltersUI = function() {
        if (window.currentCategory !== 'muzica') {
            if (_origBuildFiltersUI) _origBuildFiltersUI();
            return;
        }
        
        const container = document.getElementById('filters-container');
        if (!container) return;
        container.innerHTML = '';

        const aniUnici = getUniqueYearsFromMusicDB();
        let anOptionsHtml = '<option value="Toate">Toate</option>';
        aniUnici.forEach(an => {
            anOptionsHtml += `<option value="${an}">${an}</option>`;
        });

        container.innerHTML = `
            <div class="flex flex-col shrink-0 min-w-[150px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Album</label>
                <select id="filter-tip" onchange="handleSearch()" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="Toate">Toate</option>
                    <option value="Studio">Studio</option>
                    <option value="Live">Live</option>
                    <option value="Compilație">Compilație</option>
                    <option value="Single">Single</option>
                    <option value="Bootleg">Bootleg</option>
                </select>
            </div>
            <div class="flex flex-col shrink-0 min-w-[120px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">An lansare</label>
                <select id="filter-an" onchange="handleSearch()" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    ${anOptionsHtml}
                </select>
            </div>
            <div class="flex flex-col flex-1 min-w-[200px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Artist / Trupă</label>
                <input type="text" id="filter-text1" oninput="handleSearch()" placeholder="Scrie artist..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col flex-1 min-w-[200px]">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Caută după Titlu Album / Piese</label>
                <input type="text" id="filter-text2" oninput="handleSearch()" placeholder="Scrie titlu..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
            </div>
        `;

        if (document.getElementById('filter-tip')) document.getElementById('filter-tip').value = window.activeFilters.tip || "Toate";
        if (document.getElementById('filter-an')) document.getElementById('filter-an').value = window.activeFilters.an || "Toate";
        if (document.getElementById('filter-text1')) document.getElementById('filter-text1').value = window.activeFilters.text1 || "";
        if (document.getElementById('filter-text2')) document.getElementById('filter-text2').value = window.activeFilters.text2 || "";
    };

    // 2. STRUCTURA FIȘĂ DE COLOANE
    window.buildTableHeaderUI = function() {
        if (window.currentCategory !== 'muzica') {
            if (_origBuildTableHeaderUI) _origBuildTableHeaderUI();
            return;
        }

        const headerRow = document.getElementById('table-header-row');
        if (!headerRow) return;
        
        let actionsHtml = window.isAdmin ? `<th class="p-3 text-center w-24">Acțiuni</th>` : '';
        
        headerRow.innerHTML = `
            <th class="p-3 w-20 sortable" onclick="handleHeaderSort('cod')">COD ${getSortIndicator('cod')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('autor')">ARTIST / TRUPĂ ${getSortIndicator('autor')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('titlu')">TITLU ALBUM / MELODIE ${getSortIndicator('titlu')}</th>
            <th class="p-3 sortable w-28" onclick="handleHeaderSort('tip')">TIP ALBUM ${getSortIndicator('tip')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('gen')">GEN MUZICAL ${getSortIndicator('gen')}</th>
            <th class="p-3 sortable" onclick="handleHeaderSort('observatii')">OBSERVAȚII / INFO TEHNIC ${getSortIndicator('observatii')}</th>
            ${actionsHtml}
        `;
    };

    // 3. DESENAREA TABELULUI ȘI FILTRAREA (FĂRĂ STATUS)
    window.renderTable = function() {
        if (window.currentCategory !== 'muzica') {
            if (_origRenderTable) _origRenderTable();
            return;
        }

        const tbody = document.getElementById('data-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        let list = [];
        if (window.database && Array.isArray(window.database.muzica)) {
            list = [...window.database.muzica];
        }
        
        let filteredList = list.filter((item) => {
            if (window.activeFilters.tip && window.activeFilters.tip !== "Toate" && item.tip !== window.activeFilters.tip) return false;
            if (window.activeFilters.an && window.activeFilters.an !== "Toate" && item.an !== window.activeFilters.an) return false;
            
            if (window.activeFilters.text1) {
                const artist = item.autor ? item.autor.toLowerCase() : "";
                if (!artist.includes(window.activeFilters.text1)) return false;
            }

            if (window.activeFilters.text2) {
                const titlu = item.titlu ? item.titlu.toLowerCase() : "";
                if (!titlu.includes(window.activeFilters.text2)) return false;
            }
            return true;
        });

        filteredList.sort((a, b) => {
            let valA = a[window.currentSortKey] ? a[window.currentSortKey].toString().trim() : "";
            let valB = b[window.currentSortKey] ? b[window.currentSortKey].toString().trim() : "";

            return window.currentSortOrder === 'asc' 
                ? valA.localeCompare(valB, 'ro', { sensitivity: 'base' })
                : valB.localeCompare(valA, 'ro', { sensitivity: 'base' });
        });

        filteredList.forEach((item) => {
            const originalIndex = window.database.muzica.findIndex(x => x.cod === item.cod);
            
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-750/40 transition border-b border-gray-700/40 align-middle";

            let actionTd = window.isAdmin ? `
                <td class="p-3 text-center space-x-1 whitespace-nowrap">
                    <button onclick="openModal('edit', ${originalIndex})" class="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition" title="Modifică"><i class="fa-solid fa-pen-to-square"></i></button>
                </td>
            ` : '';

            const obsAfisat = item.observatii || "-";

            tr.innerHTML = `
                <td class="p-3 font-mono text-xs text-blue-400 font-bold">${item.cod || ''}</td>
                <td class="p-3 font-semibold text-white">${item.autor || '-'}</td>
                <td class="p-3 text-gray-300 font-medium">${item.titlu} <span class="text-xs text-gray-500 font-normal">(${item.an || '-'})</span></td>
                <td class="p-3 text-xs text-gray-400">${item.tip || '-'}</td>
                <td class="p-3 text-xs text-gray-400">${item.gen || '-'}</td>
                <td class="p-3 text-xs text-gray-400 max-w-xs truncate" title="${obsAfisat}">${obsAfisat}</td>
                ${actionTd}
            `;

            tbody.appendChild(tr);
        });

        const countEl = document.getElementById('item-count');
        if (countEl) countEl.textContent = `${filteredList.length} elemente muzicale identificate`;
    };

    // 4. GENERAREA FORMULARULUI DE EDITARE/ADĂUGARE (FĂRĂ CÂMPUL STATUS)
    window.generateFormFieldsHTML = function() {
        if (window.currentCategory !== 'muzica') {
            if (_origGenerateFormFieldsHTML) _origGenerateFormFieldsHTML();
            return;
        }

        const container = document.getElementById('dynamic-form-fields');
        if (!container) return;
        
        container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col">
                    <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cod Element *</label>
                    <input type="text" id="form-cod" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div class="flex flex-col">
                    <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tip Album</label>
                    <select id="form-tip" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                        <option value="Studio">Studio</option>
                        <option value="Live">Live</option>
                        <option value="Compilație">Compilație</option>
                        <option value="Single">Single</option>
                        <option value="Bootleg">Bootleg</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col">
                    <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Artist / Trupă *</label>
                    <input type="text" id="form-autor" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div class="flex flex-col">
                    <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">An Lansare</label>
                    <input type="text" id="form-an" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
            </div>
            <div class="flex flex-col">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlu Album / Melodie *</label>
                <input type="text" id="form-titlu" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gen Muzical</label>
                <input type="text" id="form-gen" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">URL Copertă</label>
                <input type="url" id="form-url-img" oninput="updateImagePreview(this.value)" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex flex-col">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Observații / Info Tehnic</label>
                <input type="text" id="form-observatii" placeholder="Adaugă mențiuni utile, detalii rip, info tehnic etc..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
            </div>
        `;
    };

    // 5. COMPLETAREA VALORILOR LA APĂSAREA BUTONULUI DE EDITARE (FĂRĂ STATUS)
    window.fillFormValues = function(index) {
        if (window.currentCategory !== 'muzica') {
            if (_origFillFormValues) _origFillFormValues(index);
            return;
        }
        if (!window.database.muzica || !window.database.muzica[index]) return;
        const item = window.database.muzica[index];
        
        if (document.getElementById('form-cod')) document.getElementById('form-cod').value = item.cod || '';
        if (document.getElementById('form-titlu')) document.getElementById('form-titlu').value = item.titlu || '';
        if (document.getElementById('form-tip')) document.getElementById('form-tip').value = item.tip || 'Studio';
        if (document.getElementById('form-gen')) document.getElementById('form-gen').value = item.gen || '';
        if (document.getElementById('form-an')) document.getElementById('form-an').value = item.an || '';
        if (document.getElementById('form-autor')) document.getElementById('form-autor').value = item.autor || '';
        if (document.getElementById('form-url-img')) {
            document.getElementById('form-url-img').value = item.url_img || '';
            window.updateImagePreview(item.url_img);
        }
        if (document.getElementById('form-observatii')) document.getElementById('form-observatii').value = item.observatii || '';
    };

    // 6. GEOMETRIA PĂTRATĂ CORECTĂ A COPERȚILOR DE MUZICĂ (175x175)
    window.applyImageGeometry = function() {
        if (window.currentCategory !== 'muzica') {
            if (_origApplyImageGeometry) _origApplyImageGeometry();
            return;
        }
        const wrapper = document.getElementById('image-wrapper');
        if (!wrapper) return;
        wrapper.style.minWidth = '175px'; wrapper.style.maxWidth = '175px'; wrapper.style.width = '175px'; wrapper.style.height = '175px';
        if (document.getElementById('form-image-label')) document.getElementById('form-image-label').textContent = "Copertă (175x175)";
        if (document.getElementById('modal-category-badge')) document.getElementById('modal-category-badge').textContent = "Muzică - Albume";
    };

    // 7. ASIGURAREA AFIȘĂRII CASETEI DE IMPORT PENTRU MODUL MUZICĂ
    window.openModal = function(mode, index = null) {
        if (_origOpenModal) _origOpenModal(mode, index);
        
        if (window.currentCategory === 'muzica' && mode === 'add') {
            const importZone = document.getElementById('excel-import-zone');
            const codInput = document.getElementById('form-cod');
            
            if (importZone) importZone.classList.remove('hidden');
            
            let maxNum = 0;
            if (window.database && Array.isArray(window.database.muzica)) {
                window.database.muzica.forEach(item => {
                    if (item.cod && item.cod.startsWith('M26-')) {
                        const numPart = parseInt(item.cod.replace('M26-', ""));
                        if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
                    }
                });
            }
            if (codInput) codInput.value = "M26-" + String(maxNum + 1).padStart(3, '0');
        }
    };

    // 8. ALGORITMUL DE IMPORT (FĂRĂ LOGICA DE STATUS)
    window.processExcelPaste = function() {
        if (window.currentCategory !== 'muzica') {
            if (_origProcessExcelPaste) _origProcessExcelPaste();
            return;
        }
        
        const pasteArea = document.getElementById('excel-paste-area');
        if (!pasteArea) return;
        
        const txt = pasteArea.value.trim();
        if (!txt) {
            alert("Caseta este goală! Te rog lipsește datele copiate din Excel.");
            return;
        }

        const tipGlobal = document.getElementById('form-tip') ? document.getElementById('form-tip').value : "Single";

        const linii = txt.split('\n');
        let elementeAdaugate = 0;

        let maxNum = 0;
        if (window.database && Array.isArray(window.database.muzica)) {
            window.database.muzica.forEach(m => {
                if (m.cod && m.cod.startsWith("M26-")) {
                    const numPart = parseInt(m.cod.replace("M26-", ""));
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

            let an = coloane[2] ? coloane[2].trim() : "-";
            let gen = coloane[3] ? coloane[3].trim() : "-";

            maxNum++;
            let noulCod = "M26-" + String(maxNum).padStart(3, '0');

            let muzicaNoua = {
                cod: noulCod,
                autor: artist || "-",
                titlu: titlu || "-",
                tip: tipGlobal,
                gen: gen,
                an: an,
                url_img: "",
                observatii: "-"
            };

            window.database.muzica.push(muzicaNoua);
            elementeAdaugate++;
        });

        if (elementeAdaugate > 0) {
            localStorage.setItem('biblioteca_media_db', JSON.stringify(window.database));
            window.buildFiltersUI(); 
            window.renderTable();
            pasteArea.value = ""; 
            window.closeModal();
            alert(`Succes! S-au preluat și salvat ${elementeAdaugate} elemente muzicale.`);
        } else {
            alert("Nu s-a putut procesa nicio linie validă.");
        }
    };

    console.log("Sistem: Modulul Muzică funcționează curat, fără câmpul Status.");
})();
