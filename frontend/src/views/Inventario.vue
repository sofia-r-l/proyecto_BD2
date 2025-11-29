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

      <!-- Botón para generar orden de compra -->
      <button 
        @click="mostrarModalOrdenCompra" 
        class="btn-orden-compra" 
        :disabled="inventarioBajoCount === 0 || loading"
      >
        📋 Generar Orden ({{ inventarioBajoCount }})
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

    <!-- Modal para Orden de Compra -->
<div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
  <div class="modal-content" @click.stop>
    <div class="modal-header">
      <h3>📋 Generar Orden de Compra</h3>
      <button class="btn-cerrar" @click="cerrarModal">×</button>
    </div>
    
    <div class="modal-body">
      <div v-if="cargandoProductos" class="sin-datos">
        <p>🔄 Cargando productos con stock bajo...</p>
      </div>

      <div v-else-if="errorCarga" class="sin-datos">
        <p>❌ Error al cargar productos: {{ errorCarga }}</p>
        <button @click="reintentarCarga" class="btn-alerta">Reintentar</button>
      </div>

      <form v-else @submit.prevent="generarOrdenCompra" class="form-orden-compra">
        <div class="filtro-group">
          <label for="producto">Producto *</label>
          
        <select 
          id="producto"
          v-model="productoSeleccionadoIndex"
          required
          @change="onProductoChange"
          class="form-select"
          :disabled="productosConAlerta.length === 0"
        >
          <option value="">Seleccione un producto</option>
          <option 
            v-for="(producto, index) in productosConAlerta" 
            :key="`${producto.ProductoID}-${producto.SucursalID}`"
            :value="index"
          >
            {{ producto.Producto }} - {{ producto.Sucursal }} 
            (Stock: {{ producto.Cantidad }} - {{ getEstadoStock(producto.Cantidad) }})
          </option>
        </select>
          <small style="color: #7f8c8d; font-size: 0.8rem;">
            Solo se muestran productos con stock bajo o crítico
          </small>
          <div v-if="productosConAlerta.length === 0" style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 0.75rem; border-radius: 5px; margin-top: 0.5rem;">
            ⚠️ No hay productos con stock bajo en este momento
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <!-- ⭐⭐ AGREGAR ESTE CAMPO DE PROVEEDORES QUE FALTA ⭐⭐ -->
          <div class="filtro-group">
            <label for="proveedor">Proveedor *</label>
            <select 
              id="proveedor"
              v-model="ordenCompra.ProveedorID" 
              required
              @change="onProveedorChange"
              class="form-select"
              :disabled="productosConAlerta.length === 0 || cargandoProveedores"
            >
              <option value="">Seleccione proveedor</option>
              <option 
                v-for="proveedor in proveedores" 
                :key="proveedor.ProveedorID"
                :value="proveedor.ProveedorID"
                :title="`${proveedor.IdentidadFiscal} - ${proveedor.Telefono} - Crédito: L. ${proveedor.CreditoDisponible.toLocaleString()}`"
              >
                {{ proveedor.Nombre }} 
                <span v-if="proveedor.CreditoDisponible < 10000" style="color: #e74c3c;">
                  (L. {{ proveedor.CreditoDisponible.toLocaleString() }} disp.)
                </span>
                <span v-else style="color: #27ae60;">
                  (L. {{ proveedor.CreditoDisponible.toLocaleString() }} disp.)
                </span>
              </option>
            </select>
            <small style="color: #7f8c8d; font-size: 0.8rem;">
              Se muestra el crédito disponible de cada proveedor
            </small>
            <div v-if="cargandoProveedores" style="color: #7f8c8d; font-size: 0.8rem;">
              🔄 Cargando proveedores...
            </div>
            <div v-if="proveedores.length === 0 && !cargandoProveedores" style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 0.75rem; border-radius: 5px; margin-top: 0.5rem;">
              ⚠️ No hay proveedores disponibles
            </div>
          </div>
          <!-- ⭐⭐ FIN DEL CAMPO AGREGADO ⭐⭐ -->

          <div class="filtro-group">
            <label for="cantidad">Cantidad a ordenar *</label>
            <input 
              id="cantidad"
              type="number" 
              v-model.number="ordenCompra.Cantidad" 
              min="1"
              required
              style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px;"
              placeholder="Ej: 100"
              :disabled="productosConAlerta.length === 0"
            >
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
  <div class="filtro-group">
    <label for="precio">Precio Unitario (L.) *</label>
    <div 
      style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px; background: #f8f9fa; color: #555; min-height: 42px; display: flex; align-items: center;"
    >
      <strong v-if="ordenCompra.PrecioUnitario > 0">
        L. {{ ordenCompra.PrecioUnitario.toLocaleString() }}
      </strong>
      <span v-else style="color: #7f8c8d;">
        Seleccione un producto
      </span>
    </div>
    <small style="color: #7f8c8d; font-size: 0.8rem;">
      Precio actual del producto en inventario
    </small>
  </div>

  <div class="filtro-group">
    <label for="sucursal">Sucursal *</label>
    <div 
      style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px; background: #f8f9fa; color: #555; min-height: 42px; display: flex; align-items: center;"
    >
      <strong v-if="sucursalSeleccionada">
        {{ sucursalSeleccionada }}
      </strong>
      <span v-else style="color: #7f8c8d;">
        Seleccione un producto
      </span>
    </div>
    <small style="color: #7f8c8d; font-size: 0.8rem;">
      Sucursal donde se enviará el producto
    </small>
  </div>


  <div class="filtro-group">
    <label for="fecha">Fecha de Entrega *</label>
    <input 
      id="fecha"
      type="date" 
      v-model="ordenCompra.FechaEntrega" 
      required
      style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px;"
      :min="minDate"
      :disabled="productosConAlerta.length === 0"
    >
  </div>
