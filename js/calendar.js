// calendar.js - Versión mejorada con vistas múltiples
document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  const modal = document.getElementById("appointmentModal");
  const form = document.getElementById("form-reserva");
  let selectedSlot = null;
  let calendar = null;

  // Eventos de ejemplo (puedes eliminarlos cuando conectes con tu API)
  const sampleEvents = [
    {
      title: 'Consulta General - Juan Pérez',
      start: '2024-12-05T09:00:00',
      end: '2024-12-05T09:30:00',
      backgroundColor: '#64ffda',
      borderColor: '#64ffda',
      textColor: '#0a192f'
    },
    {
      title: 'Revisión - María López',
      start: '2024-12-05T11:00:00',
      end: '2024-12-05T11:30:00',
      backgroundColor: '#64ffda',
      borderColor: '#64ffda',
      textColor: '#0a192f'
    },
    {
      title: 'Consulta - Carlos Ruiz',
      start: '2024-12-06T10:00:00',
      end: '2024-12-06T10:30:00',
      backgroundColor: '#64ffda',
      borderColor: '#64ffda',
      textColor: '#0a192f'
    },
    {
      title: 'Biopsia - Ana García',
      start: '2024-12-09T14:00:00',
      end: '2024-12-09T14:30:00',
      backgroundColor: '#64ffda',
      borderColor: '#64ffda',
      textColor: '#0a192f'
    }
  ];

  // Inicializar FullCalendar
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: 'es',
    headerToolbar: false, // Usamos controles personalizados
    slotMinTime: "08:00:00",
    slotMaxTime: "18:00:00",
    slotDuration: "00:30:00",
    allDaySlot: false,
    height: "auto",
    expandRows: true,
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    
    // Usar eventos de ejemplo o conectar con API
    events: sampleEvents,
    // Para usar tu API, descomenta la siguiente línea:
    // events: "/api/availability",
    
    // Cuando se hace clic en una fecha/hora
    dateClick(info) {
      const now = new Date();
      
      // No permitir agendar en fechas pasadas
      if (info.date < now) {
        showAlert('❌ No puedes agendar citas en fechas pasadas', 'error');
        return;
      }
      
      selectedSlot = info.date;
      openModal(info.date);
    },

    // Cuando se hace clic en un evento existente
    eventClick(info) {
      showAlert(`📋 Cita: ${info.event.title}`, 'info');
      info.jsEvent.preventDefault();
    }
  });

  calendar.render();

  // ============================================
  // CONTROLES DE NAVEGACIÓN PERSONALIZADOS
  // ============================================
  
  document.getElementById('prevBtn').addEventListener('click', () => {
    calendar.prev();
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    calendar.next();
  });

  document.getElementById('todayBtn').addEventListener('click', () => {
    calendar.today();
  });

  // ============================================
  // CAMBIAR VISTA (DÍA, SEMANA, MES, AÑO)
  // ============================================
  
  document.querySelectorAll('.calendar-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualizar botón activo
      document.querySelectorAll('.calendar-view-btn').forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      
      // Cambiar vista del calendario
      const view = btn.dataset.view;
      calendar.changeView(view);
    });
  });

  // ============================================
  // FUNCIONES DEL MODAL
  // ============================================
  
  function openModal(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const timeOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };

    // Actualizar información en el modal
    document.getElementById('selectedDate').textContent = 
      date.toLocaleDateString('es-ES', options);
    document.getElementById('selectedTime').textContent = 
      date.toLocaleTimeString('es-ES', timeOptions);
    document.getElementById('modalSubtitle').textContent = 
      'Complete el formulario para confirmar su cita';
    
    // Mostrar modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
    form.reset();
    selectedSlot = null;
  }

  // Cerrar modal con botón X
  document.getElementById('closeModal').addEventListener('click', closeModal);

  // Cerrar modal al hacer clic en el overlay
  modal.querySelector('.appointment-modal__overlay').addEventListener('click', closeModal);

  // Cerrar modal con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // ============================================
  // ENVIAR FORMULARIO DE RESERVA
  // ============================================
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Recopilar datos del formulario
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.datetime_start = selectedSlot.toISOString();
    data.duration_minutes = 30;

    try {
      // OPCIÓN 1: Simulación (para desarrollo)
      // Comentar esto cuando tengas el backend listo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showAlert('✅ ¡Cita agendada exitosamente! Recibirás un correo de confirmación.', 'success');
      
      closeModal();
      calendar.refetchEvents(); // Recargar eventos
      
      // OPCIÓN 2: Llamada real a la API
      // Descomentar esto cuando tengas tu backend configurado
      /*
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        const result = await res.json();
        showAlert('✅ ¡Cita agendada exitosamente! Revisa tu correo.', 'success');
        closeModal();
        calendar.refetchEvents();
      } else {
        const err = await res.json();
        showAlert(`❌ ${err.message || "Error al reservar la cita"}`, 'error');
      }
      */
    } catch (error) {
      console.error('Error:', error);
      showAlert("❌ Error al procesar la solicitud. Intenta nuevamente.", 'error');
    }
  });

  // ============================================
  // SISTEMA DE ALERTAS
  // ============================================
  
  function showAlert(message, type = 'info') {
    const alert = document.getElementById('customAlert');
    const content = alert.querySelector('.custom-alert__content');
    
    content.textContent = message;
    alert.classList.add('show');

    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      alert.classList.remove('show');
    }, 4000);
  }

  // ============================================
  // HELPER: Formatear fecha para display
  // ============================================
  
  function formatDate(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
  }

  // ============================================
  // INICIALIZACIÓN ADICIONAL
  // ============================================
  
  // Ajustar tema del calendario según tema actual
  const currentTheme = document.documentElement.getAttribute('data-theme');
  updateCalendarTheme(currentTheme);

  // Observar cambios de tema
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const newTheme = document.documentElement.getAttribute('data-theme');
        updateCalendarTheme(newTheme);
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  function updateCalendarTheme(theme) {
    // Aquí podrías agregar lógica adicional si necesitas
    // actualizar colores específicos del calendario según el tema
    if (calendar) {
      calendar.render();
    }
  }

  // Log para debugging (eliminar en producción)
  console.log('📅 Calendario inicializado correctamente');
  console.log('Vista inicial:', calendar.view.type);
});