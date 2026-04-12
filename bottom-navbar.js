// Enhanced Bottom Navbar JavaScript
class BottomNavbar {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const hash = window.location.hash;
    
    // Map file names and sections to navigation items
    if (page === 'index.html' || page === '') {
      if (hash === '#about') return 'about';
      if (hash === '#skills') return 'skills';
      return 'home';
    }
    if (page === 'projects.html') return 'projects';
    
    return 'home'; // default
  }

  createNavbar() {
    const navbar = document.createElement('div');
    navbar.className = 'bottom-navbar';
    navbar.innerHTML = `
      <div class="bottom-navbar-container">
        <a href="index.html" class="bottom-nav-item" data-page="home">
          <span class="bottom-nav-text">Home</span>
        </a>
        <a href="index.html#about" class="bottom-nav-item" data-page="about">
          <span class="bottom-nav-text">About Me</span>
        </a>
        <a href="projects.html" class="bottom-nav-item" data-page="projects">
          <span class="bottom-nav-text">Projects</span>
        </a>
        <a href="index.html#skills" class="bottom-nav-item" data-page="skills">
          <span class="bottom-nav-text">My Skills</span>
        </a>
      </div>
    `;
    
    return navbar;
  }

  setActiveItem() {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === this.currentPage) {
        item.classList.add('active');
      }
    });
  }

  addEventListeners() {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        // Remove active class from all items
        navItems.forEach(navItem => navItem.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');
        
        // Enhanced click animation
        item.style.transform = 'translateY(-3px) scale(0.95)';
        setTimeout(() => {
          item.style.transform = '';
        }, 200);

        // Handle internal page navigation
        const href = item.getAttribute('href');
        if (href.includes('#') && href.startsWith('index.html')) {
          e.preventDefault();
          const targetSection = href.split('#')[1];
          
          if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            // Already on index page, just scroll
            this.scrollToSection(targetSection);
          } else {
            // Navigate to index page first, then scroll
            window.location.href = href;
          }
        }
      });

      // Enhanced hover effects
      item.addEventListener('mouseenter', () => {
        if (!item.classList.contains('active')) {
          item.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
      });

      item.addEventListener('mouseleave', () => {
        item.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
    });
  }

  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      const offsetTop = section.offsetTop - 100; // Account for any fixed headers
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      history.pushState(null, null, `#${sectionId}`);
      
      // Update active state
      this.currentPage = sectionId;
      this.setActiveItem();
    }
  }

  addScrollEffect() {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const navbar = document.querySelector('.bottom-navbar');
    
    const updateNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Auto-hide navbar when scrolling down on mobile
      if (window.innerWidth <= 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
          navbar.style.transform = 'translate(-50%, 150%)';
        } else {
          navbar.style.transform = 'translate(-50%, 0)';
        }
      }
      
      lastScrollY = currentScrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    });

    // Show navbar on mouse movement near bottom
    window.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768 && e.clientY > window.innerHeight - 120) {
        navbar.style.transform = 'translate(-50%, 0)';
      }
    });
  }

  addHashChangeListener() {
    window.addEventListener('hashchange', () => {
      this.currentPage = this.getCurrentPage();
      this.setActiveItem();
    });
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupNavbar();
      });
    } else {
      this.setupNavbar();
    }
  }

  setupNavbar() {
    // Create and append navbar
    const navbar = this.createNavbar();
    document.body.appendChild(navbar);
    
    // Set active item and add functionality
    setTimeout(() => {
      this.setActiveItem();
      this.addEventListeners();
      this.addScrollEffect();
      this.addHashChangeListener();
    }, 100);
    
    // Load CSS if not already present
    this.loadCSS();
  }

  loadCSS() {
    // Check if CSS is already loaded
    if (!document.querySelector('link[href*="bottom-navbar.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'bottom-navbar.css';
      document.head.appendChild(link);
    }
  }
}

// Initialize the bottom navbar
const bottomNavbar = new BottomNavbar();

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BottomNavbar;
}
