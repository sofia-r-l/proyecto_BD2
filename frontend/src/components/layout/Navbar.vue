<!-- src/components/layout/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <h2>🏥 Comercializadora Médica</h2>
    </div>
    
    <div class="navbar-menu">
      <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
      <RouterLink to="/productos" class="nav-link">Productos</RouterLink>
      <RouterLink to="/proveedores" class="nav-link">Proveedores</RouterLink>
      <RouterLink to="/clientes" class="nav-link">Clientes</RouterLink>
      <RouterLink to="/orden-de-compra" class="nav-link">Órdenes de Compra</RouterLink>
      <RouterLink to="/ventas" class="nav-link">Ventas</RouterLink>
      <RouterLink to="/inventario" class="nav-link">Inventario</RouterLink>
    </div>
    
    <div class="navbar-actions">
      <button @click="handleLogout" class="logout-btn">Cerrar Sesión</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}

.navbar-brand h2 {
  color: #2c3e50;
  margin: 0;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #34495e;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #ecf0f1;
}

.nav-link.router-link-active {
  background-color: #3498db;
  color: white;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.logout-btn:hover {
  background: #c0392b;
}
</style>