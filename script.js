document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // State
  let journeyUnlocked = localStorage.getItem("questacademy-journey") === "true";
  let radarUnlocked = localStorage.getItem("questacademy-radar") === "true";

  // Check locks on page load
  updateLocks();

  // Navigation locks
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const isLocked = link.classList.contains('locked');
      if (isLocked) {
        e.preventDefault();
      }
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('nav-open');
    });
  }

  // Home Page logic -> If Journey Unlocked, show correct button
  const homeActions = document.getElementById("home-actions");
  if (homeActions) {
    if (journeyUnlocked) {
      homeActions.innerHTML = `
        <a href="journey.html" class="btn btn-lg glow-md" style="padding: 1.5rem 2rem;">
          <i data-lucide="rocket" class="w-5 h-5"></i> Start Journey
        </a>
        <a href="rules.html" class="btn btn-lg btn-outline" style="padding: 1.5rem 2rem; border-color: rgba(255,255,255,0.2);">
          <i data-lucide="book-open" class="w-5 h-5"></i> View Rules
        </a>
      `;
      const granted = document.createElement('div');
      granted.className = "mt-6 text-primary animate-fade-in-up flex justify-center items-center gap-2 text-sm";
      granted.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4"></i><span>Journey Access Granted</span>`;
      homeActions.parentElement.appendChild(granted);
      lucide.createIcons();
    }
  }

  // Modal unlocking logic
  const homeUnlockBtn = document.getElementById("home-unlock-btn");
  const accessModal = document.getElementById("access-modal");
  const modalClose = document.getElementById("modal-close");
  const accessForm = document.getElementById("access-form");
  const accessInput = document.getElementById("access-input");
  const accessError = document.getElementById("access-error");
  const accessSuccess = document.getElementById("access-success");
  
  if (homeUnlockBtn && accessModal) {
    homeUnlockBtn.addEventListener("click", () => {
      accessModal.classList.add("active");
      accessInput.focus();
    });
    
    modalClose.addEventListener("click", () => {
      accessModal.classList.remove("active");
    });

    accessModal.addEventListener("click", (e) => {
      if (e.target === accessModal) accessModal.classList.remove("active");
    });
    
    accessForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = accessInput.value.trim().toLowerCase();
      
      if (code === "journey") {
        journeyUnlocked = true;
        localStorage.setItem("questacademy-journey", "true");
        accessError.classList.add("hidden");
        accessSuccess.classList.remove("hidden");
        accessSuccess.innerHTML = '<i data-lucide="check-circle-2" style="width: 16px;"></i><span>Journey unlocked!</span>';
        lucide.createIcons();
        updateLocks();
        
        setTimeout(() => {
          accessModal.classList.remove("active");
          accessSuccess.classList.add("hidden");
          accessInput.value = "";
          location.reload(); // Refresh to update hero button
        }, 1500);
      } else if (code === "radar") {
        radarUnlocked = true;
        localStorage.setItem("questacademy-radar", "true");
        accessError.classList.add("hidden");
        accessSuccess.classList.remove("hidden");
        accessSuccess.innerHTML = '<i data-lucide="check-circle-2" style="width: 16px;"></i><span>Radar unlocked!</span>';
        lucide.createIcons();
        updateLocks();
        
        setTimeout(() => {
          accessModal.classList.remove("active");
          accessSuccess.classList.add("hidden");
          accessInput.value = "";
        }, 1500);
      } else {
        accessError.classList.remove("hidden");
        accessSuccess.classList.add("hidden");
      }
    });
  }

  function updateLocks() {
    document.querySelectorAll('[data-protected]').forEach(el => {
      const key = el.getAttribute('data-protected');
      if (key === 'journey') {
        if (!journeyUnlocked) {
          el.classList.add('locked');
          if (el.querySelector('.lock-icon')) el.querySelector('.lock-icon').classList.remove('hidden');
        } else {
          el.classList.remove('locked');
          if (el.querySelector('.lock-icon')) el.querySelector('.lock-icon').classList.add('hidden');
        }
      }
      
      if (key === 'radar') {
        if (!radarUnlocked) {
          el.classList.add('locked');
          if (el.querySelector('.lock-icon')) el.querySelector('.lock-icon').classList.remove('hidden');
        } else {
          el.classList.remove('locked');
          if (el.querySelector('.lock-icon')) el.querySelector('.lock-icon').classList.add('hidden');
        }
      }
    });
  }

  // --- Journey Logic ---
  const stages = document.querySelectorAll('.journey-card');
  const radarModal = document.getElementById("radar-modal");
  const radarModalClose = document.getElementById("radar-modal-close");
  const radarUnlockBtn = document.getElementById("radar-unlock-btn");
  const radarForm = document.getElementById("radar-form");
  const radarInput = document.getElementById("radar-input");
  const radarError = document.getElementById("radar-error");
  const radarSuccess = document.getElementById("radar-success");
  const journeyLockScreen = document.getElementById("journey-lock-screen");
  const journeyContent = document.getElementById("journey-content");

  if (journeyLockScreen && journeyContent) {
    if (journeyUnlocked) {
      journeyLockScreen.classList.add("hidden");
      journeyContent.classList.remove("hidden");
    } else {
      journeyLockScreen.classList.remove("hidden");
      journeyContent.classList.add("hidden");
    }
  }

  let completedSteps = [];
  let currentStep = 1;

  function updateJourneyCards() {
    stages.forEach(card => {
      const stepId = parseInt(card.getAttribute('data-step'));
      const badge = card.querySelector('.journey-badge');
      const iconWrap = card.querySelector('.icon-wrap');
      
      card.classList.remove('active', 'locked', 'completed');
      badge.classList.remove('bg-primary', 'text-black', 'bg-secondary', 'text-muted');
      iconWrap.classList.remove('bg-primary', 'text-primary', 'bg-secondary');
      
      if (completedSteps.includes(stepId)) {
        card.classList.add('completed');
        badge.innerHTML = '<i data-lucide="check-circle-2" style="width: 14px;"></i>';
        badge.style.backgroundColor = 'var(--primary)';
        badge.style.color = 'var(--foreground)';
        iconWrap.style.color = 'var(--primary)';
      } else if (stepId === currentStep) {
        card.classList.add('active');
        badge.innerText = stepId;
        badge.style.backgroundColor = 'var(--secondary)';
        iconWrap.style.color = 'var(--primary)';
      } else if (stepId > currentStep) {
        card.classList.add('locked');
        badge.innerText = stepId;
        badge.style.backgroundColor = 'rgba(255,255,255,0.1)';
        iconWrap.style.color = 'var(--muted-foreground)';
      }
    });
    lucide.createIcons();

    const progressIndicator = document.getElementById('journey-progress-text');
    if (progressIndicator) {
      progressIndicator.innerText = `${completedSteps.length}/${stages.length}`;
    }

    if (completedSteps.length === stages.length) {
      document.getElementById("exploration-phase").classList.remove("hidden");
      if (radarUnlocked) {
        document.getElementById("nav-to-radar-btn").classList.remove("hidden");
        if(radarUnlockBtn) radarUnlockBtn.classList.add("hidden");
      }
    }
  }

  if (stages.length > 0) {
    updateJourneyCards();

    stages.forEach(card => {
      card.addEventListener('click', () => {
        const stepId = parseInt(card.getAttribute('data-step'));
        if (stepId === currentStep && !completedSteps.includes(stepId)) {
          completedSteps.push(stepId);
          currentStep++;
          updateJourneyCards();
        }
      });
    });
  }
  
  if (radarUnlockBtn && radarModal) {
    radarUnlockBtn.addEventListener("click", () => {
      radarModal.classList.add("active");
      radarInput.focus();
    });
    
    radarModalClose.addEventListener("click", () => {
      radarModal.classList.remove("active");
    });

    radarForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = radarInput.value.trim().toLowerCase();
      
      if (code === "radar") {
        radarUnlocked = true;
        localStorage.setItem("questacademy-radar", "true");
        radarError.classList.add("hidden");
        radarSuccess.classList.remove("hidden");
        radarSuccess.innerHTML = '<i data-lucide="check-circle-2" style="width: 16px;"></i><span>Radar unlocked!</span>';
        lucide.createIcons();
        updateLocks();
        
        setTimeout(() => {
          radarModal.classList.remove("active");
          radarSuccess.classList.add("hidden");
          radarInput.value = "";
          location.reload(); // refresh to show radar button wrapper
        }, 1500);
      } else {
        radarError.classList.remove("hidden");
        radarSuccess.classList.add("hidden");
      }
    });
  }

  // --- Radar Page Logic ---
  const challengeButtons = document.querySelectorAll('.challenge-btn');
  const radarLockScreen = document.getElementById("radar-lock-screen");
  const radarContent = document.getElementById("radar-content");

  if (radarLockScreen && radarContent) {
    if (radarUnlocked) {
      radarLockScreen.classList.add("hidden");
      radarContent.classList.remove("hidden");
    } else {
      radarLockScreen.classList.remove("hidden");
      radarContent.classList.add("hidden");
    }
  }

  let completedChallenges = [];
  let currentChallenge = 1;

  function updateChallenges() {
    let allComplete = false;
    challengeButtons.forEach(btn => {
      const id = parseInt(btn.getAttribute('data-id'));
      btn.classList.remove('active', 'locked', 'completed');
      btn.style.backgroundColor = 'rgba(255,255,255,0.05)';
      btn.style.color = 'var(--muted-foreground)';
      btn.style.border = '1px solid transparent';
      
      if (completedChallenges.includes(id)) {
        btn.classList.add('completed');
        btn.innerHTML = '<i data-lucide="check-circle-2" class="w-5 h-5"></i>';
        btn.style.backgroundColor = 'rgba(166, 51, 230, 0.2)';
        btn.style.color = 'var(--primary)';
        btn.style.border = '2px solid var(--primary)';
      } else if (id === currentChallenge) {
        btn.classList.add('active');
        btn.innerHTML = `<span class="text-sm font-bold" style="font-size: 1rem;">${id}</span>`;
        btn.style.backgroundColor = 'rgba(166, 51, 230, 0.1)';
        btn.style.color = 'var(--foreground)';
        btn.style.border = '2px solid rgba(166, 51, 230, 0.7)';
      } else if (id > currentChallenge) {
        btn.classList.add('locked');
        btn.innerHTML = '<i data-lucide="lock" class="w-4 h-4" style="opacity: 0.5;"></i>';
      }
    });
    lucide.createIcons();

    const helperText = document.getElementById("challenge-helper");
    if (completedChallenges.length === challengeButtons.length && challengeButtons.length > 0) {
      document.getElementById("challenge-congrats")?.classList.remove("hidden");
      document.getElementById("challenge-wrapper")?.classList.add("hidden");
      if(helperText) helperText.classList.add("hidden");
    } else {
      if(helperText) helperText.innerText = `Click challenge ${currentChallenge} to complete it`;
    }
  }

  if (challengeButtons.length > 0) {
    updateChallenges();
    challengeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        if (id === currentChallenge && !completedChallenges.includes(id)) {
          completedChallenges.push(id);
          currentChallenge++;
          updateChallenges();
        }
      });
    });
  }

});
