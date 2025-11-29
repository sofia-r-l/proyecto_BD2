<template>
  <div class="clientes-wrapper">

    <!-- Título -->
    <header class="header">
      <h1>Gestión de Clientes</h1>

      <button class="btn-primary" @click="openCreate">
        <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
        Nuevo Cliente
      </button>
    </header>

    <!-- Buscador -->
    <div class="search-box">
      <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      <input type="text" v-model="busqueda" placeholder="Buscar cliente..." />
    </div>

    <!-- Tabla -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Crédito (L.)</th>
            <th>Opciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="cliente in filtrados" :key="cliente.id">
            <td>{{ cliente.nombre }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.email }}</td>
            <td>{{ cliente.limiteCredito }}</td>

            <td class="acciones">
              <button class="icon-btn" @click="openEdit(cliente)">
                <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
              </button>

              <button class="icon-btn delete" @click="confirmDelete(cliente)">
                <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="modalOpen" class="modal-overlay">
      <div class="modal">
        <h2>{{ editando ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>

        <form @submit.prevent="save">

          <label>Nombre *</label>
          <input v-model="form.nombre" required />

          <label>Teléfono *</label>
          <input v-model="form.telefono" required />

          <label>Email *</label>
          <input v-model="form.email" type="email" required />

          <label>Crédito (L.) *</label>
          <input v-model="form.limiteCredito" type="number" min="0" required />

          <div class="modal-buttons">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary">{{ editando ? 'Actualizar' : 'Crear' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- CONFIRM DELETE -->
    <div v-if="confirmOpen" class="modal-overlay">
      <div class="confirm-box">
        <h3>¿Eliminar cliente?</h3>
        <p>Esta acción no se puede deshacer.</p>

        <div class="confirm-buttons">
          <button class="btn-secondary" @click="confirmOpen = false">Cancelar</button>
          <button class="btn-danger" @click="deleteCliente">Eliminar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const busqueda = ref("");
const modalOpen = ref(false);
const confirmOpen = ref(false);
const editando = ref(false);

const form = ref({
  id: null,
  nombre: "",
  telefono: "",
  email: "",
  limiteCredito: 0,
});

const clientes = ref([
  { id: 1, nombre: "Clínica San José", telefono: "22334455", email: "contacto@sanJose.com", limiteCredito: 50000 },
  { id: 2, nombre: "Hospital La Paz", telefono: "33445566", email: "info@lapaz.com", limiteCredito: 100000 },
  { id: 3, nombre: "Consultorio Dr. Gómez", telefono: "44556677", email: "drgomez@consultorio.com", limiteCredito: 20000 },
]);

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase();
  return clientes.value.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    c.telefono.includes(q) ||
    c.email.toLowerCase().includes(q)
  );
});

const openCreate = () => {
  editando.value = false;
  form.value = { id: null, nombre: "", telefono: "", email: "", limiteCredito: 0 };
  modalOpen.value = true;
};

const openEdit = (cliente) => {
  editando.value = true;
  form.value = { ...cliente };
  modalOpen.value = true;
};

const save = () => {
  if (editando.value) {
    const i = clientes.value.findIndex(c => c.id === form.value.id);
    clientes.value[i] = { ...form.value };
  } else {
    clientes.value.push({ ...form.value, id: Date.now() });
  }
  modalOpen.value = false;
};

const closeModal = () => modalOpen.value = false;

let idToDelete = null;

const confirmDelete = (cliente) => {
  confirmOpen.value = true;
  idToDelete = cliente.id;
};

const deleteCliente = () => {
  clientes.value = clientes.value.filter(c => c.id !== idToDelete);
  confirmOpen.value = false;
};
</script>

<style scoped>
/* Layout */
.clientes-wrapper {
  padding: 30px;
  max-width: 1200px;
  margin: auto;
  font-family: "Segoe UI", sans-serif;
  color: #333;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.header h1 {
  font-size: 30px;
  font-weight: 700;
  color: #2c3e50;
}

/* Botones */
.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 600;
}

.btn-primary {
  background: #4f46e5;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-secondary {
  background: #e5e7eb;
  border: none;
}

.btn-danger {
  background: #d82b2b;
  color: white;
  border: none;
}

/* Search */
.search-box {
  display: flex;
  align-items: center;
  background: white;
  padding: 10px 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0px 3px 10px rgba(0,0,0,0.06);
  gap: 8px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 15px;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 14px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0px 3px 12px rgba(0,0,0,0.07);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f3f4f6;
}

th, td {
  padding: 14px 18px;
  font-size: 14px;
}

tbody tr {
  border-bottom: 1px solid #f1f1f1;
}

/* Icons */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.icon-btn svg {
  fill: #4f46e5;
}

.icon-btn.delete svg {
  fill: #d82b2b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #fff;
  padding: 25px;
  width: 380px;
  border-radius: 14px;
  box-shadow: 0px 6px 20px rgba(0,0,0,0.15);
}

.modal h2 {
  margin-bottom: 18px;
  font-size: 20px;
}

.modal input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 12px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

/* Confirm Delete */
.confirm-box {
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 330px;
  box-shadow: 0px 6px 20px rgba(0,0,0,0.15);
  text-align: center;
}

.confirm-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}
</style>
