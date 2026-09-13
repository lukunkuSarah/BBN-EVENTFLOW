<script setup>
import { reactive, onMounted } from 'vue'
import AppIcon from '../components/AppIcon.vue'

// ── Apparition au défilement (directive locale v-reveal) ─────────────────────
// Usage : v-reveal ou v-reveal="120" (délai en ms pour décaler les éléments)
const vReveal = {
  mounted(el, binding) {
    el.classList.add('reveal')
    if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    if (!('IntersectionObserver' in window)) { el.classList.add('is-visible'); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { el.classList.add('is-visible'); io.disconnect() }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' })
    io.observe(el)
  },
}

// ── Compteurs animés du hero ─────────────────────────────────────────────────
const stats = reactive([
  { value: 0, target: 500, suffix: '+',  label: 'Événements créés' },
  { value: 0, target: 12,  suffix: 'k+', label: 'Participants' },
  { value: 0, target: 98,  suffix: '%',  label: 'Satisfaction' },
])

function animateCounters() {
  const duration = 1500
  const start = performance.now()
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - p, 3)
    stats.forEach((s) => { s.value = Math.round(s.target * eased) })
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

onMounted(() => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) { stats.forEach((s) => { s.value = s.target }); return }
  setTimeout(animateCounters, 350)
})

// ── Contenu ──────────────────────────────────────────────────────────────────
const features = [
  { icon: 'calendar-plus', title: 'Création d\'événements',
    text: 'Titre, description, date et capacité : publiez une conférence, un atelier ou un meetup en moins d\'une minute.' },
  { icon: 'user-check', title: 'Inscription en un clic',
    text: 'Les membres s\'inscrivent ou annulent instantanément. Les places restantes se mettent à jour pour tout le monde.', highlight: true },
  { icon: 'shield-check', title: 'Rôles admin et membre',
    text: 'L\'administrateur crée et pilote, le membre s\'inscrit. Les accès sont contrôlés côté client et côté serveur.' },
  { icon: 'radio', title: 'Temps réel',
    text: 'Grâce aux Server-Sent Events, chaque inscription est diffusée à tous les navigateurs ouverts, sans recharger.' },
  { icon: 'clipboard', title: 'Journal d\'activité',
    text: 'Chaque création, modification, inscription et annulation est tracée avec des statistiques par événement.' },
  { icon: 'box', title: 'Conteneurs et cloud',
    text: 'Environnement reproductible avec Docker Compose et mise en production continue depuis GitHub.' },
]

const steps = [
  { n: '01', icon: 'user-plus',      title: 'Créez un compte',        text: 'Inscription immédiate avec un e-mail et un mot de passe. Aucune carte bancaire.' },
  { n: '02', icon: 'calendar-plus',  title: 'Publiez un événement',   text: 'Définissez la date, la capacité et la description, puis mettez en ligne en un clic.' },
  { n: '03', icon: 'activity',       title: 'Pilotez en direct',      text: 'Suivez les inscriptions en temps réel et consultez la liste des membres inscrits.' },
]
</script>

