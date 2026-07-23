/* This is generated with the help of an LLM */

(function () {
  var input = document.getElementById("paper-search");
  var table = document.getElementById("paper-table");
  var countEl = document.getElementById("paper-count");
  var noResults = document.getElementById("no-results");
  if (!input || !table) return;

  var tbody = table.querySelector("tbody");
  var rows = Array.from(tbody.querySelectorAll("tr"));
  var defaultOrder = rows.slice();

  function el(tag, props) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (key) { node[key] = props[key]; });
    return node;
  }

  // Precompute searchable text per row, excluding hidden field-label spans
  // (mobile-only captions) so the search box can't accidentally match on
  // a label instead of real content.
  rows.forEach(function (row) {
    var clone = row.cloneNode(true);
    clone.querySelectorAll(".field-label").forEach(function (node) { node.remove(); });
    row.dataset.searchText = clone.textContent.toLowerCase();
  });

  // --- Sorting ---
  var headers = Array.from(table.querySelectorAll("thead tr:first-child th[data-col]"));
  var currentSort = { col: null, dir: null };

  // Columns whose displayed text lives in a nested element rather than
  // directly reflecting a simple tr[data-*] attribute.
  var TEXT_SELECTORS = {
    title: ".paper-title",
    institution: ".institutions"
  };

  function sortValue(row, th) {
    var selector = TEXT_SELECTORS[th.dataset.col];
    var cell = selector && row.querySelector(selector);
    var raw = (cell ? cell.textContent : row.dataset[th.dataset.col] || "").trim();
    return th.dataset.sortType === "number" ? Number(raw) : raw.toLowerCase();
  }

  function sortBy(th, dir) {
    rows.sort(function (a, b) {
      var av = sortValue(a, th);
      var bv = sortValue(b, th);
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    rows.forEach(function (row) { tbody.appendChild(row); });
    headers.forEach(function (h) { h.removeAttribute("data-sort"); });
    th.setAttribute("data-sort", dir);
    currentSort = { col: th.dataset.col, dir: dir };
  }

  headers.forEach(function (th) {
    th.addEventListener("click", function () {
      sortBy(th, currentSort.col === th.dataset.col && currentSort.dir === "asc" ? "desc" : "asc");
      persist();
    });
  });

  function resetSort() {
    headers.forEach(function (h) { h.removeAttribute("data-sort"); });
    currentSort = { col: null, dir: null };
    rows.length = 0;
    rows.push.apply(rows, defaultOrder);
    rows.forEach(function (row) { tbody.appendChild(row); });
  }

  // --- Column show/hide ---
  var columnsPanel = document.getElementById("columns-panel");
  var columnCheckboxes = columnsPanel ? Array.from(columnsPanel.querySelectorAll("input[data-col]")) : [];

  function setColumnVisibility(checkbox) {
    table.classList.toggle("hide-" + checkbox.dataset.col, !checkbox.checked);
  }

  columnCheckboxes.forEach(function (checkbox) {
    setColumnVisibility(checkbox);
    checkbox.addEventListener("change", function () {
      setColumnVisibility(checkbox);
      persist();
    });
  });

  function resetColumns() {
    columnCheckboxes.forEach(function (checkbox) {
      checkbox.checked = checkbox.defaultChecked;
      setColumnVisibility(checkbox);
    });
  }

  // --- Dropdown helper (shared by the Columns menu and each column filter) ---
  var openPanels = [];

  function closeAllPanels() {
    openPanels.forEach(function (panel) { panel.hidden = true; });
  }

  function setupDropdown(toggleBtn, panel) {
    openPanels.push(panel);
    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var wasHidden = panel.hidden;
      closeAllPanels();
      panel.hidden = !wasHidden;
      var search = !panel.hidden && panel.querySelector(".filter-panel-search");
      if (search) search.focus();
    });
  }

  document.addEventListener("click", function (e) {
    openPanels.forEach(function (panel) {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== panel.previousElementSibling) {
        panel.hidden = true;
      }
    });
  });

  if (columnsPanel) setupDropdown(document.getElementById("columns-toggle"), columnsPanel);

  // --- Column filters (multi-select checkbox dropdowns) ---
  // All values start selected (opt-out filtering): the button reads "All"
  // and unchecking a value narrows the results, rather than starting empty
  // and requiring the user to opt in to every value they want.
  // type "exact": dataset attribute holds a single value.
  // type "list": dataset attribute holds "|"-delimited values.
  var FILTERS = [
    { col: "year", attr: "year", type: "exact" },
    { col: "venue", attr: "venue", type: "exact" },
    { col: "institution", attr: "institutions", type: "list" }
  ].map(function (filter) {
    var container = document.querySelector('.filter-dropdown[data-filter="' + filter.col + '"]');
    filter.button = container && container.querySelector(".filter-btn");
    filter.panel = container && container.querySelector(".filter-panel");
    filter.selected = {};
    return filter;
  }).filter(function (filter) { return filter.panel; });

  function filterLabel(filter) {
    var selectedCount = Object.keys(filter.selected).length;
    if (selectedCount === filter.allValues.length) return "All";
    if (selectedCount === 0) return "None";
    if (selectedCount <= 2) return Object.keys(filter.selected).join(", ");
    return selectedCount + " selected";
  }

  function setFilterValue(filter, checkbox) {
    if (checkbox.checked) {
      filter.selected[checkbox.value] = true;
    } else {
      delete filter.selected[checkbox.value];
    }
  }

  function refreshFilter(filter) {
    filter.button.textContent = filterLabel(filter);
    applyFilters();
    persist();
  }

  function populateFilter(filter) {
    var values = rows.reduce(function (acc, row) {
      var raw = row.dataset[filter.attr] || "";
      return acc.concat(filter.type === "list" ? raw.split("|") : [raw]);
    }, []);
    filter.allValues = values.filter(function (v, i, arr) { return v && arr.indexOf(v) === i; }).sort();

    var search = el("input", { type: "text", className: "filter-panel-search", placeholder: "Search…" });
    var list = el("div", { className: "filter-panel-list" });
    var checkboxes = filter.allValues.map(function (value) {
      filter.selected[value] = true;
      var checkbox = el("input", { type: "checkbox", value: value, checked: true });
      checkbox.addEventListener("change", function () {
        setFilterValue(filter, checkbox);
        refreshFilter(filter);
      });
      var label = el("label", {});
      label.append(checkbox, value);
      list.appendChild(label);
      return checkbox;
    });

    var selectAllBtn = el("button", { type: "button", textContent: "Select all" });
    var selectNoneBtn = el("button", { type: "button", textContent: "Select none" });
    function setAll(checked) {
      checkboxes.forEach(function (checkbox) {
        checkbox.checked = checked;
        setFilterValue(filter, checkbox);
      });
      refreshFilter(filter);
    }
    selectAllBtn.addEventListener("click", function () { setAll(true); });
    selectNoneBtn.addEventListener("click", function () { setAll(false); });
    var actions = el("div", { className: "filter-panel-actions" });
    actions.append(selectAllBtn, selectNoneBtn);

    search.addEventListener("input", function () {
      var query = search.value.trim().toLowerCase();
      Array.from(list.querySelectorAll("label")).forEach(function (label) {
        label.hidden = query.length > 0 && label.textContent.toLowerCase().indexOf(query) === -1;
      });
    });

    filter.panel.append(search, actions, list);
    filter.button.textContent = filterLabel(filter);
    setupDropdown(filter.button, filter.panel);
  }

  FILTERS.forEach(populateFilter);

  function filterMatches(filter, row) {
    var raw = row.dataset[filter.attr] || "";
    if (!raw) return true; // nothing to filter on for this row (optional field left blank)
    var selected = Object.keys(filter.selected);
    if (selected.length === 0) return false;
    if (filter.type === "list") {
      var rawValues = raw.split("|");
      return selected.some(function (value) { return rawValues.indexOf(value) !== -1; });
    }
    return selected.indexOf(raw) !== -1;
  }

  function resetFilters() {
    FILTERS.forEach(function (filter) {
      filter.selected = {};
      Array.from(filter.panel.querySelectorAll("input[type=checkbox]")).forEach(function (checkbox) {
        checkbox.checked = true;
        filter.selected[checkbox.value] = true;
      });
      filter.panel.querySelector(".filter-panel-search").value = "";
      Array.from(filter.panel.querySelectorAll("label")).forEach(function (label) { label.hidden = false; });
      filter.button.textContent = filterLabel(filter);
    });
  }

  // --- Search ---
  // Every query word must appear verbatim somewhere in the text --
  // order-independent, so "shinde bertschi" still matches
  // "Andrin Bertschi, Shweta Shinde".
  function textMatches(text, query) {
    if (!query) return true;
    return query.split(/\s+/).filter(Boolean).every(function (queryWord) {
      return text.indexOf(queryWord) !== -1;
    });
  }

  // --- Search box + combined filtering ---
  function applyFilters() {
    var query = input.value.trim().toLowerCase();
    var visible = 0;

    rows.forEach(function (row) {
      var match = textMatches(row.dataset.searchText, query) &&
        FILTERS.every(function (filter) { return filterMatches(filter, row); });
      row.hidden = !match;
      if (match) visible++;
    });

    countEl.textContent = visible + (visible === 1 ? " paper" : " papers");
    noResults.hidden = visible !== 0;
  }

  var resetBtn = document.getElementById("reset-filters");

  // --- Persist selection across visits ---
  // Sticks to localStorage: column visibility, filter selections, and sort.
  // The free-text search query is deliberately left out -- resurrecting an
  // old query on a fresh visit would be surprising.
  var STORAGE_KEY = "arm-cca-research:table-state";

  function getState() {
    return {
      columns: columnCheckboxes.map(function (cb) { return [cb.dataset.col, cb.checked]; }),
      filters: FILTERS.map(function (f) { return [f.col, Object.keys(f.selected).sort()]; }),
      sort: currentSort
    };
  }

  function applyState(state) {
    columnCheckboxes.forEach(function (checkbox) {
      var entry = state.columns.find(function (c) { return c[0] === checkbox.dataset.col; });
      if (!entry) return;
      checkbox.checked = entry[1];
      setColumnVisibility(checkbox);
    });

    FILTERS.forEach(function (filter) {
      var entry = state.filters.find(function (f) { return f[0] === filter.col; });
      if (!entry) return;
      var values = entry[1];
      filter.selected = {};
      Array.from(filter.panel.querySelectorAll("input[type=checkbox]")).forEach(function (checkbox) {
        checkbox.checked = values.indexOf(checkbox.value) !== -1;
        if (checkbox.checked) filter.selected[checkbox.value] = true;
      });
      filter.button.textContent = filterLabel(filter);
    });

    if (state.sort && state.sort.col) {
      var th = headers.find(function (h) { return h.dataset.col === state.sort.col; });
      if (th) sortBy(th, state.sort.dir);
    }
  }

  var defaultState = getState();

  function isChanged() {
    return input.value !== "" || JSON.stringify(getState()) !== JSON.stringify(defaultState);
  }

  function updateResetButtonState() {
    if (resetBtn) resetBtn.classList.toggle("is-active", isChanged());
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
    } catch (e) {
      // localStorage unavailable (private browsing, disabled, quota) -- fine, just skip persisting.
    }
    updateResetButtonState();
  }

  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) applyState(saved);
  } catch (e) {
    // Ignore a corrupt or missing saved state and fall back to server-rendered defaults.
  }

  input.addEventListener("input", function () {
    applyFilters();
    updateResetButtonState();
  });
  applyFilters();
  updateResetButtonState();

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      input.value = "";
      resetFilters();
      resetColumns();
      resetSort();
      applyFilters();
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      updateResetButtonState();
    });
  }
})();
