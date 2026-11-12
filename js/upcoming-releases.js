// ============================================
// PRÓXIMOS LANZAMIENTOS DESDE SUPABASE
// Brutal Gaming Argentina
// ============================================

let upcomingGames = [];


// ============================================
// CARGAR PRÓXIMOS LANZAMIENTOS
// ============================================

async function cargarProximosLanzamientos() {

    const gameList = document.getElementById("upcoming-game-list");

    if (!gameList) {
        return;
    }

    console.log("Cargando próximos lanzamientos...");

    const { data, error } = await window.supabaseClient
        .from("upcoming_releases")
        .select(`
            game_id,
            games (
                id,
                slug,
                title,
                intro,
                image_url,
                categories,
                release_date,
                release_status
            )
        `)
        .eq("is_active", true);

    if (error) {
        console.error(
            "No se pudieron cargar los próximos lanzamientos:",
            error.message
        );
        return;
    }

    // Obtener los videojuegos relacionados.
    upcomingGames = data
        .map(function (release) {
            return release.games;
        })
        .filter(Boolean);

    console.log(
        "Próximos lanzamientos recibidos:",
        upcomingGames.length
    );

    console.table(upcomingGames);

    cargarAniosDisponibles(upcomingGames);

    configurarFiltrosLanzamientos();

    mostrarProximosLanzamientos(upcomingGames);
}


// ============================================
// GENERAR OPCIONES DE AÑOS
// ============================================

function cargarAniosDisponibles(games) {

    const yearFilter = document.getElementById("upcoming-year");

    if (!yearFilter) {
        return;
    }

    // Conservar solamente la opción inicial.
    yearFilter.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Todos los años";

    yearFilter.appendChild(defaultOption);

    const years = games
        .filter(function (game) {
            return game.release_status === "confirmed"
                && game.release_date;
        })
        .map(function (game) {
            return Number(game.release_date.split("-")[0]);
        });

    const uniqueYears = [...new Set(years)].sort(function (a, b) {
        return a - b;
    });

    uniqueYears.forEach(function (year) {

        const option = document.createElement("option");

        option.value = year;
        option.textContent = year;

        yearFilter.appendChild(option);

    });
}


// ============================================
// CREAR TARJETA DE VIDEOJUEGO
// ============================================

function crearTarjetaLanzamiento(game) {

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

    // Fecha de lanzamiento.
    const releaseDate = document.createElement("p");
    releaseDate.classList.add("release-date");

    if (
        game.release_status === "confirmed"
        && game.release_date
    ) {

        const [year, month, day] = game.release_date.split("-");

        releaseDate.textContent =
            "Fecha de lanzamiento: " + day + "/" + month + "/" + year;

    } else {

        releaseDate.textContent =
            "Fecha de lanzamiento: Por confirmar";

    }

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
        releaseDate,
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

    return listItem;
}


// ============================================
// MOSTRAR PRÓXIMOS LANZAMIENTOS
// ============================================

function mostrarProximosLanzamientos(games) {

    const gameList = document.getElementById("upcoming-game-list");

    if (!gameList) {
        return;
    }

    gameList.replaceChildren();

    games.forEach(function (game) {

        const card = crearTarjetaLanzamiento(game);

        gameList.appendChild(card);

    });

    actualizarMensajeSinResultados(games.length);
}


// ============================================
// CONFIGURAR FILTROS
// ============================================

function configurarFiltrosLanzamientos() {

    const searchInput = document.getElementById("upcoming-search");

    const monthFilter = document.getElementById("upcoming-month");

    const yearFilter = document.getElementById("upcoming-year");

    const categoryFilters = document.querySelectorAll(
        'input[name="upcoming-category"]'
    );

    function aplicarFiltros() {

        const searchText = searchInput.value.toLowerCase().trim();

        const selectedMonth = monthFilter.value;

        const selectedYear = yearFilter.value;

        const selectedCategories = Array.from(categoryFilters)
            .filter(function (checkbox) {
                return checkbox.checked;
            })
            .map(function (checkbox) {
                return checkbox.value.toLowerCase();
            });

        const filteredGames = upcomingGames.filter(function (game) {

            // Buscar por nombre.
            const gameTitle = game.title || "";

            const matchesName = gameTitle
                .toLowerCase()
                .includes(searchText);

            // Filtrar por categoría.
            const gameCategories = Array.isArray(game.categories)
                ? game.categories.map(function (category) {
                    return category.toLowerCase();
                })
                : [];

            const matchesCategory =
                selectedCategories.length === 0
                || selectedCategories.some(function (category) {
                    return gameCategories.includes(category);
                });

            // Obtener mes y año.
            let gameMonth = "";
            let gameYear = "";

            if (
                game.release_status === "confirmed"
                && game.release_date
            ) {

                const dateParts = game.release_date.split("-");

                gameYear = dateParts[0];
                gameMonth = String(Number(dateParts[1]));

            }

            // Filtrar por mes.
            const matchesMonth =
                selectedMonth === ""
                || gameMonth === selectedMonth;

            // Filtrar por año.
            const matchesYear =
                selectedYear === ""
                || gameYear === selectedYear;

            return (
                matchesName
                && matchesCategory
                && matchesMonth
                && matchesYear
            );

        });

        mostrarProximosLanzamientos(filteredGames);
    }

    searchInput.addEventListener("input", aplicarFiltros);

    monthFilter.addEventListener("change", aplicarFiltros);

    yearFilter.addEventListener("change", aplicarFiltros);

    categoryFilters.forEach(function (checkbox) {
        checkbox.addEventListener("change", aplicarFiltros);
    });
}


// ============================================
// MENSAJE SIN RESULTADOS
// ============================================

function actualizarMensajeSinResultados(total) {

    const noResults = document.getElementById(
        "upcoming-no-results"
    );

    if (noResults) {
        noResults.hidden = total > 0;
    }
}


// ============================================
// INICIAR
// ============================================

cargarProximosLanzamientos();