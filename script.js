document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('nav-open');
    });
  }

  // --- Journey Logic ---
  const stages = document.querySelectorAll('.journey-card');
  let completedSteps = [];
  let currentStep = 1;

  function updateJourneyCards() {
    stages.forEach(card => {
      const stepId = parseInt(card.getAttribute('data-step'));
      const badge = card.querySelector('.journey-badge');
      const iconWrap = card.querySelector('.icon-wrap');
      
      card.classList.remove('active', 'locked', 'completed');
      
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

    if (completedSteps.length === stages.length && stages.length > 0) {
      const explorationPhase = document.getElementById("exploration-phase");
      if (explorationPhase) explorationPhase.classList.remove("hidden");
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

  // --- Radar Page Logic ---
  const challengeButtons = document.querySelectorAll('.challenge-btn');
  let completedChallenges = [];
  let currentChallenge = 1;

  function updateChallenges() {
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