<template>
  <div class="home">

    <!-- ══════════════════════════ HERO ══════════════════════════ -->
    <section class="hero">
      <div class="hero-bg" aria-hidden="true">
        <span class="blob blob-1"></span>
        <span class="blob blob-2"></span>
        <span class="blob blob-3"></span>
        <span class="grid-dots"></span>
      </div>

      <div class="container">
        <div class="hero-grid">

          <!-- Colonne gauche -->
          <div class="hero-left">
            <span class="badge hero-anim" style="--i:0">
              <AppIcon name="sparkles" :size="14" />
              Plateforme de gestion d'événements
            </span>

            <h1 class="hero-anim" style="--i:1">
              Gérez vos événements
              <span class="accent-wrap"><em class="accent">avec élégance.</em><span class="accent-underline"></span></span>
            </h1>

            <p class="lead hero-anim" style="--i:2">
              Conférences, ateliers, meetups : créez, publiez et suivez
              vos événements en temps réel, du premier inscrit au dernier.
            </p>

            <div class="hero-actions hero-anim" style="--i:3">
              <router-link to="/register" class="btn btn-primary">
                <AppIcon name="user-plus" :size="18" />
                <span>Commencer gratuitement</span>
              </router-link>
              <router-link to="/login" class="btn btn-ghost">
                <span>Déjà un compte</span>
                <AppIcon name="arrow-right" :size="18" class="btn-arrow" />
              </router-link>
            </div>

            <div class="stats-row hero-anim" style="--i:4">
              <div v-for="(s, i) in stats" :key="s.label" class="stat">
                <span class="stat-n">{{ s.value }}<small>{{ s.suffix }}</small></span>
                <span class="stat-l">{{ s.label }}</span>
                <span v-if="i < stats.length - 1" class="vline" aria-hidden="true"></span>
              </div>
            </div>
          </div>

          <!-- Colonne droite : aperçu animé -->
          <div class="hero-right hero-anim" style="--i:2">
            <div class="preview-stack">

              <article class="event-preview">
                <div class="ep-top">
                  <span class="tag tag-live"><span class="pulse"></span>En direct</span>
                  <span class="tag tag-gray"><AppIcon name="users" :size="12" />60 places</span>
                </div>
                <h3>Atelier Vue 3 &amp; Pinia</h3>
                <p>Découvrez les fonctionnalités modernes de Vue 3 avec une approche pratique et des exercices concrets.</p>
                <div class="ep-meta">
                  <span><AppIcon name="calendar" :size="14" />Jeudi 3 mars</span>
                  <span><AppIcon name="clock" :size="14" />14h00</span>
                  <span><AppIcon name="map-pin" :size="14" />Kinshasa</span>
                </div>
                <div class="ep-progress">
                  <div class="ep-bar"><div class="ep-fill"></div></div>
                  <span class="ep-count">48 / 60 inscrits</span>
                </div>
                <button type="button" class="ep-btn">
                  <AppIcon name="user-check" :size="16" />
                  S'inscrire maintenant
                </button>
              </article>

              <div class="bubble bubble-1">
                <span class="bubble-ico bubble-ico--green"><AppIcon name="check" :size="13" :stroke-width="3" /></span>
                Inscription confirmée
              </div>
              <div class="bubble bubble-2">
                <span class="bubble-ico bubble-ico--teal"><AppIcon name="bell" :size="13" /></span>
                3 nouveaux événements
              </div>
              <div class="bubble bubble-3">
                <span class="avatars">
                  <span class="av">A</span><span class="av">K</span><span class="av">S</span>
                </span>
                +12 inscrits cette semaine
              </div>

              <span class="ring ring-1" aria-hidden="true"></span>
              <span class="ring ring-2" aria-hidden="true"></span>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ══════════════════════════ FEATURES ══════════════════════ -->
    <section class="features-section">
      <div class="container">
        <div class="sec-head" v-reveal>
          <p class="eyebrow"><AppIcon name="zap" :size="13" />Fonctionnalités</p>
          <h2>Tout ce dont vous avez besoin</h2>
          <p class="sec-sub">Une solution complète pour les organisateurs comme pour les participants.</p>
        </div>

        <div class="feat-grid">
          <article
            v-for="(f, i) in features" :key="f.title"
            class="feat" :class="{ 'feat--highlight': f.highlight }"
            v-reveal="i * 90"
          >
            <div class="feat-ico">
              <AppIcon :name="f.icon" :size="22" />
            </div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.text }}</p>
            <span class="feat-shine" aria-hidden="true"></span>
          </article>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════ STEPS ═════════════════════════ -->
    <section class="steps-section">
      <div class="container">
        <div class="sec-head" v-reveal>
          <p class="eyebrow"><AppIcon name="mouse-pointer" :size="13" />Comment ça marche</p>
          <h2>En trois étapes simples</h2>
          <p class="sec-sub">De la création du compte au suivi en direct.</p>
        </div>

        <div class="steps-row">
          <div class="steps-line" aria-hidden="true" v-reveal="200"></div>
          <article v-for="(s, i) in steps" :key="s.n" class="step" v-reveal="i * 140">
            <div class="step-badge">
              <span class="step-num">{{ s.n }}</span>
              <span class="step-ico"><AppIcon :name="s.icon" :size="22" /></span>
            </div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════ LIVE STRIP ════════════════════ -->
    <section class="live-strip">
      <div class="container">
        <div class="live-card" v-reveal>
          <div class="live-left">
            <span class="live-pill"><span class="pulse"></span>Temps réel</span>
            <h3>Une inscription sur un écran, une mise à jour sur tous les autres.</h3>
            <p>Le serveur diffuse chaque changement par Server-Sent Events. Les places restantes, les badges et les compteurs se synchronisent sans rechargement.</p>
          </div>
          <div class="live-right" aria-hidden="true">
            <div class="mini-card" v-for="n in 3" :key="n" :style="{ '--n': n }">
              <span class="mini-bar"><span class="mini-fill"></span></span>
              <span class="mini-txt"></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════ CTA FINAL ═════════════════════ -->
    <section class="final-cta">
      <div class="container">
        <div class="cta-card" v-reveal>
          <span class="cta-orb cta-orb-1" aria-hidden="true"></span>
          <span class="cta-orb cta-orb-2" aria-hidden="true"></span>
          <div class="cta-ico"><AppIcon name="calendar" :size="26" /></div>
          <h2>Prêt à organiser votre prochain événement ?</h2>
          <p>Rejoignez les organisateurs qui font confiance à EventFlow pour leurs conférences, ateliers et meetups.</p>
          <div class="cta-actions">
            <router-link to="/register" class="btn btn-white">
              <span>Démarrer maintenant</span>
              <AppIcon name="arrow-right" :size="18" class="btn-arrow" />
            </router-link>
            <router-link to="/events" class="btn btn-outline-white">
              <AppIcon name="calendar" :size="18" />
              <span>Voir les événements</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ─── Layout ──────────────────────────────────────────── */
