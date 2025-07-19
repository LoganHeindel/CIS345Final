// Calendar Prototype JS
const calendarEl = document.getElementById('calendar');
const eventModal = document.getElementById('eventModal');
const closeModalBtn = document.getElementById('closeModal');
const eventForm = document.getElementById('eventForm');
const eventDateInput = document.getElementById('eventDate');
const editEventModal = document.getElementById('editEventModal');
const closeEditModalBtn = document.getElementById('closeEditModal');
const editEventForm = document.getElementById('editEventForm');
const editEventDateInput = document.getElementById('editEventDate');
const editEventIndexInput = document.getElementById('editEventIndex');
const editStartTimeInput = document.getElementById('editStartTime');
const editEndTimeInput = document.getElementById('editEndTime');
const editDescriptionInput = document.getElementById('editDescription');
const deleteEventBtn = document.getElementById('deleteEventBtn');
const editEventColorInput = document.getElementById('editEventColor');

// Get current month/year
let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

function getMonthDays(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay();
}

function getEvents() {
    return JSON.parse(localStorage.getItem('calendarEvents') || '{}');
}

function saveEvents(events) {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function getMonthName(month) {
    return [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ][month];
}

// Helper to get rgba for background from hex
function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

function formatTime12h(timeStr) {
    if (!timeStr) return '';
    let [hour, minute] = timeStr.split(':');
    hour = parseInt(hour, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
}

function renderCalendar(year, month) {
    const calendarTitle = document.getElementById('calendarTitle');
    if (calendarTitle) {
        calendarTitle.textContent = `${getMonthName(month)} ${year}`;
    }
    calendarEl.innerHTML = '';
    const daysInMonth = getMonthDays(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const events = getEvents();
    // Weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day calendar-header-day';
        header.style.background = '#1976d2';
        header.style.color = '#fff';
        header.style.fontWeight = 'bold';
        header.textContent = day;
        calendarEl.appendChild(header);
    });
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        calendarEl.appendChild(empty);
    }
    // Days
    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth()+1).padStart(2,'0')}-${String(todayObj.getDate()).padStart(2,'0')}`;
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        // Highlight today
        if (dateStr === todayStr) {
            dayDiv.style.background = 'rgba(25, 118, 210, 0.15)';
        }
        // Date number
        const dateNum = document.createElement('span');
        dateNum.className = 'date-number';
        dateNum.textContent = day;
        dayDiv.appendChild(dateNum);
        // Add event button
        const addBtn = document.createElement('button');
        addBtn.className = 'add-event-btn';
        addBtn.innerHTML = '+';
        addBtn.title = 'Add event';
        addBtn.onclick = () => openEventModal(dateStr);
        dayDiv.appendChild(addBtn);
        // Event list
        const eventList = document.createElement('div');
        eventList.className = 'event-list';
        if (events[dateStr]) {
            events[dateStr].forEach((ev, idx) => {
                const evDiv = document.createElement('div');
                evDiv.className = 'event-item';
                evDiv.innerHTML = `<b>${formatTime12h(ev.startTime)} - ${formatTime12h(ev.endTime)}</b><br>${ev.description}`;
                evDiv.style.cursor = 'pointer';
                evDiv.title = 'Click to edit or delete';
                evDiv.onclick = () => openEditEventModal(dateStr, idx);
                evDiv.style.borderLeft = `4px solid ${ev.color || '#1976d2'}`;
                evDiv.style.background = hexToRgba(ev.color || '#1976d2', 0.15);
                eventList.appendChild(evDiv);
            });
        }
        dayDiv.appendChild(eventList);
        calendarEl.appendChild(dayDiv);
    }
    renderUpcomingEvents();
}

function openEventModal(dateStr) {
    eventModal.style.display = 'block';
    eventDateInput.value = dateStr;
    eventForm.reset();
}

function closeEventModal() {
    eventModal.style.display = 'none';
}

closeModalBtn.onclick = closeEventModal;
window.onclick = function(event) {
    if (event.target === eventModal) closeEventModal();
};

eventForm.onsubmit = function(e) {
    e.preventDefault();
    const date = eventDateInput.value;
    const startTime = eventForm.startTime.value;
    const endTime = eventForm.endTime.value;
    const description = eventForm.description.value;
    const color = eventForm.eventColor.value || '#1976d2';
    const events = getEvents();
    if (!events[date]) events[date] = [];
    events[date].push({ startTime, endTime, description, color });
    saveEvents(events);
    closeEventModal();
    renderCalendar(currentYear, currentMonth);
};

function openEditEventModal(dateStr, eventIndex) {
    const events = getEvents();
    const event = events[dateStr][eventIndex];
    editEventDateInput.value = dateStr;
    editEventIndexInput.value = eventIndex;
    editStartTimeInput.value = event.startTime;
    editEndTimeInput.value = event.endTime;
    editDescriptionInput.value = event.description;
    editEventColorInput.value = event.color || '#1976d2';
    editEventModal.style.display = 'block';
}

function closeEditEventModal() {
    editEventModal.style.display = 'none';
}

closeEditModalBtn.onclick = closeEditEventModal;
window.addEventListener('click', function(event) {
    if (event.target === editEventModal) closeEditEventModal();
});

editEventForm.onsubmit = function(e) {
    e.preventDefault();
    const date = editEventDateInput.value;
    const index = parseInt(editEventIndexInput.value, 10);
    const events = getEvents();
    if (events[date] && events[date][index]) {
        events[date][index] = {
            startTime: editStartTimeInput.value,
            endTime: editEndTimeInput.value,
            description: editDescriptionInput.value,
            color: editEventColorInput.value || '#1976d2'
        };
        saveEvents(events);
        closeEditEventModal();
        renderCalendar(currentYear, currentMonth);
    }
};

deleteEventBtn.onclick = function() {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const date = editEventDateInput.value;
    const index = parseInt(editEventIndexInput.value, 10);
    const events = getEvents();
    if (events[date]) {
        events[date].splice(index, 1);
        if (events[date].length === 0) delete events[date];
        saveEvents(events);
        closeEditEventModal();
        renderCalendar(currentYear, currentMonth);
    }
};

function updateMonth(offset) {
    currentMonth += offset;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
}

document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    if (prevBtn && nextBtn) {
        prevBtn.onclick = () => updateMonth(-1);
        nextBtn.onclick = () => updateMonth(1);
    }
});

function getUpcomingEvents() {
    const events = getEvents();
    const today = new Date();
    let allEvents = [];
    Object.keys(events).forEach(dateStr => {
        events[dateStr].forEach(ev => {
            allEvents.push({
                ...ev,
                date: dateStr
            });
        });
    });
    // Filter for today or later
    allEvents = allEvents.filter(ev => {
        const evDate = new Date(ev.date + 'T' + (ev.startTime || '00:00'));
        return evDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
    });
    // Sort by date and time
    allEvents.sort((a, b) => {
        const aDate = new Date(a.date + 'T' + (a.startTime || '00:00'));
        const bDate = new Date(b.date + 'T' + (b.startTime || '00:00'));
        return aDate - bDate;
    });
    return allEvents.slice(0, 10);
}

function formatDashboardDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;
    const events = getUpcomingEvents();
    container.innerHTML = '';
    if (events.length === 0) {
        container.innerHTML = '<div style="color:#888;">No upcoming events.</div>';
        return;
    }
    events.forEach(ev => {
        const evDiv = document.createElement('div');
        evDiv.className = 'event-item';
        evDiv.style.borderLeft = `4px solid ${ev.color || '#1976d2'}`;
        evDiv.style.background = hexToRgba(ev.color || '#1976d2', 0.15);
        evDiv.style.marginBottom = '10px';
        evDiv.style.padding = '6px 10px';
        evDiv.innerHTML = `<b>${formatDashboardDate(ev.date)}</b><br><span>${formatTime12h(ev.startTime)} - ${formatTime12h(ev.endTime)}</span><br>${ev.description}`;
        container.appendChild(evDiv);
    });
}

// Initial render
renderCalendar(currentYear, currentMonth);
renderUpcomingEvents(); 