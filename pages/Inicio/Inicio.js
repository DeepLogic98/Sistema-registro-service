// ===== CONSTANTES DE CONFIGURACIÓN =====
const CONSTANTS = {
    SERVICE_TYPES: {
        SERVICE: 'Service',
        REVISION: 'Revisión',
        CAMBIO: 'Cambio'
    },
    PRODUCT_CATEGORIES: {
        FILTRO_ACEITE: 'Filtro de Aceite',
        FILTRO_AIRE: 'Filtro de Aire',
        FILTRO_COMBUSTIBLE: 'Filtro de Combustible',
        FILTRO_HABITACULO: 'Filtro de Habitáculo',
        ACEITE_MOTOR: 'Aceite de Motor',
        ACEITE_CAJA: 'Aceite de Caja'
    },
    BUTTON_LABELS: {
        EDIT: 'Editar',
        DELETE: 'Eliminar',
        CANCEL: 'Cancelar'
    },
    NOTIFICATIONS: {
        SERVICE_REGISTERED: 'Servicio registrado exitosamente',
        SERVICE_UPDATED: 'Servicio actualizado exitosamente',
        SERVICE_DELETED: 'Servicio eliminado',
        EDIT_CANCELLED: 'Edición cancelada'
    }
};

// Elementos del DOM
const serviceForm = document.getElementById('serviceForm');
const serviceList = document.getElementById('serviceList');
const searchInput = document.getElementById('searchInput');
const serviceTypeSelect = document.getElementById('serviceType');
const genericFields = document.getElementById('genericFields');
const serviceFields = document.getElementById('serviceFields');
const totalServiceDisplay = document.getElementById('totalService');
const dateInput = document.getElementById('date');
const serviceDateInput = document.getElementById('serviceDate');
const productsIcon = document.getElementById('productsIcon');

// Estado de edición
let editingServiceId = null;

// Datos
let services = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES)) || [];
let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [];

// Configuración inicial
const today = getTodayDate();
dateInput.value = today;
serviceDateInput.value = today;

// Event Listeners
serviceForm.addEventListener('submit', handleSubmit);
searchInput.addEventListener('input', displayServices);
serviceTypeSelect.addEventListener('change', toggleServiceFields);

// Event listeners para calcular el total automáticamente
const servicePriceInputs = [
    'filtroAceitePrecio', 'filtroAirePrecio', 'filtroCombustible1Precio',
    'filtroCombustible2Precio', 'filtroHabitaculoPrecio', 'aceite1Precio',
    'aceite2Precio', 'aceiteCajaPrecio', 'manoObraPrecio'
];

servicePriceInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('input', calculateServiceTotal);
    }
});

// Función para mostrar/ocultar campos según el tipo de servicio
function toggleServiceFields() {
    const selectedType = serviceTypeSelect.value;
    
    if (selectedType === CONSTANTS.SERVICE_TYPES.SERVICE) {
        genericFields.style.display = 'none';
        serviceFields.style.display = 'block';
        calculateServiceTotal();
    } else {
        genericFields.style.display = 'block';
        serviceFields.style.display = 'none';
    }
}

// Función para calcular el total de Service automáticamente
function calculateServiceTotal() {
    const total = servicePriceInputs.reduce((sum, inputId) => {
        return sum + (parseFloat(document.getElementById(inputId).value) || 0);
    }, 0);
    
    totalServiceDisplay.value = total.toFixed(2);
}

