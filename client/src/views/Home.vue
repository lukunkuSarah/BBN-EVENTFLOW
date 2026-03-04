<script setup>
// Static landing page
</script>

<template>
  <div class="home">

    <!-- ════════════════════════ HERO ════════════════════════ -->
    <section class="hero">
      <div class="container">
        <div class="hero-grid">

          <!-- Left: Content -->
          <div class="hero-left">
            <span class="badge">✦ Plateforme professionnelle</span>
            <h1>
              Gérez vos événements<br>
              <em class="accent">avec élégance.</em>
            </h1>
            <p class="lead">
              Conférences, séminaires, meetups — créez, pilotez
              et faites grandir vos événements professionnels,
              simplement.
            </p>
            <div class="hero-actions">
              <router-link to="/register" class="btn-primary">
                Commencer gratuitement
              </router-link>
              <router-link to="/login" class="btn-ghost">
                Déjà un compte →
              </router-link>
            </div>
            <div class="stats-row">
              <div class="stat">
                <span class="stat-n">500+</span>
                <span class="stat-l">Événements créés</span>
              </div>
              <div class="vline"></div>
              <div class="stat">
                <span class="stat-n">12k+</span>
                <span class="stat-l">Participants</span>
              </div>
              <div class="vline"></div>
              <div class="stat">
                <span class="stat-n">98%</span>
                <span class="stat-l">Satisfaction</span>
              </div>
            </div>
          </div>

          <!-- Right: Visual -->
          <div class="hero-right">
            <div class="event-preview">
              <div class="ep-top">
                <span class="tag tag-live">● Live</span>
                <span class="tag tag-gray">50 places</span>
              </div>
              <h3>Atelier Vue 3 &amp; Pinia</h3>
              <p>Découvrez les fonctionnalités modernes de Vue 3 avec une approche pratique et des exercices concrets.</p>
              <div class="ep-date">📅 3 mars 2026 · 14h00</div>
              <div class="ep-progress">
                <div class="ep-bar"><div class="ep-fill" style="width:80%"></div></div>
                <span>48 / 60 inscrits</span>
              </div>
              <button class="ep-btn">S'inscrire maintenant</button>
            </div>
            <div class="bubble bubble-1">
              <span class="bubble-dot"></span> Inscription confirmée ✓
            </div>
            <div class="bubble bubble-2">
              🎯 3 nouveaux événements
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ════════════════════════ FEATURES ════════════════════ -->
    <section class="features-section">
      <div class="container">
        <p class="eyebrow">Fonctionnalités</p>
        <h2>Tout ce dont vous avez besoin</h2>
        <p class="sec-sub">Une solution complète pour organisateurs et participants.</p>
        <div class="feat-grid">
          <div class="feat">
            <span class="feat-ico">🗓️</span>
            <h3>Création d'événements</h3>
            <p>Configurez conférences, séminaires et meetups en quelques minutes avec tous les paramètres nécessaires.</p>
          </div>
          <div class="feat feat--highlight">
            <span class="feat-ico">🔐</span>
            <h3>Inscription sécurisée</h3>
            <p>Authentification robuste et gestion des inscriptions en temps réel avec mises à jour instantanées via SSE.</p>
          </div>
          <div class="feat">
            <span class="feat-ico">📊</span>
            <h3>Gestion administrative</h3>
            <p>Dashboard complet pour suivre les participants, modifier les événements et analyser la fréquentation.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════════ STEPS ═══════════════════════ -->
    <section class="steps-section">
      <div class="container">
        <p class="eyebrow">Comment ça marche</p>
        <h2>En 3 étapes simples</h2>
        <div class="steps-row">
          <div class="step">
            <div class="step-num">01</div>
            <h3>Créez un compte</h3>
            <p>Inscription gratuite et immédiate, aucune carte bancaire requise.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">02</div>
            <h3>Publiez un événement</h3>
            <p>Définissez date, capacité et détails, mettez-le en ligne en un clic.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">03</div>
            <h3>Gérez en direct</h3>
            <p>Suivez les inscriptions en temps réel et pilotez votre événement.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════════ CTA FINAL ═══════════════════ -->
    <section class="final-cta">
      <div class="container">
        <div class="cta-card">
          <div class="cta-glow"></div>
          <h2>Prêt à organiser votre prochain événement ?</h2>
          <p>Rejoignez des centaines d'organisateurs professionnels sur EventFlow.</p>
          <router-link to="/register" class="btn-cta-white">
            Démarrer maintenant →
          </router-link>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ─── Layout ──────────────────────────────────────────── */
