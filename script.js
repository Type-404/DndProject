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

  // --- Puzzle Guide Toggle Buttons ---
  const answerToggleBtns = document.querySelectorAll('.answer-toggle-btn');
  const evolutionToggleBtns = document.querySelectorAll('.evolution-toggle-btn');

  answerToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role');
      const answerReveal = document.querySelector(`.answer-reveal[data-role="${role}"]`);
      const isVisible = answerReveal.style.display !== 'none';
      
      if (isVisible) {
        answerReveal.style.display = 'none';
        btn.innerHTML = '<i data-lucide="eye" style="width: 14px; height: 14px; display: inline-block; margin-right: 0.4rem;"></i>Show Answer';
      } else {
        answerReveal.style.display = 'block';
        btn.innerHTML = '<i data-lucide="eye-off" style="width: 14px; height: 14px; display: inline-block; margin-right: 0.4rem;"></i>Hide Answer';
      }
      lucide.createIcons();
    });
  });

  evolutionToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role');
      const evolutionReveal = document.querySelector(`.evolution-reveal[data-role="${role}"]`);
      const isVisible = evolutionReveal.style.display !== 'none';
      
      if (isVisible) {
        evolutionReveal.style.display = 'none';
        btn.innerHTML = '<i data-lucide="zap" style="width: 14px; height: 14px; display: inline-block; margin-right: 0.4rem;"></i>Show Evolution';
      } else {
        evolutionReveal.style.display = 'block';
        btn.innerHTML = '<i data-lucide="zap-off" style="width: 14px; height: 14px; display: inline-block; margin-right: 0.4rem;"></i>Hide Evolution';
      }
      lucide.createIcons();
    });
  });

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

  // --- Map download: print preview with image only (new window) ---
  const printMapBtn = document.getElementById('btn-print-map');
  const mapPreviewImg = document.querySelector('.map-download-preview-img');
  if (printMapBtn && mapPreviewImg) {
    printMapBtn.addEventListener('click', () => {
      const src = mapPreviewImg.currentSrc || mapPreviewImg.getAttribute('src');
      if (!src) return;

      const printWin = window.open('', '_blank', 'noopener,noreferrer');
      if (!printWin) {
        window.alert('Please allow pop-ups for this site to print the map.');
        return;
      }

      const doc = printWin.document;
      doc.open();
      doc.write('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Print map</title>');
      doc.write('<style>html,body{margin:0;padding:0;background:#fff}img{display:block;width:100%;max-width:100%;height:auto}@media print{img{page-break-inside:avoid}}</style>');
      doc.write('</head><body></body></html>');
      doc.close();

      const img = doc.createElement('img');
      img.alt = mapPreviewImg.getAttribute('alt') || 'Map';
      img.src = src;

      function runPrint() {
        printWin.focus();
        printWin.addEventListener('afterprint', () => {
          try {
            printWin.close();
          } catch (e) { /* ignore */ }
        }, { once: true });
        printWin.print();
        window.setTimeout(() => {
          try {
            if (printWin && !printWin.closed) printWin.close();
          } catch (e) { /* ignore */ }
        }, 500);
      }

      img.onerror = () => {
        try {
          printWin.close();
        } catch (e) { /* ignore */ }
        window.alert('Could not load the map image for printing.');
      };

      doc.body.appendChild(img);
      if (img.complete && img.naturalWidth > 0) {
        runPrint();
      } else {
        img.onload = () => runPrint();
      }
    });
  }

});
