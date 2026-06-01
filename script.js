/* =============================================
   ConstructPro — script.js
   Full featured Construction PMS
   ============================================= */

'use strict';

// =================== STATE ===================
let state = {
  projects: [],
  staff: [],
  deadlines: [],
  notifications: [],
  settings: {
    companyName: 'ConstructPro',
    adminName: 'Construction Manager',
    logoUrl: '',
    theme: 'dark'
  }
};

let charts = {};
let currentPage = 'dashboard';
let deleteCallback = null;
let currentDetailId = null;

// =================== STORAGE ===================
const KEYS = { projects:'cp_projects', staff:'cp_staff', deadlines:'cp_deadlines', notifications:'cp_notifications', settings:'cp_settings' };

function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {} }
function load(key) { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; } catch(e) { return null; } }

function saveAll() {
  save(KEYS.projects, state.projects);
  save(KEYS.staff, state.staff);
  save(KEYS.deadlines, state.deadlines);
  save(KEYS.notifications, state.notifications);
  save(KEYS.settings, state.settings);
}

function loadAll() {
  state.projects    = load(KEYS.projects)      || [];
  state.staff       = load(KEYS.staff)         || [];
  state.deadlines   = load(KEYS.deadlines)     || [];
  state.notifications = load(KEYS.notifications) || [];
  state.settings    = load(KEYS.settings)      || state.settings;
}

// =================== DEMO DATA ===================
function loadDemoData() {
  const today = new Date();
  const d = (offset) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString().split('T')[0];
  };

  state.projects = [
    { id:'P001', name:'Downtown Skyline Tower', client:'Apex Developments', type:'Commercial', status:'In Progress', address:'23 MG Road', city:'Hyderabad', state:'Telangana', country:'India', start:d(-180), end:d(120), budget:120000000, progress:62, manager:'Rajesh Kumar', desc:'40-floor commercial skyscraper in the heart of downtown.', stages: defaultStages(62) },
    { id:'P002', name:'Green Valley Residency', client:'Srinivas Builders', type:'Residential', status:'In Progress', address:'Plot 88, Gachibowli', city:'Hyderabad', state:'Telangana', country:'India', start:d(-90), end:d(200), budget:45000000, progress:38, manager:'Priya Sharma', desc:'200-unit luxury apartment complex with amenities.', stages: defaultStages(38) },
    { id:'P003', name:'Pharma Industrial Hub', client:'LifeScience Corp', type:'Industrial', status:'Planning', address:'JNPC Zone 4', city:'Vizag', state:'AP', country:'India', start:d(10), end:d(400), budget:280000000, progress:5, manager:'Mohammed Ali', desc:'Large-scale pharmaceutical manufacturing facility.', stages: defaultStages(5) },
    { id:'P004', name:'Heritage Mall Expansion', client:'RetailMax Group', type:'Commercial', status:'Delayed', address:'Begumpet Road', city:'Hyderabad', state:'Telangana', country:'India', start:d(-200), end:d(-10), budget:68000000, progress:78, manager:'Sunita Rao', desc:'Extension of Heritage Mall, adding 3 new wings.', stages: defaultStages(78) },
    { id:'P005', name:'Sunrise Villa Community', client:'Dream Homes Ltd', type:'Residential', status:'Completed', address:'Kompally Main Road', city:'Hyderabad', state:'Telangana', country:'India', start:d(-400), end:d(-30), budget:35000000, progress:100, manager:'Kiran Babu', desc:'72-unit premium villa gated community.', stages: defaultStages(100) },
    { id:'P006', name:'City Bridge Renovation', client:'GHMC Authority', type:'Industrial', status:'In Progress', address:'Hussainsagar Bridge', city:'Hyderabad', state:'Telangana', country:'India', start:d(-60), end:d(90), budget:52000000, progress:45, manager:'Arjun Reddy', desc:'Complete renovation and structural upgrade of historic bridge.', stages: defaultStages(45) },
    { id:'P007', name:'TechPark Phase 2', client:'InfoSys Realty', type:'Commercial', status:'Planning', address:'HITEC City', city:'Hyderabad', state:'Telangana', country:'India', start:d(30), end:d(500), budget:340000000, progress:0, manager:'Nandini Iyer', desc:'Second phase of IT park, 5 buildings.', stages: defaultStages(0) },
  ];

  state.staff = [
    { id:'E001', name:'Rajesh Kumar', role:'Project Manager', phone:'+91 98765 43210', email:'rajesh@constructpro.in', project:'Downtown Skyline Tower', status:'Active' },
    { id:'E002', name:'Priya Sharma', role:'Architect', phone:'+91 87654 32109', email:'priya@constructpro.in', project:'Green Valley Residency', status:'Active' },
    { id:'E003', name:'Mohammed Ali', role:'Civil Engineer', phone:'+91 76543 21098', email:'ali@constructpro.in', project:'Pharma Industrial Hub', status:'Active' },
    { id:'E004', name:'Sunita Rao', role:'Site Engineer', phone:'+91 65432 10987', email:'sunita@constructpro.in', project:'Heritage Mall Expansion', status:'On Leave' },
    { id:'E005', name:'Kiran Babu', role:'Supervisor', phone:'+91 54321 09876', email:'kiran@constructpro.in', project:'', status:'Active' },
    { id:'E006', name:'Arjun Reddy', role:'Project Manager', phone:'+91 43210 98765', email:'arjun@constructpro.in', project:'City Bridge Renovation', status:'Active' },
    { id:'E007', name:'Nandini Iyer', role:'Architect', phone:'+91 32109 87654', email:'nandini@constructpro.in', project:'TechPark Phase 2', status:'Active' },
    { id:'E008', name:'Venkat Swamy', role:'Worker', phone:'+91 21098 76543', email:'venkat@constructpro.in', project:'Downtown Skyline Tower', status:'Active' },
    { id:'E009', name:'Deepa Krishnan', role:'Civil Engineer', phone:'+91 10987 65432', email:'deepa@constructpro.in', project:'Green Valley Residency', status:'Inactive' },
  ];

  state.deadlines = [
    { id:'D001', project:'Downtown Skyline Tower', task:'Complete floor 25–30 structural work', assigned:'Rajesh Kumar', due: d(-2), priority:'High' },
    { id:'D002', project:'Green Valley Residency', task:'Foundation waterproofing inspection', assigned:'Priya Sharma', due: d(3), priority:'Medium' },
    { id:'D003', project:'Heritage Mall Expansion', task:'Submit revised construction drawings', assigned:'Sunita Rao', due: d(-15), priority:'High' },
    { id:'D004', project:'City Bridge Renovation', task:'Traffic diversion plan approval', assigned:'Arjun Reddy', due: d(10), priority:'Low' },
    { id:'D005', project:'TechPark Phase 2', task:'Environmental clearance submission', assigned:'Nandini Iyer', due: d(25), priority:'Medium' },
    { id:'D006', project:'Pharma Industrial Hub', task:'JNPC zone permit renewal', assigned:'Mohammed Ali', due: d(5), priority:'High' },
  ];

  state.notifications = [
    { id:'N001', type:'warning', msg:'Deadline approaching: Structural work due in 3 days', time:'2 hours ago' },
    { id:'N002', type:'danger', msg:'Project "Heritage Mall Expansion" is now Delayed', time:'1 day ago' },
    { id:'N003', type:'success', msg:'Project "Sunrise Villa Community" marked Completed', time:'2 days ago' },
    { id:'N004', type:'primary', msg:'New project "TechPark Phase 2" added to pipeline', time:'3 days ago' },
  ];

  saveAll();
}

