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
                    game_title,
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

        // Identificador corto.
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

        orderItems.forEach(function (item) {

            const listItem = document.createElement("li");

            listItem.textContent =
                item.game_title +
                " x " + item.quantity +
                " — " + formatOrderPrice(item.line_total);

            itemsList.appendChild(listItem);

        });


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