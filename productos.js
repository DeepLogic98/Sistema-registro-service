// Elementos del DOM
const productForm = document.getElementById('productForm');
const productsList = document.getElementById('productsList');
const categoryFilter = document.getElementById('categoryFilter');
const homeIcon = document.getElementById('homeIcon');

// Datos
let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [];

// Event Listeners
productForm.addEventListener('submit', handleSubmit);
categoryFilter.addEventListener('input', displayProducts);

// Navegación
homeIcon.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Función para manejar el envío del formulario
function handleSubmit(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        category: document.getElementById('productCategory').value,
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value
    };
    
    products.push(newProduct);
    saveProducts();
    displayProducts();
    productForm.reset();
    showNotification('Producto agregado exitosamente');
}

// Función para guardar en localStorage
function saveProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

// Función para mostrar los productos
function displayProducts() {
    const selectedCategory = categoryFilter.value;
    
    const filteredProducts = products.filter(product => {
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesCategory;
    });
    
    if (filteredProducts.length === 0) {
        productsList.innerHTML = '<p class="no-products">No hay productos registrados</p>';
        return;
    }
    
    productsList.innerHTML = `
        <div class="list-header">
            <div>Nombre del Producto</div>
            <div>Precio</div>
            <div>Acciones</div>
        </div>
    ` + filteredProducts
        .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
        .map(product => `
            <div class="list-item">
                <div class="list-item-name">${product.name}</div>
                <div class="list-item-price">$${product.price.toFixed(2)}</div>
                <div class="list-item-actions">
                    <button onclick="editProduct(${product.id})" class="btn-edit-small">Editar</button>
                    <button onclick="deleteProduct(${product.id})" class="btn-delete-small">Eliminar</button>
                </div>
            </div>
        `).join('');
}

// Función para editar producto
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        
        // Eliminar el producto antiguo al editar
        products = products.filter(p => p.id !== id);
        saveProducts();
        displayProducts();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showNotification('Editando producto - Modifica los datos y guarda');
    }
}

// Función para eliminar producto
function deleteProduct(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        products = products.filter(product => product.id !== id);
        saveProducts();
        displayProducts();
        showNotification('Producto eliminado');
    }
}

// Inicializar
displayProducts();

// ============================================
// FUNCIONES DE EXPORTAR/IMPORTAR EXCEL
// ============================================

async function exportarProductos() {
    await exportData('/api/export/productos', { products }, 'No hay productos para exportar');
}

async function importarProductos() {
    const result = await importData('/api/import/productos', 'products');
    
    if (!result) return;

    // Preguntar si desea sobrescribir o fusionar
    const overwrite = confirm(
        `Se encontraron ${result.products.length} productos en Excel.\n\n` +
        'Haz clic en "Aceptar" para REEMPLAZAR todos los productos actuales.\n' +
        'Haz clic en "Cancelar" para AGREGAR a los productos existentes.'
    );

    if (overwrite) {
        products = result.products;
    } else {
        // Fusionar evitando duplicados por ID
        const existingIds = new Set(products.map(p => p.id));
        const newProducts = result.products.filter(p => !existingIds.has(p.id));
        products = [...products, ...newProducts];
        showNotification(`✅ ${newProducts.length} productos nuevos agregados`);
    }

    saveProducts();
    displayProducts();
    showNotification(result.message);
}

