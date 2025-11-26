document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  const form = document.getElementById("form-reserva");
  let selectedSlot = null;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    headerToolbar: { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" },
    slotMinTime: "08:00:00",
    slotMaxTime: "18:00:00",
    slotDuration: "00:30:00",
    allDaySlot: false,
    height: 400, // más pequeño
    events: "/api/availability", // ← endpoint que haremos después
    dateClick(info) {
      const now = new Date();
      if (info.date < now) return;
      selectedSlot = info.date;
      form.classList.remove("hidden");
      form.scrollIntoView({ behavior: "smooth" });
    }
  });

  calendar.render();

  // POST de la reserva
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.datetime_start = selectedSlot.toISOString();
    data.duration_minutes = 30;

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("Cita reservada. Revisa tu correo.");
      form.reset();
      form.classList.add("hidden");
      calendar.refetchEvents();
    } else {
      const err = await res.json();
      alert(err.message || "Error al reservar");
    }
  });
});