</div>

        <!-- Información del producto seleccionado -->
        <div class="filtro-group" v-if="productoSeleccionado">
          <div style="background: #f8f9fa; padding: 1rem; border-radius: 5px; border-left: 4px solid #3498db;">
            <h4 style="margin: 0 0 0.5rem 0; color: #2c3e50;">Información del Producto Seleccionado:</h4>
            <p style="margin: 0.25rem 0; color: #555;"><strong>Stock actual:</strong> {{ productoSeleccionado.Cantidad }} unidades</p>
            <p style="margin: 0.25rem 0; color: #555;"><strong>Estado:</strong> 
              <span :class="{
                'estado-critico': productoSeleccionado.Cantidad === 0,
                'estado-alerta': productoSeleccionado.Cantidad > 0 && productoSeleccionado.Cantidad < 50
              }">
                {{ getEstadoStock(productoSeleccionado.Cantidad) }}
              </span>
            </p>
            <p style="margin: 0.25rem 0; color: #555;"><strong>Sucursal:</strong> {{ productoSeleccionado.Sucursal }}</p>
            <p style="margin: 0.25rem 0; color: #555;"><strong>Precio actual:</strong> L. {{ parseFloat(productoSeleccionado.PrecioBase).toLocaleString() }}</p>
            
          
          </div>
        </div>

        <!-- ⭐⭐ AGREGAR TAMBIÉN LA INFORMACIÓN DEL PROVEEDOR SELECCIONADO ⭐⭐ -->
        <div class="filtro-group" v-if="proveedorSeleccionado">
          <div style="background: #f0f8ff; padding: 1rem; border-radius: 5px; border-left: 4px solid #2980b9;">
            <h4 style="margin: 0 0 0.5rem 0; color: #2c3e50;">Información del Proveedor Seleccionado:</h4>
            <p style="margin: 0.25rem 0; color: #555;"><strong>Identidad Fiscal:</strong> {{ proveedorSeleccionado.IdentidadFiscal }}</p>
            <p style="margin: 0.25rem 0; color: #555;"><strong>Teléfono:</strong> {{ proveedorSeleccionado.Telefono }}</p>
            <p style="margin: 0.25rem 0; color: #555;"><strong>Email:</strong> {{ proveedorSeleccionado.Email }}</p>
            <p style="margin: 0.25rem 0; color: #555;">
              <strong>Crédito disponible:</strong> 
              <span :style="proveedorSeleccionado.CreditoDisponible < 10000 ? 'color: #e74c3c; font-weight: bold;' : 'color: #27ae60;'">
                L. {{ proveedorSeleccionado.CreditoDisponible.toLocaleString() }}
              </span>
              de L. {{ proveedorSeleccionado.LimiteCredito.toLocaleString() }}
            </p>
            <p style="margin: 0.25rem 0; color: #555;"><strong>Saldo actual:</strong> L. {{ proveedorSeleccionado.SaldoActual.toLocaleString() }}</p>
            <p style="margin: 0.25rem 0; color: #555;"><strong>Dirección:</strong> {{ proveedorSeleccionado.Direccion }}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e9ecef;">
          <button type="button" @click="cerrarModal" class="btn-alerta">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-orden-compra"
            :disabled="procesandoOrden || productosConAlerta.length === 0"
          >
            {{ procesandoOrden ? 'Procesando...' : 'Generar Orden' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <p>🔄 Cargando inventario...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  inventarioService, 
  type ProductoInventario, 
  type ProductoConAlerta,
  type OrdenCompra,
  type Proveedor 
} from '@/services/inventario.service';
import { ordenCompraService } from '@/services/ordenCompra.service';

// Estados
const inventario = ref<ProductoInventario[]>([]);
const productosConAlerta = ref<ProductoConAlerta[]>([]);
const loading = ref(true);
const cargandoProductos = ref(false);
const errorCarga = ref<string | null>(null);
const filtroSucursal = ref('');
const filtroCategoria = ref('');
const mostrarBajoStock = ref(false);
const mostrarModal = ref(false);
const procesandoOrden = ref(false);
const proveedores = ref<Proveedor[]>([]);
const cargandoProveedores = ref(false);
const productoSeleccionadoIndex = ref<number | string>('');

const router = useRouter();

// Datos del formulario
const ordenCompra = ref({
  ProveedorID: 0,
  ProductoID: 0,
  Cantidad: 0,
  PrecioUnitario: 0,
  FechaEntrega: '',
  SucursalID: 0
});

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

const proveedorSeleccionado = computed(() => {
  if (!ordenCompra.value.ProveedorID) return null;
  return proveedores.value.find((p: Proveedor) => p.ProveedorID === ordenCompra.value.ProveedorID);
});



const minDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const onProveedorChange = () => {
  if (proveedorSeleccionado.value) {
    console.log('Proveedor seleccionado:', proveedorSeleccionado.value);
  }
};

// 1. Computed property para el producto seleccionado
const productoSeleccionado = computed(() => {
  if (productoSeleccionadoIndex.value === '' || productoSeleccionadoIndex.value === null) return null;
  const index = typeof productoSeleccionadoIndex.value === 'string' 
    ? parseInt(productoSeleccionadoIndex.value) 
    : productoSeleccionadoIndex.value;
  return productosConAlerta.value[index] || null;
});

// 2. Computed property para la sucursal seleccionada (LA QUE CAUSA EL ERROR)
const sucursalSeleccionada = computed(() => {
  return productoSeleccionado.value?.Sucursal || '';
});
/*
// 3. Función de mapeo actualizada
const mapearSucursalAId = (sucursalNombre: string): number => {
  const mapeoSucursales: { [key: string]: number } = {
    'Sucursal Centro': 1,
    'Sucursal Norte': 2, 
    'Sucursal Sur': 3,
    'Sucursal Central': 1, // Por si acaso también existe este nombre
    // Agrega más según lo que veas en tus logs
  };
  
  return mapeoSucursales[sucursalNombre] || 1; // Default a 1 si no se encuentra
};
*/
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

const cargarProveedores = async () => {
  try {
    cargandoProveedores.value = true;
    proveedores.value = await inventarioService.getProveedores();
    console.log('✅ Proveedores cargados desde BD:', proveedores.value.length);
    
    // Debug: mostrar los proveedores cargados
    proveedores.value.forEach(proveedor => {
      console.log(`📋 ${proveedor.Nombre} - Crédito: L. ${proveedor.CreditoDisponible}`);
    });
  } catch (error) {
    console.error('❌ Error cargando proveedores:', error);
    alert('Error al cargar los proveedores: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  } finally {
    cargandoProveedores.value = false;
  }
};

const mostrarModalOrdenCompra = async () => {
  try {
    cargandoProductos.value = true;
    errorCarga.value = null;
    mostrarModal.value = true;
    
    console.log('📦 Inventario cargado:', inventario.value.length);
    
    // Filtrar productos con alerta
    productosConAlerta.value = inventario.value
      .filter(item => item.Cantidad < 50)
      .map(item => ({
        ...item,
        Estado: item.Cantidad === 0 ? 'critico' : item.Cantidad < 20 ? 'critico' : 'alerta'
      }));
    
    console.log('🚨 Productos con alerta:', productosConAlerta.value.length);
    
    // ⭐⭐ DEBUG DETALLADO DE PRODUCTOS CON ALERTA ⭐⭐
    console.log('🔍 PRODUCTOS CON ALERTA - PRECIOS DETALLADOS:');
    productosConAlerta.value.forEach((producto, index) => {
      console.log(`   ${index + 1}. ID: ${producto.ProductoID}, "${producto.Producto}"`, {
        PrecioBase: producto.PrecioBase,
        Cantidad: producto.Cantidad,
        SucursalID: producto.SucursalID
      });
    });
    
    // Cargar proveedores
    await cargarProveedores();
    
    // Resetear el formulario
    productoSeleccionadoIndex.value = '';
    ordenCompra.value = {
      ProveedorID: 0,
      ProductoID: 0,
      Cantidad: 0,
      PrecioUnitario: 0,
      FechaEntrega: '',
      SucursalID: 0
    };
    
  } catch (error) {
    console.error('Error cargando modal:', error);
    errorCarga.value = error instanceof Error ? error.message : 'Error desconocido';
  } finally {
    cargandoProductos.value = false;
  }
};

const reintentarCarga = () => {
  mostrarModalOrdenCompra();
};

const onProductoChange = () => {
  console.log('🔄 onProductoChange ejecutado');
  
  if (productoSeleccionadoIndex.value === '' || productoSeleccionadoIndex.value === null) {
    console.log('❌ No hay producto seleccionado');
    ordenCompra.value.ProductoID = 0;
    ordenCompra.value.PrecioUnitario = 0;
    ordenCompra.value.SucursalID = 0;
    return;
  }
  
  const index = typeof productoSeleccionadoIndex.value === 'string' 
    ? parseInt(productoSeleccionadoIndex.value) 
    : productoSeleccionadoIndex.value;
  
  const producto = productosConAlerta.value[index];
  
  if (producto) {
    console.log('✅ Producto encontrado:', producto.Producto);
    
    // ⭐ SOLUCIÓN TEMPORAL: Buscar IDs reales en el inventario completo
    const productoCompleto = inventario.value.find(item => 
      item.Producto === producto.Producto && item.Sucursal === producto.Sucursal
    );
    
    // Si encontramos el producto completo con IDs, usarlos
    if (productoCompleto && productoCompleto.ProductoID && productoCompleto.SucursalID) {
      ordenCompra.value.ProductoID = productoCompleto.ProductoID;
      ordenCompra.value.SucursalID = productoCompleto.SucursalID;
      console.log('🆔 IDs encontrados en inventario completo');
    } else {
      // Fallback: mapear nombres a IDs
      ordenCompra.value.ProductoID = mapearProductoAId(producto.Producto);
      ordenCompra.value.SucursalID = mapearSucursalAId(producto.Sucursal);
      console.log('⚠️ IDs generados por mapeo');
    }
    
    ordenCompra.value.PrecioUnitario = parseFloat(producto.PrecioBase) || 0;
    
    console.log('✅ Datos guardados:');
    console.log('   ProductoID:', ordenCompra.value.ProductoID);
    console.log('   SucursalID:', ordenCompra.value.SucursalID);
    console.log('   PrecioUnitario:', ordenCompra.value.PrecioUnitario);
    
  } else {
    console.log('❌ Producto no encontrado');
    ordenCompra.value.ProductoID = 0;
    ordenCompra.value.PrecioUnitario = 0;
    ordenCompra.value.SucursalID = 0;
  }
};

// Mapeo de productos a IDs (basado en tus datos)
const mapearProductoAId = (productoNombre: string): number => {
  const mapeoProductos: { [key: string]: number } = {
    'Ibuprofeno 400mg': 1,
    'Paracetamol 500mg': 2,
    'Amoxicilina 500mg': 3,
    'Ciprofloxacino 250mg': 4,
    'Vitamina C 1g': 5,
    'Complejo B': 6,
    'Gasas Estériles 10x10': 7,
    'Jeringas 5ml': 8,
    'Jabón Antibacterial': 9,
    'Alcohol Gel 70%': 10
  };
  return mapeoProductos[productoNombre] || 1;
};

// Mapeo de sucursales a IDs
const mapearSucursalAId = (sucursalNombre: string): number => {
  const mapeoSucursales: { [key: string]: number } = {
    'Sucursal Centro': 1,
    'Sucursal Norte': 2, 
    'Sucursal Sur': 3
  };
  return mapeoSucursales[sucursalNombre] || 1;
};


const generarOrdenCompra = async () => {
  try {
    procesandoOrden.value = true;
    
    // Validaciones
    if (ordenCompra.value.Cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    if (ordenCompra.value.PrecioUnitario <= 0) {
      alert('El precio unitario debe ser mayor a 0');
      return;
    }

    const resultado = await inventarioService.crearOrdenCompra(ordenCompra.value);
    
    alert('✅ Orden de compra generada exitosamente');
    console.log('Orden creada:', resultado);
    
    cerrarModal();
    // Redireccionar a la página de órdenes de compra con un flag para refrescar
    router.push({ name: 'OrdenDeCompra', query: { refresh: 'true' } });
    
  } catch (error) {
    console.error('Error generando orden de compra:', error);
    alert('❌ Error al generar la orden de compra: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  } finally {
    procesandoOrden.value = false;
  }
};

const cerrarModal = () => {
  mostrarModal.value = false;
  productosConAlerta.value = [];
  errorCarga.value = null;
};

const cargarInventario = async () => {
  try {
    loading.value = true;
    const data = await inventarioService.getInventario();
    inventario.value = data;
    
    console.log('🔍 ESTRUCTURA COMPLETA del response:', data);
    console.log('📊 Total de productos:', data.length);
    
    if (data && data.length > 0) {
      // Mostrar la estructura real del primer producto
      const primerProducto = data[0] as any;
      console.log('📦 ESTRUCTURA REAL DEL PRIMER PRODUCTO:', primerProducto);
      console.log('📋 PROPIEDADES DISPONIBLES:', Object.keys(primerProducto));
      
      // Buscar propiedades que podrían ser el ID
      const idProperties = Object.keys(primerProducto).filter(key => 
        key.toLowerCase().includes('id') || key === 'id'
      );
      console.log('🆔 PROPIEDADES QUE PODRÍAN SER EL ID:', idProperties);
      
      // Mostrar los primeros 3 productos
      console.log('🎯 PRIMEROS 3 PRODUCTOS:');
      data.slice(0, 3).forEach((item, index) => {
        const itemAny = item as any;
        console.log(`   Producto ${index + 1}:`, {
          Nombre: itemAny.Producto,
          // Mostrar todas las propiedades que podrían ser el ID
          IDs: idProperties.map(prop => `${prop}: ${itemAny[prop]}`),
          PrecioBase: itemAny.PrecioBase,
          Cantidad: itemAny.Cantidad
        });
      });
    }
    
  } catch (error) {
    console.error('Error cargando inventario:', error);
    alert('Error al cargar el inventario');
  } finally {
    loading.value = false;
  }
};


// Lifecycle
onMounted(async () => {
  await cargarInventario();
});
</script>

<style scoped>
/* TODOS LOS ESTILOS ORIGINALES SE MANTIENEN IGUAL */
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

.btn-orden-compra {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 2px solid #27ae60;
  border-radius: 5px;
  color: #27ae60;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-orden-compra:hover {
  background: #27ae60;
  color: white;
}

.btn-orden-compra:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8f9fa;
  color: #95a5a6;
  border-color: #bdc3c7;
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

/* Estilos del Modal - usando los estilos existentes */
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

.modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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

.modal-header h3 {
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

.modal-body {
  padding: 1.5rem;
}

.form-orden-compra {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.form-select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .inventario {
    padding: 1rem;
  }
  
  .filtros {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filtro-group select {
    min-width: auto;
  }
  
  .btn-orden-compra {
    margin-top: 0.5rem;
  }
  
  .tabla-container {
    overflow-x: auto;
  }
  
  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}
</style>