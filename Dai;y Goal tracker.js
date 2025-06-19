// Initialize jsPDF
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const goalInput = document.getElementById('goalInput');
    const addGoalBtn = document.getElementById('addGoalBtn');
    const goalList = document.getElementById('goalList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const currentDateEl = document.getElementById('currentDate');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const totalGoalsEl = document.getElementById('totalGoals');
    const completedGoalsEl = document.getElementById('completedGoals');
    const streakCountEl = document.getElementById('streakCount');
    const monthCompletionEl = document.getElementById('monthCompletion');
    const quoteTextEl = document.getElementById('quoteText');
    const quoteAuthorEl = document.getElementById('quoteAuthor');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    const calendarGrid = document.getElementById('calendarGrid');
    const historyContainer = document.getElementById('historyContainer');

    // Current date
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // Display current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = today.toLocaleDateString('en-US', options);

    // Motivational quotes
    const quotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
        { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
        { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
        { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
        { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" }
    ];

    // Display random quote
    function displayRandomQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteTextEl.textContent = `"${quotes[randomIndex].text}"`;
        quoteAuthorEl.textContent = `- ${quotes[randomIndex].author}`;
    }

    displayRandomQuote();

    // Goals array and daily history
    let goals = JSON.parse(localStorage.getItem('goals')) || [];
    let dailyHistory = JSON.parse(localStorage.getItem('dailyHistory')) || {};

    // Streak tracking
    let streak = localStorage.getItem('streak') ? parseInt(localStorage.getItem('streak')) : 0;
    const lastVisitDate = localStorage.getItem('lastVisitDate');
    
    // Check if user visited yesterday to maintain streak
    if (lastVisitDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastVisit = new Date(lastVisitDate);
        
        // If last visit was yesterday, increment streak
        if (lastVisit.toDateString() === yesterday.toDateString()) {
            streak++;
        } 
        // If last visit was today, do nothing
        else if (lastVisit.toDateString() !== today.toDateString()) {
            // If more than one day has passed, reset streak
            streak = 0;
        }
    } else {
        // First time user
        streak = 1;
    }
    
    // Update streak in localStorage
    localStorage.setItem('streak', streak.toString());
    localStorage.setItem('lastVisitDate', today.toString());
    streakCountEl.textContent = streak;

    // Filter state
    let currentFilter = 'all';

    // Save daily progress
    function saveDailyProgress() {
        const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        const completedCount = goals.filter(goal => goal.completed).length;
        const totalCount = goals.length;
        
        dailyHistory[dateKey] = {
            date: today.toISOString(),
            completed: completedCount,
            total: totalCount,
            goals: goals.map(goal => ({
                text: goal.text,
                completed: goal.completed
            }))
        };
        
        localStorage.setItem('dailyHistory', JSON.stringify(dailyHistory));
    }

    // Render goals
    function renderGoals() {
        // Clear the list
        goalList.innerHTML = '';

        // Filter goals based on current filter
        let filteredGoals = goals;
        if (currentFilter === 'active') {
            filteredGoals = goals.filter(goal => !goal.completed);
        } else if (currentFilter === 'completed') {
            filteredGoals = goals.filter(goal => goal.completed);
        }

        // Update stats
        totalGoalsEl.textContent = goals.length;
        const completedCount = goals.filter(goal => goal.completed).length;
        completedGoalsEl.textContent = completedCount;

        // Update progress bar
        const progress = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}% Complete`;

        // Update month completion
        updateMonthCompletion();

        // Render each goal
        filteredGoals.forEach((goal, index) => {
            const goalItem = document.createElement('li');
            goalItem.className = `goal-item ${goal.completed ? 'completed' : ''}`;
            goalItem.dataset.id = goal.id;

            goalItem.innerHTML = `
                <button class="check-btn" title="Mark as ${goal.completed ? 'active' : 'completed'}">
                    <i class="fas fa-${goal.completed ? 'undo' : 'check'}"></i>
                </button>
                <span class="goal-text">${goal.text}</span>
                <button class="delete-btn" title="Delete goal">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            goalList.appendChild(goalItem);
        });

        // Save to localStorage
        localStorage.setItem('goals', JSON.stringify(goals));
        saveDailyProgress();
    }

    // Add new goal
    function addGoal() {
        const text = goalInput.value.trim();
        if (text) {
            const newGoal = {
                id: Date.now(),
                text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            goals.unshift(newGoal);
            goalInput.value = '';
            renderGoals();
        }
    }

    // Update month completion percentage
    function updateMonthCompletion() {
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        const today = new Date();
        
        // Filter history for current month
        const monthHistory = Object.entries(dailyHistory).filter(([dateKey, data]) => {
            const date = new Date(data.date);
            return date >= monthStart && date <= monthEnd && date <= today;
        });
        
        if (monthHistory.length === 0) {
            monthCompletionEl.textContent = '0%';
            return;
        }
        
        // Calculate average completion for the month
        const totalDays = monthHistory.length;
        let totalCompletion = 0;
        
        monthHistory.forEach(([dateKey, data]) => {
            const dayCompletion = data.total > 0 ? (data.completed / data.total) * 100 : 0;
            totalCompletion += dayCompletion;
        });
        
        const avgCompletion = Math.round(totalCompletion / totalDays);
        monthCompletionEl.textContent = `${avgCompletion}%`;
    }

    // Generate PDF
    function generatePDF() {
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.setTextColor(108, 99, 255); // Primary color
        doc.text('Daily Goal Tracker Report', 105, 20, { align: 'center' });
        
        // Date
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        // Stats
        doc.setFontSize(14);
        doc.text('Current Stats', 14, 40);
        doc.setFontSize(12);
        
        const completedCount = goals.filter(goal => goal.completed).length;
        const totalCount = goals.length;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        doc.text(`Total Goals: ${totalCount}`, 14, 50);
        doc.text(`Completed Goals: ${completedCount}`, 14, 60);
        doc.text(`Progress: ${progress}%`, 14, 70);
        
        // Goals table
        doc.setFontSize(14);
        doc.text('Goals List', 14, 85);
        
        const goalsData = goals.map(goal => [
            goal.completed ? '✓' : '',
            goal.text,
            goal.completed ? 'Completed' : 'Pending',
            new Date(goal.createdAt).toLocaleDateString()
        ]);
        
        doc.autoTable({
            startY: 90,
            head: [['', 'Goal', 'Status', 'Created']],
            body: goalsData,
            headStyles: {
                fillColor: [108, 99, 255], // Primary color
                textColor: 255
            },
            alternateRowStyles: {
                fillColor: [240, 240, 255]
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 0 && data.cell.raw === '✓') {
                    doc.setTextColor(40, 167, 69); // Success color
                }
            }
        });
        
        // Calendar overview
        doc.setFontSize(14);
        doc.text('Monthly Progress', 14, doc.lastAutoTable.finalY + 15);
        
        const calendarData = [];
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = dailyHistory[dateKey] || { completed: 0, total: 0 };
            const dayCompletion = dayData.total > 0 ? Math.round((dayData.completed / dayData.total) * 100) : 0;
            
            calendarData.push([
                day,
                dayCompletion > 0 ? `${dayCompletion}%` : 'No data',
                dayData.total > 0 ? dayData.completed : '-',
                dayData.total > 0 ? dayData.total : '-'
            ]);
        }
        
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Day', 'Completion', 'Completed', 'Total']],
            body: calendarData,
            headStyles: {
                fillColor: [108, 99, 255], // Primary color
                textColor: 255
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 40 },
                2: { cellWidth: 40 },
                3: { cellWidth: 40 }
            },
            alternateRowStyles: {
                fillColor: [240, 240, 255]
            }
        });
        
        // Save the PDF
        doc.save(`GoalTracker_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    // Clear completed goals
    function clearCompletedGoals() {
        goals = goals.filter(goal => !goal.completed);
        renderGoals();
    }

    // Tab switching
    function switchTab(tabName) {
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });
        
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        if (tabName === 'calendar') {
            renderCalendar();
        } else if (tabName === 'history') {
            renderHistory();
        }
    }

    // Render calendar
    function renderCalendar() {
        currentMonthYearEl.textContent = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
        
        calendarGrid.innerHTML = '';
        
        // Create day names header
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day-name';
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        });
        
        // Get first day of month and total days
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyElement = document.createElement('div');
            emptyElement.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyElement);
        }
        
        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = dailyHistory[dateKey] || { completed: 0, total: 0 };
            const dayCompletion = dayData.total > 0 ? (dayData.completed / dayData.total) * 100 : 0;
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (dayData.total > 0) {
                dayElement.classList.add(dayCompletion === 100 ? 'completed-day' : 'partial-day');
            }
            
            dayElement.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-progress">
                    <div class="calendar-day-progress-bar" style="width: ${dayCompletion}%"></div>
                </div>
            `;
            
            // Add click event to view day details
            dayElement.addEventListener('click', () => {
                viewDayDetails(dateKey);
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }

    // View day details
    function viewDayDetails(dateKey) {
        const dayData = dailyHistory[dateKey];
        if (!dayData) return;
        
        const date = new Date(dayData.date);
        const dateStr = date.toLocaleDateString('en-US', options);
        const completion = dayData.total > 0 ? Math.round((dayData.completed / dayData.total) * 100) : 0;
        
        // Create a modal or alert with day details
        alert(`Date: ${dateStr}\nCompletion: ${completion}%\nCompleted: ${dayData.completed}/${dayData.total}\n\nGoals:\n${
            dayData.goals.map(goal => `${goal.completed ? '✓' : '○'} ${goal.text}`).join('\n')
        }`);
    }

    // Render history
    function renderHistory() {
        historyContainer.innerHTML = '';
        
        // Sort history by date (newest first)
        const sortedHistory = Object.entries(dailyHistory)
            .sort(([a], [b]) => new Date(b) - new Date(a));
        
        if (sortedHistory.length === 0) {
            historyContainer.innerHTML = '<p>No history available yet.</p>';
            return;
        }
        
        sortedHistory.forEach(([dateKey, data]) => {
            const date = new Date(data.date);
            const dateStr = date.toLocaleDateString('en-US', options);
            const completion = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            historyItem.innerHTML = `
                <div class="history-date">${dateStr}</div>
                <div class="history-stats">
                    <span>Completion: ${completion}%</span>
                    <span>${data.completed}/${data.total} completed</span>
                </div>
                <div class="history-goals">
                    ${data.goals.map(goal => `
                        <div class="history-goal ${goal.completed ? 'completed' : 'pending'}">
                            <i class="fas fa-${goal.completed ? 'check-circle' : 'circle'}"></i>
                            ${goal.text}
                        </div>
                    `).join('')}
                </div>
            `;
            
            historyContainer.appendChild(historyItem);
        });
    }

    // Change month
    function changeMonth(offset) {
        currentMonth += offset;
        
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        
        renderCalendar();
    }

    // Event listeners
    addGoalBtn.addEventListener('click', addGoal);
    goalInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addGoal();
        }
    });

    // Handle click on goal items (for check and delete buttons)
    goalList.addEventListener('click', function(e) {
        const goalItem = e.target.closest('.goal-item');
        if (!goalItem) return;

        const goalId = parseInt(goalItem.dataset.id);
        const goalIndex = goals.findIndex(goal => goal.id === goalId);

        // Check if click was on check button
        if (e.target.closest('.check-btn')) {
            goals[goalIndex].completed = !goals[goalIndex].completed;
            renderGoals();
        }

        // Check if click was on delete button
        if (e.target.closest('.delete-btn')) {
            goals.splice(goalIndex, 1);
            renderGoals();
        }
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update current filter
            currentFilter = this.dataset.filter;
            // Re-render goals
            renderGoals();
        });
    });

    // Export PDF button
    exportPdfBtn.addEventListener('click', generatePDF);

    // Clear completed button
    clearCompletedBtn.addEventListener('click', clearCompletedGoals);

    // Tab buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Calendar navigation
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));

    // Initial render
    renderGoals();
});