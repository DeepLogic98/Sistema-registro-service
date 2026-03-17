# 📋 Sistema de Registro de Servicios - Con Sincronización Excel

## 🚀 Instalación Inicial

### Primera vez (solo una vez por computadora)

1. **Instalar Node.js**
   - Descarga desde: https://nodejs.org
   - Versión recomendada: LTS (Long Term Support)
   - Durante la instalación, acepta todas las opciones predeterminadas

2. **Instalar dependencias del proyecto**
   - Abre PowerShell o CMD en la carpeta del proyecto
   - Ejecuta:
     ```
     npm install
     ```
   - Esto instalará Express y la librería xlsx (tarda ~30 segundos)

---

## ▶️ Cómo Usar el Sistema

### Iniciar el servidor

1. Abre PowerShell o CMD en la carpeta del proyecto
2. Ejecuta:
   ```
   npm start
   ```
   O también:
   ```
   node server.js
   ```

3. Verás un mensaje como:
   ```
   ╔═══════════════════════════════════════════════════════════╗
   ║   🚀 Servidor iniciado correctamente                      ║
   ║   📍 URL: http://localhost:3000                           ║
   ╚═══════════════════════════════════════════════════════════╝
   ```

4. Abre tu navegador y ve a: **http://localhost:3000**

5. Para detener el servidor: presiona **Ctrl + C** en la terminal

---

## 📦 Funciones de Importar/Exportar

### 💾 Acceso desde la Barra Lateral

**Ubicación del menú:**
- En la barra lateral izquierda, encontrarás el icono **💾** (Sincronización Excel)
- Pasa el mouse sobre este icono para desplegar el menú
- Aparecerán dos opciones:
  - **⬆️ Importar** - Carga datos desde Excel
  - **⬇️ Exportar** - Guarda datos en Excel
- El menú se cierra automáticamente al quitar el mouse

### ⬇️ Exportar a Excel

**En la página principal (Trabajos):**
- Haz clic en **"⬇️ Exportar"** en el menú lateral
- Se creará/actualizará la hoja **"Trabajos"** en: `BaseDeDatos/BaseDeDatos.xlsx`
- Todos los servicios de la aplicación se guardan en Excel

**En la página de Productos:**
- Haz clic en **"⬇️ Exportar"** en el menú lateral
- Se creará/actualizará la hoja **"Productos"** en: `BaseDeDatos/BaseDeDatos.xlsx`
- Todos los productos se guardan en Excel

**Nota:** Ambas secciones usan el mismo archivo Excel pero en hojas separadas

### ⬆️ Importar desde Excel

**En la página principal (Trabajos):**
- Haz clic en **"⬆️ Importar"** en el menú lateral
- Lee los datos desde la hoja **"Trabajos"** en `BaseDeDatos/BaseDeDatos.xlsx`
- Opciones:
  - **Aceptar**: Reemplaza todos los trabajos actuales
  - **Cancelar**: Agrega solo los trabajos nuevos (sin duplicar IDs)

**En la página de Productos:**
- Haz clic en **"⬆️ Importar"** en el menú lateral
- Lee los datos desde la hoja **"Productos"** en `BaseDeDatos/BaseDeDatos.xlsx`
- Opciones:
  - **Aceptar**: Reemplaza todos los productos actuales
  - **Cancelar**: Agrega solo los productos nuevos

---

## 💾 Estructura de Archivos

```
ProgramaDeRegistroDeService/
├── INICIAR.bat             # Inicio recomendado (abre navegador automáticamente)
├── package.json            # Configuración del proyecto
├── server.js              # Servidor Node.js
├── styles.css             # Estilos globales
├── utils.js               # Utilidades compartidas
├── productos.js           # Archivo legado de productos (no usado por la vista actual)
├── pages/
│   ├── Inicio/
│   │   ├── Inicio.html    # Página principal (Trabajos)
│   │   └── inicio.js      # Lógica de trabajos
│   └── Productos/
│       ├── productos.html # Página de productos
│       └── productos.js   # Lógica de productos
└── BaseDeDatos/
    └── BaseDeDatos.xlsx   # 📊 ARCHIVO EXCEL ÚNICO
                            #    • Hoja "Trabajos" - Servicios registrados
                            #    • Hoja "Productos" - Catálogo de productos
```