// Función para manejar el envío del formulario
function handleSubmit(e) {
    e.preventDefault();
    
    const selectedType = document.getElementById('serviceType').value;
    let newService;
    
    if (selectedType === CONSTANTS.SERVICE_TYPES.SERVICE) {
        // Recopilar datos específicos de Service
        const serviceData = {
            filtros: {
                aceite: { producto: document.getElementById('filtroAceite').value, precio: parseFloat(document.getElementById('filtroAceitePrecio').value) || 0 },
                aire: { producto: document.getElementById('filtroAire').value, precio: parseFloat(document.getElementById('filtroAirePrecio').value) || 0 },
                combustible1: { producto: document.getElementById('filtroCombustible1').value, precio: parseFloat(document.getElementById('filtroCombustible1Precio').value) || 0 },
                combustible2: { producto: document.getElementById('filtroCombustible2').value, precio: parseFloat(document.getElementById('filtroCombustible2Precio').value) || 0 },
                habitaculo: { producto: document.getElementById('filtroHabitaculo').value, precio: parseFloat(document.getElementById('filtroHabitaculoPrecio').value) || 0 }
            },
            aceites: {
                aceite1: { producto: document.getElementById('aceite1').value, cantidad: document.getElementById('aceite1Cantidad').value, precio: parseFloat(document.getElementById('aceite1Precio').value) || 0 },
                aceite2: { producto: document.getElementById('aceite2').value, cantidad: document.getElementById('aceite2Cantidad').value, precio: parseFloat(document.getElementById('aceite2Precio').value) || 0 }
            },
            aceiteCaja: { producto: document.getElementById('aceiteCaja').value, cantidad: document.getElementById('aceiteCajaCantidad').value, precio: parseFloat(document.getElementById('aceiteCajaPrecio').value) || 0 },
            manoObra: { descripcion: document.getElementById('manoObra').value, precio: parseFloat(document.getElementById('manoObraPrecio').value) || 0 }
        };
        
        // Calcular costo total
        const totalCost = 
            serviceData.filtros.aceite.precio +
            serviceData.filtros.aire.precio +
            serviceData.filtros.combustible1.precio +
            serviceData.filtros.combustible2.precio +
            serviceData.filtros.habitaculo.precio +
            serviceData.aceites.aceite1.precio +
            serviceData.aceites.aceite2.precio +
            serviceData.aceiteCaja.precio +
            serviceData.manoObra.precio;
        
        newService = {
            id: editingServiceId || Date.now(),
            clientName: document.getElementById('clientName').value,
            vehiclePlate: document.getElementById('vehiclePlate').value,
            vehicleKm: parseInt(document.getElementById('vehicleKm').value),
            serviceType: selectedType,
            date: document.getElementById('serviceDate').value,
            cost: totalCost,
            serviceData: serviceData
        };
    } else {
        // Datos genéricos para otros tipos
        newService = {
            id: editingServiceId || Date.now(),
            clientName: document.getElementById('clientName').value,
            vehiclePlate: document.getElementById('vehiclePlate').value,
            vehicleKm: parseInt(document.getElementById('vehicleKm').value),
            serviceType: selectedType,
            description: document.getElementById('description').value,
            date: document.getElementById('date').value,
            cost: parseFloat(document.getElementById('cost').value)
        };
    }
    
    // Si estamos editando, actualizar; si no, insertar
    if (editingServiceId) {
        const index = services.findIndex(s => s.id === editingServiceId);
        if (index !== -1) {
            services[index] = newService;
        }
        showNotification(CONSTANTS.NOTIFICATIONS.SERVICE_UPDATED);
        cancelEditService();
    } else {
        services.push(newService);
        showNotification(CONSTANTS.NOTIFICATIONS.SERVICE_REGISTERED);
    }
    
    saveServices();
    serviceForm.reset();
    dateInput.value = today;
    serviceDateInput.value = today;
    toggleServiceFields();
    displayServices();
}

// Función para guardar en localStorage
function saveServices() {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
}

// Función para mostrar los servicios
function displayServices() {
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredServices = services.filter(service => {
        const matchesSearch = service.clientName.toLowerCase().includes(searchTerm);
        return matchesSearch;
    });
    
    if (filteredServices.length === 0) {
        serviceList.innerHTML = '<p class="no-services">No hay servicios registrados</p>';
        return;
    }
    
    serviceList.innerHTML = `
        <table class="services-table">
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Patente</th>
                    <th>Vehículo</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Costo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${filteredServices
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(service => `
                        <tr>
                            <td>${service.clientName}</td>
                            <td>${service.vehiclePlate}</td>
                            <td class="table-vehicle">-</td>
                            <td>${service.serviceType}</td>
                            <td>${formatDate(service.date)}</td>
                            <td class="table-cost">$${service.cost.toFixed(2)}</td>
                            <td class="table-actions">
                                <button onclick="editService(${service.id})" class="btn-edit-small">${CONSTANTS.BUTTON_LABELS.EDIT}</button>
                                <button onclick="deleteService(${service.id})" class="btn-delete-small">${CONSTANTS.BUTTON_LABELS.DELETE}</button>
                            </td>
                        </tr>
                    `).join('')}
            </tbody>
        </table>
    `;
}