.home { overflow-x: hidden; }
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 40px;
}

/* ─── HERO ────────────────────────────────────────────── */
.hero {
  background: linear-gradient(150deg, var(--teal-pale) 0%, var(--white) 55%);
  padding: 88px 0 104px;
  position: relative;
}
.hero::after {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 45%; height: 100%;
  background: radial-gradient(ellipse at top right, rgba(20,184,166,.1) 0%, transparent 65%);
  pointer-events: none;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  align-items: center;
}

.hero-left { animation: fadeUp .55s ease both; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--teal-subtle);
  color: var(--teal-d);
  font-size: 12.5px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 100px;
  margin-bottom: 28px;
  letter-spacing: .03em;
}

.hero-left h1 {
  font-size: clamp(2rem, 3.5vw, 2.9rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--s900);
  margin: 0 0 20px;
  letter-spacing: -.02em;
}

.accent {
  color: var(--teal);
  font-style: italic;
}

.lead {
  font-size: 1.05rem;
  color: var(--s500);
  line-height: 1.72;
  margin: 0 0 36px;
  max-width: 420px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 44px;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-block;
  background: var(--teal);
  color: var(--white);
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 700;
  font-size: .93rem;
  text-decoration: none;
  transition: background .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 4px 18px rgba(13,148,136,.32);
}
.btn-primary:hover {
  background: var(--teal-d);
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(13,148,136,.42);
}

.btn-ghost {
  color: var(--teal-d);
  font-weight: 600;
  font-size: .93rem;
  text-decoration: none;
  transition: color .2s;
}
.btn-ghost:hover { color: var(--teal); }

/* Stats */
.stats-row {
  display: flex;
  gap: 28px;
  align-items: center;
  padding-top: 36px;
  border-top: 1px solid var(--s200);
}
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-n { font-size: 1.45rem; font-weight: 800; color: var(--teal-d); }
.stat-l { font-size: .75rem; color: var(--s500); font-weight: 500; letter-spacing: .02em; }
.vline  { width: 1px; height: 34px; background: var(--s200); }

/* Hero Visual */
.hero-right {
  position: relative;
  animation: fadeUp .55s ease .12s both;
}

.event-preview {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: 0 8px 40px rgba(0,0,0,.1);
  padding: 28px;
  border: 1px solid rgba(0,0,0,.05);
}

.ep-top { display: flex; gap: 8px; margin-bottom: 16px; }

.tag {
  font-size: .7rem;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 100px;
  letter-spacing: .03em;
}
.tag-live { background: #dcfce7; color: #15803d; }
.tag-gray { background: var(--s200); color: var(--s500); }

.event-preview h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--s900);
  margin: 0 0 8px;
}
.event-preview p {
  font-size: .86rem;
  color: var(--s500);
  line-height: 1.6;
  margin: 0 0 16px;
}
.ep-date {
  font-size: .81rem;
  color: var(--s700);
  margin-bottom: 16px;
}

.ep-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: .77rem;
  color: var(--s500);
}
.ep-bar {
  flex: 1; height: 6px;
  background: var(--s200);
  border-radius: 100px;
  overflow: hidden;
}
.ep-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--teal), var(--teal-l));
  border-radius: 100px;
}
.ep-btn {
  width: 100%;
  background: var(--teal);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: .88rem;
  cursor: pointer;
  transition: background .2s, transform .15s;
}
.ep-btn:hover { background: var(--teal-d); transform: translateY(-1px); }

