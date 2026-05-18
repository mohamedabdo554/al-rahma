/* ── Command Palette (Ctrl+K) ── */
let paletteOpen = false;
let paletteTimeout = null;

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
    }
    if (e.key === 'Escape' && paletteOpen) {
        closePalette();
    }
});

function togglePalette() {
    paletteOpen ? closePalette() : openPalette();
}

function openPalette() {
    const overlay = document.getElementById('palette');
    const input = document.getElementById('paletteInput');
    if (!overlay) return;
    overlay.classList.add('show');
    paletteOpen = true;
    setTimeout(function() { input.focus(); }, 100);
    document.body.style.overflow = 'hidden';
}

function closePalette() {
    const overlay = document.getElementById('palette');
    if (!overlay) return;
    overlay.classList.remove('show');
    paletteOpen = false;
    document.body.style.overflow = '';
}

function closePaletteOutside(e) {
    if (e.target === e.currentTarget) closePalette();
}

/* ── Palette Search ── */
(function() {
    const input = document.getElementById('paletteInput');
    const results = document.getElementById('paletteResults');
    if (!input || !results) return;

    let debounceTimer = null;

    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const q = this.value.trim();
        if (q.length < 1) {
            results.innerHTML = '<div class="palette-empty"><i class="bi bi-search"></i><p>ابدأ الكتابة للبحث...</p></div>';
            return;
        }
        debounceTimer = setTimeout(function() {
            fetch('/api/search?q=' + encodeURIComponent(q))
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (data.length === 0) {
                        results.innerHTML = '<div class="palette-empty"><i class="bi bi-inbox"></i><p>لا توجد نتائج</p></div>';
                        return;
                    }
                    var html = '';
                    var hasOwners = data.some(function(o) { return o.type === 'owner'; });
                    var hasAnimals = data.some(function(o) { return o.type === 'animal'; });

                    if (hasOwners) {
                        html += '<div class="palette-group-label"><i class="bi bi-people"></i> العملاء</div>';
                        data.forEach(function(item) {
                            if (item.type !== 'owner') return;
                            html += '<a href="/owners/' + item.id + '" class="palette-item" onclick="closePalette()">';
                            html += '<div class="pi-icon owner"><i class="bi bi-person"></i></div>';
                            html += '<div class="pi-info">';
                            html += '<div class="pi-title">' + escapeHtml(item.name) + '</div>';
                            html += '<div class="pi-sub" dir="ltr">' + escapeHtml(item.phone) + ' — ' + item.animal_count + ' حيوان' + '</div>';
                            html += '</div>';
                            html += '<div class="pi-badge">عميل</div>';
                            html += '</a>';
                        });
                    }

                    if (hasAnimals) {
                        html += '<div class="palette-group-label"><i class="bi bi-paw"></i> الحيوانات</div>';
                        data.forEach(function(item) {
                            if (item.type !== 'animal') return;
                            var speciesIcon = item.species === 'dog' ? 'bi-paw' : 'bi-bug';
                            html += '<a href="/animals/' + item.id + '" class="palette-item" onclick="closePalette()">';
                            html += '<div class="pi-icon animal"><i class="bi ' + speciesIcon + '"></i></div>';
                            html += '<div class="pi-info">';
                            html += '<div class="pi-title">' + escapeHtml(item.name) + '</div>';
                            html += '<div class="pi-sub">مالك: ' + escapeHtml(item.owner_name) + '</div>';
                            html += '</div>';
                            html += '<div class="pi-badge">' + (item.species === 'dog' ? 'كلب' : item.species === 'cat' ? 'قط' : item.species) + '</div>';
                            html += '</a>';
                        });
                    }

                    results.innerHTML = html;
                })
                .catch(function() {
                    results.innerHTML = '<div class="palette-empty"><i class="bi bi-exclamation-triangle"></i><p>حدث خطأ في البحث</p></div>';
                });
        }, 200);
    });

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
})();

