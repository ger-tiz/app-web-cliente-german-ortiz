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
    const gameList = document.querySelector(".game-list");

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

