<script setup>
import { reactive, watch, nextTick, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  initial:    { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue', 'save'])

const form = reactive({ id: null, title: '', description: '', date: '', capacity: '' })
const errors = reactive({ title: '', date: '', capacity: '' })
const titleInput = ref(null)

watch(
  () => props.initial,
  (v) => {
    form.id          = v?.id          || null
    form.title       = v?.title       || ''
    form.description = v?.description || ''
    form.date        = v?.date ? new Date(v.date).toISOString().slice(0, 16) : ''
    form.capacity    = v?.capacity    ?? ''
    errors.title = errors.date = errors.capacity = ''
  },
  { immediate: true }
)

watch(() => props.modelValue, async (open) => {
  if (open) {
    errors.title = errors.date = errors.capacity = ''
    await nextTick()
    titleInput.value?.focus()
  }
})

function close() { emit('update:modelValue', false) }

function validate() {
  errors.title    = form.title.trim()        ? '' : 'Le titre est requis'
  errors.date     = form.date                ? '' : 'La date est requise'
  errors.capacity = form.capacity !== '' && Number(form.capacity) >= 0
                    ? '' : 'La capacité doit être ≥ 0'
  return !errors.title && !errors.date && !errors.capacity
}

function save() {
  if (!validate()) return
  emit('save', {
    ...form,
    title:    form.title.trim(),
    capacity: Number(form.capacity),
    date:     new Date(form.date).toISOString(),
  })
}

function onBackdrop(e) {
  if (e.target === e.currentTarget) close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-backdrop" @click="onBackdrop" @keydown.esc="close">

        <div class="modal-panel" role="dialog" aria-modal="true">

          <!-- Header -->
          <div class="modal-header">
            <div class="modal-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
              </svg>
            </div>
            <div>
              <h2 class="modal-title">{{ form.id ? 'Modifier l\'événement' : 'Nouvel événement' }}</h2>
              <p class="modal-sub">{{ form.id ? 'Mettez à jour les informations' : 'Remplissez les informations ci-dessous' }}</p>
            </div>
            <button class="modal-close" @click="close" aria-label="Fermer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form class="modal-form" @submit.prevent="save" novalidate>

            <!-- Titre -->
            <div class="field" :class="{ 'field--error': errors.title }">
              <label class="field-label">
                Titre de l'événement
                <span class="required">*</span>
              </label>
              <div class="input-wrap">
                <svg class="input-ico" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="4 7 4 4 20 4 20 7"/>
                  <line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
                </svg>
                <input
                  ref="titleInput"
                  v-model="form.title"
                  type="text"
                  class="input"
                  placeholder="Ex: Conférence Vue 3 — Paris 2026"
                  @input="errors.title = ''"
                />
              </div>
              <span class="field-error" v-if="errors.title">{{ errors.title }}</span>
            </div>

            <!-- Description -->
            <div class="field">
              <label class="field-label">Description <span class="optional">optionnel</span></label>
              <div class="input-wrap input-wrap--ta">
                <svg class="input-ico input-ico--ta" xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/>
                  <line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>
                </svg>
                <textarea
                  v-model="form.description"
                  class="input input--ta"
                  rows="3"
                  placeholder="Décrivez l'objectif, le programme, le public cible…"
                ></textarea>
              </div>
            </div>

            <!-- Date + Capacité (deux colonnes) -->
            <div class="field-row">

              <div class="field" :class="{ 'field--error': errors.date }">
                <label class="field-label">Date & heure <span class="required">*</span></label>
                <div class="input-wrap">
                  <svg class="input-ico" xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <input
                    v-model="form.date"
                    type="datetime-local"
                    class="input"
                    @change="errors.date = ''"
                  />
                </div>
                <span class="field-error" v-if="errors.date">{{ errors.date }}</span>
              </div>

              <div class="field" :class="{ 'field--error': errors.capacity }">
                <label class="field-label">Capacité <span class="required">*</span></label>
                <div class="input-wrap">
                  <svg class="input-ico" xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <input
                    v-model.number="form.capacity"
                    type="number"
                    min="0"
                    class="input"
                    placeholder="Ex: 100"
                    @input="errors.capacity = ''"
                  />
                </div>
                <span class="field-error" v-if="errors.capacity">{{ errors.capacity }}</span>
              </div>

            </div>

            <!-- Footer -->
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="close">Annuler</button>
              <button type="submit" class="btn-save">
                <svg v-if="!form.id" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ form.id ? 'Enregistrer les modifications' : 'Créer l\'événement' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop ─────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* ── Panel ────────────────────────────────────────────────── */
.modal-panel {
  background: var(--white);
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 24px 80px rgba(0,0,0,.22);
  overflow: hidden;
}

/* ── Header ───────────────────────────────────────────────── */
.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 28px 28px 0;
}
.modal-header-icon {
  width: 46px; height: 46px;
  background: var(--teal-pale);
  border: 1.5px solid var(--teal-subtle);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--teal-d);
  flex-shrink: 0;
}
.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--s900);
  letter-spacing: -.02em;
  margin: 2px 0 4px;
}
.modal-sub {
  font-size: .8rem;
  color: var(--s500);
  margin: 0;
}
.modal-close {
  margin-left: auto;
  width: 34px; height: 34px;
  background: var(--s100);
  border: none;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--s500);
  flex-shrink: 0;
  transition: background .15s, color .15s;
}
.modal-close:hover { background: var(--s200); color: var(--s900); }

