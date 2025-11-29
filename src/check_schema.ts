
import prisma from './lib/prisma';

async function main() {
    try {
        console.log('Checking tables...');
        const tables = await prisma.$queryRaw`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES`;
        console.log('Tables:', tables);

        console.log('Checking columns for OrdenCompra...');
        try {
            const columns = await prisma.$queryRaw`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'OrdenCompra'`;
            console.log('Columns for OrdenCompra:', columns);
        } catch (e) {
            console.log('OrdenCompra table not found or error checking columns');
        }

        try {
            const columns = await prisma.$queryRaw`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'OrdenesCompra'`;
            console.log('Columns for OrdenesCompra:', columns);
        } catch (e) {
            console.log('OrdenesCompra table not found or error checking columns');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
