<template>
  <div class="venta-card">
    <h2 class="title">Registro de Venta</h2>

    <!-- Cliente -->
    <div class="card-section">
      <h3>Cliente</h3>

      <div class="field">
        <label>Cliente</label>
        <select v-model="selectedClienteId" @change="cargarDatosCliente">
          <option value="">Seleccione un cliente</option>
          <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
            {{ cliente.nombre }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Teléfono</label>
        <input type="text" :value="clienteSeleccionado?.telefono || ''" disabled />
      </div>

      <div class="field">
        <label>Dirección</label>
        <input type="text" :value="clienteSeleccionado?.direccion || ''" disabled />
      </div>
    </div>

    <!-- Producto -->
    <div class="card-section">
      <h3>Producto</h3>

      <div class="field">
        <label>Producto</label>
        <select v-model="selectedProductoId" @change="cargarDatosProducto">
          <option value="">Seleccione un producto</option>
          <option v-for="producto in productos" :key="producto.id" :value="producto.id">
            {{ producto.nombre }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Precio</label>
        <input type="number" :value="productoSeleccionado?.precio || ''" disabled />
      </div>

      <div class="field">
        <label>Stock</label>
        <input type="number" :value="productoSeleccionado?.stock || ''" disabled />
      </div>
    </div>

    <!-- Venta -->
    <div class="card-section">
      <h3>Datos de Venta</h3>

      <div class="field">
        <label>Cantidad</label>
        <input type="number" v-model.number="cantidad" @input="calcularTotal" min="1" />
      </div>

      <div class="field">
        <label>Total</label>
        <input type="number" :value="total" disabled />
      </div>

      <div class="field">
        <label>Fecha</label>
        <input type="date" v-model="fecha" />
      </div>
    </div>

    <!-- Botón -->
    <div class="card-section">
      <button class="btn-registrar" @click="registrarVenta">Registrar Venta</button>
    </div>

    <!-- Lista de ventas registradas -->
    <div class="card-section" v-if="ventas.length">
      <h3>Ventas Registradas</h3>
      <ul>
        <li v-for="(v, index) in ventas" :key="index">
          {{ v.fecha }} - {{ v.cliente }} compró {{ v.cantidad }} de {{ v.producto }} - Total: ${{
            v.total
          }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Datos simulados pero más reales para una comercializadora médica
const clientes = ref([
  { id: 1, nombre: 'Clínica San José', telefono: '22334455', direccion: 'Av. Central 123' },
  { id: 2, nombre: 'Hospital La Paz', telefono: '33445566', direccion: 'Calle Principal 45' },
  { id: 3, nombre: 'Consultorio Médico Dr. Gómez', telefono: '44556677', direccion: 'Calle 7 #89' },
])

const productos = ref([
  { id: 1, nombre: 'Guantes de látex (100 unidades)', precio: 15, stock: 100 },
  { id: 2, nombre: 'Mascarillas quirúrgicas (50 unidades)', precio: 10, stock: 200 },
  { id: 3, nombre: 'Termómetro digital infrarrojo', precio: 45, stock: 30 },
  { id: 4, nombre: 'Alcohol etílico 70% (1 litro)', precio: 8, stock: 150 },
  { id: 5, nombre: 'Jeringas 5ml (50 unidades)', precio: 12, stock: 120 },
  { id: 6, nombre: 'Curitas adhesivas (100 unidades)', precio: 5, stock: 300 },
  { id: 7, nombre: 'Aspirina 500mg (20 tabletas)', precio: 7, stock: 250 },
  { id: 8, nombre: 'Estetoscopio profesional', precio: 60, stock: 25 },
])

// Estados
const selectedClienteId = ref('')
const selectedProductoId = ref('')
const clienteSeleccionado = ref(null)
const productoSeleccionado = ref(null)
const cantidad = ref(1)
const total = ref(0)
const fecha = ref(new Date().toISOString().split('T')[0])
const ventas = ref([])

// Funciones
function cargarDatosCliente() {
  clienteSeleccionado.value = clientes.value.find((c) => c.id === Number(selectedClienteId.value))
}

function cargarDatosProducto() {
  productoSeleccionado.value = productos.value.find(
    (p) => p.id === Number(selectedProductoId.value),
  )
  calcularTotal()
}

function calcularTotal() {
  if (productoSeleccionado.value && cantidad.value > 0) {
    total.value = productoSeleccionado.value.precio * cantidad.value
  } else {
    total.value = 0
  }
}

function registrarVenta() {
  if (!clienteSeleccionado.value || !productoSeleccionado.value || cantidad.value <= 0) {
    alert('Complete todos los campos antes de registrar la venta.')
    return
  }
  if (cantidad.value > productoSeleccionado.value.stock) {
    alert('No hay suficiente stock.')
    return
  }

  // Registrar venta
  ventas.value.push({
    cliente: clienteSeleccionado.value.nombre,
    producto: productoSeleccionado.value.nombre,
    cantidad: cantidad.value,
    total: total.value,
    fecha: fecha.value,
  })

  // Actualizar stock
  productoSeleccionado.value.stock -= cantidad.value

  // Reset campos
  selectedClienteId.value = ''
  selectedProductoId.value = ''
  clienteSeleccionado.value = null
  productoSeleccionado.value = null
  cantidad.value = 1
  total.value = 0
  fecha.value = new Date().toISOString().split('T')[0]

  alert('Venta registrada con éxito!')
}
</script>

<style>
/* Contenedor principal */
.venta-card {
  max-width: 650px;
  margin: 40px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', sans-serif;
  border-left: 6px solid #1a73e8;
}

/* Título principal */
.venta-card .title {
  text-align: center;
  font-size: 26px;
  margin-bottom: 25px;
  color: #1a73e8;
  font-weight: 600;
}

/* Secciones */
.card-section {
  margin-bottom: 25px;
  background: #f7f9fc;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid #e3e7ed;
}

.card-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #1a73e8;
  font-weight: 600;
}

/* Campos */
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.field label {
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
}

.field input,
.field select {
  padding: 10px 12px;
  border: 1px solid #d0d7e0;
  border-radius: 10px;
  background: #fff;
  transition: all 0.2s ease;
}

/* Hover focus */
.field input:focus,
.field select:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 4px rgba(26, 115, 232, 0.4);
  outline: none;
}

.btn-registrar {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #1a73e8, #4aa3ff);
  color: white;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
  transition: 0.3s ease;
}

.btn-registrar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 80%;
  height: 100%;
  background: rgba(255, 255, 255, 0.25);
  transform: skewX(-25deg);
  transition: 0.4s ease;
}

.btn-registrar:hover::before {
  left: 130%;
}

.btn-registrar:hover {
  transform: translateY(-3px);
}
</style>
