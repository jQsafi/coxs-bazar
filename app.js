/**
 * Cox's Bazar Tourism Portal - Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initBeachStatusTicker();
  initAmbientSound();
  initFilterTabs();
  initItineraryTabs();
  initLightbox();
  initMap();
  initBackToTop();
});

/* ==========================================================================
   0. Hero Background Slider & Carousel
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('sliderPrevBtn');
  const nextBtn = document.getElementById('sliderNextBtn');
  const heroSection = document.getElementById('home');

  if (!slides.length) return;

  let currentIndex = 0;
  let slideInterval = null;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentIndex = index;
  }

  function nextSlide() {
    let nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    let prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoSlide();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      showSlide(idx);
      startAutoSlide();
    });
  });

  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoSlide);
    heroSection.addEventListener('mouseleave', startAutoSlide);
  }

  startAutoSlide();
}

/* ==========================================================================
   1. Navbar Scrolling & Mobile Drawer
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Spy for active link
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('active');
    });
    if (drawerClose) {
      drawerClose.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
      });
    }
    mobileDrawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
      });
    });
  }
}

/* ==========================================================================
   2. Live Beach Status & Tide Simulation
   ========================================================================== */
function initBeachStatusTicker() {
  const timeEl = document.getElementById('liveTime');
  const sunsetEl = document.getElementById('sunsetCountdown');
  const tideEl = document.getElementById('liveTide');

  function updateTimes() {
    const now = new Date();
    // Format Bangladesh Time (BST is UTC+6)
    const options = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-US', options) + ' BST';
    }

    // Calculate Sunset (Approx ~6:15 PM in Cox's Bazar)
    const bstHour = (now.getUTCHours() + 6) % 24;
    const bstMin = now.getUTCMinutes();
    const currentMins = bstHour * 60 + bstMin;
    const sunsetMins = 18 * 60 + 15; // 6:15 PM
    
    if (sunsetEl) {
      if (currentMins < sunsetMins) {
        const diff = sunsetMins - currentMins;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        sunsetEl.textContent = `Sunset in ${h}h ${m}m (6:15 PM)`;
      } else {
        sunsetEl.textContent = 'Golden Sunset Passed (Tomorrow 5:48 AM Sunrise)';
      }
    }

    // Tide simulation (Tides shift ~every 6 hours)
    if (tideEl) {
      const tideCycle = (bstHour % 6);
      if (tideCycle < 3) {
        tideEl.textContent = 'Low Tide (Receding - Safe Beach Walks)';
      } else {
        tideEl.textContent = 'High Tide (Surfing & Swells - Caution)';
      }
    }
  }

  updateTimes();
  setInterval(updateTimes, 1000);
}

/* ==========================================================================
   3. Web Audio API Ambient Ocean Wave Sound Synthesizer
   ========================================================================== */
let audioCtx = null;
let isAudioPlaying = false;
let waveNodes = [];

function initAmbientSound() {
  const soundBtn = document.getElementById('soundToggleBtn');
  const soundStatusText = document.getElementById('soundStatusText');
  if (!soundBtn) return;

  soundBtn.addEventListener('click', () => {
    if (!isAudioPlaying) {
      startAmbientOcean();
      soundBtn.classList.add('playing');
      soundBtn.innerHTML = '<span>🔊</span> <span id="soundStatusText">Waves: On</span>';
      isAudioPlaying = true;
    } else {
      stopAmbientOcean();
      soundBtn.classList.remove('playing');
      soundBtn.innerHTML = '<span>🌊</span> <span id="soundStatusText">Beach Vibe</span>';
      isAudioPlaying = false;
    }
  });
}

function startAmbientOcean() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Generate Pink Noise for soothing ocean surf
    const bufferSize = audioCtx.sampleRate * 4;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to give deep sea wash texture
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);

    // LFO to simulate rhythmic wave ebb & flow
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime); // Wave every ~8 seconds

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(250, audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(audioCtx.destination);

    whiteNoise.start();
    lfo.start();

    waveNodes = [whiteNoise, lfo, mainGain];
  } catch (err) {
    console.warn('Web Audio Ambient Wave initialization:', err);
  }
}

function stopAmbientOcean() {
  if (waveNodes.length > 0) {
    waveNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    waveNodes = [];
  }
}

/* ==========================================================================
   4. Destination Category Filter Tabs
   ========================================================================== */
function initFilterTabs() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.dest-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   5. Curated Travel Itinerary Switcher Tabs
   ========================================================================== */
function initItineraryTabs() {
  const tabBtns = document.querySelectorAll('.itinerary-tab-btn');
  const panes = document.querySelectorAll('.itinerary-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = `itin-${btn.dataset.itinerary}`;
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   6. Lightbox Photo Gallery
   ========================================================================== */
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');

  if (!modal || !modalImg) return;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.dataset.caption || img.alt || "Cox's Bazar Sea Beach";
      modalImg.src = img.src;
      if (modalCaption) modalCaption.textContent = caption;
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

/* ==========================================================================
   7. Interactive Tourist Map (Leaflet.js)
   ========================================================================== */
function initMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer || typeof L === 'undefined') return;

  // Initialize map centered around Cox's Bazar main beach area
  // Coordinates: 21.4272° N, 91.9722° E (approx)
  const map = L.map('map-container').setView([21.4272, 91.9722], 12);

  // Use standard OpenStreetMap tiles (100% free, no API key required)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  // Custom icon for pins
  const customIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Markers Data
  const locations = [
    { name: "Laboni Beach", coords: [21.4172, 91.9722], desc: "Main beach center, popular for sunsets and nightlife." },
    { name: "Sugandha Point", coords: [21.4200, 91.9750], desc: "Famous for beachfront seafood stalls and Burmese markets." },
    { name: "Inani Beach", coords: [21.1883, 92.0436], desc: "Coral boulder beach, peaceful and perfect for photography." },
    { name: "Himchari National Park", coords: [21.3533, 91.9961], desc: "Scenic hill viewpoint and natural waterfalls." }
  ];

  // Add markers to the map
  locations.forEach(loc => {
    L.marker(loc.coords, { icon: customIcon })
      .addTo(map)
      .bindPopup(`<strong>${loc.name}</strong><br>${loc.desc}`);
  });
}

/* ==========================================================================
   9. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