/* ── Owner → Animal Select (Appointment form) ── */
(function() {
    var ownerSelect = document.getElementById('ownerSelect');
    var animalSelect = document.getElementById('animalSelect');

    if (ownerSelect && animalSelect) {
        ownerSelect.addEventListener('change', function() {
            var ownerId = this.value;
            animalSelect.innerHTML = '<option value="">جاري التحميل...</option>';

            if (!ownerId) {
                animalSelect.innerHTML = '<option value="">اختر الحيوان...</option>';
                return;
            }

            fetch('/api/animals/' + ownerId)
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    animalSelect.innerHTML = '<option value="">اختر الحيوان...</option>';
                    data.forEach(function(animal) {
                        var opt = document.createElement('option');
                        opt.value = animal.id;
                        var speciesName = animal.species === 'dog' ? 'كلب' : animal.species === 'cat' ? 'قط' : animal.species;
                        opt.textContent = animal.name + ' (' + speciesName + ')';
                        animalSelect.appendChild(opt);
                    });
                })
                .catch(function() {
                    animalSelect.innerHTML = '<option value="">خطأ في التحميل</option>';
                });
        });
    }
})();

/* ── Financial System (Invoice Calculator) ── */
var services = [];

function addService() {
    var select = document.getElementById('serviceSelect');
    if (!select || !select.value) return;

    var name = select.value;
    var price = parseFloat(select.options[select.selectedIndex].getAttribute('data-price')) || 0;

    services.push({ name: name, price: price });
    renderServices();
    calcInvoice();
    select.value = '';
}

function removeService(index) {
    services.splice(index, 1);
    renderServices();
    calcInvoice();
}

function updatePrice(index, newPrice) {
    var p = parseFloat(newPrice);
    if (isNaN(p) || p < 0) p = 0;
    services[index].price = p;
    calcInvoice();
}

function renderServices() {
    var container = document.getElementById('servicesList');
    var empty = document.getElementById('emptyServices');
    var hidden = document.getElementById('services_json');
    if (!container) return;

    if (services.length === 0) {
        container.innerHTML = '<div class="text-muted-c text-center py-3" id="emptyServices" style="font-size:0.85rem;"><i class="bi bi-inbox d-block mb-1" style="font-size:1.3rem;"></i>لم تضف أي خدمة بعد</div>';
        if (hidden) hidden.value = '[]';
        return;
    }

    var html = '';
    services.forEach(function(svc, i) {
        html += '<div class="d-flex align-items-center gap-2 mb-2" style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.5rem 0.7rem;">';
        html += '<span style="flex:1;font-size:0.9rem;">' + escapeHtml(svc.name) + '</span>';
        html += '<input type="number" step="0.5" value="' + svc.price + '" min="0" style="width:90px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:6px;padding:0.2rem 0.5rem;color:var(--text);font-size:0.85rem;text-align:center;" onchange="updatePrice(' + i + ', this.value)">';
        html += '<span style="color:var(--text-dim);font-size:0.8rem;">ج</span>';
        html += '<button type="button" class="btn-glass sm danger" style="padding:0.15rem 0.5rem;" onclick="removeService(' + i + ')"><i class="bi bi-x-lg" style="font-size:0.7rem;"></i></button>';
        html += '</div>';
    });
    container.innerHTML = html;

    if (hidden) hidden.value = JSON.stringify(services);
}

function calcInvoice() {
    var total = services.reduce(function(sum, svc) { return sum + svc.price; }, 0);
    var discount = parseFloat(document.getElementById('discountInput')?.value) || 0;
    var paid = parseFloat(document.getElementById('paidInput')?.value) || 0;
    var remaining = total - discount - paid;
    if (remaining < 0) remaining = 0;

    var totalEl = document.getElementById('totalDisplay');
    var remainingEl = document.getElementById('remainingDisplay');
    var hiddenTotal = document.querySelector('input[name="total_amount"]');
    var hiddenPaid = document.querySelector('input[name="amount_paid"]');
    var hiddenDiscount = document.querySelector('input[name="discount"]');
    var hiddenRemaining = document.querySelector('input[name="remaining_amount"]');

    if (totalEl) totalEl.textContent = total.toFixed(2) + ' ج';
    if (remainingEl) {
        remainingEl.textContent = remaining.toFixed(2) + ' ج';
        remainingEl.style.color = remaining > 0 ? 'var(--danger)' : 'var(--primary)';
    }
    if (hiddenTotal) hiddenTotal.value = total;
    if (hiddenPaid) hiddenPaid.value = paid;
    if (hiddenDiscount) hiddenDiscount.value = discount;
    if (hiddenRemaining) hiddenRemaining.value = remaining;

    // Update services hidden field too
    var hidden = document.getElementById('services_json');
    if (hidden) hidden.value = JSON.stringify(services);
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/* ── Auto-dismiss alerts ── */
(function() {
    var alerts = document.querySelectorAll('.alert-glass');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            alert.classList.remove('show');
            setTimeout(function() { alert.remove(); }, 300);
        }, 4000);
    });
})();
