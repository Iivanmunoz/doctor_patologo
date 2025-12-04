// Nav toggle
const toggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
toggle?.addEventListener('click', () => navList.classList.toggle('open'));

// Smooth scroll para enlaces
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const tgt = document.querySelector(a.getAttribute('href'));
    tgt?.scrollIntoView({ behavior: 'smooth' });
  });
});

const toggleButton = document.getElementById('theme-toggle');
const html = document.documentElement;

// Cargar tema desde localStorage
const currentTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', currentTheme);
updateIcon(currentTheme);

// Escuchar clic en el botón
toggleButton.addEventListener('click', () => {
  const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateIcon(newTheme);
});