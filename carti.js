const SUPORT_FIZIC_OPTIONS = ["Tipărite pe hârtie", "Electronice"];
const GEN_TEMATIC_OPTIONS = ["Polițist", "Thriller", "Romance", "Istoric", "Social", "Acțiune", "Science-Fiction", "Fantasy", "Horror"];

let currentDetailsIndex = null;

function getUniqueYearsFromCartiDB() {
    const aniSet = new Set();
    (database.carti || []).forEach(c => {
        if (c.an && c.an !== "-") {
            aniSet.add(c.an.trim());
        }
    });
    return Array.from(aniSet).sort((a, b) => b - a);
}

window.buildCartiFiltersUI = function() {
    const container = document.getElementById('filters-container');
    const aniUnici = getUniqueYearsFromCartiDB();

    let anOptionsHtml = '<option value="Toate">Toate</option>';
    aniUnici.forEach(an => { anOptionsHtml += `<option value="${an}">${an}</option>`; });

    let suportOptionsHtml = '<option value="Toate">Toate</option>';
    SUPORT_FIZIC_OPTIONS.forEach(s => { suportOptionsHtml += `<option value="${s}">${s}</option>`; });

    let genOptionsHtml = '<option value="Toate">Toate</option>';
    GEN_TEMATIC_OPTIONS.forEach(g => { genOptionsHtml += `<option value="${g}">${g}</option>`; });

    container.innerHTML = `
        <div class="flex flex-col shrink-0 min-w-[170px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Suport fizic</label>
            <select id="filter-suport" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                ${suportOptionsHtml}
            </select>
        </div>
        <div class="flex flex-col shrink-0 min-w-[150px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gen tematic</label>
            <select id="filter-gen" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                ${genOptionsHtml}
            </select>
        </div>
        <div class="flex flex-col shrink-0 min-w-[110px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Anul apariției</label>
            <select id="filter-an" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                ${anOptionsHtml}
            </select>
        </div>
        <div class="flex flex-col flex-1 min-w-[160px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Autor</label>
            <input type="text" id="filter-text1" placeholder="Caută autor..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
        </div>
        <div class="flex flex-col flex-1 min-w-[160px]">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlul</label>
            <input type="text" id="filter-text2" placeholder="Caută titlu..." class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500">
        </div>
    `;

    if (document.getElementById('filter-suport')) document.getElementById('filter-suport').value = activeFilters.suport || "Toate";
    if (document.getElementById('filter-gen')) document.getElementById('filter-gen').value = activeFilters.gen || "Toate";
    if (document.getElementById('filter-an')) document.getElementById('filter-an').value = activeFilters.an || "Toate";
    if (document.getElementById('filter-text1')) document.getElementById('filter-text1').value = activeFilters.text1 || "";
    if (document.getElementById('filter-text2')) document.getElementById('filter-text2').value = activeFilters.text2 || "";
};

window.handleCartiSearch = function() {
    activeFilters.suport = document.getElementById('filter-suport').value;
    activeFilters.gen = document.getElementById('filter-gen').value;
    activeFilters.an = document.getElementById('filter-an').value;
    activeFilters.text1 = document.getElementById('filter-text1').value.trim().toLowerCase();
    activeFilters.text2 = document.getElementById('filter-text2').value.trim().toLowerCase();
    renderTable();
};

window.resetCartiFiltersObject = function() {
    activeFilters = { suport: "Toate", gen: "Toate", an: "Toate", text1: "", text2: "" };
};

window.buildCartiTableHeaderUI = function() {
    const headerRow = document.getElementById('table-header-row');
    headerRow.innerHTML = `
        <th class="p-3 sortable" onclick="handleHeaderSort('autor')">Autor ${getSortIndicator('autor')}</th>
        <th class="p-3 sortable" onclick="handleHeaderSort('titlu')">Titlul ${getSortIndicator('titlu')}</th>
        <th class="p-3 sortable w-28" onclick="handleHeaderSort('an')">Anul apariției ${getSortIndicator('an')}</th>
        <th class="p-3 text-center w-32">Vezi detalii</th>
    `;
};