function defaultStages(overallProgress) {
  const stages = [
    'Planning','Site Preparation','Foundation','Structural Work','Roofing','Electrical','Plumbing','Interior Finishing','Quality Inspection','Completed'
  ];
  const today = new Date();
  return stages.map((name, i) => {
    const offset = i * 30;
    const start = new Date(today); start.setDate(start.getDate() - (300 - offset));
    const end = new Date(start); end.setDate(end.getDate() + 30);
    let pct = 0;
    const stageThreshold = (i + 1) * 10;
    if (overallProgress >= stageThreshold) pct = 100;
    else if (overallProgress >= i * 10) pct = Math.round((overallProgress - i * 10) * 10);
    let status = pct === 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Pending';
    return { name, pct, start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0], status };
  });
}

// =================== INIT ===================
window.addEventListener('DOMContentLoaded', () => {
  loadAll();
  if (!state.projects.length) loadDemoData();

  applySettings();
  updateDate();
  setInterval(updateDate, 60000);

  bindSidebar();
  bindGlobalSearch();
  bindNotifications();

  navigateTo('dashboard');
});

// =================== DATE ===================
function updateDate() {
  const el = document.getElementById('topbarDate');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
  }
}

// =================== SIDEBAR ===================
function bindSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const overlay = document.getElementById('sidebarOverlay');

  toggle?.addEventListener('click', () => {
    if (window.innerWidth > 900) {
      sidebar.classList.toggle('collapsed');
    }
  });

  mobileBtn?.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  });

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
      if (window.innerWidth <= 900) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      }
    });
  });

  document.querySelectorAll('.view-all[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });
}

// =================== NAVIGATION ===================
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.remove('hidden');

  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  currentPage = page;

  // Render page-specific content
  switch (page) {
    case 'dashboard':  renderDashboard(); break;
    case 'projects':   renderProjects(); break;
    case 'locations':  renderLocations(); break;
    case 'staff':      renderStaff(); break;
    case 'stages':     renderStageSelector(); break;
    case 'deadlines':  renderDeadlines(); break;
    case 'reports':    renderReports(); break;
    case 'settings':   renderSettings(); break;
  }
}

// =================== DASHBOARD ===================
function renderDashboard() {
  updateStats();
  renderRecentProjects();
  renderCharts();
}

function updateStats() {
  const projects = state.projects;
  const total = projects.length;
  const active = projects.filter(p => p.status === 'In Progress').length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  const delayed = projects.filter(p => p.status === 'Delayed').length;

  animateCount('statTotal', total);
  animateCount('statActive', active);
  animateCount('statCompleted', completed);
  animateCount('statDelayed', delayed);

  const badge = document.getElementById('projectsBadge');
  if (badge) { badge.textContent = total; badge.classList.toggle('show', total > 0); }

  updateNotifBadge();
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const duration = 600;
  const startTime = performance.now();
  const update = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const val = Math.round(start + (target - start) * easeOut(progress));
    el.textContent = val;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function easeOut(t) { return 1 - (1 - t) * (1 - t); }

function renderRecentProjects() {
  const tbody = document.getElementById('recentProjectsTbody');
  if (!tbody) return;
  const recent = [...state.projects].slice(0, 6);
  tbody.innerHTML = recent.map(p => `
    <tr>
      <td>
        <div style="font-weight:600">${p.name}</div>
        <div style="font-size:11px;color:var(--text-muted)">${p.type}</div>
      </td>
      <td>${p.client}</td>
      <td>
        <div class="prog-wrap">
          <div class="prog-bar-bg"><div class="prog-bar-fill" style="width:${p.progress}%"></div></div>
          <span class="prog-label">${p.progress}%</span>
        </div>
      </td>
      <td>${statusBadge(p.status)}</td>
      <td style="font-size:12.5px;color:var(--text-muted)">${formatDate(p.end)}</td>
    </tr>
  `).join('');
}

function renderCharts() {
  renderStatusChart();
  renderProgressChart();
}

function renderStatusChart() {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;
  if (charts.status) { charts.status.destroy(); }

  const counts = {
    'Planning': state.projects.filter(p => p.status === 'Planning').length,
    'In Progress': state.projects.filter(p => p.status === 'In Progress').length,
    'Delayed': state.projects.filter(p => p.status === 'Delayed').length,
    'Completed': state.projects.filter(p => p.status === 'Completed').length,
  };

  charts.status = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#3B82F6','#F97316','#EF4444','#22C55E'],
        borderColor: 'transparent',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94A3B8', padding: 16, font: { size: 12 } } }
      },
      cutout: '68%'
    }
  });
}