/* ── Form ─────────────────────────────────────────────────── */
.modal-form {
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* ── Field ────────────────────────────────────────────────── */
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: .82rem;
  font-weight: 600;
  color: var(--s700);
  display: flex;
  align-items: center;
  gap: 5px;
}
.required { color: #e11d48; font-size: .8rem; }
.optional {
  font-size: .72rem;
  font-weight: 500;
  color: var(--s300);
  padding: 1px 7px;
  background: var(--s100);
  border-radius: 100px;
}

/* ── Input wrapper ────────────────────────────────────────── */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-wrap--ta { align-items: flex-start; }
.input-ico {
  position: absolute;
  left: 13px;
  color: var(--s400, var(--s500));
  pointer-events: none;
  flex-shrink: 0;
}
.input-ico--ta { top: 13px; }

.input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  border: 1.5px solid var(--s200);
  border-radius: 11px;
  font-size: .9rem;
  font-family: inherit;
  color: var(--s900);
  background: var(--s50);
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .15s;
}
.input::placeholder { color: var(--s300); }
.input:focus {
  border-color: var(--teal);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(13,148,136,.12);
}
.input--ta {
  resize: vertical;
  min-height: 88px;
  line-height: 1.6;
  padding-top: 11px;
}
input[type="datetime-local"] { cursor: pointer; }
input[type="number"] { -moz-appearance: textfield; }
input[type="number"]::-webkit-inner-spin-button { display: none; }

/* ── Field error state ────────────────────────────────────── */
.field--error .input {
  border-color: #f43f5e;
  background: #fff1f2;
}
.field--error .input:focus {
  box-shadow: 0 0 0 3px rgba(244,63,94,.12);
}
.field-error {
  font-size: .76rem;
  color: #e11d48;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
.field-error::before { content: '⚠'; font-size: .8rem; }

/* ── Footer ───────────────────────────────────────────────── */
.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 6px;
  border-top: 1px solid var(--s200);
  margin-top: 4px;
}
.btn-cancel {
  padding: 11px 20px;
  border: 1.5px solid var(--s200);
  border-radius: 11px;
  background: transparent;
  color: var(--s500);
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s, border-color .15s;
}
.btn-cancel:hover { background: var(--s100); border-color: var(--s300); }
.btn-save {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 22px;
  background: linear-gradient(135deg, var(--teal-d), var(--teal));
  color: white;
  border: none;
  border-radius: 11px;
  font-size: .9rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 3px 14px rgba(13,148,136,.32);
  transition: transform .15s, box-shadow .2s;
}
.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 20px rgba(13,148,136,.42);
}

/* ── Transition ───────────────────────────────────────────── */
.modal-enter-active { transition: opacity .22s ease, transform .22s ease; }
.modal-leave-active { transition: opacity .18s ease, transform .18s ease; }
.modal-enter-from  { opacity: 0; transform: scale(.96) translateY(8px); }
.modal-leave-to    { opacity: 0; transform: scale(.96) translateY(8px); }
.modal-enter-from .modal-panel,
.modal-leave-to   .modal-panel { transform: translateY(12px); }

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 560px) {
  .modal-backdrop { align-items: flex-end; padding: 0; }
  .modal-panel    { border-radius: 20px 20px 0 0; max-width: 100%; }
  .field-row      { grid-template-columns: 1fr; }
}
</style>
