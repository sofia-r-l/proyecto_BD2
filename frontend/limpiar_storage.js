// Script para limpiar localStorage de órdenes de compra
// Ejecutar en la consola del navegador (F12)

console.log('🧹 Iniciando limpieza de localStorage...');

const key = 'ordenes_compra_local';
const data = localStorage.getItem(key);

if (!data) {
    console.log('✅ localStorage ya está limpio - No hay órdenes guardadas');
} else {
    try {
        const ordenes = JSON.parse(data);
        console.log(`📊 Se encontraron ${ordenes.length} orden(es) de compra`);
        console.log('📋 Órdenes a eliminar:', ordenes);

        localStorage.removeItem(key);

        const verificacion = localStorage.getItem(key);
        if (verificacion === null) {
            console.log('✅ localStorage limpiado exitosamente');
            console.log(`🗑️ ${ordenes.length} orden(es) eliminada(s)`);
        } else {
            console.error('❌ Error: No se pudo limpiar localStorage');
        }
    } catch (error) {
        console.error('❌ Error al parsear JSON:', error);
        console.log('🔧 Limpiando de todas formas...');
        localStorage.removeItem(key);
        console.log('✅ localStorage limpiado (forzado)');
    }
}

