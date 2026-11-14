// ============================================
// HISTORIAL DE COMPRAS
// BRUTAL GAMING ARGENTINA
// ============================================


// ============================================
// ELEMENTOS DEL DOM
// ============================================

const accountLogin = document.querySelector(".account-login");
const accountDashboard = document.getElementById("account-dashboard");
const accountUsername = document.getElementById("account-username");
const orderHistoryList = document.getElementById("order-history-list");


// ============================================
// FORMATO DE DATOS
// ============================================

const orderCurrencyFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

const orderDateFormatter = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short"
});


function formatOrderPrice(price) {
    return orderCurrencyFormatter.format(Number(price));
}


function formatOrderDate(date) {
    return orderDateFormatter.format(new Date(date));
}


// ============================================
// CONSULTAR HISTORIAL EN SUPABASE
// ============================================

async function loadOrderHistory(user) {

    orderHistoryList.textContent = "Cargando historial de compras...";

    try {

        const { data: orders, error } = await window.supabaseClient
            .from("orders")
            .select(`
                id,
                created_at,
                status,
                payment_method,
                total,
                order_items (
                    id,
                    game_title,
                    item_type,
                    delivery_status,
                    unit_price,
                    quantity,
                    line_total
                )
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        // Recuperar los identificadores de los artículos comprados.

const orderItemIds = orders.flatMap(function (order) {

    return (order.order_items || []).map(function (item) {
        return item.id;
    });

});


// Consultar las claves asignadas a esos artículos.

let assignedKeys = [];

if (orderItemIds.length > 0) {

    const { data: keys, error: keysError } = await window.supabaseClient
        .from("mystery_key_inventory")
        .select("id, order_item_id, key_code, game_id, assigned_at")
        .in("order_item_id", orderItemIds)
        .order("assigned_at", { ascending: true });

    if (keysError) {
        throw keysError;
    }

    assignedKeys = keys || [];
    // Recuperar los nombres de los videojuegos asociados a las claves.

const gameIds = [...new Set(
    assignedKeys
        .map(function (key) {
            return key.game_id;
        })
        .filter(Boolean)
)];

if (gameIds.length > 0) {

    const { data: games, error: gamesError } =
        await window.supabaseClient
            .from("games")
            .select("id, title")
            .in("id", gameIds);

    if (gamesError) {
        throw gamesError;
    }

    assignedKeys.forEach(function (key) {

        const game = games.find(function (game) {
            return game.id === key.game_id;
        });

        key.game_title = game ? game.title : "Videojuego no encontrado";

    });

}

}


// Asociar las claves con sus respectivos artículos.

orders.forEach(function (order) {

    (order.order_items || []).forEach(function (item) {

        item.assignedKeys = assignedKeys.filter(function (key) {
            return key.order_item_id === item.id;
        });

    });

});


renderOrderHistory(orders);

    } catch (error) {

        console.error("Error al recuperar el historial:", error);

        orderHistoryList.textContent =
            "No se pudo cargar el historial de compras. Intentá nuevamente.";

    }

}

// ============================================
// MOSTRAR HISTORIAL
// ============================================

function renderOrderHistory(orders) {

    orderHistoryList.replaceChildren();

    if (!orders || orders.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.textContent =
            "Todavía no realizaste ninguna compra.";

        orderHistoryList.appendChild(emptyMessage);

        return;
    }

    orders.forEach(function (order) {

        // ========================================
        // TARJETA DEL PEDIDO
        // ========================================

        const orderArticle = document.createElement("article");
        orderArticle.className = "order-card";

        const orderTitle = document.createElement("h3");

        orderTitle.textContent =
            "Pedido #" + order.id.substring(0, 8);


        // ========================================
        // INFORMACIÓN DEL PEDIDO
        // ========================================

        const orderDate = document.createElement("p");

        orderDate.textContent =
            "Fecha: " + formatOrderDate(order.created_at);


        const orderStatus = document.createElement("p");

        orderStatus.textContent =
            "Estado: " + getOrderStatus(order.status);


        const orderPayment = document.createElement("p");

        orderPayment.textContent =
            "Método de pago: " +
            getOrderPaymentMethod(order.payment_method);


        const orderTotal = document.createElement("p");

        orderTotal.className = "order-total";

        orderTotal.textContent =
            "Total: " + formatOrderPrice(order.total);


        // ========================================
        // BOTÓN VER DETALLES
        // ========================================

        const detailsButton = document.createElement("button");

        detailsButton.type = "button";
        detailsButton.className = "order-details-button";
        detailsButton.textContent = "Ver detalles";
        detailsButton.setAttribute("aria-expanded", "false");


        // ========================================
        // CONTENEDOR DE PRODUCTOS
        // ========================================

        const orderDetails = document.createElement("div");

        orderDetails.className = "order-details";
        orderDetails.hidden = true;


        const itemsTitle = document.createElement("h4");

        itemsTitle.textContent = "Productos";


        const itemsList = document.createElement("ul");

        const orderItems = order.order_items || [];


        // ========================================
        // RECORRER PRODUCTOS
        // ========================================

        orderItems.forEach(function (item) {

            const listItem = document.createElement("li");
            listItem.className = "order-history-product";


            // Tipo de producto.

            const productType =
                item.item_type === "special_product"
                    ? "Producto especial"
                    : "Videojuego";


            // Nombre y cantidad.

            const productName = document.createElement("span");

            productName.textContent =
                item.game_title + " x " + item.quantity;


            // Etiqueta del tipo.

            const productTypeLabel = document.createElement("small");

            productTypeLabel.textContent = productType;


            // Precio.

            const productPrice = document.createElement("strong");

            productPrice.textContent =
                formatOrderPrice(item.line_total);


            listItem.append(
                productName,
                productTypeLabel,
                productPrice
            );


            // ====================================
            // ENTREGA DE PRODUCTOS ESPECIALES
            // ====================================

            if (item.item_type === "special_product") {

                const deliveryStatus = document.createElement("small");

                deliveryStatus.textContent =
                    item.delivery_status === "delivered"
                        ? "Entrega: Entregado"
                        : "Entrega: Pendiente";

                listItem.appendChild(deliveryStatus);


                const assignedKeys = item.assignedKeys || [];


                if (assignedKeys.length > 0) {

                    const keysContainer = document.createElement("div");

                    keysContainer.className = "order-keys";


                    const keysTitle = document.createElement("strong");

                    keysTitle.textContent =
                        "Tus códigos de activación:";

                    keysContainer.appendChild(keysTitle);


                    assignedKeys.forEach(function (key) {

                        const keyRow = document.createElement("div");

                        keyRow.className = "order-key-row";


                        const gameTitle = document.createElement("strong");

                        gameTitle.textContent = key.game_title || "Videojuego";


                        const keyCode = document.createElement("code");

                        keyCode.textContent = key.key_code;


                        const copyButton = document.createElement("button");

                        copyButton.type = "button";
                        copyButton.textContent = "Copiar";
                        copyButton.className = "copy-key-button";


                        copyButton.addEventListener("click", async function () {

                            try {

                                await navigator.clipboard.writeText(key.key_code);

                                copyButton.textContent = "¡Copiado!";

                                setTimeout(function () {
                                    copyButton.textContent = "Copiar";
                                }, 2000);

                            } catch (error) {

                                console.error(
                                    "Error al copiar la clave:",
                                    error
                                );

                                copyButton.textContent = "No se pudo copiar";

                            }

                        });


                        keyRow.append(
                            gameTitle,
                            keyCode,
                            copyButton
                        );

                        keysContainer.appendChild(keyRow);

                    });


                    listItem.appendChild(keysContainer);

                } else {

                    const pendingMessage = document.createElement("small");

                    pendingMessage.textContent =
                        "Todavía no hay códigos asignados a esta compra.";

                    listItem.appendChild(pendingMessage);

                }

            }


            // Agregar producto a la lista.

            itemsList.appendChild(listItem);

        });


        // Agregar título y lista al contenedor.

        orderDetails.append(itemsTitle, itemsList);


        // ========================================
        // EVENTO DEL BOTÓN
        // ========================================

        detailsButton.addEventListener("click", function () {

            const isExpanded =
                detailsButton.getAttribute("aria-expanded") === "true";

            orderDetails.hidden = isExpanded;

            detailsButton.setAttribute(
                "aria-expanded",
                String(!isExpanded)
            );

            detailsButton.textContent =
                isExpanded ? "Ver detalles" : "Ocultar detalles";

        });


        // ========================================
        // CONSTRUIR TARJETA
        // ========================================

        orderArticle.append(
            orderTitle,
            orderDate,
            orderStatus,
            orderPayment,
            orderTotal,
            detailsButton,
            orderDetails
        );

        orderHistoryList.appendChild(orderArticle);

    });
}

// ============================================
// TRADUCIR ESTADOS
// ============================================

function getOrderStatus(status) {

    const statuses = {
        approved: "Aprobado",
        pending: "Pendiente",
        cancelled: "Cancelado"
    };

    return statuses[status] || "No especificado";

}

// ============================================
// TRADUCIR MÉTODOS DE PAGO
// ============================================

function getOrderPaymentMethod(method) {

    const methods = {
        card: "Tarjeta de crédito/débito",
        "mercado-pago": "Mercado Pago"
    };

    return methods[method] || "No especificado";

}


// ============================================
// INICIALIZAR HISTORIAL
// ============================================

async function initializeOrderHistory() {

    if (!window.supabaseClient) {

        console.error("Supabase no está inicializado.");

        return;
    }

    try {

        const { data, error } =
            await window.supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        const user = data.session?.user;

        // Usuario sin sesión.

        if (!user) {

            accountLogin.hidden = false;
            accountDashboard.hidden = true;

            return;
        }

        // Usuario autenticado.

        accountLogin.hidden = true;
        accountDashboard.hidden = false;

        // Recuperar nombre de usuario.

        const { data: profile, error: profileError } =
            await window.supabaseClient
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .single();

        if (profileError) {
            throw profileError;
        }

        accountUsername.textContent = profile.username;

        // Recuperar pedidos.

        await loadOrderHistory(user);

    } catch (error) {

        console.error("Error al inicializar la cuenta:", error);

        orderHistoryList.textContent =
            "No se pudo cargar la información de tu cuenta.";

    }

}


// ============================================
// EJECUTAR
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    initializeOrderHistory
);

// ============================================
// DETECTAR CAMBIOS EN LA SESIÓN
// ============================================

window.supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        setTimeout(() => {

            // Usuario cerró sesión.
            if (event === "SIGNED_OUT") {

                accountLogin.hidden = false;
                accountDashboard.hidden = true;

                accountUsername.textContent = "";

                orderHistoryList.replaceChildren();

                return;
            }

            // Usuario inició sesión.
            if (event === "SIGNED_IN" && session?.user) {

                initializeOrderHistory();

            }

        }, 0);
    }
);