// Función para editar servicio
function editService(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    editingServiceId = id;
    
    // Cargar datos en el formulario
    document.getElementById('clientName').value = service.clientName;
    document.getElementById('vehiclePlate').value = service.vehiclePlate;
    document.getElementById('vehicleKm').value = service.vehicleKm;
    document.getElementById('serviceType').value = service.serviceType;
    
    // Cambiar tipo de servicio para mostrar campos correctos
    toggleServiceFields();
    
    if (service.serviceType === CONSTANTS.SERVICE_TYPES.SERVICE) {
        // Cargar datos específicos de Service
        document.getElementById('serviceDate').value = service.date;
        
        const data = service.serviceData;
        document.getElementById('filtroAceite').value = data.filtros.aceite.producto;
        document.getElementById('filtroAceitePrecio').value = data.filtros.aceite.precio || '';
        document.getElementById('filtroAire').value = data.filtros.aire.producto;
        document.getElementById('filtroAirePrecio').value = data.filtros.aire.precio || '';
        document.getElementById('filtroCombustible1').value = data.filtros.combustible1.producto;
        document.getElementById('filtroCombustible1Precio').value = data.filtros.combustible1.precio || '';
        document.getElementById('filtroCombustible2').value = data.filtros.combustible2.producto;
        document.getElementById('filtroCombustible2Precio').value = data.filtros.combustible2.precio || '';
        document.getElementById('filtroHabitaculo').value = data.filtros.habitaculo.producto;
        document.getElementById('filtroHabitaculoPrecio').value = data.filtros.habitaculo.precio || '';
        
        document.getElementById('aceite1').value = data.aceites.aceite1.producto;
        document.getElementById('aceite1Cantidad').value = data.aceites.aceite1.cantidad;
        document.getElementById('aceite1Precio').value = data.aceites.aceite1.precio || '';
        document.getElementById('aceite2').value = data.aceites.aceite2.producto;
        document.getElementById('aceite2Cantidad').value = data.aceites.aceite2.cantidad;
        document.getElementById('aceite2Precio').value = data.aceites.aceite2.precio || '';
        
        document.getElementById('aceiteCaja').value = data.aceiteCaja.producto;
        document.getElementById('aceiteCajaCantidad').value = data.aceiteCaja.cantidad;
        document.getElementById('aceiteCajaPrecio').value = data.aceiteCaja.precio || '';
        
        document.getElementById('manoObra').value = data.manoObra.descripcion;
        document.getElementById('manoObraPrecio').value = data.manoObra.precio || '';
        
        calculateServiceTotal();
    } else {
        // Cargar datos genéricos
        document.getElementById('date').value = service.date;
        document.getElementById('description').value = service.description || '';
        document.getElementById('cost').value = service.cost || '';
    }
    
    // Cambiar texto del botón y desplazar al formulario
    const submitBtn = serviceForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Actualizar Servicio';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showNotification('Editando servicio - Modifica los datos y guarda');
}

// Función para cancelar edición
function cancelEditService() {
    editingServiceId = null;
    
    const submitBtn = serviceForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Registrar Servicio';
    
    // Limpiar el formulario solo al cancelar, no después de guardar
    // lo cual se hace en handleSubmit
}

// Función para eliminar servicio
function deleteService(id) {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
        services = services.filter(service => service.id !== id);
        saveServices();
        displayServices();
        showNotification(CONSTANTS.NOTIFICATIONS.SERVICE_DELETED);
    }
}

// ===== GESTIÓN DE PRODUCTOS =====

// Event Listener para navegar a productos
productsIcon.addEventListener('click', () => {
    window.location.href = '/productos';
});

