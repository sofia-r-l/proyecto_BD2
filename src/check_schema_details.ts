
import prisma from './lib/prisma';

async function main() {
    try {
        console.log('Checking columns for OrdenCompraDetalle...');
        const columns = await prisma.$queryRaw`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'OrdenCompraDetalle'`;
        console.log('Columns for OrdenCompraDetalle:', columns);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
