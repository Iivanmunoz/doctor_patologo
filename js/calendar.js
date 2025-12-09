/* calendar.js – refactored para “mes → horarios → formulario” */
document.addEventListener('DOMContentLoaded', () => {
  const calendarEl   = document.getElementById('calendar');
  const modal        = document.getElementById('appointmentModal');
  const form         = document.getElementById('form-reserva');
  const slotsWrapper = document.createElement('div'); // contenedor dinámico
  slotsWrapper.className = 'slots-wrapper';
  form.before(slotsWrapper);

  let calendar      = null;
  let selectedSlot  = null;   // fecha+hora completa seleccionada
  let selectedDate  = null;   // día que pinchó el usuario

  /* 1. Eventos de muestra (puedes conectar tu API después) */
  const sampleEvents = [
    { title:'Consulta General - Juan Pérez', start:'2024-12-05T09:00:00', end:'2024-12-05T09:30:00', backgroundColor:'#64ffda', borderColor:'#64ffda', textColor:'#0a192f' },
    { title:'Revisión - María López',      start:'2024-12-05T11:00:00', end:'2024-12-05T11:30:00', backgroundColor:'#64ffda', borderColor:'#64ffda', textColor:'#0a192f' },
    { title:'Consulta - Carlos Ruiz',      start:'2024-12-06T10:00:00', end:'2024-12-06T10:30:00', backgroundColor:'#64ffda', borderColor:'#64ffda', textColor:'#0a192f' },
    { title:'Biopsia - Ana García',        start:'2024-12-09T14:00:00', end:'2024-12-09T14:30:00', backgroundColor:'#64ffda', borderColor:'#64ffda', textColor:'#0a192f' }
  ];

  /* 2. Generar horarios disponibles de 8:00-18:00 (30 min) para un día dado */
  function generateSlots(day) {
    const slots = [];
    const start = new Date(day);
    start.setHours(8, 0, 0, 0);
    const end = new Date(day);
    end.setHours(18, 0, 0, 0);

    while (start < end) {
      const iso = start.toISOString();
      /* ocupado = evento que coincide con este slot */
      const busy = sampleEvents.some(ev =>
        new Date(ev.start) <= start && new Date(ev.end) > start
      );
      slots.push({ iso, time: start.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit', hour12:false}), busy });
      start.setMinutes(start.getMinutes() + 30);
    }
    return slots;
  }

  /* 3. Renderizar botones de horarios dentro del modal */
  function renderSlots(slots) {
    slotsWrapper.innerHTML = '<p><strong>Horarios disponibles el día seleccionado:</strong></p>';
    slots.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = s.busy ? 'slot-btn busy' : 'slot-btn free';
      btn.textContent = s.time;
      if (!s.busy) {
        btn.addEventListener('click', () => {
          selectedSlot = new Date(s.iso);
          showForm();           // pasamos a la pantalla de formulario
        });
      }
      slotsWrapper.appendChild(btn);
    });
  }

  /* 4. Mostrar/ocultar pantallas dentro del modal */
  function showSlots() {
    slotsWrapper.style.display = 'block';
    form.style.display        = 'none';
    document.getElementById('modalSubtitle').textContent = 'Selecciona un horario disponible:';
  }
  function showForm() {
    slotsWrapper.style.display = 'none';
    form.style.display         = 'block';
    /* rellenar fecha/hora en el form */
    document.getElementById('selectedDate').textContent = selectedSlot.toLocaleDateString('es-ES', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
    document.getElementById('selectedTime').textContent = selectedSlot.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit', hour12:false});
    document.getElementById('modalSubtitle').textContent = 'Completa el formulario para confirmar tu cita:';
  }

  /* 5. Abrir modal (viene del dateClick) */
  function openModal(dayDate) {
    selectedDate = dayDate;
    renderSlots(generateSlots(dayDate));
    showSlots();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    form.reset();
    selectedSlot = null;
    selectedDate = null;
  }

  /* 6. Inicializar FullCalendar – solo vista mes */
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: false,   // usamos los botones propios
    height: 'auto',
    events: sampleEvents,   // cambia por tu endpoint cuando tengas API
    dateClick(info) {
      const now = new Date();
      if (info.date < now.setHours(0,0,0,0)) {
        showAlert('❌ No puedes agendar citas en fechas pasadas', 'error');
        return;
      }
      openModal(info.date);
    },
    eventClick(info) {
      showAlert(`📋 Cita existente: ${info.event.title}`, 'info');
      info.jsEvent.preventDefault();
    }
  });
  calendar.render();

  /* 7. Navegación mes anterior/siguiente / hoy */
  document.getElementById('prevBtn')?.addEventListener('click', () => calendar.prev());
  document.getElementById('nextBtn')?.addEventListener('click', () => calendar.next());
  document.getElementById('todayBtn')?.addEventListener('click', () => calendar.today());

  /* 8. Cerrar modal */
  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  modal.querySelector('.appointment-modal__overlay')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

  /* 9. Envío del formulario (mismo comportamiento que antes) */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.datetime_start = selectedSlot.toISOString();
    data.duration_minutes = 30;

    try {
      /* simulación */
      await new Promise(r => setTimeout(r, 800));
      showAlert('✅ Cita agendada. Revisa tu correo.', 'success');
      closeModal();
      calendar.refetchEvents(); // cuando uses API real
      /* Aquí iría el fetch real a tu endpoint cuando lo tengas */
    } catch (err) {
      console.error(err);
      showAlert('❌ Error al reservar. Intenta nuevamente.', 'error');
    }
  });

  /* 10. Sistema de alertas (sin cambios) */
  function showAlert(msg, type = 'info') {
    const box = document.getElementById('customAlert');
    if (!box) return;
    box.querySelector('.custom-alert__content').textContent = msg;
    box.classList.add('show');
    setTimeout(() => box.classList.remove('show'), 4000);
  }

  /* 11. Tema oscuro / claro (sin cambios) */
  const observer = new MutationObserver(() => calendar.render());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  console.log('📅 Calendario mes+horarios+formulario cargado');
});