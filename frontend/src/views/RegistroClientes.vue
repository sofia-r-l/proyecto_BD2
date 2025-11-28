<template>
  <div class="clientes-container">
    <h1 class="titulo">
      <i class="fas fa-users"></i> Gestión de Clientes
    </h1>

    <!-- Buscador + Botón agregar -->
    <div class="search-add">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" v-model="busqueda" placeholder="Buscar cliente...">
      </div>

      <button class="btn-agregar" @click="modalOpen = true">
        <i class="fas fa-plus"></i> Nuevo Cliente
      </button>
    </div>

    <!-- Tabla de clientes -->
    <div class="tabla-container">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Crédito (L.)</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
            <td>{{ cliente.nombre }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.email }}</td>
            <td>{{ cliente.direccion }}</td>
            <td>{{ cliente.limiteCredito }}</td>
            <td class="opciones">
              <button class="btn-editar"><i class="fas fa-edit"></i></button>
              <button class="btn-eliminar"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div class="modal" v-if="modalOpen">
      <div class="modal-content">

        <!-- Header -->
        <div class="modal-header">
          <i class="fas fa-user-plus"></i>
          <h2>Nuevo Cliente</h2>
        </div>

        <form @submit.prevent="guardarCliente">

          <div class="form-row">
            <div class="form-group">
              <label><i class="fas fa-user"></i> Nombre Completo *</label>
              <input v-model="clienteForm.nombre" placeholder="Nombre del cliente" required />
            </div>

            <div class="form-group">
              <label><i class="fas fa-id-card"></i> Identidad *</label>
              <input v-model="clienteForm.identidad" placeholder="Número de identidad" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label><i class="fas fa-phone"></i> Teléfono *</label>
              <input v-model="clienteForm.telefono" placeholder="+504 0000-0000" required />
            </div>

            <div class="form-group">
              <label><i class="fas fa-envelope"></i> Email *</label>
              <input type="email" v-model="clienteForm.email" placeholder="correo@empresa.com" required />
            </div>
          </div>

          <div class="form-group">
            <label><i class="fas fa-map-marker-alt"></i> Dirección *</label>
            <input v-model="clienteForm.direccion" placeholder="Dirección completa" required />
          </div>

          <div class="form-group">
            <label><i class="fas fa-credit-card"></i> Límite de Crédito (L.) *</label>
            <input type="number" min="0" v-model="clienteForm.limiteCredito" placeholder="0" required />
          </div>

          <div class="modal-buttons">
            <button type="button" class="btn-cancel" @click="modalOpen = false">
              <i class="fas fa-times"></i> Cancelar
            </button>

            <button type="submit" class="btn-save">
              <i class="fas fa-check"></i> Crear
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  setup() {
    const modalOpen = ref(false);
    const busqueda = ref("");

    const clientes = ref([]); // ← aquí se llenarán desde backend

    const clienteForm = ref({
      nombre: "",
      identidad: "",
      telefono: "",
      email: "",
      direccion: "",
      limiteCredito: 0
    });

    const clientesFiltrados = computed(() => {
      if (!busqueda.value) return clientes.value;

      return clientes.value.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
        c.telefono.includes(busqueda.value) ||
        c.email.toLowerCase().includes(busqueda.value.toLowerCase())
      );
    });

    const limpiarFormulario = () => {
      clienteForm.value = {
        nombre: "",
        identidad: "",
        telefono: "",
        email: "",
        direccion: "",
        limiteCredito: 0
      };
    };

    const guardarCliente = () => {
      const nuevo = {
        id: Date.now(),
        ...clienteForm.value
      };

      clientes.value.push(nuevo);

      limpiarFormulario();
      modalOpen.value = false;
    };

    return {
      modalOpen,
      clientes,
      clienteForm,
      busqueda,
      clientesFiltrados,
      guardarCliente
    };
  }
};
</script>

<style scoped>
/* CONTENEDOR */
.clientes-container {
  padding: 30px;
  max-width: 1100px;
  margin: auto;
  font-family: "Segoe UI", sans-serif;
}

.titulo {
  font-size: 28px;
  font-weight: 700;
  color: #3b3bbf;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
}

/* BUSCADOR + BOTÓN */
.search-add {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f1f1f9;
  padding: 10px 15px;
  border-radius: 12px;
  width: 350px;
}

.search-box i {
  color: #555;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
}

.btn-agregar {
  background: #4a3aff;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}

.btn-agregar:hover {
  background: #372ce0;
}

/* TABLA */
.tabla-container {
  overflow-x: auto;
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 4px 15px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #ececff;
}

th {
  padding: 12px;
  text-align: left;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.opciones button {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 18px;
}

.btn-editar {
  color: #2575ff;
}

.btn-eliminar {
  color: #e84c4c;
}

/* MODAL */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(17, 17, 17, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: #ffffff;
  width: 90%;
  max-width: 650px;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 35px rgba(0,0,0,0.15);
  animation: popIn 0.25s ease-out;
}

@keyframes popIn {
  from { transform: scale(.85); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* HEADER */
.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: bold;
  color: #4a3aff;
}

.modal-header i {
  font-size: 25px;
  color: #4a3aff;
}

/* FORM */
.form-row {
  display: flex;
  gap: 15px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

label {
  font-weight: 600;
  margin-bottom: 6px;
  display: flex;
  gap: 5px;
  align-items: center;
}

input {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #d8d8d8;
  background: #fafafa;
}

input:focus {
  border-color: #4a3aff;
  background: white;
  box-shadow: 0 0 5px rgba(74, 58, 255, 0.3);
}

/* BOTONES MODAL */
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: #626262;
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.btn-save {
  background: #2575ff;
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}
</style>
