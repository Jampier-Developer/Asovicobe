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

    // Pago fijo por tipo de día — el horario no afecta el monto.
    // `montoManual`, si viene (número), pisa el cálculo automático — se usa
    // en días normales impredecibles (ver jampierDatabase/jampierAgenda).
    function calcularPago(dia, montoManual) {
        if (typeof montoManual === 'number') return montoManual;
        if (isDiaRojo(dia))   return 100000;
        if (isDiaSabado(dia)) return 40000;
        return 20000;
    }

    // El color del badge sigue el TIPO de día, no el monto — así "verde" queda
    // exclusivo de sábados de verdad, y un día normal con monto manual alto
    // (ej. horario de sábado en un martes) sigue viéndose amarillo, sin confundir.
    function badgeClass(dia) {
        if (isDiaRojo(dia))   return 'festivo'; // rojo
        if (isDiaSabado(dia)) return 'sabado';  // verde
        return 'low';                           // amarillo
    }

    function formatPeso(amount) {
        return '$' + amount.toLocaleString('es-CO');
    }

    function normTime(t) {
        return t.replace(/\s+a\s+/gi, ' - ');
    }

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = String(str);
        return d.innerHTML;
    }

    // ── Fechas / meses (para el historial) ────────────────────────────────────

    const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
                   'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    // Adelanto manual del "mes actual": normalmente el mes actual se calcula
    // solo (con la fecha real del dispositivo). Si Jampier quiere ver el mes
    // siguiente como actual ANTES de que llegue de verdad (ej. cerrar julio y
    // pasar a agosto unos días antes de que termine julio real), se pone aquí
    // el año/mes deseado (month es 0-indexado: enero=0 ... agosto=7). En
    // cuanto la fecha real alcance o pase este valor, deja de tener efecto y
    // todo vuelve a ser 100% automático solo — no hay que quitarlo a mano.
    const MES_ADELANTADO = { year: 2026, month: 7 }; // agosto 2026

    // Acepta "14 De Junio De 2026" y "14 De Junio 2026"
    function parseFecha(str) {
        const m = String(str).toLowerCase().match(/(\d{1,2})\s*de\s*([a-záéíóúñ]+)\s*(?:de\s*)?(\d{4})/i);
        if (!m) return null;
        const month = MESES.findIndex(mes => mes === m[2] || mes.startsWith(m[2]) || m[2].startsWith(mes));
        if (month === -1) return null;
        return { day: parseInt(m[1], 10), month, year: parseInt(m[3], 10) };
    }

    function mesLabel(year, month) {
        const nombre = MESES[month];
        return nombre.charAt(0).toUpperCase() + nombre.slice(1) + ' ' + year;
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
        { day: 'MARTES',          date: '16 De Junio De 2026', time: '5PM a 9PM', completed: true, isJampier: true, pago: 15000 },
        { day: 'JUEVES',          date: '18 De Junio De 2026', time: '5PM a 9PM', completed: true, isJampier: true, pago: 15000 },
        { day: 'VIERNES',         date: '19 De Junio De 2026', time: '5PM a 9PM', completed: true, isJampier: true, pago: 15000 },
        { day: 'SABADO',          date: '20 De Junio De 2026', time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '21 De Junio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'LUNES',           date: '22 De Junio De 2026', time: '5PM a 9PM', completed: true, isJampier: true, pago: 15000 },
        { day: 'MARTES',          date: '23 De Junio De 2026', time: '5PM a 9PM', completed: true, isJampier: true, pago: 15000 },
        { day: 'MIERCOLES',       date: '24 De Junio De 2026', time: '5PM a 9PM', completed: true, isJampier: true, pago: 15000 },
        { day: 'JUEVES',          date: '25 De Junio De 2026', time: '5PM a 9PM', completed: true, isJampier: true, pago: 15000 },
        { day: 'VIERNES',         date: '26 De Junio De 2026', time: '5PM a 9PM', completed: true, isJampier: true, pago: 15000 },
        { day: 'SABADO',          date: '27 De Junio De 2026', time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '28 De Junio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'LUNES - FESTIVO', date: '29 De Junio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },

        // Julio 2026 — sábado 4 excluido a propósito (no laborado)
        { day: 'DOMINGO',         date: '5 De Julio De 2026',  time: '7AM a 9PM', completed: true, isJampier: true },
        // Martes trabajado con horario de sábado (1pm-9pm) -> monto manual $40.000
        { day: 'MARTES',          date: '7 De Julio De 2026',  time: '1PM a 9PM', completed: true, isJampier: true, pago: 40000 },
        { day: 'MIERCOLES',       date: '8 De Julio De 2026',  time: '5PM a 9PM', completed: true, isJampier: true },
        { day: 'SABADO',          date: '11 De Julio De 2026', time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '12 De Julio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'LUNES - FESTIVO', date: '13 De Julio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'SABADO',          date: '18 De Julio De 2026', time: '7AM a 9PM', completed: true, isJampier: true, pago: 100000 },
        { day: 'DOMINGO',         date: '19 De Julio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'LUNES - FESTIVO', date: '20 De Julio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'SABADO',          date: '25 De Julio De 2026', time: '7AM a 9PM', completed: true, isJampier: true, pago: 100000 },
        { day: 'DOMINGO',         date: '26 De Julio De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
    ];

    // ── Agenda Jampier (NO editable desde la UI) ─────────────────────────────
    // Turnos PROGRAMADOS del mes (sábados, domingos y festivos conocidos).
    // Se marcan completed:true de una vez, apenas se agenda el turno (así lo
    // maneja Jampier siempre, no espera a que pase el día). Separado de
    // jampierDatabase a propósito: esto es agenda del mes actual, no historial
    // (el Historial agrupa por mes sin importar el estado de completed).
    const jampierAgenda = [
        // Agosto 2026 — festivos: viernes 7 (Batalla de Boyacá, fecha fija) y
        // lunes 17 (Asunción de la Virgen, trasladada por Ley Emiliani)
        { day: 'SABADO',          date: '1 De Agosto De 2026',  time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '2 De Agosto De 2026',  time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'VIERNES - FESTIVO', date: '7 De Agosto De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'SABADO',          date: '8 De Agosto De 2026',  time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '9 De Agosto De 2026',  time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'SABADO',          date: '15 De Agosto De 2026', time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '16 De Agosto De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'LUNES - FESTIVO', date: '17 De Agosto De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'SABADO',          date: '22 De Agosto De 2026', time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '23 De Agosto De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
        { day: 'SABADO',          date: '29 De Agosto De 2026', time: '1PM a 9PM', completed: true, isJampier: true },
        { day: 'DOMINGO',         date: '30 De Agosto De 2026', time: '7AM a 9PM', completed: true, isJampier: true },
    ];

    // ── DOM ───────────────────────────────────────────────────────────────────

    const daySelect    = document.getElementById('day');
    const dateInput    = document.getElementById('date');
    const timeSelect   = document.getElementById('time');
    const saveBtn      = document.getElementById('saveBtn');
    const dataList     = document.getElementById('dataList');
    const emptyState   = document.getElementById('emptyState');
    const mesActualLabel      = document.getElementById('mesActual');
    const historialContainer  = document.getElementById('historialContainer');
    const historialEmptyState = document.getElementById('historialEmptyState');
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

    function buildShiftLi(item, index, pago) {
        const dayClass = getDayClass(item.day);
        const li = document.createElement('li');
        li.classList.add(`is-${dayClass}`);
        if (item.completed) li.classList.add('is-done');

        li.innerHTML = `
            <div class="shift-info">
                <div class="shift-day ${dayClass}">${esc(item.day)}</div>
                <div class="shift-meta">
                    <span><i class="far fa-calendar"></i> ${esc(item.date)}</span>
                    <span><i class="far fa-clock"></i> ${esc(normTime(item.time))}</span>
                </div>
            </div>
            <div class="shift-right">
                <span class="pago-badge ${badgeClass(item.day)}">${formatPeso(pago)}</span>
                <div class="actions">
                    <button class="complete" onclick="toggleComplete(${index}, ${item.isJampier})" title="${item.completed ? 'Marcar pendiente' : 'Marcar completado'}">
                        <i class="fas fa-${item.completed ? 'check-circle' : 'circle'}"></i>
                    </button>
                    ${item.isJampier ? '' : `<button class="delete" onclick="deleteData(${index})" title="Eliminar turno">
                        <i class="fas fa-trash-alt"></i>
                    </button>`}
                </div>
            </div>`;

        return li;
    }

    // Turnos del mes calendario actual → arriba, editables.
    // Meses anteriores → Historial, agrupados, nunca se borran.
    function renderData() {
        // Recordar qué meses del historial estaban abiertos antes de reconstruir todo.
        const mesesAbiertos = new Set(
            [...historialContainer.querySelectorAll('.historial-month[open]')].map(d => d.dataset.key)
        );

        dataList.innerHTML = '';
        historialContainer.innerHTML = '';

        const userData = JSON.parse(localStorage.getItem('asovicobe_data')) || [];
        const allData  = [...jampierDatabase, ...jampierAgenda, ...userData];

        const now = new Date();
        let curY  = now.getFullYear();
        let curM  = now.getMonth();
        // Si el adelanto manual es más "futuro" que la fecha real, manda él;
        // apenas la fecha real lo alcance o pase, deja de aplicar solo.
        if (MES_ADELANTADO.year > curY || (MES_ADELANTADO.year === curY && MES_ADELANTADO.month > curM)) {
            curY = MES_ADELANTADO.year;
            curM = MES_ADELANTADO.month;
        }

        const actuales  = [];
        const historial = new Map(); // "YYYY-MM" -> { year, month, items: [] }

        allData.forEach((item, index) => {
            const fecha = parseFecha(item.date);
            // Si no se puede interpretar la fecha, se muestra en el mes actual (mejor visible que perdida).
            // Un mes futuro (ej. agosto agregado con antelación mientras aún es julio) también
            // se queda en "Mis Turnos" — el Historial es solo para meses que YA pasaron.
            const esPasado = fecha && (fecha.year < curY || (fecha.year === curY && fecha.month < curM));
            if (!esPasado) {
                actuales.push({ item, index });
                return;
            }
            const key = `${fecha.year}-${String(fecha.month).padStart(2, '0')}`;
            if (!historial.has(key)) historial.set(key, { year: fecha.year, month: fecha.month, items: [] });
            historial.get(key).items.push({ item, index });
        });

        mesActualLabel.textContent = `— ${mesLabel(curY, curM)}`;

        // ── Mes actual ──
        let totalGanado = 0;
        let completados = 0;

        actuales.forEach(({ item, index }) => {
            const pago = calcularPago(item.day, item.pago);
            if (item.completed) {
                completados++;
                totalGanado += pago;
            }
            dataList.appendChild(buildShiftLi(item, index, pago));
        });

        document.getElementById('totalTurnos').textContent       = actuales.length;
        document.getElementById('totalGanado').textContent       = formatPeso(totalGanado);
        document.getElementById('turnosCompletados').textContent = completados;
        document.getElementById('turnosPendientes').textContent  = actuales.length - completados;
        document.getElementById('turnosCount').textContent       = `${actuales.length} turno${actuales.length !== 1 ? 's' : ''}`;

        emptyState.style.display = actuales.length === 0 ? 'block' : 'none';

        // ── Historial (meses anteriores, más reciente primero) ──
        const meses = [...historial.values()].sort((a, b) => (b.year - a.year) || (b.month - a.month));
        let historialTotal = 0;

        meses.forEach(mes => {
            const key = `${mes.year}-${String(mes.month).padStart(2, '0')}`;
            let subtotal = 0;
            const ul = document.createElement('ul');
            ul.className = 'shift-list';

            mes.items.forEach(({ item, index }) => {
                const pago = calcularPago(item.day, item.pago);
                if (item.completed) subtotal += pago;
                ul.appendChild(buildShiftLi(item, index, pago));
            });

            const details = document.createElement('details');
            details.className = 'historial-month';
            details.dataset.key = key;
            if (mesesAbiertos.has(key)) details.open = true;
            details.innerHTML = `
                <summary>
                    <span class="historial-name">${esc(mesLabel(mes.year, mes.month))}</span>
                    <span class="historial-sub">${mes.items.length} turno${mes.items.length !== 1 ? 's' : ''} · ${formatPeso(subtotal)}</span>
                </summary>`;
            details.appendChild(ul);
            historialContainer.appendChild(details);

            historialTotal += mes.items.length;
        });

        document.getElementById('historialCount').textContent = `${historialTotal} turno${historialTotal !== 1 ? 's' : ''}`;
        historialEmptyState.style.display = meses.length === 0 ? 'block' : 'none';
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
        const i = index - jampierDatabase.length - jampierAgenda.length;
        userData[i].completed = !userData[i].completed;
        localStorage.setItem('asovicobe_data', JSON.stringify(userData));
        renderData();
    };

    window.deleteData = (index) => {
        const userData = JSON.parse(localStorage.getItem('asovicobe_data')) || [];
        userData.splice(index - jampierDatabase.length - jampierAgenda.length, 1);
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
