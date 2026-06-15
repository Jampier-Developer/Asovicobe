document.addEventListener('DOMContentLoaded', () => {

    // ── Helpers ──────────────────────────────────────────────────────────────

    function isDiaRojo(dia) {
        const d = dia.toUpperCase();
        return d.includes('FESTIVO') || d === 'DOMINGO';
    }

    function isDiaSabado(dia) {
        return dia.toUpperCase() === 'SABADO';
    }

    // 'red' | 'sabado' | 'normal'
    function getDayClass(dia) {
        if (isDiaRojo(dia))   return 'red';
        if (isDiaSabado(dia)) return 'sabado';
        return 'normal';
    }

    // Pago fijo por tipo de día — el horario no afecta el monto
    function calcularPago(dia) {
        if (isDiaRojo(dia))   return 100000;
        if (isDiaSabado(dia)) return 35000;
        return 15000;
    }

    function badgeClass(pago) {
        if (pago === 100000) return 'festivo'; // rojo
        if (pago === 35000)  return 'sabado';  // verde
        return 'low';                           // amarillo
    }

    function formatPeso(amount) {
        return '$' + amount.toLocaleString('es-CO');
    }

    function normTime(t) {
        return t.replace(/\s+a\s+/gi, ' - ');
    }

    // ── Base de datos Jampier (NO editable) ──────────────────────────────────

    const jampierDatabase = [
        { day: 'SABADO',          date: '6 De Junio De 2026',  time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '7 De Junio De 2026',  time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'LUNES - FESTIVO', date: '8 De Junio De 2026',  time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'MIERCOLES',       date: '10 De Junio De 2026', time: '5PM a 9PM', completed: true, isJampier: true },
        { day: 'SABADO',          date: '13 De Junio De 2026', time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '14 De Junio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'LUNES - FESTIVO', date: '15 De Junio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'SABADO',          date: '20 De Junio De 2026', time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '21 De Junio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'SABADO',          date: '27 De Junio De 2026', time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '28 De Junio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'LUNES - FESTIVO', date: '29 De Junio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
    ];

    // ── DOM ───────────────────────────────────────────────────────────────────

    const daySelect    = document.getElementById('day');
    const dateInput    = document.getElementById('date');
    const timeSelect   = document.getElementById('time');
    const saveBtn      = document.getElementById('saveBtn');
    const dataList     = document.getElementById('dataList');
    const emptyState   = document.getElementById('emptyState');
    const modal        = document.getElementById('modal');
    const modalText    = document.getElementById('modalText');
    const closeModal   = document.querySelector('.close-modal');
    const pagoPreview  = document.getElementById('pagoPreview');
    const pagoEstimado = document.getElementById('pagoEstimado');

    // ── Opciones de horario por tipo de día ───────────────────────────────────

    const TIME_OPTIONS = {
        red:    [{ v: '7AM - 9PM',  l: '7AM - 9PM &nbsp;(14 horas)' }],
        sabado: [
            { v: '11AM - 9PM', l: '11AM - 9PM &nbsp;(10 horas)' },
            { v: '12PM - 9PM', l: '12PM - 9PM &nbsp;(9 horas)'  },
            { v: '1PM - 9PM',  l: '1PM - 9PM &nbsp;(8 horas)'   },
            { v: '2PM - 9PM',  l: '2PM - 9PM &nbsp;(7 horas)'   },
        ],
        normal: [{ v: '5PM - 9PM', l: '5PM - 9PM &nbsp;(4 horas)' }],
    };

    function updateTimeOptions() {
        const day = daySelect.value;
        timeSelect.innerHTML = '<option value="">-- Selecciona el horario --</option>';
        pagoPreview.style.display = 'none';

        if (!day) return;

        const key = getDayClass(day); // 'red' | 'sabado' | 'normal'
        TIME_OPTIONS[key].forEach(opt => {
            const o = document.createElement('option');
            o.value     = opt.v;
            o.innerHTML = opt.l;
            timeSelect.appendChild(o);
        });

        // Si solo hay un horario posible, se selecciona automáticamente
        if (TIME_OPTIONS[key].length === 1) {
            timeSelect.value = TIME_OPTIONS[key][0].v;
        }

        updatePreview();
    }

    function updatePreview() {
        const day  = daySelect.value;
        const time = timeSelect.value;
        if (day && time) {
            pagoEstimado.textContent = formatPeso(calcularPago(day));
            pagoPreview.style.display = 'flex';
        } else {
            pagoPreview.style.display = 'none';
        }
    }

    daySelect.addEventListener('change', updateTimeOptions);
    timeSelect.addEventListener('change', updatePreview);

    // ── Guardar turno ─────────────────────────────────────────────────────────

    saveBtn.addEventListener('click', () => {
        const day  = daySelect.value.trim();
        const date = dateInput.value.trim();
        const time = timeSelect.value;

        if (!day || !date || !time) {
            showModal('⚠️ Todos los campos son obligatorios.');
            return;
        }

        saveToLocalStorage({ day, date, time, completed: false, isJampier: false });
        renderData();
        clearInputs();
        showModal(`✅ Turno guardado.\nPago estimado: ${formatPeso(calcularPago(day))}`);
    });

    // ── Render ────────────────────────────────────────────────────────────────

    function renderData() {
        dataList.innerHTML = '';

        const userData = JSON.parse(localStorage.getItem('asovicobe_data')) || [];
        const allData  = [...jampierDatabase, ...userData];

        let totalGanado = 0;
        let completados = 0;

        allData.forEach((item, index) => {
            const pago     = calcularPago(item.day);
            const dayClass = getDayClass(item.day);
            if (item.completed) completados++;
            totalGanado += pago;

            const li = document.createElement('li');
            li.classList.add(`is-${dayClass}`);
            if (item.completed) li.classList.add('is-done');

            li.innerHTML = `
                <div class="shift-info">
                    <div class="shift-day ${dayClass}">${item.day}</div>
                    <div class="shift-meta">
                        <span><i class="far fa-calendar"></i> ${item.date}</span>
                        <span><i class="far fa-clock"></i> ${normTime(item.time)}</span>
                    </div>
                </div>
                <div class="shift-right">
                    <span class="pago-badge ${badgeClass(pago)}">${formatPeso(pago)}</span>
                    <div class="actions">
                        <button class="complete" onclick="toggleComplete(${index}, ${item.isJampier})" title="${item.completed ? 'Marcar pendiente' : 'Marcar completado'}">
                            <i class="fas fa-${item.completed ? 'check-circle' : 'circle'}"></i>
                        </button>
                        ${item.isJampier ? '' : `<button class="delete" onclick="deleteData(${index})" title="Eliminar turno">
                            <i class="fas fa-trash-alt"></i>
                        </button>`}
                    </div>
                </div>`;

            dataList.appendChild(li);
        });

        document.getElementById('totalTurnos').textContent       = allData.length;
        document.getElementById('totalGanado').textContent       = formatPeso(totalGanado);
        document.getElementById('turnosCompletados').textContent = completados;
        document.getElementById('turnosPendientes').textContent  = allData.length - completados;
        document.getElementById('turnosCount').textContent       = `${allData.length} turno${allData.length !== 1 ? 's' : ''}`;

        emptyState.style.display = allData.length === 0 ? 'block' : 'none';
    }

    // ── LocalStorage ──────────────────────────────────────────────────────────

    function saveToLocalStorage(data) {
        const userData = JSON.parse(localStorage.getItem('asovicobe_data')) || [];
        userData.push(data);
        localStorage.setItem('asovicobe_data', JSON.stringify(userData));
    }

    // ── Acciones globales ─────────────────────────────────────────────────────

    window.toggleComplete = (index, isJampier) => {
        if (isJampier) {
            showModal('🔒 Los turnos de la base no se pueden modificar.');
            return;
        }
        const userData = JSON.parse(localStorage.getItem('asovicobe_data')) || [];
        const i = index - jampierDatabase.length;
        userData[i].completed = !userData[i].completed;
        localStorage.setItem('asovicobe_data', JSON.stringify(userData));
        renderData();
    };

    window.deleteData = (index) => {
        const userData = JSON.parse(localStorage.getItem('asovicobe_data')) || [];
        userData.splice(index - jampierDatabase.length, 1);
        localStorage.setItem('asovicobe_data', JSON.stringify(userData));
        renderData();
        showModal('🗑️ Turno eliminado.');
    };

    // ── Modal ─────────────────────────────────────────────────────────────────

    function showModal(message) {
        modalText.textContent = message;
        modal.style.display = 'flex';
    }

    closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // ── Utils ─────────────────────────────────────────────────────────────────

    function clearInputs() {
        daySelect.value  = '';
        dateInput.value  = '';
        timeSelect.innerHTML = '<option value="">-- Selecciona el horario --</option>';
        pagoPreview.style.display = 'none';
    }

    // ── Init ──────────────────────────────────────────────────────────────────

    if (!localStorage.getItem('asovicobe_data')) {
        localStorage.setItem('asovicobe_data', JSON.stringify([]));
    }
    renderData();
});
