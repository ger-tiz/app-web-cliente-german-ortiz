// ============================================
// CHECKOUT
// BRUTAL GAMING ARGENTINA
// ============================================


// ============================================
// CONFIGURACIÓN
// ============================================

const CHECKOUT_CART_KEY = "brutalGamingCart";
const CHECKOUT_RESULT_KEY = "brutalGamingLastOrder";
const IVA_RATE = 21;


// ============================================
// ELEMENTOS DEL DOM
// ============================================

const checkoutForm = document.getElementById("checkout-form");

const checkoutItems = document.getElementById("checkout-items");

const checkoutSubtotal = document.getElementById("checkout-subtotal");

const checkoutIva = document.getElementById("checkout-iva");

const checkoutTotal = document.getElementById("checkout-total");

const checkoutMessage = document.getElementById("checkout-message");

const checkoutSubmit = document.getElementById("checkout-submit");

const paymentRadios = document.querySelectorAll(
    'input[name="payment-method"]'
);

const cardPanel = document.getElementById("card-panel");

const mercadoPagoPanel = document.getElementById("mercado-pago-panel");


// ============================================
// ESTADO
// ============================================

let checkoutCart = [];
let checkoutGames = [];
let checkoutIsProcessing = false;
let checkoutApproved = false;


// ============================================
// FORMATO DE PRECIOS
// ============================================

function formatCheckoutPrice(price) {

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(price);

}


// ============================================
// RECUPERAR CARRITO
// ============================================

function getCheckoutCart() {

    try {

        const cart = JSON.parse(
            localStorage.getItem(CHECKOUT_CART_KEY)
        );

        return Array.isArray(cart) ? cart : [];

    } catch (error) {

        console.error("Error al recuperar el carrito:", error);

        return [];

    }

}


// ============================================
// MENSAJES
// ============================================

function showCheckoutMessage(message, type = "info") {

    checkoutMessage.textContent = message;

    checkoutMessage.className = type;

}


// ============================================
// MOSTRAR PANEL SEGÚN MÉTODO
// ============================================

function updatePaymentPanel() {

    const selectedMethod = checkoutForm.querySelector(
        'input[name="payment-method"]:checked'
    );

    const method = selectedMethod ? selectedMethod.value : null;

    cardPanel.hidden = method !== "card";

    mercadoPagoPanel.hidden = method !== "mercado-pago";

    // Los campos de tarjeta solo son obligatorios
    // cuando el usuario selecciona tarjeta.

    const cardFields = [
        document.getElementById("card-number"),
        document.getElementById("card-holder"),
        document.getElementById("card-expiry"),
        document.getElementById("card-cvv")
    ];

    cardFields.forEach(function (field) {

        field.required = method === "card";

    });

}


// ============================================
// REPRESENTACIÓN VISUAL DE TARJETA
// ============================================

function updateCardPreview() {

    const number = document.getElementById("card-number").value;

    const holder = document.getElementById("card-holder").value;

    const expiry = document.getElementById("card-expiry").value;

    document.getElementById("card-preview-number").textContent =
        number || "•••• •••• •••• ••••";

    document.getElementById("card-preview-holder").textContent =
        holder.toUpperCase() || "TITULAR";

    document.getElementById("card-preview-expiry").textContent =
        expiry || "MM/AA";

}


// ============================================
// VALIDAR DATOS FICTICIOS DE TARJETA
// ============================================

