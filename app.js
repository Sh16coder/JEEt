// Study Session Management
let studySessions = [];
let liveTimerInterval = null;
let liveTimerSeconds = 0;
let pomodoroInterval = null;
let pomodoroSeconds = 25 * 60; // 25 minutes
let isPomodoroRunning = false;
let pomodoroCount = 0;
let currentMode = 'pomodoro'; // 'pomodoro', 'shortBreak', 'longBreak'

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form with current datetime
    setCurrentDateTime();
    
    // Load data from localStorage if not signed in
    if (!firebase.auth().currentUser) {
        loadFromLocalStorage();
    }
    
    // Form submission
    document.getElementById('study-session-form').addEventListener('submit', saveStudySession);
    
    // Live timer buttons
    document.getElementById('start-live-timer').addEventListener('click', startLiveTimer);
    document.getElementById('stop-live-timer').addEventListener('click', stopLiveTimer);
    
    // Pomodoro timer controls
    document.getElementById('start-timer').addEventListener('click', startPomodoroTimer);
    document.getElementById('pause-timer').addEventListener('click', pausePomodoroTimer);
    document.getElementById('reset-timer').addEventListener('click', resetPomodoroTimer);
    
    // Pomodoro mode buttons
    document.getElementById('pomodoro-btn').addEventListener('click', () => setPomodoroMode('pomodoro'));
    document.getElementById('short-break-btn').addEventListener('click', () => setPomodoroMode('shortBreak'));
    document.getElementById('long-break-btn').addEventListener('click', () => setPomodoroMode('longBreak'));
    
    // Update UI
    updateTotalStudyHours();
    updateTodayStudyHours();
    updateStreakDays();
    renderStudySessions();
    renderDetailedLog();
});

function setCurrentDateTime() {
    const now = new Date();
    const startTime = document.getElementById('start-time');
    const endTime = document.getElementById('end-time');
    
    // Format for datetime-local input
    const format = (date) => {
        return date.toISOString().slice(0, 16);
    };
    
    startTime.value = format(now);
    
    // Set end time to 1 hour from now by default
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    endTime.value = format(oneHourLater);
}

function saveStudySession(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const topic = document.getElementById('topic').value;
    const resource = document.getElementById('resource').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const notes = document.getElementById('notes').value;
    
    // Calculate duration in hours
    const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
    
    if (duration <= 0) {
        alert('End time must be after start time');
        return;
    }
    
    const session = {
        id: Date.now().toString(),
        date: new Date(startTime).toISOString(),
        subject,
        topic,
        resource,
        duration,
        notes
    };
    
    // Add to sessions array
    studySessions.push(session);
    
    // Save to Firebase if signed in, otherwise to localStorage
    if (firebase.auth().currentUser) {
        saveToFirebase(session);
    } else {
        saveToLocalStorage();
    }
    
    // Update UI
    updateTotalStudyHours();
    updateTodayStudyHours();
    updateStreakDays();
    renderStudySessions();
    renderDetailedLog();
    updateCharts();
    
    // Reset form
    e.target.reset();
    setCurrentDateTime();
}

function saveToFirebase(session) {
    const userId = firebase.auth().currentUser.uid;
    const sessionsRef = database.ref(`users/${userId}/sessions`);
    
    sessionsRef.push(session)
        .then(() => {
            console.log('Session saved to Firebase');
        })
        .catch((error) => {
            console.error('Error saving session:', error);
            alert('Failed to save session to cloud. Data saved locally.');
            saveToLocalStorage();
        });
}

function saveToLocalStorage() {
    localStorage.setItem('studySessions', JSON.stringify(studySessions));
    console.log('Session saved to localStorage');
}

function loadFromLocalStorage() {
    const savedSessions = localStorage.getItem('studySessions');
    if (savedSessions) {
        studySessions = JSON.parse(savedSessions);
        console.log('Sessions loaded from localStorage');
        
        // Update UI
        updateTotalStudyHours();
        updateTodayStudyHours();
        updateStreakDays();
        renderStudySessions();
        renderDetailedLog();
        updateCharts();
    }
}

function updateTotalStudyHours() {
    const totalHours = studySessions.reduce((sum, session) => sum + session.duration, 0);
    document.getElementById('total-hours').textContent = totalHours.toFixed(1);
}

function updateTodayStudyHours() {
    const today = new Date().toDateString();
    const todayHours = studySessions
        .filter(session => new Date(session.date).toDateString() === today)
        .reduce((sum, session) => sum + session.duration, 0);
    
    document.getElementById('today-hours').textContent = todayHours.toFixed(1);
}

