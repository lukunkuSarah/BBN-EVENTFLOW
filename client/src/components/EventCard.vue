<script setup>
const props = defineProps({
  event: { type: Object, required: true },
})
const emit = defineEmits(['edit', 'delete', 'register', 'cancel'])

function remaining(e) {
  return Math.max(0, (e.capacity || 0) - (e.registeredCount || 0))
}
function fillPct(e) {
  if (!e.capacity) return 0
  return Math.min(100, Math.round(((e.registeredCount || 0) / e.capacity) * 100))
}
function status(e) {
  const pct = fillPct(e)
  if (pct >= 100) return { label: 'Complet',          cls: 'status--full'   }
  if (pct >= 75)  return { label: 'Presque complet',  cls: 'status--almost' }
  return               { label: 'Places disponibles', cls: 'status--open'  }
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <article class="card">

    <!-- Accent strip de couleur selon statut -->
    <div class="card-accent" :class="status(event).cls"></div>

    <!-- Top row: statut + actions icônes -->
    <div class="card-top">
      <span class="badge" :class="status(event).cls">{{ status(event).label }}</span>
      <div class="icon-actions">
        <button class="icon-btn icon-btn--edit" @click="emit('edit', event)" title="Modifier">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="icon-btn icon-btn--del" @click="emit('delete', event)" title="Supprimer">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Titre -->
    <h3 class="card-title">{{ event.title }}</h3>

    <!-- Date -->
    <div class="card-date">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      {{ fmtDate(event.date) }}
    </div>

    <!-- Description -->
    <p class="card-desc">{{ event.description || 'Aucune description fournie.' }}</p>

    <!-- Barre de capacité -->
    <div class="card-capacity">
      <div class="cap-row">
        <span class="cap-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {{ event.registeredCount || 0 }} / {{ event.capacity || 0 }} inscrits
        </span>
        <span class="cap-pct" :class="status(event).cls">{{ fillPct(event) }}%</span>
      </div>
      <div class="cap-track">
        <div class="cap-fill" :class="status(event).cls" :style="{ width: fillPct(event) + '%' }"></div>
      </div>
    </div>

    <!-- Séparateur -->
    <div class="card-divider"></div>

    <!-- Actions principales -->
    <div class="card-actions">
      <button
        class="btn-register"
        :class="{ 'btn-register--full': remaining(event) === 0 }"
        :disabled="remaining(event) === 0"
        @click="emit('register', event)"
      >
        <svg v-if="remaining(event) > 0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        {{ remaining(event) === 0 ? 'Complet' : "S'inscrire" }}
      </button>
      <button class="btn-cancel" @click="emit('cancel', event)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        Annuler
      </button>
    </div>

  </article>
</template>

<style scoped>
/* ── Card shell ───────────────────────────────────────────── */
.card {
  position: relative;
  background: var(--white);
  border: 1.5px solid var(--s200);
  border-radius: 18px;
  padding: 0 24px 22px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  transition: box-shadow .25s, transform .25s, border-color .25s;
  animation: cardIn .4s ease both;
}
.card:hover {
  box-shadow: 0 12px 40px rgba(0,0,0,.1);
  transform: translateY(-4px);
  border-color: var(--teal-subtle);
}

/* ── Accent strip top ─────────────────────────────────────── */
.card-accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  border-radius: 18px 18px 0 0;
}
.card-accent.status--open   { background: linear-gradient(90deg, var(--teal), var(--teal-l)); }
.card-accent.status--almost { background: linear-gradient(90deg, #f59e0b, #fcd34d); }
.card-accent.status--full   { background: linear-gradient(90deg, #6366f1, #a78bfa); }

/* ── Top row ──────────────────────────────────────────────── */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 22px;
  margin-bottom: 14px;
}

/* ── Badge statut ─────────────────────────────────────────── */
.badge {
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 100px;
}
.badge.status--open   { background: var(--teal-subtle); color: var(--teal-d); }
.badge.status--almost { background: #fef3c7; color: #b45309; }
.badge.status--full   { background: #ede9fe; color: #5b21b6; }

/* ── Icon buttons ─────────────────────────────────────────── */
.icon-actions { display: flex; gap: 6px; }
.icon-btn {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1.5px solid var(--s200);
  background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;
  color: var(--s500);
}
.icon-btn--edit:hover { background: var(--teal-pale); border-color: var(--teal-subtle); color: var(--teal-d); }
.icon-btn--del:hover  { background: #fff0f0; border-color: #fecaca; color: #dc2626; }

/* ── Title ────────────────────────────────────────────────── */
.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--s900);
  margin: 0 0 8px;
  letter-spacing: -.01em;
  line-height: 1.35;
}

/* ── Date ─────────────────────────────────────────────────── */
.card-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .78rem;
  color: var(--s500);
  font-weight: 500;
  margin-bottom: 12px;
}
.card-date svg { flex-shrink: 0; color: var(--teal); }

/* ── Description ──────────────────────────────────────────── */
.card-desc {
  font-size: .85rem;
  color: var(--s500);
  line-height: 1.65;
  margin: 0 0 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Capacity ─────────────────────────────────────────────── */
.card-capacity { margin-bottom: 18px; }
.cap-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.cap-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .77rem;
  color: var(--s500);
  font-weight: 500;
}
.cap-label svg { color: var(--teal); }
.cap-pct {
  font-size: .72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 100px;
}
.cap-pct.status--open   { background: var(--teal-subtle); color: var(--teal-d); }
.cap-pct.status--almost { background: #fef3c7; color: #b45309; }
.cap-pct.status--full   { background: #ede9fe; color: #5b21b6; }

.cap-track {
  height: 6px;
  background: var(--s200);
  border-radius: 100px;
  overflow: hidden;
}
.cap-fill {
  height: 100%;
  border-radius: 100px;
  transition: width .6s cubic-bezier(.4,0,.2,1);
}
.cap-fill.status--open   { background: linear-gradient(90deg, var(--teal), var(--teal-l)); }
.cap-fill.status--almost { background: linear-gradient(90deg, #f59e0b, #fcd34d); }
.cap-fill.status--full   { background: linear-gradient(90deg, #6366f1, #a78bfa); }

/* ── Divider ──────────────────────────────────────────────── */
.card-divider {
  height: 1px;
  background: var(--s200);
  margin-bottom: 18px;
}

/* ── Actions ──────────────────────────────────────────────── */
.card-actions {
  display: flex;
  gap: 10px;
}
.btn-register {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 16px;
  background: linear-gradient(135deg, var(--teal-d), var(--teal));
  color: white;
  border: none;
  border-radius: 10px;
  font-size: .85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 3px 12px rgba(13,148,136,.28);
}
.btn-register:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 18px rgba(13,148,136,.38);
}
.btn-register:disabled,
.btn-register--full {
  background: var(--s200);
  color: var(--s500);
  box-shadow: none;
  cursor: not-allowed;
}
.btn-cancel {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: transparent;
  color: var(--s500);
  border: 1.5px solid var(--s200);
  border-radius: 10px;
  font-size: .83rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;
}
.btn-cancel:hover {
  background: #fff0f0;
  border-color: #fecaca;
  color: #dc2626;
}

/* ── Animation ────────────────────────────────────────────── */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
