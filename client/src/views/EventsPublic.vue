<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '../stores/events.js'
import { useAuthStore } from '../stores/auth.js'
import EventCard from '../components/EventCard.vue'

const router  = useRouter()
const events  = useEventsStore()
const auth    = useAuthStore()
const search  = ref('')
const toast   = ref('')
let toastTimer = null

onMounted(async () => {
  await events.fetchAll()
  events.startRealtime()
  if (auth.isAuthenticated) {
    await events.fetchMyRegistrations()
  }
})

onUnmounted(() => events.stopRealtime())

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return events.items
  return events.items.filter(e =>
    e.title?.toLowerCase().includes(q) ||
    e.description?.toLowerCase().includes(q)
  )
})

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3200)
}

async function handleRegister(ev) {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/events' } })
    return
  }
  try {
    await events.register(ev.id)
    showToast(`Inscrit à "${ev.title}" !`)
  } catch (e) {
    showToast(e?.response?.data?.message || 'Erreur lors de l\'inscription')
  }
}

async function handleCancel(ev) {
  if (!auth.isAuthenticated) return
  try {
    await events.cancelRegistration(ev.id)
    showToast(`Inscription annulée pour "${ev.title}"`)
  } catch (e) {
    showToast(e?.response?.data?.message || 'Erreur lors de l\'annulation')
  }
}
</script>

<template>
  <div class="events-page">

    <!-- ── Hero header ───────────────────────────────────────── -->
    <div class="page-hero">
      <div class="hero-left">
        <div class="hero-eyebrow">
          <span class="live-dot"></span>
          Mise à jour en temps réel
        </div>
        <h1>Événements à venir</h1>
        <p>Découvrez et rejoignez les prochains événements de la communauté.</p>
      </div>

      <!-- Bannière connexion si non connecté -->
      <div v-if="!auth.isAuthenticated" class="login-banner">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Connectez-vous pour vous inscrire aux événements</span>
        <router-link to="/login" class="banner-btn">Se connecter</router-link>
      </div>
    </div>

    <!-- ── Search ─────────────────────────────────────────────── -->
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

    <!-- ── Loading ───────────────────────────────────────────── -->
    <div v-if="events.loading" class="page-loading">
      <div class="spinner"></div>
      <span>Chargement des événements…</span>
    </div>

    <!-- ── Empty ─────────────────────────────────────────────── -->
    <div v-else-if="events.items.length === 0" class="page-empty">
      <div class="empty-visual">
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <h3>Aucun événement pour le moment</h3>
      <p>Revenez bientôt, de nouveaux événements seront publiés prochainement.</p>
    </div>

    <!-- ── No results ─────────────────────────────────────────── -->
    <div v-else-if="filtered.length === 0" class="page-empty">
      <div class="empty-visual">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <h3>Aucun résultat</h3>
      <p>Aucun événement ne correspond à <strong>"{{ search }}"</strong></p>
      <button class="btn-ghost" @click="search = ''">Effacer la recherche</button>
    </div>

    <!-- ── Grille ─────────────────────────────────────────────── -->
    <div v-else class="events-grid">
      <EventCard
        v-for="(ev, i) in filtered"
        :key="ev.id"
        :event="ev"
        :isAdmin="false"
        :style="{ animationDelay: `${i * 55}ms` }"
        @register="handleRegister"
        @cancel="handleCancel"
      />
    </div>

    <!-- ── Toast ─────────────────────────────────────────────── -->
    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>

  </div>
</template>

<style scoped>
.events-page { animation: fadeIn .4s ease both; }

/* ── Hero ────────────────────────────────────────────────────── */
.page-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.hero-eyebrow {
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
.hero-left h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--s900);
  letter-spacing: -.025em;
  margin: 0 0 6px;
}
.hero-left p { color: var(--s500); font-size: .92rem; margin: 0; }

/* ── Login banner ────────────────────────────────────────────── */
.login-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: var(--teal-pale);
  border: 1.5px solid var(--teal-subtle);
  border-radius: 14px;
  color: var(--teal-d);
  font-size: .88rem;
  font-weight: 600;
  flex-shrink: 0;
  max-width: 380px;
}
.login-banner svg { flex-shrink: 0; }
.banner-btn {
  margin-left: auto;
  padding: 8px 18px;
  background: var(--teal);
  color: white;
  border-radius: 8px;
  font-size: .83rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: background .15s;
}
.banner-btn:hover { background: var(--teal-d); }

/* ── Search ──────────────────────────────────────────────────── */
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
  color: var(--s400);
  padding: 2px;
  display: flex; align-items: center;
}
.search-count { font-size: .82rem; color: var(--s500); white-space: nowrap; }

/* ── Loading ─────────────────────────────────────────────────── */
.page-loading {
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
.page-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 20px; text-align: center; gap: 12px;
}
.empty-visual {
  width: 96px; height: 96px;
  background: var(--s100);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
  color: var(--s300);
}
.page-empty h3 { font-size: 1.15rem; font-weight: 700; color: var(--s700); margin: 0; }
.page-empty p  { color: var(--s500); font-size: .93rem; margin: 0 0 8px; max-width: 340px; }
.btn-ghost {
  padding: 10px 20px;
  border: 1.5px solid var(--s200);
  border-radius: 10px;
  background: transparent;
  color: var(--s600);
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background .2s;
}

/* ── Grid ────────────────────────────────────────────────────── */
.events-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  align-items: start;
}

/* ── Toast ───────────────────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--s900);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: .9rem;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  white-space: nowrap;
}
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }

/* ── Animations ──────────────────────────────────────────────── */
@keyframes fadeIn  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes spin    { to { transform: rotate(360deg); } }
@keyframes pulse   { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(1.4); } }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 900px) {
  .events-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .login-banner { max-width: 100%; }
}
@media (max-width: 600px) {
  .events-grid  { grid-template-columns: 1fr; }
  .page-hero    { flex-direction: column; }
  .search-wrap  { max-width: 100%; }
  .hero-left h1 { font-size: 1.4rem; }
}
</style>
