<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth.js'
import { useEventsStore } from './stores/events.js'
import { useRouter, useRoute } from 'vue-router'
import logoBBN from './assets/LogoBBN.jpeg'

const auth = useAuthStore()
const events = useEventsStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  auth.hydrate()
  if (auth.isAuthenticated) {
    events.fetchAll()
    events.startRealtime()
  }
})

function logout() {
  auth.logout()
  events.stopRealtime()
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <a class="brand" href="/">
        <img :src="logoBBN" alt="EventFlow by BBN" class="brand-logo" />
      </a>
      <nav class="nav-links">
        <!-- Lien Événements toujours visible -->
        <router-link to="/events" class="nav-btn nav-btn--ghost">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Événements</span>
        </router-link>
        <template v-if="!auth.isAuthenticated">
          <router-link to="/login" class="nav-btn nav-btn--outline">
            <!-- icon: log-in -->
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <span>Se connecter</span>
          </router-link>
          <router-link to="/register" class="nav-btn nav-btn--solid">
            <!-- icon: user-plus -->
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <span>Créer un compte</span>
          </router-link>
        </template>
        <template v-else>
          <router-link to="/events" class="nav-btn nav-btn--ghost">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Événements</span>
          </router-link>
          <router-link v-if="auth.isAdmin" to="/dashboard" class="nav-btn nav-btn--solid">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Dashboard</span>
          </router-link>
          <div class="user-chip">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>{{ auth.user?.name || auth.user?.email || 'Utilisateur' }}</span>
            <span v-if="auth.isAdmin" class="admin-badge">Admin</span>
          </div>
          <button class="nav-btn nav-btn--ghost" @click="logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Déconnexion</span>
          </button>
        </template>
      </nav>
    </div>
  </header>

  <main :class="['app-main', { 'app-main--wide': route.meta?.fullWidth }]">
    <router-view />
  </main>
</template>

<style scoped>
/* ── Header ─────────────────────────────────────────────── */
.app-header {
  background: var(--white);
  border-bottom: 1px solid var(--s200);
  box-shadow: 0 2px 16px rgba(0,0,0,.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 48px;
  height: 72px;
  display: flex;
  align-items: center;
}

.brand { display: flex; align-items: center; }
.brand-logo {
  height: 48px;
  width: auto;
  display: block;
  border-radius: 8px;
  object-fit: contain;
}

/* ── Nav ────────────────────────────────────────────────── */
.nav-links {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: .95rem;
  font-weight: 600;
  font-family: inherit;
  text-decoration: none;
  transition: all .2s;
  cursor: pointer;
  border: 2px solid transparent;
  white-space: nowrap;
  line-height: 1;
}

.nav-btn--outline {
  border-color: var(--teal);
  color: var(--teal);
  background: transparent;
}
.nav-btn--outline:hover {
  background: var(--teal-pale);
  color: var(--teal-d);
  border-color: var(--teal-d);
}

.nav-btn--solid {
  background: var(--teal);
  color: white;
  border-color: var(--teal);
  box-shadow: 0 3px 12px rgba(13,148,136,.28);
}
.nav-btn--solid:hover {
  background: var(--teal-d);
  border-color: var(--teal-d);
  transform: translateY(-1px);
  box-shadow: 0 5px 18px rgba(13,148,136,.38);
}

.nav-btn--ghost {
  background: transparent;
  color: var(--s500);
  border-color: var(--s200);
}
.nav-btn--ghost:hover {
  background: var(--s50);
  color: var(--s700);
  border-color: var(--s300);
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: var(--teal-pale);
  color: var(--teal-d);
  border-radius: 100px;
  font-size: .88rem;
  font-weight: 600;
  border: 1px solid var(--teal-subtle);
}
.admin-badge {
  background: var(--teal-d);
  color: white;
  font-size: .65rem;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 100px;
}

/* ── Main ───────────────────────────────────────────────── */
.app-main {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 48px;
}
.app-main--wide {
  max-width: 100%;
  padding: 0;
  margin: 0;
}

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 900px) {
  .header-inner { padding: 0 24px; height: 64px; }
  .brand-logo   { height: 40px; }
  .nav-btn span { display: none; }
  .nav-btn      { padding: 11px 13px; gap: 0; }
  .user-chip span { display: none; }
  .user-chip    { padding: 9px; border-radius: 50%; }
  .app-main     { padding: 24px; }
}

@media (max-width: 480px) {
  .header-inner { padding: 0 16px; height: 58px; }
  .brand-logo   { height: 34px; }
  .nav-links    { gap: 8px; }
  .app-main     { padding: 16px; }
}
</style>
