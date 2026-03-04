<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '../stores/events.js'
import EventCard from '../components/EventCard.vue'
import EventModal from '../components/EventModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const events = useEventsStore()
const showModal = ref(false)
const editing = ref(null)
const confirmDelete = ref(false)
const toDelete = ref(null)
const search = ref('')

onMounted(() => {
  events.fetchAll()
  events.startRealtime()
})

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return events.items
  return events.items.filter(e =>
    e.title?.toLowerCase().includes(q) ||
    e.description?.toLowerCase().includes(q)
  )
})

const totalInscrits = computed(() => events.items.reduce((t, e) => t + (e.registeredCount || 0), 0))
const totalCapacity  = computed(() => events.items.reduce((t, e) => t + (e.capacity || 0), 0))
const fillRate = computed(() => totalCapacity.value
  ? Math.round((totalInscrits.value / totalCapacity.value) * 100) : 0)

function openCreate() { editing.value = null; showModal.value = true }
function openEdit(ev) { editing.value = ev; showModal.value = true }
async function save(ev) {
  if (ev.id) await events.update(ev.id, ev)
  else await events.create(ev)
  showModal.value = false
}
function askDelete(ev) { toDelete.value = ev; confirmDelete.value = true }
async function doDelete() { if (toDelete.value) await events.remove(toDelete.value.id) }
async function register(ev) { await events.register(ev.id) }
async function cancel(ev)   { await events.cancelRegistration(ev.id) }
</script>

<template>
  <div class="dashboard">

    <!-- ── Header ───────────────────────────────────────── -->
    <div class="dash-header">
      <div class="dash-header-left">
        <div class="dash-eyebrow">
          <span class="live-dot"></span>
          Temps réel
        </div>
        <h1>Tableau de bord</h1>
        <p>Gérez et suivez vos événements</p>
      </div>
      <button class="btn-create" @click="openCreate">
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Créer un événement</span>
      </button>
    </div>

    <!-- ── Stats ─────────────────────────────────────────── -->
    <div class="dash-stats">

      <div class="stat-card stat-card--teal">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-num">{{ events.items.length }}</span>
          <span class="stat-label">Événements actifs</span>
        </div>
      </div>

      <div class="stat-card stat-card--purple">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-num">{{ totalInscrits }}</span>
          <span class="stat-label">Participants inscrits</span>
        </div>
      </div>

      <div class="stat-card stat-card--amber">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-num">{{ fillRate }}<small>%</small></span>
          <span class="stat-label">Taux de remplissage</span>
        </div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" :style="{ width: fillRate + '%' }"></div>
        </div>
      </div>

    </div>

    <!-- ── Search bar ─────────────────────────────────────── -->
    <div class="search-bar" v-if="!events.loading && events.items.length > 0">
      <div class="search-wrap">
        <svg class="search-ico" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" type="text" placeholder="Rechercher un événement…" class="search-input" />
        <button v-if="search" class="search-clear" @click="search = ''">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <span class="search-count" v-if="search">
        {{ filtered.length }} résultat{{ filtered.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- ── Loading ────────────────────────────────────────── -->
    <div v-if="events.loading" class="dash-loading">
      <div class="spinner"></div>
      <span>Chargement des événements…</span>
    </div>

    <!-- ── Empty state ────────────────────────────────────── -->
    <div v-else-if="events.items.length === 0" class="dash-empty">
      <div class="empty-visual">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="12" y1="15" x2="12" y2="15" stroke-width="2"/>
        </svg>
      </div>
      <h3>Aucun événement pour le moment</h3>
      <p>Lancez-vous et créez votre premier événement en quelques secondes.</p>
      <button class="btn-create" @click="openCreate">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Créer mon premier événement
      </button>
    </div>

    <!-- ── No results ─────────────────────────────────────── -->
    <div v-else-if="filtered.length === 0" class="dash-empty">
      <div class="empty-visual">
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <h3>Aucun résultat</h3>
      <p>Aucun événement ne correspond à <strong>"{{ search }}"</strong></p>
      <button class="btn-ghost-teal" @click="search = ''">Effacer la recherche</button>
    </div>

    <!-- ── Grille d'événements ────────────────────────────── -->
    <div v-else class="events-grid">
      <EventCard
        v-for="(ev, i) in filtered" :key="ev.id"
        :event="ev"
        :style="{ animationDelay: `${i * 55}ms` }"
        @edit="openEdit"
        @delete="askDelete"
        @register="register"
        @cancel="cancel"
      />
    </div>

    <EventModal v-model="showModal" :initial="editing" @save="save" />
    <ConfirmModal v-model="confirmDelete" title="Supprimer" message="Supprimer cet événement ?" @confirm="doDelete" />
  </div>
</template>

<style scoped>
.dashboard { animation: fadeIn .4s ease both; }

/* ── Header ─────────────────────────────────────────────────── */
.dash-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.dash-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--teal);
  margin-bottom: 8px;
}
.live-dot {
  width: 7px; height: 7px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s ease infinite;
}
.dash-header-left h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--s900);
  letter-spacing: -.025em;
  margin: 0 0 4px;
}
.dash-header-left p { color: var(--s500); font-size: .92rem; margin: 0; }

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  background: linear-gradient(135deg, var(--teal-d), var(--teal));
  color: white;
  border-radius: 12px;
  font-size: .9rem;
  font-weight: 700;
  border: none;
  box-shadow: 0 4px 16px rgba(13,148,136,.3);
  white-space: nowrap;
  transition: transform .15s, box-shadow .2s;
  cursor: pointer;
}
.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(13,148,136,.42);
}