function updateStreakDays() {
    // Simple streak calculation - can be enhanced
    const dates = studySessions
        .map(session => new Date(session.date).toDateString())
        .filter((date, i, self) => self.indexOf(date) === i) // Unique dates
        .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    let currentDate = new Date();
    
    // Check if studied today
    if (dates.length > 0 && dates[0] === currentDate.toDateString()) {
        streak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
        
        // Check consecutive days
        for (let i = 1; i < dates.length; i++) {
            if (dates[i] === currentDate.toDateString()) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
    }
    
    document.getElementById('streak-days').textContent = streak;
}

function renderStudySessions() {
    const table = document.getElementById('sessions-table');
    table.innerHTML = '';
    
    // Show last 5 sessions
    const recentSessions = [...studySessions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    recentSessions.forEach(session => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(session.date).toLocaleString();
        
        const subjectCell = document.createElement('td');
        subjectCell.textContent = session.subject;
        
        const topicCell = document.createElement('td');
        topicCell.textContent = session.topic;
        
        const durationCell = document.createElement('td');
        durationCell.textContent = session.duration.toFixed(1) + 'h';
        
        const actionsCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteSession(session.id));
        actionsCell.appendChild(deleteBtn);
        
        row.appendChild(dateCell);
        row.appendChild(subjectCell);
        row.appendChild(topicCell);
        row.appendChild(durationCell);
        row.appendChild(actionsCell);
        
        table.appendChild(row);
    });
}

function renderDetailedLog() {
    const table = document.getElementById('detailed-log-table');
    table.innerHTML = '';
    
    // Sort by date descending
    const sortedSessions = [...studySessions]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedSessions.forEach(session => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(session.date).toLocaleDateString();
        
        const subjectCell = document.createElement('td');
        subjectCell.textContent = session.subject;
        
        const topicCell = document.createElement('td');
        topicCell.textContent = session.topic;
        
        const durationCell = document.createElement('td');
        durationCell.textContent = session.duration.toFixed(1) + 'h';
        
        const resourceCell = document.createElement('td');
        resourceCell.textContent = session.resource || '-';
        
        const notesCell = document.createElement('td');
        notesCell.textContent = session.notes || '-';
        
        row.appendChild(dateCell);
        row.appendChild(subjectCell);
        row.appendChild(topicCell);
        row.appendChild(durationCell);
        row.appendChild(resourceCell);
        row.appendChild(notesCell);
        
        table.appendChild(row);
    });
}

function deleteSession(sessionId) {
    if (confirm('Are you sure you want to delete this session?')) {
        studySessions = studySessions.filter(session => session.id !== sessionId);
        
        // Update storage
        if (firebase.auth().currentUser) {
            // In a real app, you would delete from Firebase here
            // For simplicity, we'll just save the updated array
            saveToFirebase();
        } else {
            saveToLocalStorage();
        }
        
        // Update UI
        updateTotalStudyHours();
        updateTodayStudyHours();
        updateStreakDays();
        renderStudySessions();
        renderDetailedLog();
        updateCharts();
    }
}

// Live Timer Functions
function startLiveTimer() {
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('liveTimerModal'));
    modal.show();
    
    // Reset timer
    liveTimerSeconds = 0;
    updateLiveTimerDisplay();
    
    // Start interval
    liveTimerInterval = setInterval(() => {
        liveTimerSeconds++;
        updateLiveTimerDisplay();
    }, 1000);
}

function stopLiveTimer() {
    // Stop interval
    clearInterval(liveTimerInterval);
    
    // Get values from modal
    const subject = document.getElementById('live-subject').value;
    const topic = document.getElementById('live-topic').value;
    const notes = document.getElementById('live-notes').value;
    
    // Calculate duration in hours
    const duration = liveTimerSeconds / 3600;
    
    if (duration < 0.1) { // At least 6 minutes
        alert('Study session too short (minimum 6 minutes)');
        return;
    }
    
    // Create session
    const session = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        subject,
        topic,
        resource: 'Live Timer',
        duration,
        notes
    };
    
    // Add to sessions
    studySessions.push(session);
    
    // Save
    if (firebase.auth().currentUser) {
        saveToFirebase(session);
    } else {
        saveToLocalStorage();
    }
    
    // Update UI
    updateTotalStudyHours();
    updateTodayStudyHours();
    updateStreakDays();
    renderStudySessions();
    renderDetailedLog();
    updateCharts();
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('liveTimerModal'));
    modal.hide();
    
    // Reset modal fields
    document.getElementById('live-topic').value = '';
    document.getElementById('live-notes').value = '';
}