function renderProgressChart() {
  const ctx = document.getElementById('progressChart');
  if (!ctx) return;
  if (charts.progress) charts.progress.destroy();

  const labels = state.projects.slice(0, 7).map(p => p.name.split(' ').slice(0,2).join(' '));
  const data = state.projects.slice(0, 7).map(p => p.progress);

  charts.progress = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Progress %',
        data,
        backgroundColor: data.map(v => v >= 80 ? '#22C55E' : v >= 50 ? '#F97316' : '#3B82F6'),
        borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748B', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748B', font: { size: 11 } }, max: 100, min: 0 }
      }
    }
  });
}

// =================== PROJECTS ===================
function renderProjects(filter = {}) {
  const tbody = document.getElementById('projectsTbody');
  if (!tbody) return;

  let projects = [...state.projects];

  const search = (document.getElementById('projectSearch')?.value || '').toLowerCase();
  const statusF = document.getElementById('statusFilter')?.value || '';
  const typeF = document.getElementById('typeFilter')?.value || '';

  if (search) projects = projects.filter(p => p.name.toLowerCase().includes(search) || p.client.toLowerCase().includes(search) || p.city?.toLowerCase().includes(search));
  if (statusF) projects = projects.filter(p => p.status === statusF);
  if (typeF) projects = projects.filter(p => p.type === typeF);

  if (!projects.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-dim)">No projects found</td></tr>`;
    return;
  }

  tbody.innerHTML = projects.map(p => `
    <tr>
      <td style="font-size:11px;color:var(--text-dim);font-family:monospace">${p.id}</td>
      <td>
        <div style="font-weight:600;font-size:13.5px">${p.name}</div>
        <div style="font-size:11px;color:var(--text-muted)">${p.type}</div>
      </td>
      <td>${p.client}</td>
      <td style="font-size:12.5px">${p.city || '—'}</td>
      <td style="font-size:12px;color:var(--text-muted)">${formatDate(p.start)}</td>
      <td style="font-size:12px;color:var(--text-muted)">${formatDate(p.end)}</td>
      <td style="font-size:12.5px;white-space:nowrap">₹${formatBudget(p.budget)}</td>
      <td>
        <div class="prog-wrap" style="min-width:100px">
          <div class="prog-bar-bg"><div class="prog-bar-fill" style="width:${p.progress}%"></div></div>
          <span class="prog-label">${p.progress}%</span>
        </div>
      </td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn" onclick="viewProject('${p.id}')">View</button>
          <button class="action-btn" onclick="editProject('${p.id}')">Edit</button>
          <button class="action-btn delete" onclick="confirmDelete('project','${p.id}')">Del</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterProjects() { renderProjects(); }

function viewProject(id) {
  currentDetailId = id;
  navigateTo('detail');
  renderProjectDetail(id);
}

function renderProjectDetail(id) {
  const p = state.projects.find(pr => pr.id === id);
  if (!p) return;

  document.getElementById('detailProjectName').textContent = p.name;
  document.getElementById('detailProjectClient').textContent = `Client: ${p.client} · ${p.type}`;

  const editBtn = document.getElementById('detailEditBtn');
  if (editBtn) editBtn.onclick = () => editProject(id);

  const assignedStaff = state.staff.filter(s => s.project === p.name);

  const stages = p.stages || defaultStages(p.progress);

  const content = document.getElementById('detailContent');
  content.innerHTML = `
    <div class="detail-grid">
      <div class="detail-card">
        <h4>Project Information</h4>
        ${detailRow('Project ID', p.id)}
        ${detailRow('Client', p.client)}
        ${detailRow('Type', p.type)}
        ${detailRow('Status', statusBadge(p.status))}
        ${detailRow('Site Manager', p.manager || '—')}
        ${detailRow('Budget', '₹' + formatBudget(p.budget))}
      </div>
      <div class="detail-card">
        <h4>Timeline</h4>
        ${detailRow('Start Date', formatDate(p.start))}
        ${detailRow('End Date', formatDate(p.end))}
        ${detailRow('Duration', calcDuration(p.start, p.end))}
        ${detailRow('Days Remaining', calcRemaining(p.end))}
        <div class="big-progress" style="margin-top:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:12.5px">
            <span style="color:var(--text-muted)">Overall Progress</span>
            <span style="font-weight:700;color:var(--primary)">${p.progress}%</span>
          </div>
          <div class="big-prog-bar-bg"><div class="big-prog-bar-fill" style="width:${p.progress}%"></div></div>
        </div>
      </div>
      <div class="detail-card">
        <h4>Site Information</h4>
        ${detailRow('Address', p.address || '—')}
        ${detailRow('City', p.city || '—')}
        ${detailRow('State', p.state || '—')}
        ${detailRow('Country', p.country || '—')}
      </div>
      <div class="detail-card">
        <h4>Description</h4>
        <p style="font-size:13.5px;color:var(--text-muted);line-height:1.7">${p.desc || 'No description provided.'}</p>
      </div>
    </div>

    <div class="detail-card" style="margin-bottom:16px">
      <h4>Assigned Staff (${assignedStaff.length})</h4>
      ${assignedStaff.length ? `
        <div class="staff-cards-grid">
          ${assignedStaff.map(s => `
            <div class="staff-mini-card">
              <div class="staff-mini-av" style="background:${avatarColor(s.name)}">${initials(s.name)}</div>
              <div class="staff-mini-name">${s.name}</div>
              <div class="staff-mini-role">${s.role}</div>
            </div>
          `).join('')}
        </div>
      ` : `<p style="color:var(--text-dim);font-size:13px">No staff assigned yet</p>`}
    </div>

    <div class="detail-card" style="margin-bottom:16px">
      <h4>Construction Stages</h4>
      <div class="stages-list" style="margin-top:14px">
        ${stages.map((st, i) => `
          <div class="stage-card">
            <div class="stage-num" style="background:${stageColor(st.status)};color:#fff">${i+1}</div>
            <div class="stage-info">
              <div class="stage-name">${st.name}</div>
              <div class="stage-dates">${formatDate(st.start)} — ${formatDate(st.end)}</div>
            </div>
            <div class="stage-prog-wrap">
              <div class="stage-prog-label"><span>Progress</span><span>${st.pct}%</span></div>
              <div class="prog-bar-bg"><div class="prog-bar-fill" style="width:${st.pct}%"></div></div>
            </div>
            <div class="stage-status">${stageBadge(st.status)}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="detail-card">
      <h4>Recent Activity</h4>
      <div class="activity-feed">
        ${generateActivity(p)}
      </div>
    </div>
  `;

  document.querySelector('.nav-item.active')?.classList.remove('active');
}

function detailRow(label, value) {
  return `<div class="detail-row"><span class="detail-row-label">${label}</span><span class="detail-row-value">${value}</span></div>`;
}

function calcDuration(start, end) {
  if (!start || !end) return '—';
  const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
  const months = Math.floor(diff / 30);
  return `${months} months (${Math.round(diff)} days)`;
}

function calcRemaining(end) {
  if (!end) return '—';
  const diff = Math.ceil((new Date(end) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `<span style="color:var(--danger)">${Math.abs(diff)} days overdue</span>`;
  if (diff === 0) return `<span style="color:var(--warning)">Due today</span>`;
  return `<span style="color:var(--success)">${diff} days</span>`;
}

function generateActivity(p) {
  const activities = [
    { text: `Project "${p.name}" progress updated to ${p.progress}%`, time: '2 hours ago' },
    { text: `Budget allocation confirmed for ₹${formatBudget(p.budget)}`, time: '1 day ago' },
    { text: `Site inspection completed`, time: '2 days ago' },
    { text: `Project kickoff meeting held with ${p.client}`, time: '1 week ago' },
    { text: `Project "${p.name}" created in system`, time: '2 weeks ago' },
  ];
  return activities.map(a => `
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div>
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

function stageColor(status) {
  if (status === 'Completed') return 'var(--success)';
  if (status === 'In Progress') return 'var(--primary)';
  return 'var(--text-dim)';
}

function stageBadge(status) {
  const map = { 'Completed': 'completed', 'In Progress': 'inprogress', 'Pending': 'planning' };
  return `<span class="badge badge-${map[status] || 'planning'}">${status}</span>`;
}

function editProject(id) {
  const p = state.projects.find(pr => pr.id === id);
  if (!p) return;
  document.getElementById('projectModalTitle').textContent = 'Edit Project';
  document.getElementById('projectEditId').value = p.id;
  document.getElementById('projName').value = p.name;
  document.getElementById('projClient').value = p.client;
  document.getElementById('projType').value = p.type;
  document.getElementById('projStatus').value = p.status;
  document.getElementById('projAddress').value = p.address || '';
  document.getElementById('projCity').value = p.city || '';
  document.getElementById('projState').value = p.state || '';
  document.getElementById('projCountry').value = p.country || '';
  document.getElementById('projStart').value = p.start || '';
  document.getElementById('projEnd').value = p.end || '';
  document.getElementById('projBudget').value = p.budget || '';
  document.getElementById('projProgress').value = p.progress || 0;
  document.getElementById('projManager').value = p.manager || '';
  document.getElementById('projDesc').value = p.desc || '';
  openModal('addProjectModal');
}

function saveProject() {
  const name = document.getElementById('projName').value.trim();
  const client = document.getElementById('projClient').value.trim();
  if (!name || !client) { showToast('Project name and client are required', 'error'); return; }

  const editId = document.getElementById('projectEditId').value;
  const isEdit = !!editId;

  const proj = {
    id: editId || `P${String(state.projects.length + 1).padStart(3,'0')}`,
    name, client,
    type: document.getElementById('projType').value,
    status: document.getElementById('projStatus').value,
    address: document.getElementById('projAddress').value.trim(),
    city: document.getElementById('projCity').value.trim(),
    state: document.getElementById('projState').value.trim(),
    country: document.getElementById('projCountry').value.trim(),
    start: document.getElementById('projStart').value,
    end: document.getElementById('projEnd').value,
    budget: parseFloat(document.getElementById('projBudget').value) || 0,
    progress: parseInt(document.getElementById('projProgress').value) || 0,
    manager: document.getElementById('projManager').value.trim(),
    desc: document.getElementById('projDesc').value.trim(),
  };

  if (isEdit) {
    const idx = state.projects.findIndex(p => p.id === editId);
    if (idx >= 0) {
      proj.stages = state.projects[idx].stages || defaultStages(proj.progress);
      state.projects[idx] = proj;
    }
  } else {
    proj.stages = defaultStages(proj.progress);
    state.projects.unshift(proj);
    addNotification('primary', `New project "${proj.name}" added`);
  }

  saveAll();
  closeModal('addProjectModal');
  showToast(isEdit ? 'Project updated!' : 'Project added!', 'success');
  clearProjectForm();
  renderProjects();
  updateStats();
  renderCharts();
}

function clearProjectForm() {
  ['projName','projClient','projAddress','projCity','projState','projCountry','projStart','projEnd','projBudget','projProgress','projManager','projDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('projectEditId').value = '';
  document.getElementById('projectModalTitle').textContent = 'Add New Project';
}

function confirmDelete(type, id) {
  const messages = { project: 'Are you sure you want to delete this project?', staff: 'Are you sure you want to delete this employee?', deadline: 'Are you sure you want to delete this task?' };
  document.getElementById('deleteConfirmMsg').textContent = messages[type] || 'Delete this item?';
  deleteCallback = () => {
    if (type === 'project') deleteProject(id);
    if (type === 'staff') deleteStaff(id);
    if (type === 'deadline') deleteDeadline(id);
  };
  document.getElementById('confirmDeleteBtn').onclick = () => {
    if (deleteCallback) deleteCallback();
    closeModal('confirmDeleteModal');
  };
  openModal('confirmDeleteModal');
}

function deleteProject(id) {
  state.projects = state.projects.filter(p => p.id !== id);
  saveAll();
  showToast('Project deleted', 'info');
  renderProjects();
  updateStats();
  renderCharts();
}

// =================== LOCATIONS ===================
function renderLocations() {
  const grid = document.getElementById('sitesGrid');
  if (!grid) return;
  if (!state.projects.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><p>No site locations yet</p></div>`;
    return;
  }
  grid.innerHTML = state.projects.map(p => `
    <div class="site-card">
      <div class="site-accent"></div>
      <div class="site-card-top">
        <div>
          <div class="site-card-name">${p.name}</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:2px">${p.type}</div>
        </div>
        ${statusBadge(p.status)}
      </div>
      <div class="site-card-body">
        <div>📍 <span>${p.address ? p.address + ', ' : ''}${p.city || '—'}</span></div>
        <div>👤 Site Manager: <span>${p.manager || '—'}</span></div>
        <div>🏗️ Stage: <span>${currentStage(p)}</span></div>
        <div>📅 End: <span>${formatDate(p.end)}</span></div>
      </div>
      <div class="site-card-footer">
        <div class="prog-wrap">
          <div class="prog-bar-bg"><div class="prog-bar-fill" style="width:${p.progress}%"></div></div>
          <span class="prog-label">${p.progress}%</span>
        </div>
        <button class="btn btn-outline btn-sm" onclick="viewProject('${p.id}')" style="margin-top:10px;width:100%">View Details</button>
      </div>
    </div>
  `).join('');
}

function currentStage(p) {
  if (!p.stages) return 'Not started';
  const active = p.stages.find(s => s.status === 'In Progress');
  if (active) return active.name;
  const last = [...p.stages].reverse().find(s => s.status === 'Completed');
  return last ? last.name : 'Planning';
}

// =================== STAFF ===================
function renderStaff() {
  const tbody = document.getElementById('staffTbody');
  if (!tbody) return;
  populateStaffProjectDropdown();

  let staff = [...state.staff];
  const search = (document.getElementById('staffSearch')?.value || '').toLowerCase();
  const roleF = document.getElementById('staffRoleFilter')?.value || '';
  const statusF = document.getElementById('staffStatusFilter')?.value || '';

  if (search) staff = staff.filter(s => s.name.toLowerCase().includes(search) || s.role.toLowerCase().includes(search) || s.email.toLowerCase().includes(search));
  if (roleF) staff = staff.filter(s => s.role === roleF);
  if (statusF) staff = staff.filter(s => s.status === statusF);

  if (!staff.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-dim)">No employees found</td></tr>`;
    return;
  }

  tbody.innerHTML = staff.map(s => `
    <tr>
      <td style="font-size:11px;color:var(--text-dim);font-family:monospace">${s.id}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:30px;height:30px;border-radius:50%;background:${avatarColor(s.name)};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:#fff;flex-shrink:0">${initials(s.name)}</div>
          <span style="font-weight:600">${s.name}</span>
        </div>
      </td>
      <td style="font-size:12.5px">${s.role}</td>
      <td style="font-size:12.5px;color:var(--text-muted)">${s.phone}</td>
      <td style="font-size:12px;color:var(--text-muted)">${s.email}</td>
      <td style="font-size:12.5px">${s.project || '<span style="color:var(--text-dim)">Unassigned</span>'}</td>
      <td>${staffStatusBadge(s.status)}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn" onclick="editStaff('${s.id}')">Edit</button>
          <button class="action-btn delete" onclick="confirmDelete('staff','${s.id}')">Del</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterStaff() { renderStaff(); }

function populateStaffProjectDropdown() {
  const sel = document.getElementById('staffProject');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">— Unassigned —</option>' +
    state.projects.map(p => `<option value="${p.name}" ${p.name === current ? 'selected':''}>  ${p.name}</option>`).join('');
}

function openAddStaffModal() {
  document.getElementById('staffModalTitle').textContent = 'Add Employee';
  document.getElementById('staffEditId').value = '';
  ['staffName','staffPhone','staffEmail'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  document.getElementById('staffRole').value = 'Project Manager';
  document.getElementById('staffStatus').value = 'Active';
  populateStaffProjectDropdown();
}

function editStaff(id) {
  const s = state.staff.find(st => st.id === id);
  if (!s) return;
  document.getElementById('staffModalTitle').textContent = 'Edit Employee';
  document.getElementById('staffEditId').value = s.id;
  document.getElementById('staffName').value = s.name;
  document.getElementById('staffRole').value = s.role;
  document.getElementById('staffPhone').value = s.phone;
  document.getElementById('staffEmail').value = s.email;
  document.getElementById('staffStatus').value = s.status;
  populateStaffProjectDropdown();
  document.getElementById('staffProject').value = s.project || '';
  openModal('addStaffModal');
}

function saveStaff() {
  const name = document.getElementById('staffName').value.trim();
  if (!name) { showToast('Employee name is required', 'error'); return; }
  const editId = document.getElementById('staffEditId').value;
  const emp = {
    id: editId || `E${String(state.staff.length + 1).padStart(3,'0')}`,
    name,
    role: document.getElementById('staffRole').value,
    phone: document.getElementById('staffPhone').value.trim(),
    email: document.getElementById('staffEmail').value.trim(),
    project: document.getElementById('staffProject').value,
    status: document.getElementById('staffStatus').value,
  };
  if (editId) {
    const idx = state.staff.findIndex(s => s.id === editId);
    if (idx >= 0) state.staff[idx] = emp;
  } else {
    state.staff.push(emp);
  }
  saveAll();
  closeModal('addStaffModal');
  showToast(editId ? 'Employee updated!' : 'Employee added!', 'success');
  renderStaff();
}

function deleteStaff(id) {
  state.staff = state.staff.filter(s => s.id !== id);
  saveAll();
  showToast('Employee deleted', 'info');
  renderStaff();
}

// =================== STAGES ===================
function renderStageSelector() {
  const sel = document.getElementById('stageProjectFilter');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select Project</option>' +
    state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function renderStages() {
  const selVal = document.getElementById('stageProjectFilter')?.value;
  const cont = document.getElementById('stagesContent');
  if (!cont) return;

  if (!selVal) {
    cont.innerHTML = `<div class="empty-state"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><p>Select a project to view its stages</p></div>`;
    return;
  }

  const p = state.projects.find(pr => pr.id === selVal);
  if (!p) return;

  const stages = p.stages || defaultStages(p.progress);

  cont.innerHTML = `
    <div class="detail-card" style="margin-bottom:16px">
      <h4 style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:4px">${p.name}</h4>
      <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:16px">Overall: ${p.progress}% · ${p.status}</div>
      <div class="big-prog-bar-bg"><div class="big-prog-bar-fill" style="width:${p.progress}%"></div></div>
    </div>
    <div class="stages-list">
      ${stages.map((st, i) => `
        <div class="stage-card">
          <div class="stage-num" style="background:${stageColor(st.status)};color:#fff;font-weight:800">${i+1}</div>
          <div class="stage-info" style="flex:1">
            <div class="stage-name">${st.name}</div>
            <div class="stage-dates">${formatDate(st.start)} — ${formatDate(st.end)}</div>
          </div>
          <div style="width:200px">
            <div class="stage-prog-label"><span style="font-size:11.5px;color:var(--text-muted)">Completion</span><span style="font-size:11.5px;font-weight:700">${st.pct}%</span></div>
            <div class="prog-bar-bg" style="margin-top:4px"><div class="prog-bar-fill" style="width:${st.pct}%"></div></div>
          </div>
          <div style="width:100px;text-align:right">${stageBadge(st.status)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// =================== DEADLINES ===================
function renderDeadlines() {
  const grid = document.getElementById('deadlinesGrid');
  if (!grid) return;

  populateDeadlineProjectDropdown();

  if (!state.deadlines.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><p>No deadlines set</p></div>`;
    return;
  }

  const today = new Date(); today.setHours(0,0,0,0);

  grid.innerHTML = state.deadlines.map(d => {
    const due = new Date(d.due); due.setHours(0,0,0,0);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    let cls = 'on-time', label = `${diff} days left`;
    if (diff < 0) { cls = 'overdue'; label = `${Math.abs(diff)} days overdue`; }
    else if (diff <= 5) { cls = 'due-soon'; label = `Due in ${diff} day${diff===1?'':'s'}`; }

    return `
      <div class="deadline-card ${cls}">
        <div class="deadline-indicator"></div>
        <div class="deadline-task">${d.task}</div>
        <div class="deadline-meta">📁 ${d.project}</div>
        <div class="deadline-meta">👤 ${d.assigned || '—'}</div>
        <div class="deadline-meta">📅 Due: ${formatDate(d.due)} · <strong style="color:${cls==='overdue'?'var(--danger)':cls==='due-soon'?'var(--warning)':'var(--success)'}">${label}</strong></div>
        <div class="deadline-footer">
          <span class="priority-badge priority-${d.priority.toLowerCase()}">${d.priority}</span>
          <div class="deadline-actions">
            <button class="action-btn" onclick="editDeadline('${d.id}')">Edit</button>
            <button class="action-btn delete" onclick="confirmDelete('deadline','${d.id}')">Del</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function populateDeadlineProjectDropdown() {
  const sel = document.getElementById('deadlineProject');
  if (!sel) return;
  sel.innerHTML = state.projects.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
}

function editDeadline(id) {
  const d = state.deadlines.find(dl => dl.id === id);
  if (!d) return;
  document.getElementById('deadlineModalTitle').textContent = 'Edit Task';
  document.getElementById('deadlineEditId').value = d.id;
  populateDeadlineProjectDropdown();
  document.getElementById('deadlineProject').value = d.project;
  document.getElementById('deadlineTask').value = d.task;
  document.getElementById('deadlineAssigned').value = d.assigned;
  document.getElementById('deadlineDue').value = d.due;
  document.getElementById('deadlinePriority').value = d.priority;
  openModal('addDeadlineModal');
}

function saveDeadline() {
  const task = document.getElementById('deadlineTask').value.trim();
  if (!task) { showToast('Task name required', 'error'); return; }
  const editId = document.getElementById('deadlineEditId').value;
  const dl = {
    id: editId || `D${String(state.deadlines.length + 1).padStart(3,'0')}`,
    project: document.getElementById('deadlineProject').value,
    task,
    assigned: document.getElementById('deadlineAssigned').value.trim(),
    due: document.getElementById('deadlineDue').value,
    priority: document.getElementById('deadlinePriority').value,
  };
  if (editId) {
    const idx = state.deadlines.findIndex(d => d.id === editId);
    if (idx >= 0) state.deadlines[idx] = dl;
  } else {
    state.deadlines.push(dl);
  }
  saveAll();
  closeModal('addDeadlineModal');
  document.getElementById('deadlineEditId').value = '';
  showToast(editId ? 'Task updated!' : 'Task added!', 'success');
  renderDeadlines();
}

function deleteDeadline(id) {
  state.deadlines = state.deadlines.filter(d => d.id !== id);
  saveAll();
  showToast('Task deleted', 'info');
  renderDeadlines();
}

// =================== REPORTS ===================
function renderReports() {
  // Summary stats
  const summary = document.getElementById('reportsSummary');
  if (summary) {
    const totalBudget = state.projects.reduce((a,p) => a + (p.budget||0), 0);
    const avgProgress = state.projects.length ? Math.round(state.projects.reduce((a,p)=>a+p.progress,0)/state.projects.length) : 0;
    const activeStaff = state.staff.filter(s=>s.status==='Active').length;
    const overdueCount = state.deadlines.filter(d => new Date(d.due) < new Date()).length;

    summary.innerHTML = [
      { label:'Total Projects', val: state.projects.length },
      { label:'Active Staff', val: activeStaff },
      { label:'Total Budget', val: '₹' + formatBudget(totalBudget) },
      { label:'Avg Progress', val: avgProgress + '%' },
      { label:'Overdue Tasks', val: overdueCount },
    ].map(s => `<div class="report-stat"><div class="report-stat-val">${s.val}</div><div class="report-stat-label">${s.label}</div></div>`).join('');
  }

  // Project table
  const tbody = document.getElementById('reportProjectsTbody');
  if (tbody) {
    tbody.innerHTML = state.projects.map(p => `
      <tr>
        <td style="font-weight:600">${p.name}</td>
        <td style="font-size:12.5px">${p.type}</td>
        <td>
          <div class="prog-wrap"><div class="prog-bar-bg"><div class="prog-bar-fill" style="width:${p.progress}%"></div></div><span class="prog-label">${p.progress}%</span></div>
        </td>
        <td>₹${formatBudget(p.budget)}</td>
        <td>${statusBadge(p.status)}</td>
        <td style="font-size:12.5px;color:var(--text-muted)">${p.client}</td>
      </tr>
    `).join('');
  }

  // Staff cards
  const staffGrid = document.getElementById('staffReportCards');
  if (staffGrid) {
    staffGrid.innerHTML = `<div class="staff-report-grid">` +
      state.staff.map(s => `
        <div class="staff-report-card">
          <div class="staff-report-avatar" style="background:${avatarColor(s.name)}">${initials(s.name)}</div>
          <div class="staff-report-name">${s.name}</div>
          <div class="staff-report-role">${s.role}</div>
          ${s.project ? `<div class="staff-report-proj">📁 ${s.project}</div>` : ''}
          <div style="margin-top:6px">${staffStatusBadge(s.status)}</div>
        </div>
      `).join('') + `</div>`;
  }
}

function exportCSV() {
  const headers = ['ID','Project Name','Client','Type','Status','Progress','Budget','Start','End','City'];
  const rows = state.projects.map(p => [p.id, `"${p.name}"`, `"${p.client}"`, p.type, p.status, p.progress + '%', p.budget, p.start, p.end, p.city || ''].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  download('constructpro_report.csv', csv, 'text/csv');
  showToast('CSV exported!', 'success');
}

function exportPDF() {
  const win = window.open('', '_blank');
  const html = `<!DOCTYPE html><html><head><title>ConstructPro Report</title>
  <style>body{font-family:sans-serif;padding:20px;color:#1e293b}h1{color:#F97316}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#F97316;color:#fff;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #e2e8f0}tr:nth-child(even){background:#f8fafc}</style></head>
  <body><h1>ConstructPro — Project Report</h1><p>Generated: ${new Date().toLocaleDateString()}</p>
  <table><thead><tr><th>ID</th><th>Name</th><th>Client</th><th>Type</th><th>Status</th><th>Progress</th><th>Budget</th></tr></thead>
  <tbody>${state.projects.map(p=>`<tr><td>${p.id}</td><td>${p.name}</td><td>${p.client}</td><td>${p.type}</td><td>${p.status}</td><td>${p.progress}%</td><td>₹${formatBudget(p.budget)}</td></tr>`).join('')}</tbody></table>
  <script>window.print();window.close();<\/script></body></html>`;
  win.document.write(html);
  win.document.close();
  showToast('PDF export opened!', 'success');
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// =================== SETTINGS ===================
function renderSettings() {
  const s = state.settings;
  const cn = document.getElementById('settCompanyName'); if(cn) cn.value = s.companyName || '';
  const lu = document.getElementById('settLogoUrl'); if(lu) lu.value = s.logoUrl || '';
  const an = document.getElementById('settAdminName'); if(an) an.value = s.adminName || '';

  document.getElementById('themeDark')?.classList.toggle('active', s.theme === 'dark');
  document.getElementById('themeLight')?.classList.toggle('active', s.theme === 'light');
}

function saveSettings() {
  state.settings.companyName = document.getElementById('settCompanyName')?.value.trim() || 'ConstructPro';
  state.settings.logoUrl = document.getElementById('settLogoUrl')?.value.trim() || '';
  state.settings.adminName = document.getElementById('settAdminName')?.value.trim() || 'Construction Manager';
  saveAll();
  applySettings();
  showToast('Settings saved!', 'success');
}

function applySettings() {
  const s = state.settings;
  document.querySelector('.logo-text').textContent = s.companyName || 'ConstructPro';
  const un = document.getElementById('sidebarUserName'); if(un) un.textContent = s.adminName || 'Construction Manager';
  const initStr = (s.adminName || 'CM').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const sav = document.getElementById('sidebarUserAvatar'); if(sav) sav.textContent = initStr;
  const tav = document.getElementById('topbarAvatar'); if(tav) tav.textContent = initStr;
  document.documentElement.dataset.theme = s.theme || 'dark';
}

function setTheme(theme) {
  state.settings.theme = theme;
  saveAll();
  applySettings();
  renderSettings();
  showToast(`${theme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'info');
  // Re-render charts for color update
  if (currentPage === 'dashboard') setTimeout(renderCharts, 100);
}

function resetData() {
  if (!confirm('Reset all data to demo values?')) return;
  loadDemoData();
  showToast('Demo data restored!', 'success');
  navigateTo(currentPage);
}

function clearAllData() {
  if (!confirm('This will permanently delete ALL data. Continue?')) return;
  state.projects = []; state.staff = []; state.deadlines = []; state.notifications = [];
  saveAll();
  showToast('All data cleared', 'info');
  navigateTo(currentPage);
}

// =================== NOTIFICATIONS ===================
function bindNotifications() {
  const btn = document.getElementById('notifBtn');
  const panel = document.getElementById('notifPanel');
  const clearBtn = document.getElementById('notifClear');

  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    panel?.classList.toggle('open');
    renderNotifications();
  });

  clearBtn?.addEventListener('click', () => {
    state.notifications = [];
    saveAll();
    renderNotifications();
    updateNotifBadge();
  });

  document.addEventListener('click', (e) => {
    if (!panel?.contains(e.target) && e.target !== btn) {
      panel?.classList.remove('open');
    }
  });

  updateNotifBadge();
}

function renderNotifications() {
  const list = document.getElementById('notifList');
  if (!list) return;
  if (!state.notifications.length) {
    list.innerHTML = `<div class="notif-empty">No notifications</div>`;
    return;
  }
  const typeColor = { primary: 'var(--primary)', success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)' };
  list.innerHTML = state.notifications.map(n => `
    <div class="notif-item">
      <div class="notif-dot" style="background:${typeColor[n.type] || 'var(--primary)'}"></div>
      <div>
        <div class="notif-text">${n.msg}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>
  `).join('');
}

function addNotification(type, msg) {
  state.notifications.unshift({ id: 'N' + Date.now(), type, msg, time: 'Just now' });
  saveAll();
  updateNotifBadge();
}

function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const count = state.notifications.length;
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);
}

// =================== GLOBAL SEARCH ===================
function bindGlobalSearch() {
  const input = document.getElementById('globalSearch');
  input?.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    if (!val) return;
    // Highlight matching page
    const matchProject = state.projects.some(p => p.name.toLowerCase().includes(val) || p.client.toLowerCase().includes(val));
    const matchStaff = state.staff.some(s => s.name.toLowerCase().includes(val));
    if (matchProject) {
      navigateTo('projects');
      const ps = document.getElementById('projectSearch');
      if (ps) { ps.value = input.value; filterProjects(); }
    } else if (matchStaff) {
      navigateTo('staff');
      const ss = document.getElementById('staffSearch');
      if (ss) { ss.value = input.value; filterStaff(); }
    }
  });
}

// =================== MODALS ===================
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('hidden'); document.body.style.overflow = ''; }
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
    document.body.style.overflow = '';
  }
});

