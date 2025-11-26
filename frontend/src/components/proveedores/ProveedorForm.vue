<template>
  <div class="proveedor-form">
    <form @submit.prevent="handleSubmit" class="form-container">
      <h3>{{ editMode ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor' }}</h3>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="nombre">Nombre *</label>
          <input
            id="nombre"
            v-model="formData.Nombre"
            type="text"
            required
            placeholder="Nombre del proveedor"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="identidadFiscal">RTN/Identidad Fiscal *</label>
          <input
            id="identidadFiscal"
            v-model="formData.IdentidadFiscal"
            type="text"
            required
            placeholder="Número de identificación fiscal"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="telefono">Teléfono *</label>
          <input
            id="telefono"
            v-model="formData.Telefono"
            type="tel"
            required
            placeholder="+504 2234-5678"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
            id="email"
            v-model="formData.Email"
            type="email"
            required
            placeholder="proveedor@empresa.com"
            class="form-input"
          >
        </div>

        <div class="form-group full-width">
          <label for="direccion">Dirección *</label>
          <input
            id="direccion"
            v-model="formData.Direccion"
            type="text"
            required
            placeholder="Dirección completa"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="limiteCredito">Límite de Crédito (L.) *</label>
          <input
            id="limiteCredito"
            v-model.number="formData.LimiteCredito"
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            class="form-input"
          >
        </div>
      </div>

      <div class="form-actions">
        <button
          type="button"
          @click="$emit('cancel')"
          class="btn btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary"
        >
          {{ loading ? 'Guardando...' : (editMode ? 'Actualizar' : 'Crear') }}
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { proveedoresService } from '@/services/proveedores.service';
import type { Proveedor, CrearProveedorData, ActualizarProveedorData } from '@/services/proveedores.service';

// Props
interface Props {
  proveedor?: Proveedor | null;
  editMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  proveedor: null,
  editMode: false
});

// Emits
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

// Reactive data
const loading = ref(false);
const error = ref('');

const formData = reactive<CrearProveedorData>({
  Nombre: '',
  IdentidadFiscal: '',
  Telefono: '',
  Email: '',
  Direccion: '',
  LimiteCredito: 0
});

// Watchers
watch(() => props.proveedor, (newProveedor) => {
  if (newProveedor && props.editMode) {
    formData.Nombre = newProveedor.Nombre;
    formData.IdentidadFiscal = newProveedor.IdentidadFiscal;
    formData.Telefono = newProveedor.Telefono;
    formData.Email = newProveedor.Email;
    formData.Direccion = newProveedor.Direccion;
    formData.LimiteCredito = newProveedor.LimiteCredito;
  }
}, { immediate: true });

// Methods
const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    if (props.editMode && props.proveedor) {
      await proveedoresService.updateProveedor({
        ...formData,
        ProveedorID: props.proveedor.ProveedorID
      } as ActualizarProveedorData);
    } else {
      await proveedoresService.createProveedor(formData);
    }

    emit('success');
  } catch (err: any) {
    error.value = err.message || 'Error al guardar el proveedor';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.proveedor-form {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-container h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: #3498db;
  outline: none;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 5px;
  text-align: center;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>