document.addEventListener('DOMContentLoaded', function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartModal = document.getElementById('cartModal');
    const purchaseModal = document.getElementById('purchaseModal');
    const openModalButton = document.getElementById('openModalButton');
    const closeCartModalButton = document.querySelector('.close-button');
    const closePurchaseModalButton = document.querySelectorAll('#purchaseModal .close-button')[0];
    const cartProductsContainer = document.querySelector('.carrito-productos');
    const totalElement = document.getElementById('total');
    const emptyCartButton = document.querySelector('.carrito-acciones-vaciar');
    const buyNowButton = document.querySelector('.carrito-acciones-comprar');
    const productsContainer = document.querySelector('.contenedor-productos');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const alertElement = document.getElementById('alert'); 
    const paymentForm = document.getElementById('paymentForm');
    const paymentMessage = document.getElementById('paymentMessage');

    // Función para tomar datos manga de la API Jikan
    async function fetchMangas(query = '') {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/manga${query ? '?q=' + encodeURIComponent(query) : ''}`);
            const data = await response.json();
            displayMangas(data.data);
        } catch (error) {
            console.error('Error fetching manga data:', error);
        }
    }

    // Función para generar un precio aleatorio 
    function getRandomPrice(min = 5, max = 50) {
        return (Math.random() * (max - min) + min).toFixed(2);
    }

    // Función para mostrar mangas
    function displayMangas(mangas) {
        productsContainer.innerHTML = '';
        mangas.forEach(manga => {
            const price = getRandomPrice(); 
            productsContainer.innerHTML += `
                <div class="producto">
                    <img src="${manga.images.jpg.image_url}" alt="${manga.title}">
                    <div class="producto-detalle">
                        <h3 class="producto-titulo">${manga.title}</h3>
                        <p class="producto-precio">$${price}</p>
                        <button class="producto-agregar" data-producto="${manga.title}" data-precio="${price}">Agregar</button>
                    </div>
                </div>
            `;
        });
        attachAddToCartListeners();
    }

    // Funcion para mostrar la alerta
    function showAlert(message) {
        alertElement.textContent = message;
        alertElement.classList.add('show');
        setTimeout(() => {
            alertElement.classList.remove('show');
        }, 3000); 
    }

    // Función para actualizar el carrito
    function updateCart() {
        cartProductsContainer.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            cartProductsContainer.innerHTML += `
                <div class="carrito-producto">
                    <img class="carrito-producto-imagen" src="${item.image}" alt="${item.name}">
                    <div class="carrito-producto-titulo">
                        <small>Titulo</small>
                        <h3>${item.name}</h3>
                    </div>
                    <div class="carrito-producto-cantidad">
                        <small>Cantidad</small>
                        <p>${item.quantity}</p>
                    </div>
                    <div class="carrito-producto-precio">
                        <small>Precio</small>
                        <p>$${item.price}</p>
                    </div>
                    <div class="carrito-producto-subtotal">
                        <small>Subtotal</small>
                        <p>$${item.price * item.quantity}</p>
                    </div>
                    <button class="carrito-producto-eliminar" data-index="${index}"><i class="bi bi-trash2"></i></button>
                </div>
            `;
        });
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Función para guardar el carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Función para adjuntar detectores de eventos a los botones "Agregar al carrito"
    function attachAddToCartListeners() {
        document.querySelectorAll('.producto-agregar').forEach(button => {
            button.addEventListener('click', function() {
                const productName = this.getAttribute('data-producto');
                const productPrice = parseFloat(this.getAttribute('data-precio'));
                const productImage = this.parentElement.previousElementSibling.src;

                //Comprueba si el producto ya está en el carrito
                const existingProduct = cart.find(item => item.name === productName);
                if (existingProduct) {
                    existingProduct.quantity += 1;
                } else {
                    cart.push({
                        name: productName,
                        price: productPrice,
                        quantity: 1,
                        image: productImage
                    });
                }
                saveCart();
                showAlert(`Se agregó "${productName}" al carrito.`); 
            });
        });
    }

    // Función para manejar el envío del formulario de pago
    function handlePaymentFormSubmit(event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const expiryDate = document.getElementById('expiryDate').value.trim();
        const cvv = document.getElementById('cvv').value.trim();

        if (name === '' || cardNumber === '' || expiryDate === '' || cvv === '') {
            paymentMessage.textContent = 'Por favor, complete todos los campos.';
            paymentMessage.style.color = 'red';
            return;
        }

        cart.length = 0; 
        saveCart();
        updateCart();
        paymentMessage.textContent = '¡Compra Exitosa!. Ahora eres un poco mas otaku';
        paymentMessage.style.color = 'green';
        setTimeout(() => {
            purchaseModal.style.display = 'none';
        }, 1000); 
    }

    
    fetchMangas();

    openModalButton.addEventListener('click', function() {
        updateCart();
        cartModal.style.display = 'block';
    });

    // Cerrar evento modal del carrito
    closeCartModalButton.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });

    //Cerrar modal de carrito al hacer clic fuera del modal
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Abrir modal de compra
    buyNowButton.addEventListener('click', function() {
        if (cart.length === 0) {
            showAlert('El carrito está vacío.');
            return;
        }
        purchaseModal.style.display = 'block';
    });

    // Cerrar modal de compra
    closePurchaseModalButton.addEventListener('click', function() {
        purchaseModal.style.display = 'none';
    });

    //Cerrar modal de compra al hacer clic fuera del modal
    window.addEventListener('click', function(event) {
        if (event.target === purchaseModal) {
            purchaseModal.style.display = 'none';
        }
    });

    // Quitar producto del carrito
    cartProductsContainer.addEventListener('click', function(event) {
        if (event.target.closest('.carrito-producto-eliminar')) {
            const index = event.target.closest('.carrito-producto-eliminar').getAttribute('data-index');
            cart.splice(index, 1);
            saveCart();
            updateCart();
        }
    });

    // Vaciar el carrito
    emptyCartButton.addEventListener('click', function() {
        cart.length = 0; 
        saveCart();
        updateCart();
    });

    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        fetchMangas(query);
    });

    // Busca el detector de eventos de entrada para activar la búsqueda con la tecla "Enter"
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    paymentForm.addEventListener('submit', handlePaymentFormSubmit);

    // Actualización inicial del carrito
    updateCart();
});