window.renderCartiTable = function() {
    const tbody = document.getElementById('data-tbody');
    tbody.innerHTML = '';

    let list = [...(database.carti || [])];

    let filteredList = list.filter((item) => {
        if (activeFilters.suport && activeFilters.suport !== "Toate" && item.suport_fizic !== activeFilters.suport) return false;
        if (activeFilters.gen && activeFilters.gen !== "Toate" && item.gen_tematic !== activeFilters.gen) return false;
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
        const originalIndex = database.carti.findIndex(x => x.cod === item.cod);
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-750/40 transition border-b border-gray-700/40 align-middle";

        tr.innerHTML = `
            <td class="p-3 font-semibold text-white">${item.autor || '-'}</td>
            <td class="p-3 text-gray-300 font-medium">${item.titlu || '-'}</td>
            <td class="p-3 text-xs text-gray-400">${item.an || '-'}</td>
            <td class="p-3 text-center">
                <button onclick="showBookDetails(${originalIndex})" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-xs font-bold rounded-lg transition cursor-pointer">
                    <i class="fa-solid fa-eye mr-1"></i> Vezi detalii
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('item-count').textContent = `${filteredList.length} elemente identificate`;
};

window.generateCartiFormFieldsHTML = function() {
    const container = document.getElementById('dynamic-form-fields');

    let suportOptions = "";
    SUPORT_FIZIC_OPTIONS.forEach(s => { suportOptions += `<option value="${s}">${s}</option>`; });

    let genOptions = "";
    GEN_TEMATIC_OPTIONS.forEach(g => { genOptions += `<option value="${g}">${g}</option>`; });

    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Autor *</label><input type="text" id="form-autor" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titlul *</label><input type="text" id="form-titlu" required class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Anul apariției</label><input type="text" id="form-an" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Editura</label><input type="text" id="form-editura" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ediția</label><input type="text" id="form-editie" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nr. pagini</label><input type="text" id="form-nrpagini" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Suport fizic</label><select id="form-suport" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">${suportOptions}</select></div>
            <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gen tematic</label><select id="form-gentematic" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">${genOptions}</select></div>
        </div>
        <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Observații</label><input type="text" id="form-observatii" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
        <div class="flex flex-col"><label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Link copertă</label><input type="url" id="form-url-img" oninput="updateImagePreview(this.value)" class="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"></div>
    `;
};

window.fillCartiFormValues = function(index) {
    const item = database.carti[index];
    document.getElementById('form-autor').value = item.autor || '';
    document.getElementById('form-titlu').value = item.titlu || '';
    document.getElementById('form-an').value = item.an || '';
    document.getElementById('form-editura').value = item.editura || '';
    document.getElementById('form-editie').value = item.editie || '';
    document.getElementById('form-nrpagini').value = item.nr_pagini || '';
    document.getElementById('form-suport').value = item.suport_fizic || SUPORT_FIZIC_OPTIONS[0];
    document.getElementById('form-gentematic').value = item.gen_tematic || GEN_TEMATIC_OPTIONS[0];
    document.getElementById('form-observatii').value = item.observatii || '';
    document.getElementById('form-url-img').value = item.url_img || '';
    if (item.url_img) updateImagePreview(item.url_img);
};

window.saveCartiElement = function(event) {
    const idxStr = document.getElementById('form-edit-index').value;

    const autor = document.getElementById('form-autor').value.trim();
    const titlu = document.getElementById('form-titlu').value.trim();
    const an = document.getElementById('form-an').value.trim() || "-";
    const editura = document.getElementById('form-editura').value.trim();
    const editie = document.getElementById('form-editie').value.trim();
    const nr_pagini = document.getElementById('form-nrpagini').value.trim();
    const suport_fizic = document.getElementById('form-suport').value;
    const gen_tematic = document.getElementById('form-gentematic').value;
    const observatii = document.getElementById('form-observatii').value.trim();
    const url_img = document.getElementById('form-url-img').value.trim();

    let item = { autor, titlu, an, editura, editie, nr_pagini, suport_fizic, gen_tematic, observatii, url_img };

    if (idxStr === "") {
        let maxNum = 0;
        database.carti.forEach(c => {
            if (c.cod && c.cod.startsWith("C26-")) {
                const numPart = parseInt(c.cod.replace("C26-", ""));
                if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
            }
        });
        item.cod = "C26-" + String(maxNum + 1).padStart(3, '0');
        database.carti.push(item);
    } else {
        const idx = parseInt(idxStr);
        item.cod = database.carti[idx].cod;
        database.carti[idx] = item;
    }

    saveDatabase();
    buildFiltersUI();
    closeModal();
    closeDetailsModal();
    renderTable();
};

window.processCartiExcelPaste = function() {
    const txt = document.getElementById('excel-paste-area').value.trim();
    if (!txt) {
        alert("Caseta este goală!");
        return;
    }

    const linii = txt.split('\n');
    let elementeAdaugate = 0;

    let maxNum = 0;
    database.carti.forEach(c => {
        if (c.cod && c.cod.startsWith("C26-")) {
            const numPart = parseInt(c.cod.replace("C26-", ""));
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
            cod: "C26-" + String(maxNum).padStart(3, '0'),
            autor: autor,
            titlu: titlu,
            an: col[2] ? col[2].trim() : "-",
            editura: col[3] ? col[3].trim() : "",
            editie: col[4] ? col[4].trim() : "",
            nr_pagini: col[5] ? col[5].trim() : "",
            suport_fizic: col[6] ? col[6].trim() : "Tipărite pe hârtie",
            gen_tematic: col[7] ? col[7].trim() : "-",
            observatii: col[8] ? col[8].trim() : "",
            url_img: col[9] ? col[9].trim() : ""
        };

        database.carti.push(newElement);
        elementeAdaugate++;
    });

    if (elementeAdaugate > 0) {
        saveDatabase();
        buildFiltersUI();
        renderTable();
        closeModal();
        alert(`Succes! S-au importat corect ${elementeAdaugate} înregistrări de cărți.`);
    } else {
        alert("Formatul rândurilor nu corespunde structurii cerute.");
    }
};

function showBookDetails(index) {
    const item = database.carti[index];
    if (!item) return;

    document.getElementById('details-titlu').textContent = item.titlu || '-';
    document.getElementById('details-autor').textContent = item.autor || '-';

    const cover = document.getElementById('details-cover');
    if (item.url_img && item.url_img.trim() !== "" && item.url_img.toLowerCase().startsWith('http')) {
        cover.src = "https://images.weserv.nl/?url=" + encodeURIComponent(item.url_img.trim().replace(/^https?:\/\//i, ''));
        cover.classList.remove('hidden');
    } else {
        cover.src = "";
        cover.classList.add('hidden');
    }

    const rest = document.getElementById('details-rest');
    rest.innerHTML = `
        <p><span class="text-gray-500">Anul apariției:</span> ${item.an || '-'}</p>
        <p><span class="text-gray-500">Editura:</span> ${item.editura || '-'}</p>
        <p><span class="text-gray-500">Ediția:</span> ${item.editie || '-'}</p>
        <p><span class="text-gray-500">Nr. pagini:</span> ${item.nr_pagini || '-'}</p>
        <p><span class="text-gray-500">Suport fizic:</span> ${item.suport_fizic || '-'}</p>
        <p><span class="text-gray-500">Gen tematic:</span> ${item.gen_tematic || '-'}</p>
        <p><span class="text-gray-500">Observații:</span> ${item.observatii || '-'}</p>
    `;

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