function updateLiveTimerDisplay() {
    const hours = Math.floor(liveTimerSeconds / 3600);
    const minutes = Math.floor((liveTimerSeconds % 3600) / 60);
    const seconds = liveTimerSeconds % 60;
    
    document.getElementById('live-timer-display').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Pomodoro Timer Functions
function setPomodoroMode(mode) {
    currentMode = mode;
    
    // Update active button
    document.getElementById('pomodoro-btn').classList.remove('btn-primary');
    document.getElementById('pomodoro-btn').classList.add('btn-secondary');
    document.getElementById('short-break-btn').classList.remove('btn-primary');
    document.getElementById('short-break-btn').classList.add('btn-secondary');
    document.getElementById('long-break-btn').classList.remove('btn-primary');
    document.getElementById('long-break-btn').classList.add('btn-secondary');
    
    // Set active button
    if (mode === 'pomodoro') {
        document.getElementById('pomodoro-btn').classList.add('btn-primary');
        document.getElementById('pomodoro-btn').classList.remove('btn-secondary');
        pomodoroSeconds = 25 * 60; // 25 minutes
    } else if (mode === 'shortBreak') {
        document.getElementById('short-break-btn').classList.add('btn-primary');
        document.getElementById('short-break-btn').classList.remove('btn-secondary');
        pomodoroSeconds = 5 * 60; // 5 minutes
    } else if (mode === 'longBreak') {
        document.getElementById('long-break-btn').classList.add('btn-primary');
        document.getElementById('long-break-btn').classList.remove('btn-secondary');
        pomodoroSeconds = 15 * 60; // 15 minutes
    }
    
    // Reset timer
    resetPomodoroTimer();
    updatePomodoroDisplay();
}

function startPomodoroTimer() {
    if (isPomodoroRunning) return;
    
    isPomodoroRunning = true;
    document.getElementById('timer-display').classList.add('timer-pulse');
    
    pomodoroInterval = setInterval(() => {
        pomodoroSeconds--;
        updatePomodoroDisplay();
        
        if (pomodoroSeconds <= 0) {
            clearInterval(pomodoroInterval);
            isPomodoroRunning = false;
            document.getElementById('timer-display').classList.remove('timer-pulse');
            
            // Play sound
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
            audio.play();
            
            // Increment pomodoro count if a work session completed
            if (currentMode === 'pomodoro') {
                pomodoroCount++;
                document.getElementById('pomodoro-count').textContent = pomodoroCount;
                
                // Automatically start short break after 4 pomodoros
                if (pomodoroCount % 4 === 0) {
                    setTimeout(() => {
                        setPomodoroMode('longBreak');
                        startPomodoroTimer();
                    }, 2000);
                } else {
                    setTimeout(() => {
                        setPomodoroMode('shortBreak');
                        startPomodoroTimer();
                    }, 2000);
                }
            }
        }
    }, 1000);
}

function pausePomodoroTimer() {
    if (!isPomodoroRunning) return;
    
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    document.getElementById('timer-display').classList.remove('timer-pulse');
}

function resetPomodoroTimer() {
    pausePomodoroTimer();
    
    if (currentMode === 'pomodoro') {
        pomodoroSeconds = 25 * 60;
    } else if (currentMode === 'shortBreak') {
        pomodoroSeconds = 5 * 60;
    } else if (currentMode === 'longBreak') {
        pomodoroSeconds = 15 * 60;
    }
    
    updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroSeconds / 60);
    const seconds = pomodoroSeconds % 60;
    
    document.getElementById('timer-display').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update charts with real data
function updateCharts() {
    // Group by day of week
    const dailyData = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    
    studySessions.forEach(session => {
        const day = new Date(session.date).getDay(); // 0=Sun, 6=Sat
        dailyData[day] += session.duration;
    });
    
    // Reorder to start with Monday
    const reorderedDailyData = [...dailyData.slice(1), dailyData[0]];
    dailyTrendChart.data.datasets[0].data = reorderedDailyData;
    dailyTrendChart.update();
    
    // Subject distribution
    const subjects = {
        Physics: 0,
        Chemistry: 0,
        Mathematics: 0
    };
    
    studySessions.forEach(session => {
        if (subjects.hasOwnProperty(session.subject)) {
            subjects[session.subject] += session.duration;
        }
    });
    
    subjectDistributionChart.data.datasets[0].data = [
        subjects.Physics,
        subjects.Chemistry,
        subjects.Mathematics
    ];
    subjectDistributionChart.update();
    
    // Weekly hours (simplified - groups by calendar week)
    const weeklyData = {};
    
    studySessions.forEach(session => {
        const date = new Date(session.date);
        const year = date.getFullYear();
        const week = getWeekNumber(date);
        const key = `${year}-W${week.toString().padStart(2, '0')}`;
        
        if (!weeklyData[key]) {
            weeklyData[key] = 0;
        }
        weeklyData[key] += session.duration;
    });
    
    const weeks = Object.keys(weeklyData).sort();
    const last4Weeks = weeks.slice(-4);
    
    weeklyHoursChart.data.labels = last4Weeks;
    weeklyHoursChart.data.datasets[0].data = last4Weeks.map(week => weeklyData[week]);
    weeklyHoursChart.update();
}

// Helper function to get week number
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}