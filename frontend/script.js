const API_URL = '/api'; 

let currentUser = null;
let token = localStorage.getItem('token');
let selectedRole = 'student'; 
let isSignup = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Login Status to update UI
    if(token) {
        checkLoginStatus();
    }
    
    // 2. ALWAYS Load Data Public Visibility
    renderAll(); 
});

// 1. RENDER FUNCTIONS (Fetch from Database)
async function renderAll() {
    await renderNotices();
    await renderIssues();
    await renderLF();
}

async function renderNotices() {
    const container = document.getElementById('noticeList');
    
    try {
        const res = await fetch(`${API_URL}/notices`);
        if(!res.ok) throw new Error("Failed to fetch");
        const notices = await res.json();
        
        if(notices.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; color:#888;">No notices posted yet.</p>';
            return;
        }

        container.innerHTML = notices.map(n => {
            // Check if current user is the author
            const isAuthor = currentUser && n.author && currentUser.id === n.author._id;
            
            return `
            <div class="card" data-date="${n.datePosted}" data-type="notices">
                <div class="card-header">
                    <span class="badge badge-event">${n.category}</span>
                    <small style="color:var(--text-light)">${new Date(n.datePosted).toLocaleDateString()}</small>
                </div>
                <h3>${n.title}</h3>
                <p>${n.description}</p>
                
                <div style="margin-top:10px; border-top:1px solid #eee; padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                    <small style="color:#6b7280">By ${n.author?.username || 'Admin'}</small>
                    ${isAuthor ? `<small style="color:red; cursor:pointer; font-weight:bold;" onclick="deleteNotice('${n._id}')"><i class="fas fa-trash"></i> Delete</small>` : ''}
                </div>
            </div>
            `;
        }).join('');
    } catch(err) { console.error(err); }
}