.home { overflow-x: hidden; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 40px; }

/* ─── Boutons ─────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 26px; border-radius: 12px;
  font-weight: 700; font-size: .94rem; text-decoration: none;
  transition: transform .18s ease, box-shadow .22s ease, background .2s ease, color .2s ease;
  will-change: transform;
}
.btn-primary {
  background: linear-gradient(135deg, var(--teal) 0%, var(--teal-l) 100%);
  color: #fff; box-shadow: 0 8px 24px rgba(13,148,136,.32);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(13,148,136,.42); color: #fff; }
.btn-ghost { color: var(--teal-d); padding-left: 14px; padding-right: 14px; }
.btn-ghost:hover { color: var(--teal); background: var(--teal-pale); }
.btn-arrow { transition: transform .2s ease; }
.btn:hover .btn-arrow { transform: translateX(4px); }

/* ─── HERO ────────────────────────────────────────────── */
.hero {
  position: relative; overflow: hidden;
  padding: 96px 0 112px;
  background: linear-gradient(160deg, var(--teal-pale) 0%, var(--white) 60%);
}
.hero-bg { position: absolute; inset: 0; pointer-events: none; }
.blob {
  position: absolute; border-radius: 50%; filter: blur(60px); opacity: .55;
  animation: drift 14s ease-in-out infinite;
}
.blob-1 { width: 420px; height: 420px; top: -140px; right: -80px; background: radial-gradient(circle, rgba(20,184,166,.45), transparent 70%); }
.blob-2 { width: 320px; height: 320px; bottom: -120px; left: -100px; background: radial-gradient(circle, rgba(13,148,136,.28), transparent 70%); animation-delay: -5s; }
.blob-3 { width: 240px; height: 240px; top: 40%; left: 45%; background: radial-gradient(circle, rgba(94,234,212,.35), transparent 70%); animation-delay: -9s; }
.grid-dots {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(15,118,110,.14) 1px, transparent 1px);
  background-size: 26px 26px;
  mask-image: radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%);
}

.hero-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 64px; align-items: center; position: relative; }

/* Entrée en cascade */
.hero-anim { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--i, 0) * 110ms); }

.badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; color: var(--teal-d);
  border: 1px solid var(--teal-subtle);
  font-size: .78rem; font-weight: 700; letter-spacing: .02em;
  padding: 7px 14px 7px 10px; border-radius: 100px; margin-bottom: 28px;
  box-shadow: 0 2px 10px rgba(13,148,136,.08);
}

.hero-left h1 {
  font-size: clamp(2.2rem, 4.2vw, 3.4rem); font-weight: 800; line-height: 1.08;
  color: var(--s900); margin: 0 0 22px; letter-spacing: -.03em;
}
.accent-wrap { position: relative; display: inline-block; }
.accent { color: var(--teal); font-style: italic; position: relative; z-index: 1; }
.accent-underline {
  position: absolute; left: 0; right: 0; bottom: .08em; height: .32em;
  background: linear-gradient(90deg, rgba(94,234,212,.55), rgba(20,184,166,.25));
  border-radius: 4px; transform-origin: left; transform: scaleX(0);
  animation: underline .8s cubic-bezier(.22,1,.36,1) .7s forwards;
}

.lead { font-size: 1.08rem; color: var(--s500); line-height: 1.72; margin: 0 0 36px; max-width: 460px; }

.hero-actions { display: flex; gap: 12px; align-items: center; margin-bottom: 46px; flex-wrap: wrap; }

.stats-row { display: flex; gap: 0; align-items: stretch; padding-top: 32px; border-top: 1px solid var(--s200); }
.stat { position: relative; display: flex; flex-direction: column; gap: 2px; padding-right: 32px; margin-right: 32px; }
.stat:last-child { padding-right: 0; margin-right: 0; }
.stat-n { font-size: 1.6rem; font-weight: 800; color: var(--s900); letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.stat-n small { font-size: .95rem; color: var(--teal); font-weight: 800; margin-left: 1px; }
.stat-l { font-size: .76rem; color: var(--s500); font-weight: 600; letter-spacing: .02em; }
.vline { position: absolute; right: 0; top: 4px; bottom: 4px; width: 1px; background: var(--s200); }

/* Aperçu droite */
.hero-right { position: relative; }
.preview-stack { position: relative; max-width: 440px; margin-left: auto; }

.event-preview {
  position: relative; z-index: 2;
  background: rgba(255,255,255,.92); backdrop-filter: blur(8px);
  border-radius: 20px; padding: 28px;
  border: 1px solid rgba(15,118,110,.08);
  box-shadow: 0 24px 60px rgba(15,23,42,.12), 0 2px 8px rgba(15,23,42,.04);
  animation: floatCard 6s ease-in-out infinite;
  transition: transform .3s ease, box-shadow .3s ease;
}
.event-preview:hover { box-shadow: 0 30px 70px rgba(13,148,136,.2); }

.ep-top { display: flex; gap: 8px; margin-bottom: 16px; }
.tag { display: inline-flex; align-items: center; gap: 6px; font-size: .7rem; font-weight: 700; padding: 5px 11px; border-radius: 100px; letter-spacing: .03em; }
.tag-live { background: #dcfce7; color: #15803d; }
.tag-gray { background: var(--s100); color: var(--s500); }

.pulse { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; position: relative; }
.pulse::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #22c55e; animation: ping 1.6s cubic-bezier(0,0,.2,1) infinite; }

.event-preview h3 { font-size: 1.15rem; font-weight: 800; color: var(--s900); margin: 0 0 8px; letter-spacing: -.01em; }
.event-preview p { font-size: .86rem; color: var(--s500); line-height: 1.6; margin: 0 0 16px; }
.ep-meta { display: flex; flex-wrap: wrap; gap: 14px; font-size: .8rem; color: var(--s700); font-weight: 600; margin-bottom: 18px; }
.ep-meta span { display: inline-flex; align-items: center; gap: 6px; color: var(--s700); }
.ep-meta .app-icon { color: var(--teal); }

.ep-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; font-size: .77rem; color: var(--s500); font-weight: 600; }
.ep-bar { flex: 1; height: 7px; background: var(--s100); border-radius: 100px; overflow: hidden; }
.ep-fill { height: 100%; width: 80%; border-radius: 100px; background: linear-gradient(90deg, var(--teal), var(--teal-l)); transform-origin: left; animation: grow 1.4s cubic-bezier(.22,1,.36,1) .9s both; }
.ep-btn {
  width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--teal); color: #fff; padding: 12px; border-radius: 10px; font-weight: 700; font-size: .88rem;
  transition: background .2s, transform .15s;
}
.ep-btn:hover { background: var(--teal-d); transform: translateY(-1px); }

