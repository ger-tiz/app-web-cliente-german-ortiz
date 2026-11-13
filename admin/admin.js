document.addEventListener("DOMContentLoaded", async function () {

    const adminUser = document.querySelector("#admin-user");
    const logoutButton = document.querySelector("#logout-button");

    const showGameFormButton = document.querySelector("#show-game-form");
    const gameForm = document.querySelector("#game-form");
    let editingGameId = null;
    const cancelGameFormButton = document.querySelector("#cancel-game-form");

    const gameMessage = document.querySelector("#game-message");
    const gameList = document.querySelector("#game-list");
    // Elementos de próximos lanzamientos.
    const upcomingGameSelect =
        document.querySelector("#upcoming-game-select");

    const addUpcomingGameButton =
        document.querySelector("#add-upcoming-game");

    const upcomingMessage =
        document.querySelector("#upcoming-message");

    const upcomingList =
        document.querySelector("#upcoming-list");

    // Elementos de videojuegos destacados.
    const featuredGameSelect =
        document.querySelector("#featured-game-select");

    const addFeaturedGameButton =
        document.querySelector("#add-featured-game");

    const featuredMessage =
        document.querySelector("#featured-message");

    const featuredList =
        document.querySelector("#featured-list");

    // Comprobar conexión con Supabase.
    if (!window.supabaseClient) {
        alert("No se pudo conectar con Supabase.");
        window.location.href = "../my-account.html";
        return;
    }

    // Comprobar sesión.
    const { data: sessionData, error: sessionError } =
        await window.supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
        window.location.href = "../my-account.html";
        return;
    }

    // Comprobar permisos administrativos.
    const { data: isAdmin, error: adminError } =
        await window.supabaseClient.rpc("is_admin");

    if (adminError || isAdmin !== true) {
        alert("No tenés permisos para acceder al panel.");
        window.location.href = "../index.html";
        return;
    }

    // Mostrar usuario autenticado.
    adminUser.textContent = sessionData.session.user.email;

    // Cerrar sesión.
    logoutButton.addEventListener("click", async function () {

        const { error } =
            await window.supabaseClient.auth.signOut();

        if (error) {
            alert("No se pudo cerrar la sesión.");
            return;
        }

        window.location.href = "../my-account.html";

    });

    // Mostrar formulario.
    showGameFormButton.addEventListener("click", function () {
        gameForm.hidden = false;
        gameMessage.textContent = "";
    });

    // Cancelar formulario.
    cancelGameFormButton.addEventListener("click", function () {
        gameForm.reset();
        gameForm.hidden = true;
        gameMessage.textContent = "";
    });

    // Cargar videojuegos existentes.
    async function loadGames() {

        gameList.textContent = "Cargando videojuegos...";

        const { data, error } = await window.supabaseClient
            .from("games")
            .select(`
            id,
            title,
            slug,
            intro,
            description,
            developer,
            price,
            original_price,
            image_url,
            platform,
            genre,
            categories,
            release_status,
            release_date,
            is_published
        `)
            .order("title", { ascending: true });

        if (error) {
            console.error("Error al cargar videojuegos:", error);
            gameList.textContent = "No se pudieron cargar los videojuegos.";
            return;
        }

        gameList.replaceChildren();

        if (data.length === 0) {
            gameList.textContent = "Todavía no hay videojuegos registrados.";
            return;
        }

        data.forEach(function (game) {

            const article = document.createElement("article");

            const title = document.createElement("h3");
            title.textContent = game.title;

            const developer = document.createElement("p");
            developer.textContent =
                "Desarrolladora: " + (game.developer || "No especificada");

            const price = document.createElement("p");
            price.textContent =
                "Precio: $" + Number(game.price).toLocaleString("es-AR");

            const status = document.createElement("p");

            status.textContent =
                game.release_status === "tba"
                    ? "Lanzamiento: Por confirmar"
                    : "Lanzamiento: " + game.release_date;

            if (game.release_status === "tba") {
                status.classList.add("status-pending");
            }

            const published = document.createElement("p");

            published.textContent = game.is_published
                ? "Publicado"
                : "No publicado";

            published.classList.add(
                game.is_published
                    ? "status-published"
                    : "status-unpublished"
            );

            article.append(title, developer, price, status, published);

            // Botón para editar el videojuego.
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Editar";
            editButton.dataset.gameId = game.id;
            editButton.addEventListener("click", function () {

            editingGameId = game.id;

            // Abrir el formulario.
            gameForm.hidden = false;
            gameMessage.textContent = "";

            // Cargar los datos del videojuego.
            document.querySelector("#game-title").value = game.title;
            document.querySelector("#game-slug").value = game.slug;
            document.querySelector("#game-price").value = game.price;
            document.querySelector("#game-intro").value = game.intro || "";
            document.querySelector("#game-description").value = game.description || "";
            document.querySelector("#game-developer").value = game.developer || "";

            document.querySelector("#game-original-price").value =
                game.original_price ?? "";

            document.querySelector("#game-image").value = game.image_url || "";
            document.querySelector("#game-platform").value = game.platform || "";
            document.querySelector("#game-genre").value = game.genre || "";

            document.querySelector("#game-categories").value =
                Array.isArray(game.categories)
                    ? game.categories.join(", ")
                    : "";

            document.querySelector("#game-release-status").value =
                game.release_status;

            document.querySelector("#game-release-date").value =
                game.release_date || "";

            document.querySelector("#game-published").checked =
                game.is_published;

            gameForm.querySelector('button[type="submit"]').textContent =
            "Guardar cambios";

        });

            article.appendChild(editButton);
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Eliminar";
            deleteButton.dataset.gameId = game.id;
            deleteButton.addEventListener("click", async function () {

            const confirmed = confirm(
                `¿Estás seguro de que querés eliminar "${game.title}"? Esta acción no se puede deshacer.`
            );

            if (!confirmed) {
                return;
            }

            const { error } = await window.supabaseClient
                .from("games")
                .delete()
                .eq("id", game.id);

            if (error) {
                console.error("Error al eliminar videojuego:", error);
                gameMessage.textContent =
                    "No se pudo eliminar el videojuego: " + error.message;
                return;
            }

            gameMessage.textContent =
                "¡Videojuego eliminado correctamente!";

            await loadGames();

        });

            article.appendChild(deleteButton);

            gameList.appendChild(article);

        });

    }

        // Cargar videojuegos disponibles para próximos lanzamientos.
    async function loadUpcomingOptions() {

        const { data, error } = await window.supabaseClient
            .from("games")
            .select("id, title")
            .order("title", { ascending: true });

        if (error) {
            console.error("Error al cargar videojuegos:", error);
            upcomingMessage.textContent =
                "No se pudieron cargar los videojuegos.";
            return;
        }

        upcomingGameSelect.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Seleccionar videojuego";

        upcomingGameSelect.appendChild(defaultOption);

        data.forEach(function (game) {

            const option = document.createElement("option");
            option.value = game.id;
            option.textContent = game.title;

            upcomingGameSelect.appendChild(option);

        });

    }

    // Cargar próximos lanzamientos existentes.
    async function loadUpcomingGames() {

        upcomingList.textContent = "Cargando próximos lanzamientos...";

        const { data, error } = await window.supabaseClient
            .from("upcoming_releases")
            .select("id, game_id, is_active, games(title)")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error al cargar próximos lanzamientos:", error);
            upcomingList.textContent =
                "No se pudieron cargar los próximos lanzamientos.";
            return;
        }

        upcomingList.replaceChildren();

        if (data.length === 0) {
            upcomingList.textContent =
                "No hay próximos lanzamientos registrados.";
            return;
        }

        data.forEach(function (release) {

        const article = document.createElement("article");

        const title = document.createElement("h3");
        title.textContent = release.games?.title || "Videojuego sin título";

        const status = document.createElement("p");
        status.textContent = release.is_active ? "Activo" : "Inactivo";
        status.classList.add(
        release.is_active ? "status-active" : "status-inactive"
        );

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.textContent = release.is_active
            ? "Desactivar"
            : "Activar";

        toggleButton.addEventListener("click", async function () {

            const { error } = await window.supabaseClient
                .from("upcoming_releases")
                .update({ is_active: !release.is_active })
                .eq("id", release.id);

            if (error) {
                upcomingMessage.textContent =
                    "No se pudo actualizar: " + error.message;
                return;
            }

            upcomingMessage.textContent = "Estado actualizado correctamente.";
            await loadUpcomingGames();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Eliminar";

        deleteButton.addEventListener("click", async function () {

            const confirmed = confirm(
                `¿Eliminar ${release.games?.title} de próximos lanzamientos?`
            );

            if (!confirmed) return;

            const { error } = await window.supabaseClient
                .from("upcoming_releases")
                .delete()
                .eq("id", release.id);

            if (error) {
                upcomingMessage.textContent =
                    "No se pudo eliminar: " + error.message;
                return;
            }

            upcomingMessage.textContent =
                "Lanzamiento eliminado correctamente.";

            await loadUpcomingGames();
        });

        article.append(title, status, toggleButton, deleteButton);
        upcomingList.appendChild(article);

    });
    }

    // Cargar opciones para videojuegos destacados.
async function loadFeaturedOptions() {

    const { data, error } = await window.supabaseClient
        .from("games")
        .select("id, title")
        .order("title", { ascending: true });

    if (error) {
        featuredMessage.textContent =
            "No se pudieron cargar los videojuegos.";
        return;
    }

    featuredGameSelect.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar videojuego";
    featuredGameSelect.appendChild(defaultOption);

    data.forEach(function (game) {
        const option = document.createElement("option");
        option.value = game.id;
        option.textContent = game.title;
        featuredGameSelect.appendChild(option);
    });
}


// Cargar videojuegos destacados.
async function loadFeaturedGames() {

    featuredList.textContent = "Cargando destacados...";

    const { data, error } = await window.supabaseClient
        .from("featured_games")
        .select("id, game_id, position, is_active, games(title)")
        .order("position", { ascending: true });

    if (error) {
        featuredList.textContent =
            "No se pudieron cargar los destacados.";
        console.error(error);
        return;
    }

    featuredList.replaceChildren();

    if (data.length === 0) {
        featuredList.textContent =
            "No hay videojuegos destacados.";
        return;
    }

    data.forEach(function (game) {

        const article = document.createElement("article");

        const title = document.createElement("h3");
        title.textContent = game.games?.title || "Videojuego sin título";

        const status = document.createElement("p");
        status.textContent = game.is_active ? "Activo" : "Inactivo";
        status.classList.add(
        game.is_active ? "status-active" : "status-inactive"
        );

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.textContent = game.is_active ? "Desactivar" : "Activar";

        toggleButton.addEventListener("click", async function () {

            const { error } = await window.supabaseClient
                .from("featured_games")
                .update({ is_active: !game.is_active })
                .eq("id", game.id);

            if (error) {
                featuredMessage.textContent =
                    "No se pudo actualizar: " + error.message;
                return;
            }

            featuredMessage.textContent = "Estado actualizado.";
            await loadFeaturedGames();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Eliminar";

        deleteButton.addEventListener("click", async function () {

            if (!confirm(
                `¿Eliminar ${game.games?.title} de destacados?`
            )) return;

            const { error } = await window.supabaseClient
                .from("featured_games")
                .delete()
                .eq("id", game.id);

            if (error) {
                featuredMessage.textContent =
                    "No se pudo eliminar: " + error.message;
                return;
            }

            featuredMessage.textContent = "Destacado eliminado.";
            await loadFeaturedGames();
        });

        article.append(title, status, toggleButton, deleteButton);
        featuredList.appendChild(article);
    });
}

        // Agregar videojuego a destacados.
        addFeaturedGameButton.addEventListener("click", async function () {

            const gameId = featuredGameSelect.value;

            if (!gameId) {
                featuredMessage.textContent =
                    "Seleccioná un videojuego primero.";
                return;
            }

            const { error } = await window.supabaseClient
                .from("featured_games")
                .insert({
                    game_id: gameId,
                    is_active: true
                });

            if (error) {
                featuredMessage.textContent =
                    "No se pudo agregar: " + error.message;
                return;
            }

            featuredMessage.textContent =
                "¡Videojuego agregado a destacados!";

            featuredGameSelect.value = "";

            await loadFeaturedGames();
        });

    // Agregar videojuego a próximos lanzamientos.
    addUpcomingGameButton.addEventListener("click", async function () {

        const gameId = upcomingGameSelect.value;

        if (!gameId) {
            upcomingMessage.textContent =
                "Seleccioná un videojuego primero.";
            return;
        }

        const { error } = await window.supabaseClient
            .from("upcoming_releases")
            .insert({
                game_id: gameId,
                is_active: true
            });

        if (error) {
            console.error("Error al agregar lanzamiento:", error);

            upcomingMessage.textContent =
                "No se pudo agregar el lanzamiento: " + error.message;

            return;
        }

        upcomingMessage.textContent =
            "¡Videojuego agregado a próximos lanzamientos!";

        upcomingGameSelect.value = "";

        await loadUpcomingGames();

    });
    // Registrar un videojuego.
    gameForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        gameMessage.textContent = "";

        const title = document.querySelector("#game-title").value.trim();
        const slug = document.querySelector("#game-slug").value.trim();
        const intro = document.querySelector("#game-intro").value.trim();
        const description = document.querySelector("#game-description").value.trim();
        const developer = document.querySelector("#game-developer").value.trim();

        const price = Number(document.querySelector("#game-price").value);

        const originalPriceInput =
            document.querySelector("#game-original-price").value;

        const imageUrl = document.querySelector("#game-image").value.trim();
        const platform = document.querySelector("#game-platform").value.trim();
        const genre = document.querySelector("#game-genre").value.trim();

        const categories = document.querySelector("#game-categories")
            .value
            .split(",")
            .map(function (category) {
                return category.trim();
            })
            .filter(Boolean);

        const releaseStatus =
            document.querySelector("#game-release-status").value;

        const releaseDate =
            document.querySelector("#game-release-date").value;

        const isPublished =
            document.querySelector("#game-published").checked;

                    // Validar precio de venta.
        if (!Number.isFinite(price) || price < 0) {
            gameMessage.textContent =
                "El precio debe ser un número válido y no puede ser negativo.";
            return;
        }

        // Validar precio original.
        if (
            originalPriceInput !== "" &&
            (!Number.isFinite(Number(originalPriceInput)) ||
                Number(originalPriceInput) < 0)
        ) {
            gameMessage.textContent =
                "El precio original debe ser un número válido y no puede ser negativo.";
            return;
        }

        // Validar coherencia de la fecha.
        if (releaseStatus === "confirmed" && !releaseDate) {
            gameMessage.textContent =
                "Debés indicar una fecha de lanzamiento confirmada.";
            return;
        }

        if (releaseStatus === "tba" && releaseDate) {
            gameMessage.textContent =
                "Un lanzamiento por confirmar no debe tener fecha.";
            return;
        }

                // Validar categorías.
        if (categories.length === 0) {
            gameMessage.textContent =
                "Debés indicar al menos una categoría.";
            return;
        }

        // Validar coherencia de precios.
        if (
            originalPriceInput !== "" &&
            Number(originalPriceInput) < price
        ) {
            gameMessage.textContent =
                "El precio original no puede ser inferior al precio actual.";
            return;
        }

        // Comprobar si el slug ya existe.
        let slugQuery = window.supabaseClient
            .from("games")
            .select("id")
            .eq("slug", slug);

        if (editingGameId) {
            slugQuery = slugQuery.neq("id", editingGameId);
        }

        const { data: existingGames, error: slugError } =
            await slugQuery.limit(1);

        if (slugError) {
            console.error("Error al comprobar el slug:", slugError);

            gameMessage.textContent =
                "No se pudo comprobar la disponibilidad del slug.";

            return;
        }

        if (existingGames.length > 0) {
            gameMessage.textContent =
                "Ya existe un videojuego con ese slug. Elegí otro.";

            return;
        }

        // Preparar los datos.
        const newGame = {
            title: title,
            slug: slug,
            intro: intro || null,
            description: description || null,
            developer: developer || null,
            price: price,
            original_price: originalPriceInput
                ? Number(originalPriceInput)
                : null,
            image_url: imageUrl || null,
            platform: platform || null,
            genre: genre || null,
            categories: categories,
            release_status: releaseStatus,
            release_date: releaseStatus === "confirmed"
                ? releaseDate
                : null,
            is_published: isPublished
        };

        // Enviar a Supabase.
        let query;

        if (editingGameId) {
            // Actualizar videojuego existente.
            query = window.supabaseClient
                .from("games")
                .update(newGame)
                .eq("id", editingGameId);
        } else {
            // Registrar videojuego nuevo.
            query = window.supabaseClient
                .from("games")
                .insert(newGame);
        }

        const { error } = await query;

        if (error) {
            console.error("Error al registrar videojuego:", error);

            gameMessage.textContent =
                "No se pudo guardar el videojuego: " + error.message;

            return;
        }

                gameMessage.textContent = editingGameId
            ? "¡Videojuego actualizado correctamente!"
            : "¡Videojuego registrado correctamente!";

        gameForm.reset();
        gameForm.hidden = true;

        editingGameId = null;

        gameForm.querySelector('button[type="submit"]').textContent =
            "Guardar videojuego";

        await loadGames();

    });

    // Carga inicial.
    await loadGames();
    await loadUpcomingOptions();
    await loadUpcomingGames();
    await loadFeaturedOptions();
    await loadFeaturedGames();
});