// Actualizar datalists con productos
function updateProductDataLists() {
    const categoryMappings = {
        [CONSTANTS.PRODUCT_CATEGORIES.FILTRO_ACEITE]: 'filtroAceiteList',
        [CONSTANTS.PRODUCT_CATEGORIES.FILTRO_AIRE]: 'filtroAireList',
        [CONSTANTS.PRODUCT_CATEGORIES.FILTRO_COMBUSTIBLE]: 'filtroCombustibleList',
        [CONSTANTS.PRODUCT_CATEGORIES.FILTRO_HABITACULO]: 'filtroHabitaculoList',
        [CONSTANTS.PRODUCT_CATEGORIES.ACEITE_MOTOR]: 'aceiteMotorList',
        [CONSTANTS.PRODUCT_CATEGORIES.ACEITE_CAJA]: 'aceiteCajaList'
    };
    
    // Limpiar todos los datalists
    Object.values(categoryMappings).forEach(listId => {
        const datalist = document.getElementById(listId);
        if (datalist) datalist.innerHTML = '';
    });
    
    // Poblar datalists con productos
    products.forEach(product => {
        const listId = categoryMappings[product.category];
        if (listId) {
            const datalist = document.getElementById(listId);
            if (datalist) {
                const option = document.createElement('option');
                option.value = product.name;
                option.setAttribute('data-price', product.price);
                datalist.appendChild(option);
            }
        }
    });
}

// Event listeners para autorrellenar precios
const productInputMappings = [
    { input: 'filtroAceite', price: 'filtroAceitePrecio', category: CONSTANTS.PRODUCT_CATEGORIES.FILTRO_ACEITE },
    { input: 'filtroAire', price: 'filtroAirePrecio', category: CONSTANTS.PRODUCT_CATEGORIES.FILTRO_AIRE },
    { input: 'filtroCombustible1', price: 'filtroCombustible1Precio', category: CONSTANTS.PRODUCT_CATEGORIES.FILTRO_COMBUSTIBLE },
    { input: 'filtroCombustible2', price: 'filtroCombustible2Precio', category: CONSTANTS.PRODUCT_CATEGORIES.FILTRO_COMBUSTIBLE },
    { input: 'filtroHabitaculo', price: 'filtroHabitaculoPrecio', category: CONSTANTS.PRODUCT_CATEGORIES.FILTRO_HABITACULO },
    { input: 'aceite1', price: 'aceite1Precio', category: CONSTANTS.PRODUCT_CATEGORIES.ACEITE_MOTOR },
    { input: 'aceite2', price: 'aceite2Precio', category: CONSTANTS.PRODUCT_CATEGORIES.ACEITE_MOTOR },
    { input: 'aceiteCaja', price: 'aceiteCajaPrecio', category: CONSTANTS.PRODUCT_CATEGORIES.ACEITE_CAJA }
];

productInputMappings.forEach(mapping => {
    const inputElement = document.getElementById(mapping.input);
    const priceElement = document.getElementById(mapping.price);
    
    if (inputElement && priceElement) {
        inputElement.addEventListener('input', () => {
            const selectedValue = inputElement.value;
            const product = products.find(p => p.name === selectedValue && p.category === mapping.category);
            
            if (product) {
                priceElement.value = product.price.toFixed(2);
                calculateServiceTotal();
            }
        });
    }
});

// Inicializar
displayServices();
updateProductDataLists();

// ============================================
// FUNCIONES DE EXPORTAR/IMPORTAR EXCEL
// ============================================

async function exportarTrabajos() {
    await exportData('/api/export/trabajos', { services }, 'No hay trabajos para exportar');
}

async function importarTrabajos() {
    const result = await importData('/api/import/trabajos', 'services');
    
    if (!result) return;

    // Preguntar si desea sobrescribir o fusionar
    const overwrite = confirm(
        `Se encontraron ${result.services.length} trabajos en Excel.\n\n` +
        'Haz clic en "Aceptar" para REEMPLAZAR todos los trabajos actuales.\n' +
        'Haz clic en "Cancelar" para AGREGAR a los trabajos existentes.'
    );

    if (overwrite) {
        services = result.services;
    } else {
        // Fusionar evitando duplicados por ID
        const existingIds = new Set(services.map(s => s.id));
        const newServices = result.services.filter(s => !existingIds.has(s.id));
        services = [...services, ...newServices];
        showNotification(`✅ ${newServices.length} trabajos nuevos agregados`);
    }

    saveServices();
    displayServices();
    showNotification(result.message);
}