.bubble {
  position: absolute; z-index: 3;
  display: flex; align-items: center; gap: 9px;
  background: #fff; border-radius: 14px; padding: 10px 14px;
  font-size: .8rem; font-weight: 600; color: var(--s700); white-space: nowrap;
  box-shadow: 0 10px 30px rgba(15,23,42,.14); border: 1px solid rgba(15,23,42,.04);
}
.bubble-1 { top: -22px; right: -26px; animation: float 4s ease-in-out infinite; }
.bubble-2 { bottom: 54px; left: -40px; animation: float 4.6s ease-in-out -1.2s infinite; }
.bubble-3 { bottom: -26px; right: 30px; animation: float 5.2s ease-in-out -2.4s infinite; }
.bubble-ico { width: 24px; height: 24px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; }
.bubble-ico--green { background: #dcfce7; color: #15803d; }
.bubble-ico--teal { background: var(--teal-subtle); color: var(--teal-d); }
.avatars { display: inline-flex; }
.av {
  width: 24px; height: 24px; border-radius: 50%; border: 2px solid #fff;
  background: linear-gradient(135deg, var(--teal), var(--teal-l)); color: #fff;
  font-size: .62rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;
  margin-left: -8px;
}
.av:first-child { margin-left: 0; }

.ring { position: absolute; border-radius: 50%; border: 1.5px solid rgba(13,148,136,.16); pointer-events: none; }
.ring-1 { width: 520px; height: 520px; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: spin 40s linear infinite; border-style: dashed; }
.ring-2 { width: 640px; height: 640px; top: 50%; left: 50%; transform: translate(-50%, -50%); border-color: rgba(13,148,136,.08); }

/* ─── Sections communes ───────────────────────────────── */
.sec-head { text-align: center; max-width: 640px; margin: 0 auto 56px; }
.eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: .74rem; font-weight: 800; color: var(--teal-d);
  letter-spacing: .12em; text-transform: uppercase; margin: 0 0 14px;
  background: var(--teal-pale); border: 1px solid var(--teal-subtle); padding: 6px 12px; border-radius: 100px;
}
.sec-head h2 { font-size: clamp(1.7rem, 3vw, 2.2rem); font-weight: 800; color: var(--s900); margin: 0 0 12px; letter-spacing: -.025em; }
.sec-sub { color: var(--s500); font-size: 1rem; line-height: 1.6; }

/* ─── FEATURES ────────────────────────────────────────── */
.features-section { padding: 112px 0; background: var(--white); }
.feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.feat {
  position: relative; overflow: hidden;
  padding: 32px 28px; border-radius: 18px;
  background: #fff; border: 1.5px solid var(--s200);
  transition: border-color .25s, box-shadow .3s, transform .3s cubic-bezier(.22,1,.36,1);
}
.feat:hover { border-color: var(--teal-subtle); box-shadow: 0 18px 44px rgba(13,148,136,.12); transform: translateY(-6px); }
.feat--highlight { background: linear-gradient(160deg, var(--teal-pale), #fff 70%); border-color: var(--teal-subtle); }
.feat-ico {
  width: 52px; height: 52px; border-radius: 14px; margin-bottom: 20px;
  display: inline-flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--teal-subtle), #fff); color: var(--teal-d);
  border: 1px solid var(--teal-subtle);
  transition: transform .35s cubic-bezier(.22,1,.36,1), background .3s, color .3s;
}
.feat:hover .feat-ico { transform: rotate(-6deg) scale(1.08); background: linear-gradient(135deg, var(--teal), var(--teal-l)); color: #fff; border-color: transparent; }
.feat h3 { font-size: 1.05rem; font-weight: 800; color: var(--s900); margin: 0 0 10px; letter-spacing: -.01em; }
.feat p { font-size: .88rem; color: var(--s500); line-height: 1.68; margin: 0; }
.feat-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,.7) 50%, transparent 100%);
  transform: skewX(-18deg); opacity: 0; pointer-events: none;
}
.feat:hover .feat-shine { animation: shine .9s ease forwards; }