async function renderIssues() {
    const container = document.getElementById('issueList');
    const today = new Date();

    try {
        const res = await fetch(`${API_URL}/complaints`);
        if(!res.ok) throw new Error("Failed to fetch");
        const issues = await res.json();

        if(issues.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; color:#888;">No issues raised yet.</p>';
            return;
        }

        const html = issues.map(i => {
            // 5-Day Expiry Check
            if (i.status === 'Resolved') {
                const issueDate = new Date(i.createdAt);
                const diffTime = Math.abs(today - issueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 5) return ''; 
            }

            const badgeColor = i.status === 'Resolved' ? 'badge-success' : 'badge-issue';
            const likes = i.likes || [];
            const dislikes = i.dislikes || [];
            const userName = i.studentId?.username || "Unknown";
            const issueId = i._id;
            
            const isLiked = currentUser && likes.includes(currentUser.username) ? 'liked' : '';
            const isDisliked = currentUser && dislikes.includes(currentUser.username) ? 'disliked' : '';

            return `
            <div class="card" data-date="${i.createdAt}" data-type="issues" id="issue-${issueId}">
                <div class="issue-layout">
                    <div class="vote-section">
                        <button class="vote-btn ${isLiked}" onclick="handleVote('${issueId}', 'like')">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                        <span class="vote-count">${likes.length}</span>
                        
                        <button class="vote-btn ${isDisliked}" style="margin-top:5px;" onclick="handleVote('${issueId}', 'dislike')">
                            <i class="fas fa-thumbs-down"></i>
                        </button>
                        <span class="vote-count">${dislikes.length}</span>
                    </div>
                    <div style="flex-grow:1">
                        <div class="card-header">
                            <span class="badge badge-issue">${i.type}</span>
                            <span class="badge ${badgeColor}">${i.status}</span>
                        </div>
                        <h3>${i.description}</h3>
                        <p style="font-size:0.9rem">By ${userName} • ${new Date(i.createdAt).toLocaleDateString()}</p>
                        ${currentUser && currentUser.username === userName ? `<small style="color:red;cursor:pointer" onclick="deleteIssue('${issueId}')">Delete</small>` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
        container.innerHTML = html;
    } catch(err) { console.error(err); }
}

async function renderLF() {
    const container = document.getElementById('lfList');
    
    try {
        const res = await fetch(`${API_URL}/lostfound`);
        if(!res.ok) throw new Error("Failed to fetch");
        const items = await res.json();

        if(items.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; color:#888;">No items reported.</p>';
            return;
        }

        container.innerHTML = items.map(item => {
            const isAuthor = currentUser && item.author && currentUser.id === item.author._id;

            return `
            <div class="card" data-date="${item.datePosted}" data-type="lostfound">
                <div class="card-header">
                    <span class="badge badge-lf">${item.type}</span>
                    <small>${new Date(item.datePosted).toLocaleDateString()}</small>
                </div>
                <h3>${item.description}</h3>
                
                <div style="margin-top:15px;">
                    <button onclick="alert('Contact Author at: ${item.author?.email || 'N/A'}')" style="width:100%; padding:8px; border:1px solid var(--primary); background:white; color:var(--primary); border-radius:6px; cursor:pointer;">
                        Contact Owner
                    </button>
                    
                    ${isAuthor ? `<button style="width:100%; margin-top:5px; padding:8px; border:1px solid var(--danger); background:white; color:var(--danger); border-radius:6px; cursor:pointer;" onclick="deleteLF('${item._id}')"><i class="fas fa-trash"></i> Delete Item</button>` : ''}
                </div>
            </div>
            `;
        }).join('');
    } catch(err) { console.error(err); }
}


// 2. ACTIONS (Vote, Post, Auth, Delete)


async function handleVote(id, type) {
    if (!token) { alert("Please Login to Vote!"); openLoginModal(); return; }

    try {
        const res = await fetch(`${API_URL}/complaints/${id}/vote`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, type })
        });
        
        if(res.ok) {
            renderIssues(); // Refresh UI
        }
    } catch(err) { console.error("Vote failed"); }
}

//  Delete Functions
async function deleteIssue(id) {
    if(!confirm("Delete this issue?")) return;
    try {
        await fetch(`${API_URL}/complaints/${id}`, { method: 'DELETE' });
        renderIssues();
    } catch(e) { alert("Error deleting"); }
}

async function deleteNotice(id) {
    if(!confirm("Delete this notice?")) return;
    try {
        await fetch(`${API_URL}/notices/${id}`, { method: 'DELETE' });
        renderNotices();
    } catch(e) { alert("Error deleting notice"); }
}

async function deleteLF(id) {
    if(!confirm("Delete this item?")) return;
    try {
        await fetch(`${API_URL}/lostfound/${id}`, { method: 'DELETE' });
        renderLF();
    } catch(e) { alert("Error deleting item"); }
}

// Auth Handler
async function handleAuthSubmit() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('username').value;
    const adminCode = document.getElementById('adminPasscode').value;

    if (isSignup && selectedRole === 'admin' && adminCode !== 'Spark@2025') {
        alert("Invalid Admin Passcode!");
        return;
    }

    const endpoint = isSignup ? '/auth/signup' : '/auth/login';
    const payload = isSignup 
        ? { username: name, email, password, role: selectedRole, adminPasscode: adminCode }
        : { email, password };

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
            if (isSignup) {
                alert("Account Created! Please Login.");
                toggleAuthMode();
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // IMPORTANT: Update Global Variables Immediately
                token = data.token;
                currentUser = data.user;
                
                closeModal('loginModal');
                checkLoginStatus();
                renderAll();
                alert("Logged In Successfully!");
            }
        } else {
            alert(data.message || "Auth Failed");
        }
    } catch (err) { alert("Server Error. Ensure backend is running."); }
}

// 3. UTILS Search, Filter, UI

function globalSearch() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(input) ? 'flex' : 'none';
    });
}

function toggleFilter() { document.getElementById('filterPopup').classList.toggle('show'); }

function applyFilters() {
    const start = document.getElementById('dateStart').value;
    const end = document.getElementById('dateEnd').value;

    document.querySelectorAll('.card').forEach(card => {
        const date = new Date(card.dataset.date);
        let visible = true;
        if(start && date < new Date(start)) visible = false;
        if(end && date > new Date(end)) visible = false;
        card.style.display = visible ? 'flex' : 'none';
    });
}

function resetFilters() {
    document.getElementById('dateStart').value = '';
    document.getElementById('dateEnd').value = '';
    applyFilters();
}

// Modal & UI Logic
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('roleSelection').style.display = 'block';
    document.getElementById('authForm').style.display = 'none';
}
function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-card').forEach(e => e.classList.remove('selected'));
    document.getElementById(`role${role.charAt(0).toUpperCase() + role.slice(1)}`).classList.add('selected');
    setTimeout(() => {
        document.getElementById('roleSelection').style.display = 'none';
        document.getElementById('authForm').style.display = 'block';
        updateAuthUI();
    }, 300);
}
function toggleAuthMode() { isSignup = !isSignup; updateAuthUI(); }
function updateAuthUI() {
    const title = document.getElementById('authTitle');
    const btn = document.querySelector('#authForm button');
    const toggle = document.querySelector('.toggle-link');
    const nameField = document.getElementById('username');
    const passField = document.getElementById('adminPassField');

    if(isSignup) {
        title.innerText = `Create ${selectedRole} Account`;
        btn.innerText = "Sign Up";
        toggle.innerText = "Login instead";
        nameField.classList.remove('hidden');
        if(selectedRole === 'admin') passField.classList.remove('hidden');
        else passField.classList.add('hidden');
    } else {
        title.innerText = "Welcome Back";
        btn.innerText = "Login";
        toggle.innerText = "Create Account";
        nameField.classList.add('hidden');
        passField.classList.add('hidden');
    }
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function openModal(id) { document.getElementById(id).style.display = 'flex'; }

function checkLoginStatus() {
    const stored = localStorage.getItem('user');
    if(stored) {
        currentUser = JSON.parse(stored);
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('userProfile').classList.remove('hidden');
        document.getElementById('userName').innerText = currentUser.username;
        
        if(currentUser.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(e => e.classList.remove('hidden'));
            document.querySelectorAll('.student-only').forEach(e => e.classList.add('hidden'));
        } else {
            document.querySelectorAll('.student-only').forEach(e => e.classList.remove('hidden'));
            document.querySelectorAll('.admin-only').forEach(e => e.classList.add('hidden'));
        }
    }
}
function logout() { localStorage.clear(); location.reload(); }
function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

//  Post Handlers With Token Check
async function postNotice() {
    if(!token) { alert("Please Login First"); openLoginModal(); return; }
    
    const title = document.getElementById('nTitle').value;
    const description = document.getElementById('nDesc').value;
    const category = document.getElementById('nCategory').value;
    await fetch(`${API_URL}/notices`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({title, description, category, authorId: currentUser.id})
    });
    closeModal('noticeModal'); renderAll();
}
async function postIssue() {
    if(!token) { alert("Please Login First"); openLoginModal(); return; }

    const type = document.getElementById('iType').value;
    const description = document.getElementById('iDesc').value;
    await fetch(`${API_URL}/complaints`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({type, description, studentId: currentUser.id})
    });
    closeModal('issueModal'); renderAll();
}
async function postLF() {
    if(!token) { alert("Please Login First"); openLoginModal(); return; }

    const type = document.getElementById('lfType').value;
    const description = document.getElementById('lfDesc').value;
    await fetch(`${API_URL}/lostfound`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({type, description, authorId: currentUser.id})
    });
    closeModal('lfModal'); renderAll();
}





