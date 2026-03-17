# 📊 Estructura del Archivo Excel

## Archivo: `BaseDeDatos/BaseDeDatos.xlsx`

Este archivo Excel contiene **todos los datos del sistema** organizados en diferentes hojas.

---

## 📋 Hojas del Archivo

### 1. **Hoja "Trabajos"** (Servicios Registrados)

Contiene todos los servicios de vehículos registrados en el sistema.

**Columnas:**

#### Datos Básicos:
- **ID** - Identificador único del servicio
- **Cliente** - Nombre del cliente
- **Patente** - Patente del vehículo
- **Kilometraje** - Kilómetros del vehículo
- **Tipo** - Tipo de servicio (Service, Revisión, Cambio)
- **Fecha** - Fecha del servicio
- **Costo Total** - Costo total del servicio

#### Para tipo "Service" (campos adicionales):
- **Filtro Aceite** - Producto usado
- **Precio F. Aceite** - Precio del filtro de aceite
- **Filtro Aire** - Producto usado
- **Precio F. Aire** - Precio del filtro de aire
- **Filtro Combustible 1** - Producto usado
- **Precio F. Combustible 1** - Precio del filtro
- **Filtro Combustible 2** - Producto usado (opcional)
- **Precio F. Combustible 2** - Precio del filtro
- **Filtro Habitáculo** - Producto usado
- **Precio F. Habitáculo** - Precio del filtro
- **Aceite Motor 1** - Producto de aceite
- **Cantidad Aceite 1** - Cantidad usada
- **Precio Aceite 1** - Precio del aceite
- **Aceite Motor 2** - Producto de aceite (opcional)
- **Cantidad Aceite 2** - Cantidad usada
- **Precio Aceite 2** - Precio del aceite
- **Aceite Caja** - Aceite de caja de cambios
- **Cantidad Aceite Caja** - Cantidad usada
- **Precio Aceite Caja** - Precio del aceite
- **Mano de Obra** - Descripción del trabajo
- **Precio M. Obra** - Costo de la mano de obra

#### Para tipo "Revisión" o "Cambio":
- **Descripción** - Descripción del trabajo realizado

---

### 2. **Hoja "Productos"** (Catálogo de Productos)

Contiene el catálogo de productos disponibles para usar en los servicios.

**Columnas:**
- **ID** - Identificador único del producto
- **Categoría** - Tipo de producto (Filtro de Aceite, Filtro de Aire, etc.)
- **Nombre** - Nombre del producto
- **Precio** - Precio del producto
- **Descripción** - Descripción adicional (opcional)

**Categorías disponibles:**
- Filtro de Aceite
- Filtro de Aire
- Filtro de Combustible
- Filtro de Habitáculo
- Aceite de Motor
- Aceite de Caja

---

## 🔄 Flujo de Datos

### Exportar (Guardar):
```
Aplicación Web ──► Servidor Node.js ──► BaseDeDatos.xlsx
                                        ├── Hoja "Trabajos"
                                        └── Hoja "Productos"
```

### Importar (Cargar):
```
BaseDeDatos.xlsx ──► Servidor Node.js ──► Aplicación Web
├── Hoja "Trabajos"       (lee)
└── Hoja "Productos"      (lee)
```

---

## ✏️ Edición Manual

Puedes editar el archivo Excel manualmente:

1. **Abre** `BaseDeDatos/BaseDeDatos.xlsx` con Excel
2. **Selecciona** la hoja que deseas editar (Trabajos o Productos)
3. **Modifica** los datos directamente
4. **Guarda** el archivo
5. **Importa** desde la aplicación web para ver los cambios

⚠️ **Importante:**
- No cambies los nombres de las columnas
- No elimines las hojas "Trabajos" o "Productos"
- Respeta los tipos de datos (números en campos numéricos, etc.)

---

## 🔐 Backup y Seguridad

### Para hacer backup:
1. Simplemente copia el archivo `BaseDeDatos/BaseDeDatos.xlsx`
2. Guárdalo en otro lugar (pendrive, nube, etc.)

### Para restaurar:
1. Reemplaza el archivo `BaseDeDatos/BaseDeDatos.xlsx` con tu backup
2. Importa los datos desde la aplicación

---

## 💡 Ventajas de Este Sistema

✅ **Un solo archivo** - Todos los datos en un lugar  
✅ **Hojas separadas** - Organización clara por tipo de datos  
✅ **Portable** - Fácil de copiar y respaldar  
✅ **Compatible** - Se puede abrir con Excel, LibreOffice, Google Sheets  
✅ **Sincronización bidireccional** - Importa y exporta cuando quieras  

---

## 🆘 Solución de Problemas

### "No hay datos de trabajos/productos aún"
- El archivo existe pero no tiene la hoja correspondiente
- Exporta datos desde la aplicación para crear la hoja

### "No se pudo conectar con el servidor"
- Asegúrate de iniciar primero la app (`INICIAR.bat` o `npm start`)
- Si usaste `INICIAR.bat`, utiliza la URL que se abrió automáticamente

### "Error al importar"
- Verifica que los nombres de las columnas sean correctos
- Asegúrate de que los datos tengan el formato adecuado
- Revisa que no haya filas vacías entre los datos

### "Se perdieron mis datos"
- Verifica que la hoja tenga el nombre correcto ("Trabajos" o "Productos")
- Restaura desde un backup si hiciste uno previamente
- Los datos en localStorage del navegador siguen ahí hasta que exportes
