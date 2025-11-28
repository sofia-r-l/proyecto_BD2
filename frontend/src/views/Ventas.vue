<template>
  <div class="venta-card">
    <h2 class="title">Registro de Venta</h2>

    <!-- Cliente -->
    <div class="card-section">
      <h3>Cliente</h3>

      <div class="field">
        <label>Cliente</label>
        <select>
          <option value="">Seleccione un cliente</option>
        </select>
      </div>

      <div class="field">
        <label>Teléfono</label>
        <input type="text" disabled />
      </div>

      <div class="field">
        <label>Dirección</label>
        <input type="text" disabled />
      </div>
    </div>

    <!-- Producto -->
    <div class="card-section">
      <h3>Producto</h3>

      <div class="field">
        <label>Producto</label>
        <select>
          <option value="">Seleccione un producto</option>
        </select>
      </div>

      <div class="field">
        <label>Precio</label>
        <input type="number" disabled />
      </div>

      <div class="field">
        <label>Stock</label>
        <input type="number" disabled />
      </div>
    </div>

    <!-- Venta -->
    <div class="card-section">
      <h3>Datos de Venta</h3>

      <div class="field">
        <label>Cantidad</label>
        <input type="number" />
      </div>

      <div class="field">
        <label>Total</label>
        <input type="number" disabled />
      </div>

      <div class="field">
        <label>Fecha</label>
        <input type="date" />
      </div>
    </div>

    <!-- Botón -->
    <div class="card-section">
      <button  class="btn-registrar">Registrar Venta</button>
    </div>
  </div>
</template>

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
  background: linear-gradient(135deg, #1A73E8, #4aa3ff);
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
  content: "";
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
