<template>
  <div class="proveedores">
    <div class="proveedores-header">
      <h1>🏢 Gestión de Proveedores</h1>
      <p>Administración de proveedores y líneas de crédito</p>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-proveedores">
      <div class="stat-card">
        <div class="stat-icon">🏢</div>
        <div class="stat-info">
          <h3>{{ proveedores.length }}</h3>
          <p>Proveedores Activos</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">💳</div>
        <div class="stat-info">
          <h3>L. {{ totalLimiteCredito.toLocaleString() }}</h3>
          <p>Límite de Crédito Total</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <h3>L. {{ totalSaldoActual.toLocaleString() }}</h3>
          <p>Saldo Actual Total</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🔄</div>
        <div class="stat-info">
          <h3>L. {{ totalCreditoDisponible.toLocaleString() }}</h3>
          <p>Crédito Disponible</p>
        </div>
      </div>
    </div>

    <!-- Barra de acciones -->
    <div class="acciones-bar">
      <div class="busqueda">
        <input 
          v-model="filtroBusqueda"
          type="text" 
          placeholder="🔍 Buscar proveedor..." 
          class="busqueda-input"
        >
      </div>
      <div class="acciones-derecha">
        <button class="btn btn-primary" @click="mostrarFormularioNuevo">
          ➕ Nuevo Proveedor
        </button>
      </div>
    </div>

    <!-- Tabla de proveedores -->
    <div class="tabla-container">
      <table class="tabla-proveedores">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Contacto</th>
            <th>Límite Crédito</th>
            <th>Saldo Actual</th>
            <th>Crédito Disponible</th>
            <th>Utilización</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="proveedor in proveedoresFiltrados" 
            :key="proveedor.ProveedorID"
          >
            <td class="proveedor-info">
              <div class="proveedor-nombre">
                <strong>{{ proveedor.Nombre }}</strong>
              </div>
              <div class="proveedor-documento">
                <small>RTN: {{ proveedor.IdentidadFiscal }}</small>
              </div>
              <div class="proveedor-direccion">
                <small>📍 {{ proveedor.Direccion }}</small>
              </div>
            </td>
            <td class="contacto-info">
              <div>📞 {{ proveedor.Telefono }}</div>
              <div>📧 {{ proveedor.Email }}</div>
            </td>
            <td class="monto">
              L. {{ Number(proveedor.LimiteCredito).toLocaleString() }}
            </td>
            <td class="monto">
              L. {{ Number(proveedor.SaldoActual).toLocaleString() }}
            </td>
            <td class="monto credito-disponible">
              L. {{ Number(proveedor.CreditoDisponible).toLocaleString() }}
            </td>
            <td>
              <div class="barra-utilizacion">
                <div 
                  class="barra-progreso"
                  :style="{ width: calcularPorcentajeUtilizacion(proveedor) + '%' }"
                  :class="getClaseUtilizacion(proveedor)"
                ></div>
                <span class="porcentaje-texto">
                  {{ calcularPorcentajeUtilizacion(proveedor) }}%
                </span>
              </div>
            </td>
            <td>
              <span class="estado-badge" :class="proveedor.Estado">
                {{ proveedor.Estado === 'activo' ? '✅ Activo' : '❌ Inactivo' }}
              </span>
            </td>
            <td class="acciones">
              <button class="btn btn-sm btn-info" @click="verDetalle(proveedor)">
                👁️ Ver
              </button>
              <button class="btn btn-sm btn-warning" @click="editarProveedor(proveedor)">
                ✏️ Editar
              </button>
              <button class="btn btn-sm btn-danger" @click="eliminarProveedor(proveedor)">
                🗑️ Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="proveedoresFiltrados.length === 0" class="sin-datos">
        <p>No se encontraron proveedores</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <p>🔄 Cargando proveedores...</p>
    </div>

    <!-- Modal de detalle -->
    <div v-if="proveedorSeleccionado && !mostrarFormulario" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>Detalle del Proveedor</h3>
          <button @click="proveedorSeleccionado = null" class="btn-cerrar">×</button>
        </div>
        <div class="modal-body">
          <div class="detalle-grid">
            <div class="detalle-item">
              <label>Nombre:</label>
              <span>{{ proveedorSeleccionado.Nombre }}</span>
            </div>
            <div class="detalle-item">
              <label>RTN:</label>
              <span>{{ proveedorSeleccionado.IdentidadFiscal }}</span>
            </div>
            <div class="detalle-item">
              <label>Teléfono:</label>
              <span>{{ proveedorSeleccionado.Telefono }}</span>
            </div>
            <div class="detalle-item">
              <label>Email:</label>
              <span>{{ proveedorSeleccionado.Email }}</span>
            </div>
            <div class="detalle-item">
              <label>Dirección:</label>
              <span>{{ proveedorSeleccionado.Direccion }}</span>
            </div>
            <div class="detalle-item">
              <label>Límite de Crédito:</label>
              <span>L. {{ Number(proveedorSeleccionado.LimiteCredito).toLocaleString() }}</span>
            </div>
            <div class="detalle-item">
              <label>Saldo Actual:</label>
              <span>L. {{ Number(proveedorSeleccionado.SaldoActual).toLocaleString() }}</span>
            </div>
            <div class="detalle-item">
              <label>Crédito Disponible:</label>
              <span>L. {{ Number(proveedorSeleccionado.CreditoDisponible).toLocaleString() }}</span>
            </div>
            <div class="detalle-item">
              <label>Estado:</label>
              <span :class="proveedorSeleccionado.Estado === 'activo' ? 'estado-activo' : 'estado-inactivo'">
                {{ proveedorSeleccionado.Estado === 'activo' ? '✅ Activo' : '❌ Inactivo' }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="proveedorSeleccionado = null">
            Cerrar
          </button>
          <button class="btn btn-warning" @click="editarProveedor(proveedorSeleccionado)">
            ✏️ Editar Proveedor
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de formulario -->
    <div v-if="mostrarFormulario" class="modal-backdrop">
      <div class="modal modal-large">
        <div class="modal-header">
          <h3>{{ proveedorEditando ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor' }}</h3>
          <button @click="cerrarFormulario" class="btn-cerrar">×</button>
        </div>
        <div class="modal-body">
          <ProveedorForm
            :proveedor="proveedorEditando"
            :edit-mode="!!proveedorEditando"
            @success="onProveedorGuardado"
            @cancel="cerrarFormulario"
          />
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="proveedorAEliminar" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>🗑️ Eliminar Proveedor</h3>
          <button @click="proveedorAEliminar = null" class="btn-cerrar">×</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar al proveedor <strong>{{ proveedorAEliminar.Nombre }}</strong>?</p>
          <p class="advertencia">⚠️ Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="proveedorAEliminar = null">
            Cancelar
          </button>
          <button class="btn btn-danger" @click="confirmarEliminacion" :disabled="eliminando">
            {{ eliminando ? 'Eliminando...' : 'Sí, Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { proveedoresService, type Proveedor } from '@/services/proveedores.service';
import ProveedorForm from '@/components/proveedores/ProveedorForm.vue';

const proveedores = ref<Proveedor[]>([]);
const loading = ref(true);
const filtroBusqueda = ref('');
const proveedorSeleccionado = ref<Proveedor | null>(null);
const proveedorEditando = ref<Proveedor | null>(null);
const proveedorAEliminar = ref<Proveedor | null>(null);
const mostrarFormulario = ref(false);
const eliminando = ref(false);

// Computed properties
const proveedoresFiltrados = computed(() => {
  if (!filtroBusqueda.value) return proveedores.value;
  
  const searchLower = filtroBusqueda.value.toLowerCase();
  return proveedores.value.filter(proveedor =>
    proveedor.Nombre.toLowerCase().includes(searchLower) ||
    proveedor.Email.toLowerCase().includes(searchLower) ||
    proveedor.IdentidadFiscal.includes(filtroBusqueda.value)
  );
});

const totalLimiteCredito = computed(() => {
  return proveedores.value.reduce((total, p) => {
    const limite = Number(p.LimiteCredito) || 0;
    return total + limite;
  }, 0);
});

const totalSaldoActual = computed(() => {
  return proveedores.value.reduce((total, p) => {
    const saldo = Number(p.SaldoActual) || 0;
    return total + saldo;
  }, 0);
});

const totalCreditoDisponible = computed(() => {
  return proveedores.value.reduce((total, p) => {
    const disponible = Number(p.CreditoDisponible) || 0;
    return total + disponible;
  }, 0);
});

// Methods
const calcularPorcentajeUtilizacion = (proveedor: Proveedor): number => {
  const limite = Number(proveedor.LimiteCredito) || 0;
  const saldo = Number(proveedor.SaldoActual) || 0;
  
  if (limite === 0) return 0;
  return Math.round((saldo / limite) * 100);
};

const getClaseUtilizacion = (proveedor: Proveedor): string => {
  const porcentaje = calcularPorcentajeUtilizacion(proveedor);
  if (porcentaje >= 80) return 'critico';
  if (porcentaje >= 60) return 'alerta';
  return 'normal';
};

const verDetalle = (proveedor: Proveedor) => {
  proveedorSeleccionado.value = proveedor;
  mostrarFormulario.value = false;
};

const mostrarFormularioNuevo = () => {
  proveedorEditando.value = null;
  mostrarFormulario.value = true;
  proveedorSeleccionado.value = null;
};

const editarProveedor = (proveedor: Proveedor) => {
  proveedorEditando.value = proveedor;
  mostrarFormulario.value = true;
  proveedorSeleccionado.value = null;
};

const eliminarProveedor = (proveedor: Proveedor) => {
  proveedorAEliminar.value = proveedor;
};

const confirmarEliminacion = async () => {
  if (!proveedorAEliminar.value) return;

  eliminando.value = true;
  try {
    await proveedoresService.deleteProveedor(proveedorAEliminar.value.ProveedorID);
    
    // Recargar la lista de proveedores
    await cargarProveedores();
    
    proveedorAEliminar.value = null;
  } catch (error: any) {
    console.error('Error eliminando proveedor:', error);
    alert('Error al eliminar proveedor: ' + error.message);
  } finally {
    eliminando.value = false;
  }
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  proveedorEditando.value = null;
};

const onProveedorGuardado = async () => {
  // Recargar la lista de proveedores
  await cargarProveedores();
  cerrarFormulario();
};

const cargarProveedores = async () => {
  loading.value = true;
  try {
    const data = await proveedoresService.getProveedores();
    proveedores.value = data;
  } catch (error) {
    console.error('Error cargando proveedores:', error);
    alert('Error al cargar proveedores: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  cargarProveedores();
});
</script>

<style scoped>
.proveedores {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.proveedores-header {
  margin-bottom: 2rem;
  text-align: center;
}

.proveedores-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.proveedores-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.stats-proveedores {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #3498db;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info h3 {
  font-size: 1.8rem;
  margin: 0;
  color: #2c3e50;
}

.stat-info p {
  margin: 0;
  color: #7f8c8d;
}

.acciones-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.busqueda {
  flex: 1;
  min-width: 300px;
}

.busqueda-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
}

.busqueda-input:focus {
  border-color: #3498db;
  outline: none;
}

.acciones-derecha {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.tabla-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tabla-proveedores {
  width: 100%;
  border-collapse: collapse;
}

.tabla-proveedores th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
}

.tabla-proveedores td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.tabla-proveedores tr:last-child td {
  border-bottom: none;
}

.tabla-proveedores tr:hover {
  background: #f8f9fa;
}

.proveedor-info {
  min-width: 200px;
}

.proveedor-nombre {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.proveedor-documento,
.proveedor-direccion {
  color: #6c757d;
  font-size: 0.9rem;
}

.contacto-info {
  min-width: 150px;
}

.monto {
  font-family: 'Courier New', monospace;
  font-weight: 500;
  text-align: right;
}

.credito-disponible {
  color: #27ae60;
  font-weight: 600;
}

.barra-utilizacion {
  position: relative;
  background: #e9ecef;
  border-radius: 10px;
  height: 24px;
  min-width: 100px;
}

.barra-progreso {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.barra-progreso.normal {
  background: #27ae60;
}

.barra-progreso.alerta {
  background: #f39c12;
}

.barra-progreso.critico {
  background: #e74c3c;
}

.porcentaje-texto {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: #2c3e50;
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.estado-badge.activo {
  background: #d4edda;
  color: #155724;
}

.estado-badge.inactivo {
  background: #f8d7da;
  color: #721c24;
}

.estado-activo {
  color: #155724;
  font-weight: 500;
}

.estado-inactivo {
  color: #721c24;
  font-weight: 500;
}

.acciones {
  display: flex;
  gap: 0.5rem;
}

.sin-datos {
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
}

.loading {
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
}

.detalle-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}

.detalle-item {
  display: contents;
}

.detalle-item label {
  font-weight: 600;
  color: #495057;
  padding: 0.5rem 0;
}

.detalle-item span {
  padding: 0.5rem 0;
  color: #2c3e50;
}

.advertencia {
  color: #e74c3c;
  font-weight: 500;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .proveedores {
    padding: 1rem;
  }
  
  .acciones-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .busqueda {
    min-width: auto;
  }
  
  .tabla-container {
    overflow-x: auto;
  }
  
  .detalle-grid {
    grid-template-columns: 1fr;
  }
  
  .acciones {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>