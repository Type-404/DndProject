const characters = [
    {
        id: 'lyra',
        name: 'Lyra Quantum',
        role: 'Physicist',
        hp: 19,
        ability: 'Energy Control',
        desc: 'Manipulates and stabilizes energy fields to solve high-risk physics challenges.',
        color: 'var(--color-physicist)',
        img: 'images/physicst character.png'
    },
    {
        id: 'zane',
        name: 'Zane Codebreaker',
        role: 'Programmer',
        hp: 16,
        ability: 'Debug Mode',
        desc: 'Transforms code and logic into powerful tools to break systems and bypass security.',
        color: 'var(--color-programmer)',
        img: 'images/programmer character.png'
    },
    {
        id: 'axel',
        name: 'Axel Forge',
        role: 'Engineer',
        hp: 20,
        ability: 'Build Mode',
        desc: 'Constructs, repairs, and reinforces mechanical systems in real-time scenarios.',
        color: 'var(--color-engineer)',
        img: 'images/engineer character.png'
    },
    {
        id: 'nova',
        name: 'Nova Elementrix',
        role: 'Chemist',
        hp: 17,
        ability: 'Chain Reaction',
        desc: 'Combines chemical elements to trigger powerful reactions and control hazards.',
        color: 'var(--color-chemist)',
        img: 'images/chemist character.png'
    },
    {
        id: 'arin',
        name: 'Arin Calculator',
        role: 'Mathematician',
        hp: 18,
        ability: 'Quick Calculation',
        desc: 'Uses logic and rapid calculations to gain advantage in complex situations.',
        color: 'var(--color-mathematician)',
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
        document.documentElement.style.setProperty('--accent-color', '#0ea5e9'); // default
    }

    renderCharacters() {
        const grid = document.getElementById('character-grid');
        grid.innerHTML = '';

        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'card';
            card.id = `char-card-${char.id}`;
            card.style.setProperty('--accent-color', char.color);
            card.innerHTML = `
                <div class="card-img-container">
                    <img class="card-img" src="${char.img}" alt="${char.name}">
                </div>
                <div class="card-header">
                    <div class="card-name">${char.name}</div>
                    <div class="card-role" style="color: ${char.color}">${char.role}</div>
                </div>
                <div class="card-stats">
                    <div>HP: <span class="stat-val">${char.hp}</span></div>
                    <div>Abil: <span class="stat-val" style="color: ${char.color}">${char.ability}</span></div>
                </div>
                <div class="card-desc">${char.desc}</div>
                <button class="btn btn-primary select-btn" onclick="event.stopPropagation(); app.selectCharacter('${char.id}')">Choose Character</button>
            `;
            card.onclick = () => app.selectCharacter(char.id);
            grid.appendChild(card);
        });
    }

    selectCharacter(id) {
        document.querySelectorAll('#character-grid .card').forEach(c => c.classList.remove('selected'));
        const selectedCard = document.getElementById(`char-card-${id}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        this.gameState.character = characters.find(c => c.id === id);
        this.gameState.background = null;
        document.documentElement.style.setProperty('--accent-color', this.gameState.character.color);

        document.getElementById('character-selected-name').innerHTML = `<span class="label">CHARACTER:</span> <span class="value">${this.gameState.character.name}</span> <span class="divider">//</span> <span class="label">ROLE:</span> <span class="value">${this.gameState.character.role}</span>`;
        document.getElementById('character-selected-name').style.color = ''; // Let CSS classes control the colors

        this.renderBackgrounds();

        setTimeout(() => {
            this.switchScreen('screen-character', 'screen-background');
        }, 800);
    }

    renderBackgrounds() {
        const grid = document.getElementById('background-grid');
        grid.innerHTML = '';
        const options = backgroundsData[this.gameState.character.role];

        document.getElementById('btn-confirm-background').disabled = true;

        options.forEach((bg, index) => {
            const card = document.createElement('div');
            card.className = 'card bg-card';
            card.style.setProperty('--accent-color', this.gameState.character.color);
            card.innerHTML = `
                <h3>${bg.title}</h3>
                <div class="trait">TRAIT: ${bg.trait}</div>
                <div class="ability">Bonus: ${bg.ability}</div>
                <button class="btn btn-primary select-btn">SELECT</button>
            `;

            card.onclick = () => this.selectBackground(card, bg);
            grid.appendChild(card);
        });
    }

    selectBackground(cardElement, bgData) {
        document.querySelectorAll('.bg-card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');

        this.gameState.background = bgData;
        document.getElementById('btn-confirm-background').disabled = false;
    }

    confirmBackground() {
        if (!this.gameState.background) return;
        this.renderSummary();
        this.switchScreen('screen-background', 'screen-summary');
    }

    renderSummary() {
        const content = document.getElementById('summary-content');
        const char = this.gameState.character;
        const bg = this.gameState.background;

        content.innerHTML = `
            <div class="summary-header">
                <div class="summary-title">
                    <h2>${char.name}</h2>
                    <p style="color: ${char.color}">${char.role}</p>
                </div>
                <div class="summary-hp">
                    ${char.hp} <span>HP</span>
                </div>
            </div>
            <div class="summary-details">
                <div class="detail-section">
                    <h4>Core Ability</h4>
                    <p>${char.ability}</p>
                </div>
                <div class="detail-section">
                    <h4>Selected Background</h4>
                    <p>${bg.title}</p>
                </div>
                <div class="detail-section">
                    <h4>Character Trait</h4>
                    <p>${bg.trait}</p>
                </div>
                <div class="detail-section">
                    <h4>Background Bonus</h4>
                    <p>${bg.ability}</p>
                </div>
                <div class="detail-section story-section">
                    <h4>Mission Briefing</h4>
                    <p>"${bg.story}"</p>
                </div>
            </div>
        `;
    }

    switchScreen(fromId, toId) {
        const from = document.getElementById(fromId);
        const to = document.getElementById(toId);

        const screens = ['screen-character', 'screen-background', 'screen-summary'];
        const fromIndex = screens.indexOf(fromId);
        const toIndex = screens.indexOf(toId);
        const isForward = toIndex > fromIndex;

        from.classList.remove('active');
        from.classList.add(isForward ? 'slide-left' : 'slide-right');

        setTimeout(() => {
            from.classList.remove('slide-left', 'slide-right');
            to.classList.remove('slide-left', 'slide-right');
            to.classList.add('active');
        }, 300);
    }

    goBack(targetScreen) {
        let currentScreen = 'screen-summary';
        if (targetScreen === 'screen-character') currentScreen = 'screen-background';
        this.switchScreen(currentScreen, targetScreen);
    }

    startGame() {
        const btn = document.querySelector('.pulse');
        btn.innerHTML = 'LAUNCHING...';
        btn.style.background = '#fca5a5';
        setTimeout(() => {
            alert('CORE-X PROTOCOL INITIATED! Get ready for Dice & Discoveries, ' + this.gameState.character.name + '!');
            btn.innerHTML = 'START GAME!';
            btn.style.background = '#ef4444';
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
