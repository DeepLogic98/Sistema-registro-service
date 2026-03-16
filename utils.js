// Utilidades compartidas entre páginas

// Constantes globales
const API_BASE_URL = 'http://localhost:3000';
const STORAGE_KEYS = {
    SERVICES: 'services',
    PRODUCTS: 'products'
};

const PRODUCT_CATEGORIES = [
    'Filtro de Aceite',
    'Filtro de Aire',
    'Filtro de Combustible',
    'Filtro de Habitáculo',
    'Aceite de Motor',
    'Aceite de Caja'
];

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Función para formatear fecha en formato DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Función para obtener fecha actual en formato YYYY-MM-DD
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Función auxiliar para hacer peticiones fetch
async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        return await response.json();
    } catch (error) {
        console.error('Error en la petición:', error);
        throw new Error('No se pudo conectar con el servidor. Asegúrate de que esté corriendo (node server.js)');
    }
}

// Función genérica para exportar datos
async function exportData(endpoint, data, emptyMessage) {
    if (data.length === 0) {
        showNotification(`⚠️ ${emptyMessage}`);
        return;
    }

    try {
        const result = await apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (result.success) {
            showNotification(result.message);
        } else {
            showNotification('❌ Error al exportar datos');
        }
    } catch (error) {
        showNotification(`❌ ${error.message}`);
    }
}

// Función genérica para importar datos
async function importData(endpoint, dataKey) {
    try {
        const result = await apiFetch(endpoint);

        if (result.success) {
            if (result[dataKey].length === 0) {
                showNotification('ℹ️ No hay datos en el archivo Excel');
                return null;
            }
            return result;
        } else {
            showNotification('❌ Error al importar datos');
            return null;
        }
    } catch (error) {
        showNotification(`❌ ${error.message}`);
        return null;
    }
}

// Cerrar la app desde la UI: apagar servidor y cerrar pestaña (si el navegador lo permite)
async function closeAppAndServer() {
    const confirmClose = confirm('¿Deseas cerrar la app y detener el servidor?');
    if (!confirmClose) return;

    try {
        const result = await apiFetch('/api/shutdown', { method: 'POST' });
        if (!result.success) {
            showNotification('❌ No se pudo detener el servidor');
            return;
        }
    } catch (error) {
        showNotification(`❌ ${error.message}`);
        return;
    }

    showNotification('🛑 Servidor detenido. Cerrando aplicación...');

    // Intento de cierre de pestaña/ventana.
    setTimeout(() => {
        window.open('', '_self');
        window.close();

        // Fallback para navegadores que bloquean window.close().
        setTimeout(() => {
            if (!window.closed) {
                document.body.className = 'app-closed-screen';
                document.body.innerHTML = '<div>Servidor detenido correctamente.<br>Ahora puedes cerrar esta pestaña.</div>';
            }
        }, 300);
    }, 450);
}

function initializeCloseButton() {
    const closeButton = document.getElementById('closeAppButton');
    if (!closeButton || closeButton.dataset.bound === 'true') return;

    closeButton.addEventListener('click', closeAppAndServer);
    closeButton.dataset.bound = 'true';
}

document.addEventListener('DOMContentLoaded', initializeCloseButton);