/* ─── STEPS ───────────────────────────────────────────── */
.steps-section { padding: 112px 0; background: linear-gradient(180deg, var(--s50), var(--teal-pale)); }
.steps-row { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.steps-row .steps-line.reveal {
  position: absolute; top: 44px; left: 16%; right: 16%; height: 2px;
  background: linear-gradient(90deg, var(--teal-subtle), var(--teal), var(--teal-subtle));
  transform-origin: left; transform: scaleX(0); z-index: 0;
  transition: opacity .4s ease, transform 1.2s cubic-bezier(.22,1,.36,1);
  transition-delay: var(--reveal-delay, 0ms);
}
.steps-row .steps-line.reveal.is-visible { transform: scaleX(1); }
.step {
  position: relative; z-index: 1; text-align: center;
  padding: 36px 26px 32px; background: #fff; border-radius: 18px;
  border: 1px solid rgba(15,118,110,.08); box-shadow: 0 6px 24px rgba(15,23,42,.05);
  transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s;
}
.step:hover { transform: translateY(-6px); box-shadow: 0 18px 44px rgba(13,148,136,.14); }
.step-badge { position: relative; width: 72px; height: 72px; margin: 0 auto 20px; }
.step-ico {
  width: 72px; height: 72px; border-radius: 22px;
  display: inline-flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--teal), var(--teal-l)); color: #fff;
  box-shadow: 0 10px 24px rgba(13,148,136,.3);
  transition: transform .35s cubic-bezier(.22,1,.36,1);
}
.step:hover .step-ico { transform: rotate(6deg) scale(1.06); }
.step-num {
  position: absolute; top: -8px; right: -10px; z-index: 2;
  background: var(--s900); color: #fff; font-size: .68rem; font-weight: 800;
  padding: 4px 8px; border-radius: 100px; letter-spacing: .04em; border: 2px solid #fff;
}
.step h3 { font-size: 1.05rem; font-weight: 800; color: var(--s900); margin: 0 0 8px; }
.step p { font-size: .86rem; color: var(--s500); margin: 0; line-height: 1.62; }

/* ─── LIVE STRIP ──────────────────────────────────────── */
.live-strip { padding: 0 0 112px; background: var(--teal-pale); }
.live-card {
  display: grid; grid-template-columns: 1.2fr .8fr; gap: 40px; align-items: center;
  background: var(--s900); color: #fff; border-radius: 24px; padding: 48px 52px;
  position: relative; overflow: hidden;
  box-shadow: 0 30px 60px rgba(15,23,42,.25);
}
.live-card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 85% 20%, rgba(20,184,166,.35), transparent 45%);
  pointer-events: none;
}
.live-left { position: relative; }
.live-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(34,197,94,.15); color: #86efac; border: 1px solid rgba(34,197,94,.3);
  font-size: .74rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
  padding: 6px 12px; border-radius: 100px; margin-bottom: 18px;
}
.live-left h3 { font-size: clamp(1.3rem, 2.4vw, 1.7rem); font-weight: 800; letter-spacing: -.02em; line-height: 1.25; margin: 0 0 14px; color: #fff; }
.live-left p { color: rgba(255,255,255,.72); font-size: .95rem; line-height: 1.65; }
.live-right { position: relative; display: flex; flex-direction: column; gap: 12px; }
.mini-card {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px; padding: 14px 16px;
  animation: slideIn .6s cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--n) * 160ms);
}
.mini-bar { flex: 1; height: 8px; border-radius: 100px; background: rgba(255,255,255,.12); overflow: hidden; }
.mini-fill {
  display: block; height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, var(--teal-l), #5eead4);
  animation: liveFill 3.6s ease-in-out infinite; animation-delay: calc(var(--n) * -1.2s);
}
.mini-txt { width: 54px; height: 8px; border-radius: 100px; background: rgba(255,255,255,.18); }

