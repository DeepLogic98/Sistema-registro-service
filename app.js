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
    
    if (selectedType === 'Service') {
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
    
    if (selectedType === 'Service') {
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
            id: Date.now(),
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
            id: Date.now(),
            clientName: document.getElementById('clientName').value,
            vehiclePlate: document.getElementById('vehiclePlate').value,
            vehicleKm: parseInt(document.getElementById('vehicleKm').value),
            serviceType: selectedType,
            description: document.getElementById('description').value,
            date: document.getElementById('date').value,
            cost: parseFloat(document.getElementById('cost').value)
        };
    }
    
    services.push(newService);
    saveServices();
    serviceForm.reset();
    dateInput.value = today;
    serviceDateInput.value = today;
    toggleServiceFields();
    displayServices();
    
    showNotification('Servicio registrado exitosamente');
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
        <div class="list-header">
            <div>Cliente</div>
            <div>Patente</div>
            <div>Tipo</div>
            <div>Fecha</div>
            <div>Costo</div>
            <div>Acciones</div>
        </div>
    ` + filteredServices
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(service => `
            <div class="list-item">
                <div class="list-item-client">${service.clientName}</div>
                <div class="list-item-plate">${service.vehiclePlate}</div>
                <div class="list-item-type">${service.serviceType}</div>
                <div class="list-item-date">${formatDate(service.date)}</div>
                <div class="list-item-cost">$${service.cost.toFixed(2)}</div>
                <div class="list-item-actions">
                    <button onclick="deleteService(${service.id})" class="btn-delete-small">Eliminar</button>
                </div>
            </div>
        `).join('');
}

// Función para eliminar servicio
function deleteService(id) {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
        services = services.filter(service => service.id !== id);
        saveServices();
        displayServices();
        showNotification('Servicio eliminado');
    }
}

// ===== GESTIÓN DE PRODUCTOS =====

// Event Listener para navegar a productos
productsIcon.addEventListener('click', () => {
    window.location.href = 'productos.html';
});

// Actualizar datalists con productos
function updateProductDataLists() {
    const categoryMappings = {
        'Filtro de Aceite': 'filtroAceiteList',
        'Filtro de Aire': 'filtroAireList',
        'Filtro de Combustible': 'filtroCombustibleList',
        'Filtro de Habitáculo': 'filtroHabitaculoList',
        'Aceite de Motor': 'aceiteMotorList',
        'Aceite de Caja': 'aceiteCajaList'
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
    { input: 'filtroAceite', price: 'filtroAceitePrecio', category: 'Filtro de Aceite' },
    { input: 'filtroAire', price: 'filtroAirePrecio', category: 'Filtro de Aire' },
    { input: 'filtroCombustible1', price: 'filtroCombustible1Precio', category: 'Filtro de Combustible' },
    { input: 'filtroCombustible2', price: 'filtroCombustible2Precio', category: 'Filtro de Combustible' },
    { input: 'filtroHabitaculo', price: 'filtroHabitaculoPrecio', category: 'Filtro de Habitáculo' },
    { input: 'aceite1', price: 'aceite1Precio', category: 'Aceite de Motor' },
    { input: 'aceite2', price: 'aceite2Precio', category: 'Aceite de Motor' },
    { input: 'aceiteCaja', price: 'aceiteCajaPrecio', category: 'Aceite de Caja' }
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