/* ── Stats ──────────────────────────────────────────────────── */
.dash-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.stat-card {
  border-radius: 16px;
  padding: 20px 22px 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  border: 1.5px solid transparent;
  position: relative;
  overflow: hidden;
}
.stat-card--teal   { background: var(--teal-pale); border-color: var(--teal-subtle); }
.stat-card--purple { background: #f5f3ff; border-color: #ddd6fe; }
.stat-card--amber  { background: #fffbeb; border-color: #fde68a; flex-direction: column; gap: 10px; }

.stat-icon {
  width: 42px; height: 42px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-card--teal   .stat-icon { background: var(--teal-subtle); color: var(--teal-d); }
.stat-card--purple .stat-icon { background: #ede9fe; color: #6d28d9; }
.stat-card--amber  .stat-icon { background: #fef3c7; color: #b45309; }

.stat-body { display: flex; flex-direction: column; gap: 3px; }
.stat-num  {
  font-size: 2rem; font-weight: 800; color: var(--s900); line-height: 1;
  display: flex; align-items: baseline; gap: 2px;
}
.stat-num small { font-size: 1rem; font-weight: 700; }
.stat-label { font-size: .75rem; color: var(--s500); font-weight: 500; }

/* Amber card overrides for progress bar layout */
.stat-card--amber .stat-icon { margin: 0; }
.stat-card--amber .stat-body { flex-direction: row; align-items: center; gap: 12px; }
.stat-bar-track {
  height: 5px;
  background: rgba(0,0,0,.08);
  border-radius: 100px;
  overflow: hidden;
  margin-top: -4px;
}
.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  border-radius: 100px;
  transition: width .8s ease;
}

/* ── Search ─────────────────────────────────────────────────── */
.search-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}
.search-wrap {
  position: relative;
  flex: 1;
  max-width: 460px;
}
.search-ico {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--s500);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 11px 40px 11px 42px;
  border: 1.5px solid var(--s200);
  border-radius: 12px;
  font-size: .9rem;
  font-family: inherit;
  color: var(--s900);
  background: var(--white);
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.search-input:focus {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(13,148,136,.12);
}
.search-input::placeholder { color: var(--s300); }
.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--s400, var(--s500));
  padding: 2px;
  display: flex; align-items: center;
}
.search-clear:hover { color: var(--s700); }
.search-count { font-size: .82rem; color: var(--s500); white-space: nowrap; }

/* ── Loading ─────────────────────────────────────────────────── */
.dash-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 96px 0; color: var(--s500); font-size: .93rem;
}
.spinner {
  width: 24px; height: 24px;
  border: 2.5px solid var(--s200);
  border-top-color: var(--teal);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

/* ── Empty ───────────────────────────────────────────────────── */
.dash-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 20px; text-align: center; gap: 12px;
}
.empty-visual {
  width: 100px; height: 100px;
  background: var(--s100);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
  color: var(--s300);
}
.dash-empty h3 { font-size: 1.15rem; font-weight: 700; color: var(--s700); margin: 0; }
.dash-empty p  { color: var(--s500); font-size: .93rem; margin: 0 0 8px; max-width: 300px; }

.btn-ghost-teal {
  padding: 10px 20px;
  border: 1.5px solid var(--teal-subtle);
  border-radius: 10px;
  background: var(--teal-pale);
  color: var(--teal-d);
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background .2s;
}
.btn-ghost-teal:hover { background: var(--teal-subtle); }

/* ── Grid ────────────────────────────────────────────────────── */
.events-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  align-items: start;
}

/* ── Animations ──────────────────────────────────────────────── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: .5; transform: scale(1.4); }
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 900px) {
  .dash-stats { grid-template-columns: 1fr 1fr; }
  .stat-card--amber { grid-column: span 2; flex-direction: row; gap: 14px; }
  .stat-card--amber .stat-body { flex-direction: column; gap: 3px; }
  .events-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
}
@media (max-width: 600px) {
  .dash-stats { grid-template-columns: 1fr; }
  .stat-card--amber { grid-column: span 1; }
  .events-grid { grid-template-columns: 1fr; }
  .dash-header { flex-direction: column; align-items: flex-start; }
  .btn-create  { width: 100%; justify-content: center; }
  .search-wrap { max-width: 100%; }
}
</style>
