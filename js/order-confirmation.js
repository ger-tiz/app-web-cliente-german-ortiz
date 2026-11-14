// ========================================
// ORDER CONFIRMATION
// ========================================

const ORDER_STORAGE_KEY = "brutalGamingLastOrder";

// Formato de moneda argentina
const currencyFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
});

// Formato de fecha argentina
const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short"
});


// ========================================
// FUNCIONES DE FORMATO
// ========================================

function formatPrice(priceInCents) {
    return currencyFormatter.format(priceInCents / 100);
}

function formatDate(date) {
    return dateFormatter.format(new Date(date));
}

function getPaymentMethod(method) {
    const methods = {
        card: "Tarjeta de crédito/débito",
        "mercado-pago": "Mercado Pago"
    };

    return methods[method] || "Método no especificado";
}


// ========================================
// RECUPERAR PEDIDO
// ========================================

function getSavedOrder() {
    const savedOrder = sessionStorage.getItem(ORDER_STORAGE_KEY);

    if (!savedOrder) {
        return null;
    }

    try {
        return JSON.parse(savedOrder);
    } catch (error) {
        console.error("Error al recuperar el pedido:", error);
        return null;
    }
}



function displayOrder(order) {

    document.getElementById("order-id").textContent =
        order.orderId || "No disponible";

    document.getElementById("order-date").textContent =
        formatDate(order.createdAt);

    document.getElementById("order-payment").textContent =
        getPaymentMethod(order.paymentMethod);

    document.getElementById("order-customer").textContent =
        order.customer.name || "No disponible";

    document.getElementById("order-email").textContent =
        order.customer.email || "No disponible";


    // ========================================
    // MOSTRAR PRODUCTOS
    // ========================================

    const orderItems = document.getElementById("order-items");

    orderItems.innerHTML = "";

    order.items.forEach(function (item) {

        const listItem = document.createElement("li");
        listItem.classList.add("order-item");

        // Imagen del producto.
        const productImage = document.createElement("img");

        productImage.src = item.image || "images/default-game.png";
        productImage.alt = item.title;
        productImage.classList.add("order-item-image");

        // Información del producto.
        const productInformation = document.createElement("div");
        productInformation.classList.add("order-item-information");

        const productName = document.createElement("span");

        productName.textContent =
            `${item.title} x ${item.quantity}`;

        const productType = document.createElement("small");

        productType.textContent =
            item.item_type === "special_product"
                ? "Producto especial"
                : "Videojuego";

        const productPrice = document.createElement("strong");

        productPrice.textContent =
            formatPrice(item.priceCents * item.quantity);

        productInformation.append(
            productName,
            productType,
            productPrice
        );

        listItem.append(
            productImage,
            productInformation
        );

        orderItems.appendChild(listItem);

    });


    // ========================================
    // MOSTRAR TOTALES
    // ========================================

    document.getElementById("order-subtotal").textContent =
        formatPrice(order.subtotal);

    document.getElementById("order-iva").textContent =
        formatPrice(order.iva);

    document.getElementById("order-total").textContent =
        formatPrice(order.total);
}



// ========================================
// MOSTRAR ERROR
// ========================================

function displayOrderError() {

    const confirmationContent =
        document.getElementById("confirmation-content");

    const confirmationError =
        document.getElementById("confirmation-error");

    confirmationContent.hidden = true;
    confirmationError.hidden = false;
}


// ========================================
// INICIALIZAR PÁGINA
// ========================================

function initializeOrderConfirmation() {

    const order = getSavedOrder();

    // Verificar que exista un pedido aprobado
    if (
        !order ||
        order.status !== "approved" ||
        !order.customer ||
        !Array.isArray(order.items)
    ) {
        displayOrderError();
        return;
    }

    displayOrder(order);
}


// ========================================
// EJECUTAR
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    initializeOrderConfirmation
);