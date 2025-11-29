<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>📊 Dashboard</h1>
      <p>Resumen general del sistema</p>
    </div>

    <!-- Estadísticas principales -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <h3>{{ stats.totalProductos }}</h3>
          <p>Total Productos</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <h3>L. {{ stats.totalVentasHoy.toLocaleString() }}</h3>
          <p>Ventas Hoy</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>{{ stats.totalClientes }}</h3>
          <p>Total Clientes</p>
        </div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-icon">⚠️</div>
        <div class="stat-info">
          <h3>{{ stats.inventarioBajo }}</h3>
          <p>Inventario Bajo</p>
        </div>
      </div>
    </div>

    <!-- Gráficos y tablas -->
    <div class="charts-grid">
      <!-- Ventas última semana -->
      <div class="chart-card">
        <h3>📈 Ventas Última Semana</h3>
        <div class="sales-chart">
          <div 
            v-for="day in stats.ventasUltimaSemana" 
            :key="day.fecha"
            class="bar-container"
          >
            <div 
              class="bar" 
              :style="{ height: (day.total / 15000) * 100 + '%' }"
              :title="`L. ${day.total.toLocaleString()}`"
            ></div>
            <span class="bar-label">{{ new Date(day.fecha).getDate() }}/{{ new Date(day.fecha).getMonth() + 1 }}</span>
          </div>
        </div>
      </div>

      <!-- Productos populares -->
      <div class="chart-card">
        <h3>🔥 Productos Más Vendidos</h3>
        <div class="popular-products">
          <div 
            v-for="(producto, index) in stats.productosPopulares" 
            :key="producto.producto"
            class="product-item"
          >
            <span class="rank">#{{ index + 1 }}</span>
            <span class="product-name">{{ producto.producto }}</span>
            <span class="product-sales">{{ producto.cantidad }} vendidos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones rápidas -->
    <div class="quick-actions">
      <h3>🚀 Acciones Rápidas</h3>
      <div class="actions-grid">
        <button @click="$router.push('/inventario')" class="action-btn">
          <span class="action-icon">📦</span>
          <span>Gestionar Inventario</span>
        </button>
        
        <button @click="$router.push('/productos')" class="action-btn">
          <span class="action-icon">💊</span>
          <span>Ver Productos</span>
        </button>
        
        <button @click="$router.push('/proveedores')" class="action-btn">
          <span class="action-icon">🏢</span>
          <span>Proveedores</span>
        </button>
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dashboardService, type DashboardStats } from '@/services/dashboard.service';

const stats = ref<DashboardStats>({
  totalProductos: 0,
  totalVentasHoy: 0,
  totalClientes: 0,
  inventarioBajo: 0,
  ventasUltimaSemana: [],
  productosPopulares: []
});

const loading = ref(true);

onMounted(async () => {
  try {
    const data = await dashboardService.getStats();
    stats.value = data;
  } catch (error) {
    console.error('Error cargando dashboard:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
  text-align: center;
}

.dashboard-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.stats-grid {
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

.stat-card.warning {
  border-left-color: #e74c3c;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info h3 {
  font-size: 2rem;
  margin: 0;
  color: #2c3e50;
}

.stat-info p {
  margin: 0;
  color: #7f8c8d;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.chart-card h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.sales-chart {
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 200px;
  padding: 1rem 0;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar {
  width: 30px;
  background: linear-gradient(to top, #3498db, #2980b9);
  border-radius: 4px 4px 0 0;
  min-height: 10px;
  transition: all 0.3s ease;
}

.bar:hover {
  opacity: 0.8;
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #7f8c8d;
}

.popular-products {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.rank {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.product-name {
  flex: 1;
  font-weight: 500;
}

.product-sales {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.quick-actions {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.quick-actions h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #3498db;
  color: white;
  border-color: #3498db;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>