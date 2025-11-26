<template>
  <div class="inventario">
    <div class="inventario-header">
      <h1>📦 Gestión de Inventario</h1>
      <p>Control de stock y existencias</p>
    </div>

    <!-- Filtros -->
    <div class="filtros">
      <div class="filtro-group">
        <label>Sucursal:</label>
        <select v-model="filtroSucursal" @change="filtrarInventario">
          <option value="">Todas las sucursales</option>
          <option v-for="sucursal in sucursales" :key="sucursal" :value="sucursal">
            {{ sucursal }}
          </option>
        </select>
      </div>
      
      <div class="filtro-group">
        <label>Categoría:</label>
        <select v-model="filtroCategoria" @change="filtrarInventario">
          <option value="">Todas las categorías</option>
          <option v-for="categoria in categorias" :key="categoria" :value="categoria">
            {{ categoria }}
          </option>
        </select>
      </div>

      <button @click="mostrarSoloBajo" class="btn-alerta" :class="{ active: mostrarBajoStock }">
        ⚠️ Stock Bajo ({{ inventarioBajoCount }})
      </button>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-inventario">
      <div class="stat-item">
        <span class="stat-number">{{ inventarioFiltrado.length }}</span>
        <span class="stat-label">Productos totales</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ totalValorInventario.toLocaleString() }}</span>
        <span class="stat-label">Valor total inventario</span>
      </div>
      <div class="stat-item alerta">
        <span class="stat-number">{{ inventarioBajoCount }}</span>
        <span class="stat-label">Productos con stock bajo</span>
      </div>
    </div>

    <!-- Tabla de inventario -->
    <div class="tabla-container">
      <table class="tabla-inventario">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Sucursal</th>
            <th>Stock</th>
            <th>Precio Unitario</th>
            <th>Valor Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in inventarioFiltrado" 
            :key="`${item.ProductoID}-${item.SucursalID}`"
            :class="{ 'stock-bajo': item.Cantidad < 50 }"
          >
            <td class="producto-info">
              <strong>{{ item.Producto }}</strong>
            </td>
            <td>{{ item.Categoria }}</td>
            <td>{{ item.Sucursal }}</td>
            <td class="stock-cell">
              <span class="cantidad" :class="{ bajo: item.Cantidad < 50, critico: item.Cantidad < 20 }">
                {{ item.Cantidad }}
              </span>
            </td>
            <td class="precio">L. {{ parseFloat(item.PrecioBase).toLocaleString() }}</td>
            <td class="precio">L. {{ parseFloat(item.ValorTotalInventario).toLocaleString() }}</td>
            <td>
              <span 
                class="estado-badge"
                :class="{
                  'estado-normal': item.Cantidad >= 50,
                  'estado-alerta': item.Cantidad < 50 && item.Cantidad > 0,
                  'estado-critico': item.Cantidad === 0
                }"
              >
                {{ getEstadoStock(item.Cantidad) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="inventarioFiltrado.length === 0" class="sin-datos">
        <p>No se encontraron productos con los filtros aplicados</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <p>🔄 Cargando inventario...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { inventarioService, type ProductoInventario } from '@/services/inventario.service';

const inventario = ref<ProductoInventario[]>([]);
const loading = ref(true);
const filtroSucursal = ref('');
const filtroCategoria = ref('');
const mostrarBajoStock = ref(false);

// Computed properties
const sucursales = computed(() => {
  return [...new Set(inventario.value.map(item => item.Sucursal))].sort();
});

const categorias = computed(() => {
  return [...new Set(inventario.value.map(item => item.Categoria))].sort();
});

const inventarioBajoCount = computed(() => {
  return inventario.value.filter(item => item.Cantidad < 50).length;
});

const inventarioFiltrado = computed(() => {
  let filtered = inventario.value;

  if (filtroSucursal.value) {
    filtered = filtered.filter(item => item.Sucursal === filtroSucursal.value);
  }

  if (filtroCategoria.value) {
    filtered = filtered.filter(item => item.Categoria === filtroCategoria.value);
  }

  if (mostrarBajoStock.value) {
    filtered = filtered.filter(item => item.Cantidad < 50);
  }

  return filtered;
});

const totalValorInventario = computed(() => {
  return inventarioFiltrado.value.reduce((total, item) => {
    return total + parseFloat(item.ValorTotalInventario);
  }, 0);
});

// Methods
const getEstadoStock = (cantidad: number): string => {
  if (cantidad >= 50) return 'Normal';
  if (cantidad > 0) return 'Alerta';
  return 'Crítico';
};

const filtrarInventario = () => {
  // La computed property se actualiza automáticamente
};

const mostrarSoloBajo = () => {
  mostrarBajoStock.value = !mostrarBajoStock.value;
};

// Lifecycle
onMounted(async () => {
  try {
    const data = await inventarioService.getInventario();
    inventario.value = data;
  } catch (error) {
    console.error('Error cargando inventario:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.inventario {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.inventario-header {
  margin-bottom: 2rem;
  text-align: center;
}

.inventario-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.inventario-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.filtros {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: end;
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

.filtro-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  min-width: 150px;
}

.btn-alerta {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 2px solid #e74c3c;
  border-radius: 5px;
  color: #e74c3c;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-alerta.active {
  background: #e74c3c;
  color: white;
}

.btn-alerta:hover {
  background: #e74c3c;
  color: white;
}

.stats-inventario {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  border-left: 4px solid #3498db;
}

.stat-item.alerta {
  border-left-color: #e74c3c;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.tabla-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tabla-inventario {
  width: 100%;
  border-collapse: collapse;
}

.tabla-inventario th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
}

.tabla-inventario td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.tabla-inventario tr:last-child td {
  border-bottom: none;
}

.tabla-inventario tr:hover {
  background: #f8f9fa;
}

.tabla-inventario tr.stock-bajo {
  background: #fff5f5;
}

.producto-info {
  font-weight: 500;
}

.stock-cell .cantidad {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

.stock-cell .cantidad.bajo {
  background: #fff3cd;
  color: #856404;
}

.stock-cell .cantidad.critico {
  background: #f8d7da;
  color: #721c24;
}

.precio {
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.estado-normal {
  background: #d4edda;
  color: #155724;
}

.estado-alerta {
  background: #fff3cd;
  color: #856404;
}

.estado-critico {
  background: #f8d7da;
  color: #721c24;
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

@media (max-width: 768px) {
  .inventario {
    padding: 1rem;
  }
  
  .filtros {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tabla-container {
    overflow-x: auto;
  }
}
</style>