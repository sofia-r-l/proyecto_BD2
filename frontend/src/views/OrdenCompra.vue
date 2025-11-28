<template>
  <div class="ordenes-compra">
    <div class="ordenes-header">
      <h1>📋 Gestión de Órdenes de Compra</h1>
      <p>Administra y revisa todas las órdenes de compra del sistema</p>
    </div>

    <!-- Filtros y controles -->
    <div class="controles-ordenes">
      <div class="filtros-row">
        <div class="filtro-group">
          <label>Estado:</label>
          <select v-model="filtroEstado" @change="aplicarFiltros">
            <option value="todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
            <option value="Completada">Completada</option>
          </select>
        </div>

        <div class="filtro-group">
          <label>Sucursal:</label>
          <select v-model="filtroSucursal" @change="aplicarFiltros">
            <option value="todas">Todas las sucursales</option>
            <option v-for="sucursal in sucursales" :key="sucursal" :value="sucursal">
              {{ sucursal }}
            </option>
          </select>
        </div>

        <div class="filtro-group">
          <label>Buscar:</label>
          <input 
            type="text" 
            v-model="terminoBusqueda" 
            placeholder="Buscar por producto o proveedor..."
            @input="aplicarFiltros"
          >
        </div>

        <button @click="refrescarOrdenes" class="btn-refrescar" :disabled="cargando">
          🔄 {{ cargando ? 'Cargando...' : 'Refrescar' }}
        </button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats-ordenes">
      <div class="stat-card total">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-number">{{ ordenesFiltradas.length }}</div>
          <div class="stat-label">Total Órdenes</div>
        </div>
      </div>
      
      <div class="stat-card pendiente">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-number">{{ estadisticas.pendientes }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
      </div>
      
      <div class="stat-card aprobada">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-number">{{ estadisticas.aprobadas }}</div>
          <div class="stat-label">Aprobadas</div>
        </div>
      </div>
      
      <div class="stat-card completada">
        <div class="stat-icon">🏁</div>
        <div class="stat-info">
          <div class="stat-number">{{ estadisticas.completadas }}</div>
          <div class="stat-label">Completadas</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="cargando && ordenes.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando órdenes de compra...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>Error al cargar las órdenes</h3>
      <p>{{ error }}</p>
      <button @click="cargarOrdenes" class="btn-primary">Reintentar</button>
    </div>

    <!-- Lista de Órdenes -->
    <div v-else class="ordenes-content">
      <!-- Sin resultados -->
      <div v-if="ordenesFiltradas.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No se encontraron órdenes</h3>
        <p>No hay órdenes que coincidan con los filtros aplicados.</p>
        <button @click="limpiarFiltros" class="btn-primary">Limpiar filtros</button>
      </div>

      <!-- Tabla de órdenes -->
      <div v-else class="tabla-ordenes-container">
        <table class="tabla-ordenes">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Proveedor</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Total</th>
              <th>Sucursal</th>
              <th>Fecha Entrega</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="orden in ordenesFiltradas" :key="orden.OrdenID" class="orden-row">
              <td class="orden-id">#{{ orden.OrdenID }}</td>
              <td class="producto-info">
                <div class="producto-nombre">{{ orden.ProductoNombre }}</div>
              </td>
              <td class="proveedor-info">
                <div class="proveedor-nombre">{{ orden.ProveedorNombre }}</div>
              </td>
              <td class="cantidad">{{ orden.Cantidad }}</td>
              <td class="precio-unitario">L. {{ orden.PrecioUnitario?.toLocaleString() }}</td>
              <td class="total">L. {{ orden.Total?.toLocaleString() }}</td>
              <td class="sucursal">{{ orden.SucursalNombre }}</td>
              <td class="fecha-entrega">
                <div class="fecha">{{ formatFecha(orden.FechaEntrega) }}</div>
                <div class="dias-restantes" :class="getDiasRestantesClass(orden.FechaEntrega)">
                  {{ getDiasRestantes(orden.FechaEntrega) }}
                </div>
              </td>
              <td class="estado">
                <span class="estado-badge" :class="orden.Estado.toLowerCase()">
                  {{ orden.Estado }}
                </span>
              </td>
              <td class="acciones">
                <div class="acciones-buttons">
                  <button 
                    v-if="orden.Estado === 'Pendiente'"
                    @click="aprobarOrden(orden.OrdenID)"
                    class="btn-action btn-success"
                    title="Aprobar orden"
                  >
                    ✅
                  </button>
                  <button 
                    v-if="orden.Estado === 'Pendiente'"
                    @click="rechazarOrden(orden.OrdenID)"
                    class="btn-action btn-danger"
                    title="Rechazar orden"
                  >
                    ❌
                  </button>
                  <button 
                    v-if="orden.Estado === 'Aprobada'"
                    @click="completarOrden(orden.OrdenID)"
                    class="btn-action btn-complete"
                    title="Marcar como completada"
                  >
                    🏁
                  </button>
                  <button 
                    @click="verDetalles(orden)"
                    class="btn-action btn-info"
                    title="Ver detalles"
                  >
                    👁️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="ordenesFiltradas.length > 0" class="pagination">
        <div class="pagination-info">
          Mostrando {{ ordenesFiltradas.length }} de {{ ordenes.length }} órdenes
        </div>
      </div>
    </div>

    <!-- Modal de Detalles -->
    <div v-if="ordenSeleccionada" class="modal-overlay" @click="ordenSeleccionada = null">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h2>Detalles de Orden #{{ ordenSeleccionada.OrdenID }}</h2>
          <button class="btn-cerrar" @click="ordenSeleccionada = null">×</button>
        </div>
        
        <div class="detalles-content">
          <!-- Información básica -->
          <div class="info-grid">
            <div class="info-item">
              <label>Producto:</label>
              <span>{{ ordenSeleccionada.ProductoNombre }}</span>
            </div>
            <div class="info-item">
              <label>Proveedor:</label>
              <span>{{ ordenSeleccionada.ProveedorNombre }}</span>
            </div>
            <div class="info-item">
              <label>Cantidad:</label>
              <span>{{ ordenSeleccionada.Cantidad }}</span>
            </div>
            <div class="info-item">
              <label>Precio Unitario:</label>
              <span>L. {{ ordenSeleccionada.PrecioUnitario?.toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <label>Total:</label>
              <span class="total">L. {{ ordenSeleccionada.Total?.toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <label>Sucursal:</label>
              <span>{{ ordenSeleccionada.SucursalNombre }}</span>
            </div>
            <div class="info-item">
              <label>Fecha de Entrega:</label>
              <span>{{ formatFecha(ordenSeleccionada.FechaEntrega) }}</span>
            </div>
            <div class="info-item">
              <label>Estado:</label>
              <span class="estado-badge" :class="ordenSeleccionada.Estado.toLowerCase()">
                {{ ordenSeleccionada.Estado }}
              </span>
            </div>
            <div class="info-item">
              <label>Fecha de Creación:</label>
              <span>{{ formatFechaCompleta(ordenSeleccionada.FechaCreacion) }}</span>
            </div>
          </div>
          
          <!-- Acciones según estado -->
          <div v-if="ordenSeleccionada.Estado === 'Pendiente'" class="acciones-section">
            <h3>Acciones</h3>
            <div class="acciones-buttons">
              <button @click="aprobarOrden(ordenSeleccionada.OrdenID)" class="btn btn-success">
                ✅ Aprobar Orden
              </button>
              <button @click="rechazarOrden(ordenSeleccionada.OrdenID)" class="btn btn-danger">
                ❌ Rechazar Orden
              </button>
            </div>
          </div>
          
          <div v-if="ordenSeleccionada.Estado === 'Aprobada'" class="acciones-section">
            <h3>Acciones</h3>
            <button @click="completarOrden(ordenSeleccionada.OrdenID)" class="btn btn-complete">
              🏁 Marcar como Completada
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ordenCompraService, type OrdenCompraCompleta } from '@/services/ordenCompra.service'

// Estado
const ordenes = ref<OrdenCompraCompleta[]>([])
const cargando = ref(false)
const error = ref<string | null>(null)
const ordenSeleccionada = ref<OrdenCompraCompleta | null>(null)

// Filtros
const filtroEstado = ref('todos')
const filtroSucursal = ref('todas')
const terminoBusqueda = ref('')

// Datos de soporte
const sucursales = ref([
  'Sucursal Centro',
  'Sucursal Norte', 
  'Sucursal Sur',
  'Sucursal Central',
  'Sucursal Este',
  'Sucursal Oeste'
])

// Computed
const ordenesFiltradas = computed(() => {
  let filtered = ordenes.value

  // Filtrar por estado
  if (filtroEstado.value !== 'todos') {
    filtered = filtered.filter(orden => orden.Estado === filtroEstado.value)
  }

  // Filtrar por sucursal
  if (filtroSucursal.value !== 'todas') {
    filtered = filtered.filter(orden => orden.SucursalNombre === filtroSucursal.value)
  }

  // Filtrar por búsqueda
  if (terminoBusqueda.value) {
    const searchTerm = terminoBusqueda.value.toLowerCase()
    filtered = filtered.filter(orden => 
      orden.ProductoNombre?.toLowerCase().includes(searchTerm) ||
      orden.ProveedorNombre?.toLowerCase().includes(searchTerm)
    )
  }

  return filtered
})

const estadisticas = computed(() => {
  return {
    pendientes: ordenes.value.filter(o => o.Estado === 'Pendiente').length,
    aprobadas: ordenes.value.filter(o => o.Estado === 'Aprobada').length,
    rechazadas: ordenes.value.filter(o => o.Estado === 'Rechazada').length,
    completadas: ordenes.value.filter(o => o.Estado === 'Completada').length
  }
})

// Métodos
const cargarOrdenes = async () => {
  try {
    cargando.value = true
    error.value = null
    ordenes.value = await ordenCompraService.obtenerOrdenesCompra()
    console.log('✅ Órdenes cargadas desde BD:', ordenes.value.length)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('❌ Error cargando órdenes:', err)
  } finally {
    cargando.value = false
  }
}

const refrescarOrdenes = () => {
  cargarOrdenes()
}

const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente mediante la computed property
}

const limpiarFiltros = () => {
  filtroEstado.value = 'todos'
  filtroSucursal.value = 'todas'
  terminoBusqueda.value = ''
}

const verDetalles = (orden: OrdenCompraCompleta) => {
  ordenSeleccionada.value = orden
}

const aprobarOrden = async (id: number) => {
  try {
    await ordenCompraService.actualizarEstadoOrden(id, 'Aprobada')
    await cargarOrdenes()
    ordenSeleccionada.value = null
    alert('✅ Orden aprobada exitosamente')
  } catch (error) {
    console.error('Error aprobando orden:', error)
    alert('Error al aprobar la orden: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  }
}

const rechazarOrden = async (id: number) => {
  try {
    await ordenCompraService.actualizarEstadoOrden(id, 'Rechazada')
    await cargarOrdenes()
    ordenSeleccionada.value = null
    alert('✅ Orden rechazada exitosamente')
  } catch (error) {
    console.error('Error rechazando orden:', error)
    alert('Error al rechazar la orden: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  }
}

const completarOrden = async (id: number) => {
  try {
    await ordenCompraService.actualizarEstadoOrden(id, 'Completada')
    await cargarOrdenes()
    ordenSeleccionada.value = null
    alert('✅ Orden marcada como completada')
  } catch (error) {
    console.error('Error completando orden:', error)
    alert('Error al completar la orden: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  }
}

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES')
}

const formatFechaCompleta = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDiasRestantes = (fechaEntrega: string) => {
  const hoy = new Date()
  const entrega = new Date(fechaEntrega)
  const diffTime = entrega.getTime() - hoy.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays > 1) return `En ${diffDays} días`
  if (diffDays === -1) return 'Ayer'
  return `Hace ${Math.abs(diffDays)} días`
}

const getDiasRestantesClass = (fechaEntrega: string) => {
  const hoy = new Date()
  const entrega = new Date(fechaEntrega)
  const diffTime = entrega.getTime() - hoy.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'vencido'
  if (diffDays <= 2) return 'urgente'
  if (diffDays <= 7) return 'proximo'
  return 'normal'
}

// Lifecycle
onMounted(() => {
  cargarOrdenes()
})
</script>

<style scoped>
/* Estilos idénticos a los que te proporcioné anteriormente para OrdenesCompraView.vue */
.ordenes-compra {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.ordenes-header {
  margin-bottom: 2rem;
  text-align: center;
}

.ordenes-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.ordenes-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.controles-ordenes {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filtros-row {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.filtro-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filtro-group label {
  font-weight: 500;
  color: #2c3e50;
}

.filtro-group select,
.filtro-group input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  min-width: 150px;
}

.btn-refrescar {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.btn-refrescar:hover {
  background: #2980b9;
}

.btn-refrescar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Stats Cards */
.stats-ordenes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #3498db;
}

.stat-card.pendiente { border-left-color: #f39c12; }
.stat-card.aprobada { border-left-color: #27ae60; }
.stat-card.completada { border-left-color: #9b59b6; }

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
}

/* Table */
.tabla-ordenes-container {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tabla-ordenes {
  width: 100%;
  border-collapse: collapse;
}

.tabla-ordenes th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
}

.tabla-ordenes td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.orden-row:hover {
  background: #f8f9fa;
}

.orden-id {
  font-weight: 600;
  color: #2c3e50;
}

.producto-info,
.proveedor-info {
  max-width: 200px;
}

.producto-nombre,
.proveedor-nombre {
  font-weight: 500;
}

.cantidad,
.precio-unitario,
.total {
  text-align: right;
  font-family: 'Courier New', monospace;
}

.total {
  font-weight: 600;
  color: #27ae60;
}

.fecha-entrega {
  min-width: 120px;
}

.dias-restantes {
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.dias-restantes.urgente { color: #e74c3c; font-weight: 600; }
.dias-restantes.proximo { color: #f39c12; }
.dias-restantes.normal { color: #27ae60; }
.dias-restantes.vencido { color: #7f8c8d; }

/* Estado Badges */
.estado-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-badge.pendiente {
  background: #fff3cd;
  color: #856404;
}

.estado-badge.aprobada {
  background: #d1edff;
  color: #004085;
}

.estado-badge.rechazada {
  background: #f8d7da;
  color: #721c24;
}

.estado-badge.completada {
  background: #d4edda;
  color: #155724;
}

/* Acciones */
.acciones-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-action:hover {
  transform: scale(1.1);
}

.btn-success { background: #d4edda; }
.btn-danger { background: #f8d7da; }
.btn-complete { background: #e2e3e5; }
.btn-info { background: #cce7ff; }

/* Estados de UI */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3,
.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.error-state p,
.empty-state p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background: #2980b9;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content.large {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 20px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 10px 10px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cerrar:hover {
  color: #e74c3c;
}

.detalles-content {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.info-item span {
  font-size: 1rem;
  color: #2c3e50;
}

.info-item .total {
  font-size: 1.1rem;
  font-weight: 700;
  color: #27ae60;
}

.acciones-section {
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
}

.acciones-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.acciones-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-complete {
  background: #9b59b6;
  color: white;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 10px 10px;
}

.pagination-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .ordenes-compra {
    padding: 1rem;
  }
  
  .filtros-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filtro-group select,
  .filtro-group input {
    min-width: auto;
  }
  
  .stats-ordenes {
    grid-template-columns: 1fr 1fr;
  }
  
  .tabla-ordenes-container {
    overflow-x: auto;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content.large {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}
</style>