function validateCard() {

    const number = document.getElementById("card-number").value
        .replace(/\s/g, "");

    const holder = document.getElementById("card-holder").value.trim();

    const expiry = document.getElementById("card-expiry").value.trim();

    const cvv = document.getElementById("card-cvv").value.trim();

    if (!/^\d{16}$/.test(number)) {

        showCheckoutMessage(
            "Ingresá un número ficticio de 16 dígitos.",
            "error"
        );

        return false;

    }

    if (!holder) {

        showCheckoutMessage(
            "Ingresá el titular de la tarjeta.",
            "error"
        );

        return false;

    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {

        showCheckoutMessage(
            "Ingresá un vencimiento válido en formato MM/AA.",
            "error"
        );

        return false;

    }

    if (!/^\d{3,4}$/.test(cvv)) {

        showCheckoutMessage(
            "Ingresá un código de seguridad ficticio de 3 o 4 dígitos.",
            "error"
        );

        return false;

    }

    return true;

}


// ============================================
// CALCULAR TOTALES
// ============================================

function calculateCheckoutTotals(games) {

    let total = 0;

    games.forEach(function (game) {

        total += game.priceCents * game.quantity;

    });

    const iva = Math.round(
        total * IVA_RATE / (100 + IVA_RATE)
    );

    const subtotal = total - iva;

    return {
        subtotal,
        iva,
        total
    };

}


// ============================================
// MOSTRAR RESUMEN
// ============================================

function renderCheckout(games) {

    checkoutItems.replaceChildren();

    games.forEach(function (game) {

        const item = document.createElement("li");

        const information = document.createElement("span");

        information.textContent =
            game.title + " x " + game.quantity;

        const price = document.createElement("strong");

        price.textContent = formatCheckoutPrice(
            game.price * game.quantity
        );

        item.append(information, price);

        checkoutItems.appendChild(item);

    });

    const totals = calculateCheckoutTotals(games);

    checkoutSubtotal.textContent = formatCheckoutPrice(
        totals.subtotal / 100
    );

    checkoutIva.textContent = formatCheckoutPrice(
        totals.iva / 100
    );

    checkoutTotal.textContent = formatCheckoutPrice(
        totals.total / 100
    );

}


// ============================================
// CARGAR PRODUCTOS DESDE SUPABASE
// ============================================

async function loadCheckout() {

    checkoutCart = getCheckoutCart();

    if (checkoutCart.length === 0) {

        showCheckoutMessage(
            "Tu carrito está vacío. Agregá productos antes de continuar.",
            "error"
        );

        checkoutSubmit.disabled = true;

        return;

    }

    const validCart = checkoutCart.every(function (item) {

        return (
            item &&
            typeof item.id === "string" &&
            Number.isSafeInteger(item.quantity) &&
            item.quantity > 0
        );

    });

    if (!validCart) {

        showCheckoutMessage(
            "El carrito contiene productos o cantidades inválidas.",
            "error"
        );

        checkoutSubmit.disabled = true;

        return;

    }

    const gameSlugs = [
        ...new Set(
            checkoutCart.map(function (item) {
                return item.id;
            })
        )
    ];

    showCheckoutMessage(
        "Verificando productos y precios...",
        "info"
    );

    try {

        const { data, error } = await window.supabaseClient
            .from("games")
            .select(`
                slug,
                title,
                price,
                image_url,
                is_published
            `)
            .in("slug", gameSlugs)
            .eq("is_published", true);

        if (error) {

            throw error;

        }

        if (!data || data.length !== gameSlugs.length) {

            throw new Error(
                "Uno o más productos ya no están disponibles."
            );

        }

        checkoutGames = checkoutCart.map(function (cartItem) {

            const game = data.find(function (item) {

                return item.slug === cartItem.id;

            });

            if (!game) {

                throw new Error(
                    "No se encontró un producto del carrito."
                );

            }

            const price = Number(game.price);

            if (!Number.isFinite(price) || price < 0) {

                throw new Error(
                    "Uno de los productos tiene un precio inválido."
                );

            }

            return {

                id: game.slug,
                title: game.title,
                image: game.image_url,
                price: price,
                priceCents: Math.round(price * 100),
                quantity: cartItem.quantity

            };

        });

        renderCheckout(checkoutGames);

        showCheckoutMessage(
            "Productos verificados correctamente.",
            "success"
        );

    } catch (error) {

        console.error("Error al cargar el checkout:", error);

        showCheckoutMessage(
            error.message || "No se pudo cargar el checkout.",
            "error"
        );

        checkoutSubmit.disabled = true;

    }

}


// ============================================
// PROCESAR COMPRA SIMULADA
// ============================================

async function processPayment(event) {

    event.preventDefault();

    if (checkoutIsProcessing || checkoutApproved) {

        return;

    }

    if (checkoutGames.length === 0) {

        showCheckoutMessage(
            "No hay productos disponibles para comprar.",
            "error"
        );

        return;

    }

    // Validar los campos obligatorios del formulario.

    if (!checkoutForm.reportValidity()) {

        return;

    }

    // Obtener método de pago seleccionado.

    const paymentMethod = checkoutForm.querySelector(
        'input[name="payment-method"]:checked'
    );

    if (!paymentMethod) {

        showCheckoutMessage(
            "Seleccioná un método de pago.",
            "error"
        );

        return;

    }

    // Validar tarjeta únicamente si corresponde.

    if (
        paymentMethod.value === "card" &&
        !validateCard()
    ) {

        return;

    }

    const customerName = document.getElementById(
        "customer-name"
    ).value.trim();

    const customerEmail = document.getElementById(
        "customer-email"
    ).value.trim();

    checkoutIsProcessing = true;

    checkoutSubmit.disabled = true;

    checkoutSubmit.textContent = "Procesando...";

    showCheckoutMessage(
        "Procesando compra de demostración...",
        "info"
    );

    try {

        // Simular tiempo de procesamiento.

        await new Promise(function (resolve) {

            setTimeout(resolve, 1200);

        });

        const totals = calculateCheckoutTotals(checkoutGames);

        // Preparar información de la compra.

        const order = {

            orderId: crypto.randomUUID(),

            customer: {
                name: customerName,
                email: customerEmail
            },

            paymentMethod: paymentMethod.value,

            status: "approved",

            items: checkoutGames,

            subtotal: totals.subtotal,

            iva: totals.iva,

            total: totals.total,

            createdAt: new Date().toISOString()

        };

        // Guardar únicamente el resultado temporal.
        // Nunca guardar datos de tarjeta o CVV.

        sessionStorage.setItem(
            CHECKOUT_RESULT_KEY,
            JSON.stringify(order)
        );

        // Vaciar el carrito después de la aprobación.

        localStorage.removeItem(CHECKOUT_CART_KEY);

        // Marcar la compra como aprobada.

        checkoutApproved = true;

        // Redirigir a la pantalla de confirmación.

        window.location.href = "order-confirmation.html";

        return;

    } catch (error) {

        console.error("Error durante la simulación:", error);

        showCheckoutMessage(
            "Ocurrió un error durante la simulación.",
            "error"
        );

        checkoutSubmit.disabled = false;

        checkoutSubmit.textContent = "Confirmar compra";

    } finally {

        checkoutIsProcessing = false;

    }

}


// ============================================
// LIMPIAR CAMPOS DE TARJETA
// ============================================

function clearCardFields() {

    document.getElementById("card-number").value = "";

    document.getElementById("card-holder").value = "";

    document.getElementById("card-expiry").value = "";

    document.getElementById("card-cvv").value = "";

    updateCardPreview();

}


// ============================================
// EVENTOS
// ============================================

// Cambiar método de pago.

paymentRadios.forEach(function (radio) {

    radio.addEventListener("change", function () {

        updatePaymentPanel();

        showCheckoutMessage("", "info");

    });

});


// ============================================
// ACTUALIZAR TARJETA VISUAL
// ============================================

document.getElementById("card-number").addEventListener(
    "input",
    function (event) {

        const digits = event.target.value
            .replace(/\D/g, "")
            .slice(0, 16);

        event.target.value =
            digits.match(/.{1,4}/g)?.join(" ") || "";

        updateCardPreview();

    }
);


document.getElementById("card-holder").addEventListener(
    "input",
    updateCardPreview
);


document.getElementById("card-expiry").addEventListener(
    "input",
    function (event) {

        let value = event.target.value
            .replace(/\D/g, "")
            .slice(0, 4);

        if (value.length > 2) {

            value = value.slice(0, 2) + "/" + value.slice(2);

        }

        event.target.value = value;

        updateCardPreview();

    }
);


document.getElementById("card-cvv").addEventListener(
    "input",
    function (event) {

        event.target.value = event.target.value
            .replace(/\D/g, "")
            .slice(0, 4);

    }
);


// ============================================
// ENVIAR FORMULARIO
// ============================================

checkoutForm.addEventListener(
    "submit",
    processPayment
);


// ============================================
// INICIALIZACIÓN
// ============================================

async function initializeCheckout() {

    updatePaymentPanel();

    // Comprobar que Supabase esté disponible.
    if (!window.supabaseClient) {

        showCheckoutMessage(
            "No se pudo inicializar la conexión con Supabase.",
            "error"
        );

        checkoutSubmit.disabled = true;

        return;

    }

    try {

        // Recuperar la sesión del usuario.
        const { data, error } = await window.supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        // Comprobar si existe una sesión activa.
        if (!data.session) {

            window.location.replace("my-account.html");

            return;

        }

        // Si está autenticado, cargar el checkout.
        await loadCheckout();

    } catch (error) {

        console.error("Error al verificar la sesión:", error);

        showCheckoutMessage(
            "No se pudo verificar tu sesión. Intentá nuevamente.",
            "error"
        );

        checkoutSubmit.disabled = true;

    }

}

initializeCheckout();