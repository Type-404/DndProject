const characters = [
    {
        id: 'lyra',
        name: 'Lyra Quantum',
        role: 'Physicist',
        hp: 19,
        ability: 'Energy Control',
        desc: 'Manipulates and stabilizes energy fields to solve high-risk physics challenges.',
        img: 'images/physicst character.png'
    },
    {
        id: 'zane',
        name: 'Zane Codebreaker',
        role: 'Programmer',
        hp: 16,
        ability: 'Debug Mode',
        desc: 'Transforms code and logic into powerful tools to break systems and bypass security.',
        img: 'images/programmer character.png'
    },
    {
        id: 'axel',
        name: 'Axel Forge',
        role: 'Engineer',
        hp: 20,
        ability: 'Build Mode',
        desc: 'Constructs, repairs, and reinforces mechanical systems in real-time scenarios.',
        img: 'images/engineer character.png'
    },
    {
        id: 'nova',
        name: 'Nova Elementrix',
        role: 'Chemist',
        hp: 17,
        ability: 'Chain Reaction',
        desc: 'Combines chemical elements to trigger powerful reactions and control hazards.',
        img: 'images/chemist character.png'
    },
    {
        id: 'arin',
        name: 'Arin Calculator',
        role: 'Mathematician',
        hp: 18,
        ability: 'Quick Calculation',
        desc: 'Uses logic and rapid calculations to gain advantage in complex situations.',
        img: 'images/maths character.png'
    }
];

const backgroundsData = {
    'Physicist': [
        { title: 'Mechanics Expert', trait: 'Force Control', ability: 'Reduced penalty on partial answers', story: 'Lyra applies classical mechanics to control motion and stabilize unstable systems.' },
        { title: 'Energy Master', trait: 'Power Build', ability: 'Correct answers increase next attack power', story: 'Mastering energy manipulation, Lyra amplifies her power with every correct move.' },
        { title: 'Quantum Researcher', trait: 'Uncertainty', ability: 'Wrong answers have reduced penalty', story: 'Working in quantum domains, Lyra thrives even in unpredictable outcomes.' }
    ],
    'Programmer': [
        { title: 'Software Developer', trait: 'Clean Code', ability: 'Partial answers still give reduced reward', story: 'Zane writes efficient code that performs reliably even under pressure.' },
        { title: 'Algorithm Master', trait: 'Optimization', ability: 'Exact answers give bonus damage', story: 'Zane sees patterns in systems, optimizing every move for maximum impact.' },
        { title: 'Cyber Hacker', trait: 'Bypass', ability: 'Wrong answers have reduced penalty', story: 'Operating in shadows, Zane slips through defenses even when things go wrong.' }
    ],
    'Engineer': [
        { title: 'Mechanical Engineer', trait: 'Solid Build', ability: 'Partial answers give reduced damage', story: 'Axel constructs reliable machines that keep functioning under stress.' },
        { title: 'Robotics Engineer', trait: 'Precision Design', ability: 'Exact answers increase attack effectiveness', story: 'Axel builds advanced robotic systems with high precision and efficiency.' },
        { title: 'Structural Engineer', trait: 'Reinforced', ability: 'Wrong answers reduce penalty', story: 'Axel designs structures that remain stable even under failure conditions.' }
    ],
    'Chemist': [
        { title: 'Organic Chemist', trait: 'Stable Reaction', ability: 'Partial answers still give reward', story: 'Nova controls organic compounds to maintain balance in unstable reactions.' },
        { title: 'Reaction Master', trait: 'Explosive Accuracy', ability: 'Exact answers give bonus damage', story: 'Nova triggers precise chemical reactions that result in powerful effects.' },
        { title: 'Lab Analyst', trait: 'Safety Control', ability: 'Wrong answers reduce penalty', story: 'Nova ensures safety and minimizes risk even when experiments fail.' }
    ],
    'Mathematician': [
        { title: 'Algebra Analyst', trait: 'Step-by-Step Solver', ability: 'Partial answers still give reward', story: 'Arin breaks problems into smaller steps to guarantee consistent results.' },
        { title: 'Geometry Architect', trait: 'Precision Builder', ability: 'Exact answers give bonus', story: 'Arin visualizes structures and solves spatial problems with precision.' },
        { title: 'Statistics Hacker', trait: 'Risk Control', ability: 'Reduced penalty on wrong answers', story: 'Arin manipulates probabilities to reduce risks and control outcomes.' }
    ]
};

class App {
    constructor() {
        this.gameState = {
            character: null,
            background: null
        };
        this.init();
    }

    init() {
        this.renderCharacters();
        this.wireStartGameSave();
    }

