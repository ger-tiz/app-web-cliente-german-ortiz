// ============================================
// CONEXIÓN CON SUPABASE
// Brutal Gaming Argentina
// ============================================

// URL base de tu proyecto Supabase.
const SUPABASE_URL =
    "https://aijdumduzhktszaljuta.supabase.co";

// Clave pública del proyecto.
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_h5fsHrg6TYRoEbaZwNzaUw_6TeDqjF3";

// Crear el cliente de Supabase.
window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Cliente de Supabase inicializado.");


// ============================================
// CARGAR CATÁLOGO DESDE SUPABASE
// Brutal Gaming Argentina
// ============================================

async function cargarCatalogoSupabase() {
    const gameList = document.getElementById("catalog-game-list");

    // Si esta página no tiene catálogo, no hacemos nada.
    if (!gameList) {
        return;
    }

    console.log("Cargando catálogo desde Supabase...");

    const { data, error } = await window.supabaseClient
        .from("games")
        .select(`
            slug,
            title,
            intro,
            price,
            image_url,
            categories
        `)
        .eq("is_published", true)
        .order("title");

    // Si Supabase devuelve un error, conservamos
    // el catálogo HTML actual y mostramos el error.
    if (error) {
        console.error(
            "No se pudo cargar el catálogo:",
            error.message
        );

        return;
    }

    console.log("Videojuegos recibidos:", data.length);
    console.table(data);

    // Evitar duplicar tarjetas al volver a ejecutar la función.
    gameList.replaceChildren();

    // Generar una tarjeta por cada videojuego.
    data.forEach(function (game) {
        const listItem = document.createElement("li");

        const article = document.createElement("article");
        article.classList.add("game-card");

        // Portada.
        const cover = document.createElement("div");
        cover.classList.add("game-cover");

        const image = document.createElement("img");
        image.src = game.image_url || "";
        image.alt = "Portada de " + game.title;
        image.loading = "lazy";

        cover.appendChild(image);

        // Información.
        const information = document.createElement("div");
        information.classList.add("game-information");

        const title = document.createElement("h3");
        title.textContent = game.title;

        const price = document.createElement("p");
        price.classList.add("game-price");

        const priceValue = document.createElement("strong");
        priceValue.textContent = new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }).format(Number(game.price) || 0);

        price.appendChild(priceValue);

        // Categorías.
        const categoriesList = document.createElement("ul");
        categoriesList.classList.add("game-categories");

        const categories = Array.isArray(game.categories)
            ? game.categories
            : [];

        categories.forEach(function (category) {
            const categoryItem = document.createElement("li");
            categoryItem.textContent = category;
            categoriesList.appendChild(categoryItem);
        });

        information.append(
            title,
            price,
            categoriesList
        );

        // Acción.
        const actions = document.createElement("div");
        actions.classList.add("game-actions");

        const link = document.createElement("a");
        link.href = "game.html?game=" +
            encodeURIComponent(game.slug);
        link.textContent = "Ver juego";

        actions.appendChild(link);

        // Montar la tarjeta completa.
        article.append(
            cover,
            information,
            actions
        );

        listItem.appendChild(article);
        gameList.appendChild(listItem);
    });

    // Avisar al sistema de filtros que hay nuevas tarjetas.
    if (typeof window.filterGames === "function") {
        window.filterGames();
    }

    // Informar si no hay juegos publicados.
    const noResults = document.querySelector("#no-results");

    if (noResults) {
        noResults.hidden = data.length > 0;
    }
}

// Cargar el catálogo cuando el documento ya está disponible.
cargarCatalogoSupabase();

// ============================================
// CARGAR MÁS VENDIDOS DESDE SUPABASE
// ============================================

async function cargarMasVendidosSupabase() {
    const bestSellersList = document.querySelector(
        "#best-sellers-list"
    );

    if (!bestSellersList) {
        return;
    }

    const errorMessage = document.querySelector(
        "#best-sellers-error"
    );

    const featuredSlugs = [
        "elden-ring",
        "cyberpunk-2077",
        "hades"
    ];

    const { data, error } = await window.supabaseClient
        .from("games")
        .select(`
            slug,
            title,
            price,
            image_url,
            categories
        `)
        .in("slug", featuredSlugs)
        .eq("is_published", true);

    if (error) {
        console.error(
            "Error al cargar los más vendidos:",
            error.message
        );

        if (errorMessage) {
            errorMessage.hidden = false;
        }

        return;
    }

    // Mantener el orden definido para los destacados.
    const orderedGames = featuredSlugs
        .map(function (slug) {
            return data.find(function (game) {
                return game.slug === slug;
            });
        })
        .filter(Boolean);

    bestSellersList.replaceChildren();

    orderedGames.forEach(function (game) {
        const listItem = document.createElement("li");

        const article = document.createElement("article");
        article.classList.add("game-card");

        const cover = document.createElement("div");
        cover.classList.add("game-cover");

        const image = document.createElement("img");
        image.src = game.image_url || "";
        image.alt = "Portada de " + game.title;
        image.loading = "lazy";

        cover.appendChild(image);

        const information = document.createElement("div");
        information.classList.add("game-information");

        const title = document.createElement("h3");
        title.textContent = game.title;

        const price = document.createElement("div");
        price.classList.add("game-price");

        const priceValue = document.createElement("strong");

        priceValue.textContent = new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }).format(Number(game.price));

        price.appendChild(priceValue);

        const categoriesList = document.createElement("ul");
        categoriesList.classList.add("game-categories");

        const categories = Array.isArray(game.categories)
            ? game.categories
            : [];

        categories.forEach(function (category) {
            const categoryItem = document.createElement("li");
            categoryItem.textContent = category;
            categoriesList.appendChild(categoryItem);
        });

        information.append(
            title,
            price,
            categoriesList
        );

        const actions = document.createElement("div");
        actions.classList.add("game-actions");

        const link = document.createElement("a");
        link.href = "game.html?game=" +
            encodeURIComponent(game.slug);
        link.textContent = "Ver juego";

        actions.appendChild(link);

        article.append(
            cover,
            information,
            actions
        );

        listItem.appendChild(article);
        bestSellersList.appendChild(listItem);
    });

    if (errorMessage) {
        errorMessage.hidden = orderedGames.length > 0;
    }

    console.log(
        "Más vendidos cargados:",
        orderedGames.length
    );
}

// Ejecutar la carga de destacados.
cargarMasVendidosSupabase();

