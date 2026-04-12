// Animate skills timeline items
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

document.addEventListener("DOMContentLoaded", function() {
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
});
