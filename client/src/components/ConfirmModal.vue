<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmation' },
  message: { type: String, default: 'Êtes-vous sûr ?' },
})
const emit = defineEmits(['update:modelValue', 'confirm'])
function close() { emit('update:modelValue', false) }
function confirm() { emit('confirm'); close() }
</script>

<template>
  <dialog :open="modelValue" class="modal">
    <div class="card">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="actions">
        <button class="secondary" @click="close">Annuler</button>
        <button @click="confirm">Confirmer</button>
      </div>
    </div>
  </dialog>
  
</template>

<style scoped>
.modal { border: none; padding: 0; }
.card { display: grid; gap: 10px; padding: 16px; width: 380px; border: 1px solid #e5e7eb; border-radius: 10px; }
.actions { display: flex; gap: 8px; justify-content: flex-end; }
button { padding: 8px 12px; border-radius: 6px; border: none; background: #0ea5e9; color: white; cursor: pointer; }
.secondary { background: #64748b; }
</style>

