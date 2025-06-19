document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const counterDisplay = document.getElementById('counter');
    const progressBar = document.getElementById('progress-bar');
    const tomato = document.querySelector('.tomato');
    const tomatoBody = document.querySelector('.tomato-body');
    
    // Timer settings inputs
    const pomodoroTimeInput = document.getElementById('pomodoro-time');
    const shortBreakTimeInput = document.getElementById('short-break-time');
    const longBreakTimeInput = document.getElementById('long-break-time');
    
    // Timer variables
    let timer;
    let timeLeft = 0;
    let currentMode = 'pomodoro';
    let isRunning = false;
    let pomodoroCount = 0;
    
    // Colors for different modes
    const modeColors = {
        'pomodoro': '#ff6b6b',
        'short-break': '#4ecdc4',
        'long-break': '#45aaf2'
    };
    
    // Initialize timer with default values
    function initTimer() {
        updateTimerDisplay(getModeTime(currentMode) * 60);
        updateActiveModeButton();
        updateProgressBar();
        applyModeStyles();
    }
    
    // Get time in minutes for the current mode
    function getModeTime(mode) {
        switch(mode) {
            case 'pomodoro':
                return parseInt(pomodoroTimeInput.value);
            case 'short-break':
                return parseInt(shortBreakTimeInput.value);
            case 'long-break':
                return parseInt(longBreakTimeInput.value);
            default:
                return 25;
        }
    }
    
    // Update the timer display
    function updateTimerDisplay(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        minutesDisplay.textContent = mins.toString().padStart(2, '0');
        secondsDisplay.textContent = secs.toString().padStart(2, '0');
    }
    
    // Start the timer
    function startTimer() {
        if (!isRunning) {
            if (timeLeft === 0) {
                timeLeft = getModeTime(currentMode) * 60;
            }
            
            // Start tomato animation
            tomato.style.animationPlayState = 'running';
            
            timer = setInterval(() => {
                timeLeft--;
                updateTimerDisplay(timeLeft);
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    isRunning = false;
                    tomato.style.animationPlayState = 'paused';
                    handleTimerCompletion();
                }
            }, 1000);
            
            isRunning = true;
            updateButtonStates();
        }
    }
    
    // Pause the timer
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        tomato.style.animationPlayState = 'paused';
        updateButtonStates();
    }
    
    // Reset the timer
    function resetTimer() {
        pauseTimer();
        timeLeft = getModeTime(currentMode) * 60;
        updateTimerDisplay(timeLeft);
        tomato.style.animation = 'none';
        setTimeout(() => {
            tomato.style.animation = 'rotate 15s linear infinite';
        }, 10);
    }
    
    // Handle timer completion
    function handleTimerCompletion() {
        // Play sound
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
        audio.play();
        
        // Update pomodoro count
        if (currentMode === 'pomodoro') {
            pomodoroCount++;
            counterDisplay.textContent = pomodoroCount % 4;
            updateProgressBar();
            
            // After 4 pomodoros, suggest a long break
            if (pomodoroCount % 4 === 0) {
                if (confirm('Great job! You\'ve completed 4 pomodoros. Take a long break?')) {
                    switchMode('long-break');
                }
            } else {
                if (confirm('Pomodoro completed! Take a short break?')) {
                    switchMode('short-break');
                }
            }
        } else {
            if (confirm('Break time is over! Start a new pomodoro?')) {
                switchMode('pomodoro');
            }
        }
        
        resetTimer();
    }
    
    // Switch between modes
    function switchMode(mode) {
        currentMode = mode;
        resetTimer();
        updateActiveModeButton();
        applyModeStyles();
    }
    
    // Update active mode button styling
    function updateActiveModeButton() {
        modeButtons.forEach(button => {
            if (button.dataset.mode === currentMode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    // Apply color styles based on current mode
    function applyModeStyles() {
        const color = modeColors[currentMode];
        
        // Update buttons
        startBtn.style.backgroundColor = color;
        resetBtn.style.backgroundColor = color;
        
        // Update tomato color
        tomatoBody.style.backgroundColor = color;
        
        // Update progress bar
        progressBar.style.backgroundColor = color;
    }
    
    // Update button states based on timer status
    function updateButtonStates() {
        startBtn.disabled = isRunning;
        pauseBtn.disabled = !isRunning;
    }
    
    // Update progress bar
    function updateProgressBar() {
        const progress = (pomodoroCount % 4) * 25;
        progressBar.style.width = `${progress}%`;
    }
    
    // Event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchMode(button.dataset.mode);
        });
    });
    
    // Settings change listeners
    pomodoroTimeInput.addEventListener('change', resetTimer);
    shortBreakTimeInput.addEventListener('change', resetTimer);
    longBreakTimeInput.addEventListener('change', resetTimer);
    
    // Initialize the timer
    initTimer();
});