    wireStartGameSave() {
        const startBtn = document.getElementById("btn-start-game");
        if (!startBtn) return;
        startBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (!this.gameState.character || !this.gameState.background) return;
            try {
                localStorage.setItem(
                    "questAcademy_studentParty",
                    JSON.stringify({
                        character: this.gameState.character,
                        background: this.gameState.background,
                        savedAt: Date.now(),
                    })
                );
            } catch (err) {
                console.warn("Could not save party to localStorage:", err);
            }
            const isProgrammer = this.gameState.character.role === "Programmer";
            window.location.href = isProgrammer ? "game.html" : "role-overview.html";
        });
    }

    renderCharacters() {
        const grid = document.getElementById('character-grid');
        if (!grid) return;
        grid.innerHTML = '';

        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'char-card';
            card.id = `char-card-${char.id}`;
            card.innerHTML = `
                <div class="char-card__img-wrap">
                    <img class="char-card__img" src="${char.img}" alt="${char.name}">
                </div>
                <div class="char-card__name">${char.name}</div>
                <div class="char-card__role">${char.role}</div>
                <div class="char-card__stats">
                    <div>HP: <span class="stat-val">${char.hp}</span></div>
                    <div>Abil: <span class="stat-val">${char.ability}</span></div>
                </div>
                <div class="char-card__desc">${char.desc}</div>
                <button class="char-card__select-btn" onclick="event.stopPropagation(); app.selectCharacter('${char.id}')">Choose Character</button>
            `;
            card.onclick = () => app.selectCharacter(char.id);
            grid.appendChild(card);
        });
    }

    selectCharacter(id) {
        document.querySelectorAll('#character-grid .char-card').forEach(c => c.classList.remove('selected'));
        const selectedCard = document.getElementById(`char-card-${id}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        this.gameState.character = characters.find(c => c.id === id);
        this.gameState.background = null;

        const nameEl = document.getElementById('character-selected-name');
        if (nameEl) {
            nameEl.textContent = `${this.gameState.character.name}  //  ${this.gameState.character.role}`;
        }

        this.renderBackgrounds();

        setTimeout(() => {
            this.switchScreen('screen-character', 'screen-background');
        }, 600);
    }

    renderBackgrounds() {
        const grid = document.getElementById('background-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const options = backgroundsData[this.gameState.character.role];

        const confirmBtn = document.getElementById('btn-confirm-background');
        if (confirmBtn) confirmBtn.disabled = true;

        options.forEach((bg) => {
            const card = document.createElement('div');
            card.className = 'char-bg-card';
            card.innerHTML = `
                <h3 class="char-bg-card__title">${bg.title}</h3>
                <div class="char-bg-card__trait">Trait: ${bg.trait}</div>
                <div class="char-bg-card__ability">Bonus: ${bg.ability}</div>
                <button class="char-bg-card__btn">Select</button>
            `;

            card.onclick = () => this.selectBackground(card, bg);
            grid.appendChild(card);
        });

        // Re-create lucide icons for any new elements
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    selectBackground(cardElement, bgData) {
        document.querySelectorAll('.char-bg-card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');

        this.gameState.background = bgData;
        const confirmBtn = document.getElementById('btn-confirm-background');
        if (confirmBtn) confirmBtn.disabled = false;
    }

    confirmBackground() {
        if (!this.gameState.background) return;
        this.renderSummary();
        this.switchScreen('screen-background', 'screen-summary');
    }

    renderSummary() {
        const content = document.getElementById('summary-content');
        if (!content) return;
        const char = this.gameState.character;
        const bg = this.gameState.background;

        content.innerHTML = `
            <div class="char-summary-header">
                <div class="char-summary-title">
                    <h2>${char.name}</h2>
                    <p>${char.role}</p>
                </div>
                <div class="char-summary-hp">
                    ${char.hp} <span>HP</span>
                </div>
            </div>
            <div class="char-summary-details">
                <div class="char-detail-section">
                    <h4>Core Ability</h4>
                    <p>${char.ability}</p>
                </div>
                <div class="char-detail-section">
                    <h4>Selected Background</h4>
                    <p>${bg.title}</p>
                </div>
                <div class="char-detail-section">
                    <h4>Character Trait</h4>
                    <p>${bg.trait}</p>
                </div>
                <div class="char-detail-section">
                    <h4>Background Bonus</h4>
                    <p>${bg.ability}</p>
                </div>
                <div class="char-detail-section char-story-section">
                    <h4>Mission Briefing</h4>
                    <p>"${bg.story}"</p>
                </div>
            </div>
        `;
    }

    switchScreen(fromId, toId) {
        const from = document.getElementById(fromId);
        const to = document.getElementById(toId);
        if (!from || !to) return;

        from.classList.remove('active');

        setTimeout(() => {
            to.classList.add('active');
            // Re-create lucide icons for new screen
            if (typeof lucide !== 'undefined') lucide.createIcons();
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    }

    goBack(targetScreen) {
        let currentScreen = 'screen-summary';
        if (targetScreen === 'screen-character') currentScreen = 'screen-background';
        this.switchScreen(currentScreen, targetScreen);
    }

    startGame() {
        if (!this.gameState.character || !this.gameState.background) return;
        try {
            localStorage.setItem(
                "questAcademy_studentParty",
                JSON.stringify({
                    character: this.gameState.character,
                    background: this.gameState.background,
                    savedAt: Date.now(),
                })
            );
        } catch (err) {
            console.warn("Could not save party to localStorage:", err);
        }
        const isProgrammer = this.gameState.character.role === "Programmer";
        window.location.href = isProgrammer ? "game.html" : "role-overview.html";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
