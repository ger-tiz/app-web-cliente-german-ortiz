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

    // Obtener los videojuegos registrados en próximos lanzamientos.
const { data: upcomingData, error: upcomingError } =
    await window.supabaseClient
        .from("upcoming_releases")
        .select("game_id")
        .eq("is_active", true);

// Si falla la consulta, no continuamos para evitar duplicados.
if (upcomingError) {
    console.error(
        "No se pudieron consultar los próximos lanzamientos:",
        upcomingError.message
    );

    return;
}

// Crear un conjunto con los IDs de los próximos lanzamientos.
const upcomingGameIds = new Set(
    upcomingData.map(function (release) {
        return release.game_id;
    })
);

    const { data, error } = await window.supabaseClient
        .from("games")
        .select(`
            id,
            slug,
            title,
            intro,
            price,
            image_url,
            categories,
            release_date
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

    // Excluir los videojuegos que aparecen en próximos lanzamientos.
const storeGames = data.filter(function (game) {
    return !upcomingGameIds.has(game.id);
});

    console.log("Videojuegos disponibles en tienda:", storeGames.length);
    console.table(storeGames);

    // Evitar duplicar tarjetas al volver a ejecutar la función.
    gameList.replaceChildren();

    // Generar una tarjeta por cada videojuego.
    storeGames.forEach(function (game) {
        const listItem = document.createElement("li");
        
        // Guardar la fecha de lanzamiento en la tarjeta.
        listItem.dataset.releaseDate = game.release_date || "";

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

    // Informar si no hay juegos disponibles en la tienda.
    const noResults = document.querySelector("#no-results");

    if (noResults) {
    noResults.hidden = storeGames.length > 0;
}
}

// Cargar el catálogo cuando el documento ya está disponible.
cargarCatalogoSupabase();


// ============================================
// CARGAR VIDEOJUEGOS DESTACADOS DESDE SUPABASE
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

    const { data, error } = await window.supabaseClient
        .from("featured_games")
        .select(`
            position,
            games (
                slug,
                title,
                price,
                image_url,
                categories
            )
        `)
        .eq("is_active", true)
        .order("position", { ascending: true });

    // Controlar errores de consulta.
    if (error) {
        console.error(
            "Error al cargar videojuegos destacados:",
            error.message
        );

        if (errorMessage) {
            errorMessage.hidden = false;
        }

        return;
    }

    // Obtener los juegos relacionados.
    const featuredGames = data
        .map(function (item) {
            return item.games;
        })
        .filter(function (game) {
            return game && game.slug;
        });

    // Limpiar las tarjetas anteriores.
    bestSellersList.replaceChildren();

    // Comprobar si existen destacados.
    if (featuredGames.length === 0) {
        bestSellersList.textContent =
            "No hay videojuegos destacados disponibles.";

        if (errorMessage) {
            errorMessage.hidden = true;
        }

        return;
    }

    // Crear una tarjeta por cada videojuego destacado.
    featuredGames.forEach(function (game) {

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

        const price = document.createElement("div");
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

        // Montar tarjeta.
        article.append(
            cover,
            information,
            actions
        );

        listItem.appendChild(article);
        bestSellersList.appendChild(listItem);
    });

    // Ocultar mensaje de error si la carga fue correcta.
    if (errorMessage) {
        errorMessage.hidden = true;
    }

    console.log(
        "Videojuegos destacados cargados:",
        featuredGames.length
    );
}

// Ejecutar la carga de destacados.
cargarMasVendidosSupabase();


