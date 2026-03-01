let currentUser = null;
let events = [];
let members = [];

function loadUser() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        window.location.href = '/';
        return;
    }

    try {
        currentUser = JSON.parse(user);
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('welcome-text').textContent = 'Welcome back, ' + currentUser.name + '!';
        document.getElementById('user-email').textContent = '\u{1F4E7} ' + currentUser.email;
        document.getElementById('profile-name').value = currentUser.name;
        document.getElementById('profile-email').value = currentUser.email;
    } catch (e) {
        window.location.href = '/';
    }
}

function showView(viewName) {
    document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
    document.getElementById(viewName + '-view').classList.add('active');

    if (viewName === 'events') loadEvents();
    if (viewName === 'members') loadMembers();
    if (viewName === 'attendance') loadAttendance();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// EVENTS
function addEvent(e) {
    e.preventDefault();
    const evt = {
        id: Date.now(),
        name: document.getElementById('event-name').value,
        date: document.getElementById('event-date').value,
        time: document.getElementById('event-time').value,
        location: document.getElementById('event-location').value,
    };
    events.push(evt);
    localStorage.setItem('events', JSON.stringify(events));
    document.getElementById('event-form').reset();
    loadEvents();
}

function loadEvents() {
    const stored = localStorage.getItem('events');
    events = stored ? JSON.parse(stored) : [];

    const list = document.getElementById('events-list');
    if (events.length === 0) {
        list.innerHTML = '<div class="empty-state">No events scheduled yet</div>';
    } else {
        list.innerHTML = events.map(function(e) {
            return '<div class="item">' +
                '<h4>' + escapeHtml(e.name) + '</h4>' +
                '<p>\uD83D\uDCC5 ' + escapeHtml(e.date) + ' at ' + escapeHtml(e.time) + '</p>' +
                '<p>\uD83D\uDCCD ' + escapeHtml(e.location) + '</p>' +
                '<button class="delete-btn" data-id="' + e.id + '">Delete</button>' +
                '</div>';
        }).join('');
    }
}

function deleteEvent(id) {
    events = events.filter(function(e) { return e.id !== id; });
    localStorage.setItem('events', JSON.stringify(events));
    loadEvents();
}

// MEMBERS
function addMember(e) {
    e.preventDefault();
    const member = {
        id: Date.now(),
        name: document.getElementById('member-name').value,
        email: document.getElementById('member-email').value,
        voice: document.getElementById('member-voice').value,
        phone: document.getElementById('member-phone').value,
    };
    members.push(member);
    localStorage.setItem('members', JSON.stringify(members));
    document.getElementById('member-form').reset();
    loadMembers();
}

function loadMembers() {
    const stored = localStorage.getItem('members');
    members = stored ? JSON.parse(stored) : [];

    const list = document.getElementById('members-list');
    if (members.length === 0) {
        list.innerHTML = '<div class="empty-state">No members added yet</div>';
    } else {
        list.innerHTML = members.map(function(m) {
            return '<div class="item">' +
                '<h4>' + escapeHtml(m.name) + '</h4>' +
                '<p>\uD83D\uDCE7 ' + escapeHtml(m.email) + '</p>' +
                '<p>\uD83C\uDFA4 ' + escapeHtml(m.voice || 'Not specified') + '</p>' +
                '<p>\uD83D\uDCF1 ' + escapeHtml(m.phone || 'Not provided') + '</p>' +
                '<button class="delete-btn" data-id="' + m.id + '">Remove</button>' +
                '</div>';
        }).join('');
    }
}

function deleteMember(id) {
    members = members.filter(function(m) { return m.id !== id; });
    localStorage.setItem('members', JSON.stringify(members));
    loadMembers();
}

// ATTENDANCE
function loadAttendance() {
    const list = document.getElementById('attendance-list');
    if (members.length === 0) {
        list.innerHTML = '<div class="empty-state">Add members first to track attendance</div>';
    } else {
        list.innerHTML = members.map(function(m) {
            return '<div class="item">' +
                '<h4>' + escapeHtml(m.name) + '</h4>' +
                '<p>\uD83D\uDCCA Total attended: 0 / 0 events</p>' +
                '</div>';
        }).join('');
    }
}

// MESSAGES
function sendMessage(e) {
    e.preventDefault();
    alert('Message sent to all ' + members.length + ' members!');
    document.getElementById('message-form').reset();
}

// PROFILE
function updateProfile(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    currentUser.name = name;
    localStorage.setItem('user', JSON.stringify(currentUser));
    document.getElementById('user-name').textContent = name;
    alert('Profile updated successfully!');
}

// SETTINGS
function saveSettings() {
    alert('Settings saved successfully!');
}

// XSS protection for innerHTML content
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Event delegation for dynamically created delete buttons
document.getElementById('events-list').addEventListener('click', function(e) {
    if (e.target.matches('.delete-btn[data-id]')) {
        deleteEvent(Number(e.target.dataset.id));
    }
});

document.getElementById('members-list').addEventListener('click', function(e) {
    if (e.target.matches('.delete-btn[data-id]')) {
        deleteMember(Number(e.target.dataset.id));
    }
});

// Wire up nav/card navigation (data-view attribute)
document.querySelectorAll('[data-view]').forEach(function(el) {
    el.addEventListener('click', function() {
        showView(this.dataset.view);
    });
});

// Wire up logout
document.getElementById('logout-btn').addEventListener('click', logout);

// Wire up forms
document.getElementById('event-form').addEventListener('submit', addEvent);
document.getElementById('member-form').addEventListener('submit', addMember);
document.getElementById('message-form').addEventListener('submit', sendMessage);
document.getElementById('profile-form').addEventListener('submit', updateProfile);

// Wire up save settings button
document.getElementById('save-settings-btn').addEventListener('click', saveSettings);

loadUser();