/* Floating bubbles */
.bubble {
  position: absolute;
  background: white;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: .8rem;
  font-weight: 600;
  color: var(--s700);
  box-shadow: 0 4px 20px rgba(0,0,0,.13);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(0,0,0,.04);
}
.bubble-1 {
  top: -20px; right: -20px;
  animation: float 3.2s ease-in-out infinite;
}
.bubble-2 {
  bottom: -20px; left: -20px;
  animation: float 3.2s ease-in-out .9s infinite reverse;
}
.bubble-dot {
  width: 8px; height: 8px;
  background: #22c55e;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ─── FEATURES ────────────────────────────────────────── */
.features-section {
  padding: 104px 0;
  background: var(--white);
}

.eyebrow {
  font-size: .75rem;
  font-weight: 700;
  color: var(--teal);
  letter-spacing: .12em;
  text-transform: uppercase;
  margin: 0 0 12px;
  text-align: center;
}
.features-section h2,
.steps-section h2 {
  font-size: 1.95rem;
  font-weight: 800;
  color: var(--s900);
  margin: 0 0 12px;
  text-align: center;
  letter-spacing: -.02em;
}
.sec-sub {
  color: var(--s500);
  text-align: center;
  margin: 0 0 60px;
  font-size: .98rem;
}

.feat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.feat {
  padding: 32px 28px;
  border-radius: var(--radius);
  border: 1.5px solid var(--s200);
  transition: border-color .2s, box-shadow .2s, transform .25s;
}
.feat:hover {
  border-color: var(--teal-subtle);
  box-shadow: 0 8px 36px rgba(13,148,136,.1);
  transform: translateY(-4px);
}
.feat--highlight {
  background: var(--teal-pale);
  border-color: var(--teal-subtle);
}
.feat-ico {
  font-size: 2.2rem;
  display: block;
  margin-bottom: 18px;
}
.feat h3 {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--s900);
  margin: 0 0 10px;
}
.feat p {
  font-size: .86rem;
  color: var(--s500);
  line-height: 1.68;
  margin: 0;
}

/* ─── STEPS ───────────────────────────────────────────── */
.steps-section {
  padding: 104px 0;
  background: var(--teal-pale);
}

.steps-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-top: 60px;
}
.step {
  flex: 1;
  text-align: center;
  padding: 36px 24px;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.step-num {
  width: 52px;
  height: 52px;
  background: var(--teal-subtle);
  color: var(--teal-d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0 auto 18px;
}
.step h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--s900);
  margin: 0 0 8px;
}
.step p {
  font-size: .84rem;
  color: var(--s500);
  margin: 0;
  line-height: 1.6;
}
.step-arrow {
  font-size: 1.4rem;
  color: var(--teal);
  margin-top: 58px;
  flex-shrink: 0;
  opacity: .5;
}

/* ─── FINAL CTA ───────────────────────────────────────── */
.final-cta {
  padding: 104px 0;
  background: var(--white);
}
.cta-card {
  background: linear-gradient(135deg, var(--teal-d) 0%, var(--teal) 50%, var(--teal-l) 100%);
  border-radius: 24px;
  padding: 80px 48px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.cta-glow {
  position: absolute;
  top: -60px; right: -60px;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,.15) 0%, transparent 65%);
  pointer-events: none;
}
.cta-card h2 {
  font-size: 1.85rem;
  font-weight: 800;
  color: white;
  margin: 0 0 16px;
  position: relative;
  letter-spacing: -.02em;
}
.cta-card p {
  color: rgba(255,255,255,.8);
  margin: 0 0 40px;
  font-size: 1rem;
  position: relative;
}
.btn-cta-white {
  display: inline-block;
  background: white;
  color: var(--teal-d);
  padding: 15px 36px;
  border-radius: 10px;
  font-weight: 700;
  font-size: .95rem;
  text-decoration: none;
  transition: transform .15s, box-shadow .2s;
  box-shadow: 0 4px 20px rgba(0,0,0,.18);
  position: relative;
}
.btn-cta-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,.25);
}

/* ─── Animations ──────────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

/* ─── Responsive ──────────────────────────────────────── */
@media (max-width: 900px) {
  .hero-grid   { grid-template-columns: 1fr; gap: 48px; }
  .hero-right  { display: none; }
  .feat-grid   { grid-template-columns: 1fr; }
  .steps-row   { flex-direction: column; }
  .step-arrow  { display: none; }
  .hero-left h1 { font-size: 2rem; }
  .cta-card    { padding: 56px 28px; }
  .cta-card h2 { font-size: 1.45rem; }
  .container   { padding: 0 20px; }
}
</style>
