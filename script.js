document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  try {
    if (typeof lucide !== "undefined") lucide.createIcons();
  } catch (e) {
    console.warn("Lucide icons failed:", e);
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('nav-open');
    });
  }

  const PUZZLE_IDEAS_KEY = "questAcademy_puzzleIdeas";

  function loadPuzzleIdeas() {
    try {
      const arr = JSON.parse(localStorage.getItem(PUZZLE_IDEAS_KEY) || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function savePuzzleIdeas(ideas) {
    localStorage.setItem(PUZZLE_IDEAS_KEY, JSON.stringify(ideas));
  }

  function ensureIdeaIds(ideas) {
    let changed = false;
    const out = ideas
      .filter((idea) => idea && typeof idea === "object")
      .map((idea) => {
        if (idea.id) return idea;
        changed = true;
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
        return { ...idea, id };
      });
    if (changed) savePuzzleIdeas(out);
    return out;
  }

  function renderCustomPuzzleIdeas(mount) {
    if (!mount) return;
    mount.innerHTML = "";
    const ideas = ensureIdeaIds(loadPuzzleIdeas()).sort(
      (a, b) => (b.savedAt || 0) - (a.savedAt || 0)
    );
    if (ideas.length === 0) {
      const empty = document.createElement("p");
      empty.className = "text-muted custom-puzzle-empty";
      empty.textContent =
        "No custom puzzle ideas yet. Add some from Creator → Add Puzzle Ideas.";
      mount.appendChild(empty);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "custom-puzzle-grid";

    ideas.forEach((idea) => {
      const id = String(idea.id);
      const roleAttr = id;

      const card = document.createElement("div");
      card.className = "glass-strong custom-puzzle-card";

      const header = document.createElement("div");
      header.className = "custom-puzzle-card__header";
      const roleLine = document.createElement("p");
      roleLine.className = "custom-puzzle-card__role-label";
      const roleStrong = document.createElement("strong");
      roleStrong.textContent = "Role: ";
      roleLine.appendChild(roleStrong);
      roleLine.appendChild(document.createTextNode((idea.role && idea.role.trim()) || "—"));

      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-outline-cyan custom-puzzle-delete";
      del.setAttribute("data-custom-id", id);
      del.setAttribute("aria-label", "Delete this puzzle idea");
      del.innerHTML =
        '<i data-lucide="trash-2" style="width:16px;height:16px;"></i> Delete';
      header.appendChild(roleLine);
      header.appendChild(del);

      const title = document.createElement("h2");
      title.className = "custom-puzzle-card__puzzle-title";
      title.textContent = (idea.title && idea.title.trim()) || "Untitled puzzle";

      function sectionWithIcon(label, body, iconName) {
        const wrap = document.createElement("div");
        wrap.className = "custom-puzzle-card__block";
        const h = document.createElement("h3");
        h.className = "custom-puzzle-card__block-title";
        const ic = document.createElement("i");
        ic.setAttribute("data-lucide", iconName || "puzzle");
        ic.setAttribute("style", "width:18px;height:18px;color:var(--primary);flex-shrink:0");
        h.appendChild(ic);
        h.appendChild(document.createTextNode(" " + label));
        const p = document.createElement("p");
        p.className = "custom-puzzle-card__block-body";
        p.style.whiteSpace = "pre-wrap";
        p.textContent = body && String(body).trim() ? String(body).trim() : "—";
        wrap.appendChild(h);
        wrap.appendChild(p);
        return wrap;
      }

      const puzzleBlock = sectionWithIcon("Puzzle", idea.description || "", "puzzle");
      const bossBlock = sectionWithIcon("Boss / Challenge", idea.boss || "", "shield");

      const notesWrap = document.createElement("div");
      notesWrap.className = "custom-puzzle-card__teacher-notes";
      const notesTitle = document.createElement("h3");
      notesTitle.className = "custom-puzzle-card__block-title";
      const notesIcon = document.createElement("i");
      notesIcon.setAttribute("data-lucide", "clipboard-list");
      notesIcon.setAttribute("style", "width:18px;height:18px;color:var(--primary);flex-shrink:0");
      notesTitle.appendChild(notesIcon);
      notesTitle.appendChild(document.createTextNode(" Teacher Notes"));
      const notesP = document.createElement("p");
      notesP.className = "custom-puzzle-card__block-body";
      notesP.style.whiteSpace = "pre-wrap";
      notesP.textContent =
        idea.teacherNotes && String(idea.teacherNotes).trim()
          ? String(idea.teacherNotes).trim()
          : "—";
      notesWrap.appendChild(notesTitle);
      notesWrap.appendChild(notesP);

      const btnRow = document.createElement("div");
      btnRow.className = "custom-puzzle-card__toggle-row";
      const answerBtn = document.createElement("button");
      answerBtn.type = "button";
      answerBtn.className = "answer-toggle-btn custom-puzzle-toggle-btn";
      answerBtn.setAttribute("data-role", roleAttr);
      answerBtn.innerHTML =
        '<i data-lucide="eye" style="width:14px;height:14px;display:inline-block;margin-right:0.4rem;"></i>Show Answer';
      const evoBtn = document.createElement("button");
      evoBtn.type = "button";
      evoBtn.className = "evolution-toggle-btn custom-puzzle-toggle-btn";
      evoBtn.setAttribute("data-role", roleAttr);
      evoBtn.innerHTML =
        '<i data-lucide="zap" style="width:14px;height:14px;display:inline-block;margin-right:0.4rem;"></i>Show Evolution';
      btnRow.appendChild(answerBtn);
      btnRow.appendChild(evoBtn);

      const answerReveal = document.createElement("div");
      answerReveal.className = "answer-reveal";
      answerReveal.setAttribute("data-role", roleAttr);
      answerReveal.style.display = "none";
      answerReveal.style.marginTop = "1.5rem";
      answerReveal.style.background = "rgba(0,229,255,0.06)";
      answerReveal.style.border = "1px solid rgba(0,229,255,0.25)";
      answerReveal.style.padding = "1rem";
      answerReveal.style.borderRadius = "0.5rem";
      const ah = document.createElement("h4");
      ah.style.cssText =
        "font-weight:600;font-size:0.9rem;color:var(--primary);margin:0 0 0.5rem 0";
      ah.textContent = "Answer";
      const ap = document.createElement("p");
      ap.style.cssText =
        "font-size:0.9rem;color:var(--muted-foreground);line-height:1.6;margin:0;white-space:pre-wrap";
      ap.textContent =
        idea.answer && String(idea.answer).trim() ? String(idea.answer).trim() : "—";
      answerReveal.appendChild(ah);
      answerReveal.appendChild(ap);

      const evoReveal = document.createElement("div");
      evoReveal.className = "evolution-reveal";
      evoReveal.setAttribute("data-role", roleAttr);
      evoReveal.style.display = "none";
      evoReveal.style.marginTop = "1.5rem";
      evoReveal.style.background = "rgba(0,229,255,0.06)";
      evoReveal.style.border = "1px solid rgba(0,229,255,0.25)";
      evoReveal.style.padding = "1rem";
      evoReveal.style.borderRadius = "0.5rem";
      const eh = document.createElement("h4");
      eh.style.cssText =
        "font-weight:600;font-size:0.9rem;color:var(--primary);margin:0 0 0.5rem 0";
      eh.textContent = "Evolution / Failure Result";
      const ep = document.createElement("p");
      ep.style.cssText =
        "font-size:0.9rem;color:var(--muted-foreground);line-height:1.6;margin:0;white-space:pre-wrap";
      ep.textContent =
        idea.evolution && String(idea.evolution).trim()
          ? String(idea.evolution).trim()
          : "—";
      evoReveal.appendChild(eh);
      evoReveal.appendChild(ep);

      card.appendChild(header);
      card.appendChild(title);
      card.appendChild(puzzleBlock);
      card.appendChild(bossBlock);
      card.appendChild(notesWrap);
      card.appendChild(btnRow);
      card.appendChild(answerReveal);
      card.appendChild(evoReveal);
      grid.appendChild(card);
    });

    mount.appendChild(grid);
  }

  // --- Puzzle Guide: Answer / Evolution toggles (delegated for built-in + custom cards) ---
  document.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".custom-puzzle-delete");
    if (delBtn) {
      e.preventDefault();
      const id = delBtn.getAttribute("data-custom-id");
      if (!id) return;
      if (!window.confirm("Delete this custom puzzle idea?")) return;
      const ideas = loadPuzzleIdeas().filter((x) => String(x.id) !== id);
      savePuzzleIdeas(ideas);
      const mount = document.getElementById("custom-puzzle-mount");
      if (mount) renderCustomPuzzleIdeas(mount);
      try {
        if (typeof lucide !== "undefined") lucide.createIcons();
      } catch (_) {
        /* ignore */
      }
      return;
    }

    const answerBtn = e.target.closest(".answer-toggle-btn");
    if (answerBtn) {
      const role = answerBtn.getAttribute("data-role");
      if (!role) return;
      const answerReveal = document.querySelector(`.answer-reveal[data-role="${role}"]`);
      if (!answerReveal) return;
      const isVisible = answerReveal.style.display !== "none";
      if (isVisible) {
        answerReveal.style.display = "none";
        answerBtn.innerHTML =
          '<i data-lucide="eye" style="width: 14px; height: 14px; display: inline-block; margin-right: 0.4rem;"></i>Show Answer';
      } else {
        answerReveal.style.display = "block";
        answerBtn.innerHTML =
          '<i data-lucide="eye-off" style="width: 14px; height: 14px; display: inline-block; margin-right: 0.4rem;"></i>Hide Answer';
      }
      try {
        if (typeof lucide !== "undefined") lucide.createIcons();
      } catch (_) {
        /* ignore */
      }
      return;
    }

    const evoBtn = e.target.closest(".evolution-toggle-btn");
    if (evoBtn) {
      const role = evoBtn.getAttribute("data-role");
      if (!role) return;
      const evolutionReveal = document.querySelector(`.evolution-reveal[data-role="${role}"]`);
      if (!evolutionReveal) return;
      const isVisible = evolutionReveal.style.display !== "none";
      if (isVisible) {
        evolutionReveal.style.display = "none";
        evoBtn.innerHTML =
          '<i data-lucide="zap" style="width: 14px; height: 14px; display: inline-block; margin-right: 0.4rem;"></i>Show Evolution';
      } else {
        evolutionReveal.style.display = "block";
        evoBtn.innerHTML =
          '<i data-lucide="zap-off" style="width: 14px; height: 14px; display: inline-block; margin-right: 0.4rem;"></i>Hide Evolution';
      }
      try {
        if (typeof lucide !== "undefined") lucide.createIcons();
      } catch (_) {
        /* ignore */
      }
    }
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

  function escapeHtmlAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  /**
   * Opens a new window with a single image and prints after load (map, character templates, etc.).
   */
  function openPrintWindowForImage(resolvedSrc, altText, opts) {
    const o = opts || {};
    const docTitle = o.docTitle || "Print";
    const loadingText = o.loadingText || "Preparing image for print…";
    const popupBlockedMsg = o.popupBlockedMsg || "Please allow pop-ups for this site to print.";
    const loadFailMsg = o.loadFailMsg || "Could not load the image for printing.";
    const prepFailMsg = o.prepFailMsg || "Could not prepare the print window.";

    if (!resolvedSrc) {
      window.alert(o.missingSrcMsg || loadFailMsg);
      return;
    }

    const printWin = window.open("", "_blank");
    if (!printWin) {
      window.alert(popupBlockedMsg);
      return;
    }

    const doc = printWin.document;
    const printCss =
      "html,body{margin:0;padding:0;background:#fff;font:14px system-ui,sans-serif}" +
      "#solo-print-loading{padding:1rem;margin:0}" +
      "img{display:block;width:100%;max-width:100%;height:auto;object-fit:contain}" +
      "@media print{#solo-print-loading{display:none}}" +
      "@media print{img{page-break-inside:avoid}}";

    doc.open();
    doc.write(
      "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>" +
        escapeHtmlAttr(docTitle) +
        "</title>"
    );
    doc.write("<style>" + printCss + "</style></head><body>");
    doc.write('<p id="solo-print-loading">' + escapeHtmlAttr(loadingText) + "</p>");
    doc.write(
      '<img id="solo-print-img" src="' +
        escapeHtmlAttr(resolvedSrc) +
        '" alt="' +
        escapeHtmlAttr(altText || "Image") +
        '">'
    );
    doc.write("</body></html>");
    doc.close();

    const img = doc.getElementById("solo-print-img");
    const loadingEl = doc.getElementById("solo-print-loading");
    if (!img) {
      window.alert(prepFailMsg);
      try {
        printWin.close();
      } catch (e) {
        /* ignore */
      }
      return;
    }

    const loadTimeoutMs = 30000;
    let loadTimer = window.setTimeout(() => {
      window.alert(loadFailMsg);
      try {
        printWin.close();
      } catch (e) {
        /* ignore */
      }
    }, loadTimeoutMs);

    function clearLoadTimer() {
      if (loadTimer != null) {
        window.clearTimeout(loadTimer);
        loadTimer = null;
      }
    }

    let printed = false;
    function runPrint() {
      if (printed) return;
      printed = true;
      clearLoadTimer();
      if (loadingEl && loadingEl.parentNode) loadingEl.remove();
      printWin.focus();
      printWin.addEventListener(
        "afterprint",
        () => {
          try {
            printWin.close();
          } catch (e) {
            /* ignore */
          }
        },
        { once: true }
      );
      printWin.print();
      window.setTimeout(() => {
        try {
          if (printWin && !printWin.closed) printWin.close();
        } catch (e) {
          /* ignore */
        }
      }, 500);
    }

    img.addEventListener("load", () => runPrint(), { once: true });
    img.onerror = () => {
      clearLoadTimer();
      window.alert(loadFailMsg);
      try {
        printWin.close();
      } catch (e) {
        /* ignore */
      }
    };

    if (img.complete && img.naturalWidth > 0) {
      runPrint();
    }
  }

  function resolveImgSrc(imgEl) {
    let resolvedSrc = "";
    try {
      resolvedSrc =
        imgEl.currentSrc || new URL(imgEl.getAttribute("src") || "", document.baseURI).href;
    } catch (e) {
      resolvedSrc = imgEl.getAttribute("src") || "";
    }
    return resolvedSrc;
  }

  // --- Map download: print preview with image only (new window) ---
  const printMapBtn = document.getElementById("btn-print-map");
  const mapPreviewImg = document.getElementById("map-download-preview");
  if (printMapBtn && mapPreviewImg) {
    printMapBtn.addEventListener("click", () => {
      const resolvedSrc = resolveImgSrc(mapPreviewImg);
      if (!resolvedSrc) {
        window.alert("Map image address is missing.");
        return;
      }
      openPrintWindowForImage(resolvedSrc, mapPreviewImg.getAttribute("alt") || "Map", {
        docTitle: "Print map",
        loadingText: "Preparing map for print…",
        popupBlockedMsg: "Please allow pop-ups for this site to print the map.",
        loadFailMsg: "Could not load the map image for printing.",
        prepFailMsg: "Could not prepare the print window.",
      });
    });
  }

  // --- Character templates: print one template image (new window) ---
  document.querySelectorAll(".btn-print-character-template").forEach((btn) => {
    btn.addEventListener("click", () => {
      const imgId = btn.getAttribute("data-print-img-id");
      const imgEl = imgId ? document.getElementById(imgId) : null;
      if (!imgEl || imgEl.tagName !== "IMG") {
        window.alert("Could not find that template image on the page.");
        return;
      }
      const resolvedSrc = resolveImgSrc(imgEl);
      if (!resolvedSrc) {
        window.alert("Template image address is missing.");
        return;
      }
      openPrintWindowForImage(resolvedSrc, imgEl.getAttribute("alt") || "Character template", {
        docTitle: "Print template",
        loadingText: "Preparing template for print…",
        popupBlockedMsg: "Please allow pop-ups for this site to print.",
        loadFailMsg: "Could not load the template image for printing.",
        prepFailMsg: "Could not prepare the print window.",
      });
    });
  });

  const customPuzzleMount = document.getElementById("custom-puzzle-mount");
  if (customPuzzleMount) {
    renderCustomPuzzleIdeas(customPuzzleMount);
    try {
      if (typeof lucide !== "undefined") lucide.createIcons();
    } catch (_) {
      /* ignore */
    }
  }

  const puzzleIdeaForm = document.getElementById("puzzle-idea-form");
  const puzzleSaveSuccess = document.getElementById("puzzle-save-success");
  if (puzzleIdeaForm && puzzleSaveSuccess) {
    puzzleIdeaForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("puzzle-title").value.trim();
      if (!title) return;

      const idea = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10),
        role: document.getElementById("puzzle-role").value.trim(),
        title,
        description: document.getElementById("puzzle-desc").value.trim(),
        boss: document.getElementById("puzzle-boss").value.trim(),
        answer: document.getElementById("puzzle-answer").value.trim(),
        evolution: document.getElementById("puzzle-evolution").value.trim(),
        teacherNotes: document.getElementById("puzzle-teacher-notes").value.trim(),
        savedAt: Date.now(),
      };

      try {
        const existing = loadPuzzleIdeas();
        existing.push(idea);
        savePuzzleIdeas(existing);
      } catch (_) {
        savePuzzleIdeas([idea]);
      }

      puzzleSaveSuccess.classList.remove("hidden");
      try {
        if (typeof lucide !== "undefined") lucide.createIcons();
      } catch (_) {
        /* ignore */
      }
      puzzleIdeaForm.reset();

      window.clearTimeout(puzzleSaveSuccess._hideTid);
      puzzleSaveSuccess._hideTid = window.setTimeout(() => {
        puzzleSaveSuccess.classList.add("hidden");
      }, 8000);
    });
  }

});
