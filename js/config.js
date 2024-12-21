// Configurações da área administrativa
const CONFIG = {
    // URL base do catálogo (ajuste conforme necessário)
    CATALOG_BASE_URL: '../catalogo_flow/',
    
    // Credenciais de acesso (em produção, isso deveria estar em um servidor seguro)
    ADMIN_CREDENTIALS: {
        username: 'admin',
        password: 'admin123'
    },
    
    // Configurações de armazenamento
    STORAGE_KEYS: {
        products: 'catalog_products',
        auth: 'admin_auth'
    },

    // URLs do sistema
    URLS: {
        catalog: '../catalogo_flow/catalogo.html',
        login: './login.html',
        admin: './index.html'
    }
};

// Funções de utilidade para gerenciar produtos
const ProductManager = {
    // Carregar produtos
    loadProducts: function() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.products) || '[]');
    },

    // Salvar produtos
    saveProducts: function(products) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.products, JSON.stringify(products));
        this.notifyCatalog();
    },

    // Adicionar produto
    addProduct: function(product) {
        const products = this.loadProducts();
        products.push({
            ...product,
            id: Date.now()
        });
        this.saveProducts(products);
        return true;
    },

    // Atualizar produto
    updateProduct: function(id, updatedProduct) {
        let products = this.loadProducts();
        const index = products.findIndex(p => p.id === id);
        
        if (index !== -1) {
            products[index] = { ...updatedProduct, id };
            this.saveProducts(products);
            return true;
        }
        return false;
    },

    // Deletar produto
    deleteProduct: function(id) {
        let products = this.loadProducts();
        const initialLength = products.length;
        products = products.filter(p => p.id !== id);
        
        if (products.length !== initialLength) {
            this.saveProducts(products);
            return true;
        }
        return false;
    },

    // Notificar o catálogo sobre mudanças
    notifyCatalog: function() {
        // Disparar evento para notificar o catálogo sobre mudanças
        const event = new CustomEvent('catalogUpdate', {
            detail: {
                products: this.loadProducts(),
                timestamp: new Date().getTime()
            }
        });
        window.dispatchEvent(event);
        
        // Se o catálogo estiver aberto em outra janela, notificar através do localStorage
        localStorage.setItem('catalog_update_timestamp', new Date().getTime());
    }
};

// Funções de autenticação
const AuthManager = {
    // Verificar login
    checkLogin: function() {
        const authToken = sessionStorage.getItem(CONFIG.STORAGE_KEYS.auth);
        if (!authToken) {
            window.location.href = CONFIG.URLS.login;
            return false;
        }
        return true;
    },

    // Fazer login
    login: function(username, password) {
        if (username === CONFIG.ADMIN_CREDENTIALS.username && 
            password === CONFIG.ADMIN_CREDENTIALS.password) {
            sessionStorage.setItem(CONFIG.STORAGE_KEYS.auth, 'true');
            return true;
        }
        return false;
    },

    // Fazer logout
    logout: function() {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.auth);
        window.location.href = CONFIG.URLS.login;
    }
};

// Funções de UI
const UIManager = {
    // Mostrar notificação
    showToast: function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Limpar formulário
    clearForm: function(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.style.display = 'none';
                preview.src = '';
            }
        }
    }
};

// Exportar configurações e gerenciadores
window.AdminConfig = CONFIG;
window.ProductManager = ProductManager;
window.AuthManager = AuthManager;
window.UIManager = UIManager;
