const express = require('express');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Ruta del archivo Excel único
const DATABASE_PATH = path.join(__dirname, 'BaseDeDatos', 'BaseDeDatos.xlsx');

// Función auxiliar para asegurar que el directorio existe
function ensureDirectoryExists() {
    const dir = path.dirname(DATABASE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Función auxiliar para leer el workbook existente o crear uno nuevo
function getWorkbook() {
    ensureDirectoryExists();
    
    if (fs.existsSync(DATABASE_PATH)) {
        return XLSX.readFile(DATABASE_PATH);
    } else {
        // Crear nuevo workbook vacío
        return XLSX.utils.book_new();
    }
}

// ============================================
// ENDPOINT: Exportar Trabajos a Excel
// ============================================
app.post('/api/export/trabajos', (req, res) => {
    try {
        const { services } = req.body;
        
        // Convertir datos a formato para Excel
        const excelData = services.map(service => {
            if (service.serviceType === 'Service') {
                // Formatear datos de Service detallado
                return {
                    'ID': service.id,
                    'Cliente': service.clientName,
                    'Patente': service.vehiclePlate,
                    'Kilometraje': service.vehicleKm,
                    'Tipo': service.serviceType,
                    'Fecha': service.date,
                    'Costo Total': service.cost,
                    'Filtro Aceite': service.serviceData?.filtros?.aceite?.producto || '',
                    'Precio F. Aceite': service.serviceData?.filtros?.aceite?.precio || 0,
                    'Filtro Aire': service.serviceData?.filtros?.aire?.producto || '',
                    'Precio F. Aire': service.serviceData?.filtros?.aire?.precio || 0,
                    'Filtro Combustible 1': service.serviceData?.filtros?.combustible1?.producto || '',
                    'Precio F. Combustible 1': service.serviceData?.filtros?.combustible1?.precio || 0,
                    'Filtro Combustible 2': service.serviceData?.filtros?.combustible2?.producto || '',
                    'Precio F. Combustible 2': service.serviceData?.filtros?.combustible2?.precio || 0,
                    'Filtro Habitáculo': service.serviceData?.filtros?.habitaculo?.producto || '',
                    'Precio F. Habitáculo': service.serviceData?.filtros?.habitaculo?.precio || 0,
                    'Aceite Motor 1': service.serviceData?.aceites?.aceite1?.producto || '',
                    'Cantidad Aceite 1': service.serviceData?.aceites?.aceite1?.cantidad || '',
                    'Precio Aceite 1': service.serviceData?.aceites?.aceite1?.precio || 0,
                    'Aceite Motor 2': service.serviceData?.aceites?.aceite2?.producto || '',
                    'Cantidad Aceite 2': service.serviceData?.aceites?.aceite2?.cantidad || '',
                    'Precio Aceite 2': service.serviceData?.aceites?.aceite2?.precio || 0,
                    'Aceite Caja': service.serviceData?.aceiteCaja?.producto || '',
                    'Cantidad Aceite Caja': service.serviceData?.aceiteCaja?.cantidad || '',
                    'Precio Aceite Caja': service.serviceData?.aceiteCaja?.precio || 0,
                    'Mano de Obra': service.serviceData?.manoObra?.descripcion || '',
                    'Precio M. Obra': service.serviceData?.manoObra?.precio || 0
                };
            } else {
                // Formatear datos de Revisión/Cambio
                return {
                    'ID': service.id,
                    'Cliente': service.clientName,
                    'Patente': service.vehiclePlate,
                    'Kilometraje': service.vehicleKm,
                    'Tipo': service.serviceType,
                    'Fecha': service.date,
                    'Costo Total': service.cost,
                    'Descripción': service.description || ''
                };
            }
        });

        // Leer workbook existente o crear uno nuevo
        const workbook = getWorkbook();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Ajustar ancho de columnas
        worksheet['!cols'] = [
            { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }
        ];

        // Si ya existe la hoja "Trabajos", eliminarla primero
        if (workbook.SheetNames.includes('Trabajos')) {
            delete workbook.Sheets['Trabajos'];
            workbook.SheetNames = workbook.SheetNames.filter(name => name !== 'Trabajos');
        }

        // Agregar la nueva hoja de Trabajos
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajos');

        // Escribir archivo
        XLSX.writeFile(workbook, DATABASE_PATH);

        res.json({ success: true, message: `✅ ${services.length} trabajos exportados correctamente` });
    } catch (error) {
        console.error('Error exportando trabajos:', error);
        res.status(500).json({ success: false, message: 'Error al exportar trabajos' });
    }
});

// ============================================
// ENDPOINT: Importar Trabajos desde Excel
// ============================================
app.get('/api/import/trabajos', (req, res) => {
    try {
        // Verificar si existe el archivo
        if (!fs.existsSync(DATABASE_PATH)) {
            return res.json({ success: true, services: [], message: 'No hay archivo de base de datos aún' });
        }

        // Leer archivo Excel
        const workbook = XLSX.readFile(DATABASE_PATH);
        
        // Verificar si existe la hoja "Trabajos"
        if (!workbook.SheetNames.includes('Trabajos')) {
            return res.json({ success: true, services: [], message: 'No hay datos de trabajos aún' });
        }
        
        const worksheet = workbook.Sheets['Trabajos'];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Convertir datos de Excel a formato de la aplicación
        const services = data.map(row => {
            if (row['Tipo'] === 'Service') {
                return {
                    id: row['ID'],
                    clientName: row['Cliente'],
                    vehiclePlate: row['Patente'],
                    vehicleKm: row['Kilometraje'],
                    serviceType: row['Tipo'],
                    date: row['Fecha'],
                    cost: row['Costo Total'],
                    serviceData: {
                        filtros: {
                            aceite: { producto: row['Filtro Aceite'] || '', precio: row['Precio F. Aceite'] || 0 },
                            aire: { producto: row['Filtro Aire'] || '', precio: row['Precio F. Aire'] || 0 },
                            combustible1: { producto: row['Filtro Combustible 1'] || '', precio: row['Precio F. Combustible 1'] || 0 },
                            combustible2: { producto: row['Filtro Combustible 2'] || '', precio: row['Precio F. Combustible 2'] || 0 },
                            habitaculo: { producto: row['Filtro Habitáculo'] || '', precio: row['Precio F. Habitáculo'] || 0 }
                        },
                        aceites: {
                            aceite1: { producto: row['Aceite Motor 1'] || '', cantidad: row['Cantidad Aceite 1'] || '', precio: row['Precio Aceite 1'] || 0 },
                            aceite2: { producto: row['Aceite Motor 2'] || '', cantidad: row['Cantidad Aceite 2'] || '', precio: row['Precio Aceite 2'] || 0 }
                        },
                        aceiteCaja: { producto: row['Aceite Caja'] || '', cantidad: row['Cantidad Aceite Caja'] || '', precio: row['Precio Aceite Caja'] || 0 },
                        manoObra: { descripcion: row['Mano de Obra'] || '', precio: row['Precio M. Obra'] || 0 }
                    }
                };
            } else {
                return {
                    id: row['ID'],
                    clientName: row['Cliente'],
                    vehiclePlate: row['Patente'],
                    vehicleKm: row['Kilometraje'],
                    serviceType: row['Tipo'],
                    date: row['Fecha'],
                    cost: row['Costo Total'],
                    description: row['Descripción'] || ''
                };
            }
        });

        res.json({ success: true, services, message: `✅ ${services.length} trabajos importados` });
    } catch (error) {
        console.error('Error importando trabajos:', error);
        res.status(500).json({ success: false, message: 'Error al importar trabajos' });
    }
});

// ============================================
// ENDPOINT: Exportar Productos a Excel
// ============================================
app.post('/api/export/productos', (req, res) => {
    try {
        const { products } = req.body;
        
        // Convertir datos a formato para Excel
        const excelData = products.map(product => ({
            'ID': product.id,
            'Categoría': product.category,
            'Nombre': product.name,
            'Precio': product.price,
            'Descripción': product.description || ''
        }));

        // Leer workbook existente o crear uno nuevo
        const workbook = getWorkbook();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Ajustar ancho de columnas
        worksheet['!cols'] = [
            { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 40 }
        ];

        // Si ya existe la hoja "Productos", eliminarla primero
        if (workbook.SheetNames.includes('Productos')) {
            delete workbook.Sheets['Productos'];
            workbook.SheetNames = workbook.SheetNames.filter(name => name !== 'Productos');
        }

        // Agregar la nueva hoja de Productos
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

        // Escribir archivo
        XLSX.writeFile(workbook, DATABASE_PATH);

        res.json({ success: true, message: `✅ ${products.length} productos exportados correctamente` });
    } catch (error) {
        console.error('Error exportando productos:', error);
        res.status(500).json({ success: false, message: 'Error al exportar productos' });
    }
});

// ============================================
// ENDPOINT: Importar Productos desde Excel
// ============================================
// ENDPOINT: Importar Productos desde Excel
// ============================================
app.get('/api/import/productos', (req, res) => {
    try {
        // Verificar si existe el archivo
        if (!fs.existsSync(DATABASE_PATH)) {
            return res.json({ success: true, products: [], message: 'No hay archivo de base de datos aún' });
        }

        // Leer archivo Excel
        const workbook = XLSX.readFile(DATABASE_PATH);
        
        // Verificar si existe la hoja "Productos"
        if (!workbook.SheetNames.includes('Productos')) {
            return res.json({ success: true, products: [], message: 'No hay datos de productos aún' });
        }
        
        const worksheet = workbook.Sheets['Productos'];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Convertir datos de Excel a formato de la aplicación
        const products = data.map(row => ({
            id: row['ID'],
            category: row['Categoría'],
            name: row['Nombre'],
            price: row['Precio'],
            description: row['Descripción'] || ''
        }));

        res.json({ success: true, products, message: `✅ ${products.length} productos importados` });
    } catch (error) {
        console.error('Error importando productos:', error);
        res.status(500).json({ success: false, message: 'Error al importar productos' });
    }
});

// ============================================
// ENDPOINT: Apagar servidor
// ============================================
app.post('/api/shutdown', (req, res) => {
    res.json({ success: true, message: 'Servidor apagándose...' });

    // Dar tiempo a que la respuesta llegue al cliente antes de cerrar.
    setTimeout(() => {
        server.close(() => {
            process.exit(0);
        });

        // Fallback por si hay conexiones abiertas.
        setTimeout(() => process.exit(0), 1500);
    }, 200);
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🚀 Servidor iniciado correctamente                      ║
║                                                           ║
║   📍 URL: http://localhost:${PORT}                           ║
║                                                           ║
║   � Base de Datos Excel:                                 ║
║      ${DATABASE_PATH.substring(0, 50)}...                 ║
║                                                           ║
║   📊 Hojas:                                               ║
║      • Trabajos (Servicios registrados)                   ║
║      • Productos (Catálogo de productos)                  ║
║                                                           ║
║   ✨ Abre tu navegador en http://localhost:${PORT}         ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
