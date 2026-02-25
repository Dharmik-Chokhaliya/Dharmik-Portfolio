function animateOnScroll(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      observer.unobserve(entry.target);
    }
  });
}


const sectionObserver = new IntersectionObserver(animateOnScroll, {
  threshold: 0.2
});

sectionObserver.observe(document.querySelector('.about-section'));

const sectionTitle = document.querySelector('.section-title');
if (sectionTitle) {
  const titleObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sectionTitle.classList.add('visible');
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  titleObserver.observe(sectionTitle);
}

const items = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      timelineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
items.forEach(item => {
  timelineObserver.observe(item);
});

// Smooth scroll
if (typeof SmoothScroll !== 'undefined') {
  var scroll = new SmoothScroll('a[href*="#"]', {
    speed: 800
  });
}

document.addEventListener("DOMContentLoaded", () => {
    const logo = document.querySelector(".logo");
    const homeContent = document.querySelector(".home-content");
    const socialIcons = document.querySelector(".social-icons");
    const navbar = document.querySelector(".navbar");

    setTimeout(() => {
        if (logo) {
            logo.style.transform = "translateX(0)";
            logo.style.opacity = "1";
        }
    }, 500);

    setTimeout(() => {
        if (homeContent) {
            homeContent.style.transform = "translateX(0)";
            homeContent.style.opacity = "1";
        }
    }, 1500);

    setTimeout(() => {
        if (socialIcons) {
            socialIcons.style.transform = "translateY(0)";
            socialIcons.style.opacity = "1";
        }
    }, 2500);

    setTimeout(() => {
        if (navbar) {
            navbar.style.animation = "navbarSlideIn 1s ease forwards";
        }
    }, 1000);
});

const aboutLink = document.getElementById('about-link');
if (aboutLink) {
  aboutLink.addEventListener('click', function(e) {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Animate About Me table after scroll
const aboutCard = document.querySelector('.about-card');
const aboutGrids = document.querySelectorAll('.about-grid > div');
if (aboutCard) {
  const aboutObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        aboutCard.classList.add('animated');
        aboutGrids.forEach(div => div.classList.add('animated'));
        aboutObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });
  aboutObserver.observe(aboutCard);
}
