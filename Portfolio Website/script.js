/* Dark / light mode */
const themeToggle = document.getElementById('theme-toggle');

// Load the saved theme, otherwise use the system setting
if (localStorage.getItem('theme')) {
  document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

themeToggle.addEventListener('click', function () {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

/* Mobile menu */
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
const navAnchors = navLinks.querySelectorAll('a');

navToggle.addEventListener('click', function () {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('active');
  navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});

// Close the menu after clicking a link
navAnchors.forEach(function (link) {
  link.addEventListener('click', function () {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* Back-to-top button and active nav link */
const backToTop = document.getElementById('back-to-top');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', function () {
  // Show the button after scrolling down a bit
  if (window.scrollY > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }

  // Highlight the link of the section currently in view
  let current = 'home';
  sections.forEach(function (section) {
    if (window.scrollY >= section.offsetTop - 100) {
      current = section.id;
    }
  });

  navAnchors.forEach(function (link) {
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

backToTop.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* Current year in the footer */
document.getElementById('year').textContent = new Date().getFullYear();