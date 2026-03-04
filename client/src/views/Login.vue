<script setup>
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })

async function submit() {
  const ok = await auth.login({ email: form.email, password: form.password })
  if (ok) {
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  }
}

function loginDemo() {
  form.email = 'demo@eventflow.local'
  form.password = 'demo1234'
  submit()
}
</script>

<template>
  <div class="auth-page">
    <!-- Panneau gauche: bienvenue -->
    <div class="auth-side">
      <div class="auth-side-content">
        <div class="side-badge">✦ EventFlow</div>
        <h2>Bon retour parmi nous 👋</h2>
        <p>Gérez vos conférences, séminaires et meetups depuis un seul endroit, avec élégance.</p>
        <div class="side-stats">
          <div class="side-stat"><span class="s-num">500+</span><span class="s-lbl">Événements</span></div>
          <div class="side-stat"><span class="s-num">12k+</span><span class="s-lbl">Participants</span></div>
          <div class="side-stat"><span class="s-num">98%</span><span class="s-lbl">Satisfaction</span></div>
        </div>
      </div>
    </div>

    <!-- Panneau droit: formulaire -->
    <div class="auth-form-wrap">
      <div class="auth-card">
        <div class="auth-card-header">
          <h1>Connexion</h1>
          <p>Accédez à votre espace EventFlow</p>
        </div>

        <form @submit.prevent="submit" class="auth-form">
          <div class="field">
            <label for="login-email">Adresse email</label>
            <div class="input-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input id="login-email" v-model="form.email" type="email" placeholder="demo@eventflow.local" required />
            </div>
          </div>

          <div class="field">
            <label for="login-password">Mot de passe</label>
            <div class="input-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input id="login-password" v-model="form.password" type="password" placeholder="••••••••" required />
            </div>
          </div>

          <button :disabled="auth.loading" type="submit" class="btn-submit">
            <svg v-if="!auth.loading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            <span>{{ auth.loading ? 'Connexion…' : 'Se connecter' }}</span>
          </button>

          <button type="button" class="btn-demo" @click="loginDemo">
            ⚡ Connexion démo rapide
          </button>

          <p v-if="auth.error" class="error-msg">{{ auth.error }}</p>
        </form>

        <p class="auth-footer">
          Pas encore de compte ?
          <router-link to="/register">Créer un compte →</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 72px);
}

/* ── Gauche ─────────────────────────────────────────────── */
.auth-side {
  background: linear-gradient(145deg, var(--teal-d) 0%, var(--teal) 55%, var(--teal-l) 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 60px 48px; position: relative; overflow: hidden;
}
.auth-side::before {
  content: ''; position: absolute; top: -100px; right: -100px;
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,.12) 0%, transparent 65%);
  pointer-events: none;
}
.auth-side-content { position: relative; max-width: 380px; }
.side-badge {
  display: inline-block; background: rgba(255,255,255,.2); color: white;
  font-size: .78rem; font-weight: 700; padding: 5px 14px;
  border-radius: 100px; letter-spacing: .08em; margin-bottom: 24px;
}
.auth-side-content h2 {
  font-size: 2rem; font-weight: 800; color: white;
  margin-bottom: 16px; line-height: 1.2; letter-spacing: -.02em;
}
.auth-side-content p { color: rgba(255,255,255,.82); font-size: 1rem; line-height: 1.68; margin-bottom: 40px; }
.side-stats { display: flex; gap: 28px; padding-top: 28px; border-top: 1px solid rgba(255,255,255,.25); }
.side-stat { display: flex; flex-direction: column; gap: 2px; }
.s-num { font-size: 1.5rem; font-weight: 800; color: white; }
.s-lbl { font-size: .73rem; color: rgba(255,255,255,.7); font-weight: 500; }

/* ── Droite ─────────────────────────────────────────────── */
.auth-form-wrap {
  display: flex; align-items: center; justify-content: center;
  padding: 48px 40px; background: var(--s50);
}
.auth-card {
  width: 100%; max-width: 430px; background: white; border-radius: 20px;
  box-shadow: var(--shadow-lg); padding: 40px 36px; border: 1px solid var(--s200);
  animation: slideIn .4s ease both;
}
.auth-card-header { margin-bottom: 32px; text-align: center; }
.auth-card-header h1 { font-size: 1.65rem; font-weight: 800; color: var(--s900); margin-bottom: 6px; letter-spacing: -.02em; }
.auth-card-header p { color: var(--s500); font-size: .93rem; }

.auth-form { display: flex; flex-direction: column; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field label { font-size: .83rem; font-weight: 600; color: var(--s700); }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 14px; color: var(--s500); pointer-events: none; }
.input-wrap input {
  width: 100%; padding: 12px 14px 12px 42px;
  border: 1.5px solid var(--s200); border-radius: 10px;
  font-size: .93rem; color: var(--s900); background: var(--s50);
  transition: border-color .2s, box-shadow .2s, background .2s; outline: none;
}
.input-wrap input:focus { border-color: var(--teal); background: white; box-shadow: 0 0 0 3px rgba(13,148,136,.1); }
.input-wrap input::placeholder { color: var(--s300); }

.btn-submit {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 14px; background: var(--teal); color: white;
  border-radius: 10px; font-size: .95rem; font-weight: 700; border: none; margin-top: 4px;
  box-shadow: 0 3px 14px rgba(13,148,136,.3);
}
.btn-submit:hover:not(:disabled) { background: var(--teal-d); transform: translateY(-1px); box-shadow: 0 5px 18px rgba(13,148,136,.4); }
.btn-submit:disabled { opacity: .65; cursor: not-allowed; }

.btn-demo {
  width: 100%; padding: 12px; background: var(--teal-subtle); color: var(--teal-d);
  border-radius: 10px; font-size: .88rem; font-weight: 600;
  border: 1.5px dashed var(--teal); transition: background .2s, transform .15s;
}
.btn-demo:hover { background: var(--teal-pale); transform: translateY(-1px); }

.error-msg { color: #dc2626; font-size: .84rem; font-weight: 500; padding: 10px 14px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; }

.auth-footer { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--s200); font-size: .88rem; color: var(--s500); }
.auth-footer a { font-weight: 600; color: var(--teal); }

@media (max-width: 900px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-side  { display: none; }
  .auth-form-wrap { min-height: calc(100vh - 64px); padding: 32px 20px; }
  .auth-card { padding: 32px 24px; }
}
@media (max-width: 480px) {
  .auth-form-wrap { padding: 20px 16px; }
  .auth-card { border-radius: 16px; padding: 28px 18px; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