// Keyboard escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => {
      m.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }
});

// =================== TOAST ===================
let toastTimer;
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  const icons = { success: '✓', error: '✕', info: '◉', warning: '⚠' };
  toast.textContent = (icons[type] || '◉') + ' ' + msg;
  toast.className = `toast ${type} show`;
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// =================== UTILITY ===================
function statusBadge(status) {
  const map = { 'Planning':'planning', 'In Progress':'inprogress', 'Delayed':'delayed', 'Completed':'completed' };
  return `<span class="badge badge-${map[status] || 'planning'}">${status}</span>`;
}

function staffStatusBadge(status) {
  const map = { 'Active':'active', 'On Leave':'onleave', 'Inactive':'inactive' };
  return `<span class="badge badge-${map[status] || 'active'}">${status}</span>`;
}

function formatDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
  catch(e) { return d; }
}

function formatBudget(val) {
  if (!val) return '0';
  if (val >= 10000000) return (val / 10000000).toFixed(1) + 'Cr';
  if (val >= 100000) return (val / 100000).toFixed(1) + 'L';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
  return val.toString();
}

function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
}

const AVATAR_COLORS = ['#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F59E0B','#10B981','#F97316','#EF4444'];
function avatarColor(name) {
  let hash = 0;
  for (let c of (name || '')) hash = (hash << 5) - hash + c.charCodeAt(0);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