---

## 🔄 Llevar el Proyecto a Otra Computadora

1. **Copia toda la carpeta** del proyecto a un pendrive/USB

2. **En la nueva computadora:**
   - Instala Node.js (ver sección "Instalación Inicial")
   - Copia la carpeta del proyecto
   - Abre terminal en la carpeta del proyecto
   - Ejecuta: `npm install` (primera vez solamente)
   - Ejecuta: `npm start`
   - ¡Listo! Todos tus datos en Excel se mantienen intactos

---

## ✅ Ventajas de Este Sistema

- ✅ **Un solo archivo Excel** con múltiples hojas organizadas
- ✅ **El archivo Excel viaja con el proyecto**
- ✅ **No hay rutas hardcodeadas** (C:\Users\...)
- ✅ **Funciona en cualquier computadora** con Node.js instalado
- ✅ **Puedes editar el Excel manualmente** si lo deseas (cada hoja por separado)
- ✅ **Backup automático**: todos los datos están en un solo archivo
- ✅ **Portable**: copia y pega la carpeta completa

---

## ⚠️ Notas Importantes

1. **Siempre inicia el servidor** antes de abrir la página web
2. **No abras archivos HTML directamente** (doble clic), entra siempre por la URL del servidor
3. **URL de acceso**:
   - Si usas `INICIAR.bat`, utiliza la URL que se abre automáticamente
   - Si inicias manual, usa `http://localhost:3000`
3. **Los datos se guardan**:
   - En localStorage del navegador (temporalmente)
   - En archivos Excel (permanentemente) cuando exportas
4. **Para hacer backup**: simplemente copia el archivo `BaseDeDatos/BaseDeDatos.xlsx`

---

## 🆘 Solución de Problemas

### "No se pudo conectar con el servidor"
- ✅ Verifica que el servidor esté corriendo (`INICIAR.bat` o `npm start`)
- ✅ Si usaste `INICIAR.bat`, usa la URL que abrió automáticamente
- ✅ Si usaste `npm start`, usa `http://localhost:3000`

### "npm no se reconoce como comando"
- ✅ Node.js no está instalado o no está en el PATH
- ✅ Reinstala Node.js y reinicia la terminal

### "Cannot find module 'express'"
- ✅ Las dependencias no están instaladas
- ✅ Ejecuta: `npm install`

---

## 📝 Comandos Útiles

```bash
# Inicio recomendado (Windows)
INICIAR.bat

# Iniciar servidor
npm start

# Instalar dependencias por primera vez
npm install

# Ver versión de Node.js
node --version

# Ver versión de npm
npm --version
```

---

## 🎯 Flujo de Trabajo Recomendado

1. **Inicio del día**:
   - Ejecuta `INICIAR.bat`
   - Usa la URL que abre automáticamente
   - Haz clic en **⬆️ Importar** para cargar datos del Excel

2. **Durante el trabajo**:
   - Registra servicios y productos normalmente
   - Los datos se guardan automáticamente en localStorage

3. **Fin del día**:
   - Haz clic en **⬇️ Exportar** para guardar en Excel
   - Cierra el navegador
   - Presiona Ctrl+C en la terminal para detener el servidor

4. **Backup**:
   - Copia el archivo `BaseDeDatos/BaseDeDatos.xlsx` a otro lugar
   - O copia toda la carpeta del proyecto
   - Un solo archivo contiene toda tu información

---

¡Listo! Tu sistema ahora tiene sincronización automática con Excel 🎉