/* ─── FINAL CTA ───────────────────────────────────────── */
.final-cta { padding: 112px 0; background: var(--white); }
.cta-card {
  position: relative; overflow: hidden; text-align: center;
  background: linear-gradient(135deg, var(--teal-d) 0%, var(--teal) 55%, var(--teal-l) 100%);
  border-radius: 28px; padding: 84px 48px;
  box-shadow: 0 30px 70px rgba(13,148,136,.3);
}
.cta-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(30px); }
.cta-orb-1 { width: 320px; height: 320px; top: -120px; right: -80px; background: rgba(255,255,255,.18); animation: drift 12s ease-in-out infinite; }
.cta-orb-2 { width: 260px; height: 260px; bottom: -120px; left: -60px; background: rgba(15,23,42,.18); animation: drift 15s ease-in-out -6s infinite; }
.cta-ico {
  position: relative; width: 60px; height: 60px; border-radius: 18px; margin: 0 auto 22px;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.3); color: #fff;
  backdrop-filter: blur(6px);
}
.cta-card h2 { position: relative; font-size: clamp(1.6rem, 3vw, 2.1rem); font-weight: 800; color: #fff; margin: 0 0 14px; letter-spacing: -.025em; }
.cta-card p { position: relative; color: rgba(255,255,255,.82); margin: 0 auto 36px; font-size: 1rem; max-width: 520px; line-height: 1.6; }
.cta-actions { position: relative; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-white { background: #fff; color: var(--teal-d); box-shadow: 0 8px 24px rgba(15,23,42,.2); }
.btn-white:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(15,23,42,.28); color: var(--teal-d); }
.btn-outline-white { color: #fff; border: 1.5px solid rgba(255,255,255,.55); }
.btn-outline-white:hover { background: rgba(255,255,255,.14); color: #fff; transform: translateY(-2px); }

/* ─── Apparition au défilement ────────────────────────── */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s ease, transform .8s cubic-bezier(.22,1,.36,1); transition-delay: var(--reveal-delay, 0ms); }
.reveal.is-visible { opacity: 1; transform: none; }

/* ─── Keyframes ───────────────────────────────────────── */
@keyframes fadeUp   { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
@keyframes float    { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes floatCard{ 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-6px) rotate(-.4deg); } }
@keyframes drift    { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -20px) scale(1.06); } 66% { transform: translate(-20px, 24px) scale(.96); } }
@keyframes spin     { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes ping     { 0% { transform: scale(.6); opacity: .9; } 100% { transform: scale(1.8); opacity: 0; } }
@keyframes grow     { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes underline{ to { transform: scaleX(1); } }
@keyframes shine    { from { left: -80%; opacity: 0; } 30% { opacity: 1; } to { left: 130%; opacity: 0; } }
@keyframes slideIn  { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
@keyframes liveFill { 0% { width: 30%; } 50% { width: 92%; } 100% { width: 30%; } }

/* ─── Accessibilité : mouvement réduit ────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  .reveal { opacity: 1; transform: none; }
  .ep-fill, .accent-underline, .steps-line { transform: none; }
}

/* ─── Responsive ──────────────────────────────────────── */
@media (max-width: 1024px) {
  .feat-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .hero { padding: 64px 0 80px; }
  .hero-grid { grid-template-columns: 1fr; gap: 56px; }
  .preview-stack { margin: 0 auto; }
  .ring { display: none; }
  .bubble-2 { left: -8px; }
  .bubble-1 { right: -8px; }
  .steps-row { grid-template-columns: 1fr; }
  .steps-line { display: none; }
  .live-card { grid-template-columns: 1fr; padding: 40px 28px; }
  .live-right { display: none; }
  .cta-card { padding: 60px 28px; }
  .container { padding: 0 20px; }
}
@media (max-width: 640px) {
  .feat-grid { grid-template-columns: 1fr; }
  .stats-row { flex-wrap: wrap; gap: 18px; }
  .stat { padding-right: 20px; margin-right: 20px; }
  .bubble-3 { display: none; }
  .hero-actions .btn { width: 100%; justify-content: center; }
}
</style>
