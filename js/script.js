console.log("JavaScript conectado correctamente");

// ==================================================
// 1. MOSTRAR Y OCULTAR CONTRASEÑAS
// ==================================================

const togglePasswordButtons = document.querySelectorAll(
    ".toggle-password, #toggle-password"
);

togglePasswordButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        // Buscamos el campo de contraseña asociado al botón.
        const passwordInput = button.previousElementSibling;

        // Comprobamos que exista un campo de contraseña.
        if (!passwordInput || !passwordInput.matches("input")) {
            return;
        }

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            button.textContent = "Ocultar contraseña";
        } else {
            passwordInput.type = "password";
            button.textContent = "Mostrar contraseña";
        }
    });
});


// ==================================================
// 2. VALIDACIÓN DEL FORMULARIO DE REGISTRO
// ==================================================

const registrationForm = document.querySelector(
    ".account-registration form"
);

if (registrationForm) {
    const password = document.querySelector("#register-password");
    const passwordConfirm = document.querySelector(
        "#register-password-confirm"
    );
    const passwordError = document.querySelector("#password-error");

    function validatePasswords() {
        // Si falta algún campo, no intentamos validarlo.
        if (!password || !passwordConfirm) {
            return true;
        }

        const passwordsMatch =
            password.value === passwordConfirm.value;

        if (passwordError) {
            passwordError.hidden = passwordsMatch;
        }

        passwordConfirm.setCustomValidity(
            passwordsMatch ? "" : "Las contraseñas no coinciden."
        );

        return passwordsMatch;
    }

    registrationForm.addEventListener("submit", function (event) {
        if (!validatePasswords()) {
            event.preventDefault();
        }
    });

    if (password) {
        password.addEventListener("input", validatePasswords);
    }

    if (passwordConfirm) {
        passwordConfirm.addEventListener("input", validatePasswords);
    }
}


// ==================================================
// 3. CATÁLOGO DEL BANNER PRINCIPAL
// ==================================================

const featuredGames = [
    {
        id: "cyberpunk-2077",
        title: "Cyberpunk 2077",
        description:
            "Recorré las enormes calles de Night City y descubrí su historia y personajes.",
        slogan: "Forjá tu historia, convertite en leyenda.",
        image: "images/games/cyberpunk/cover.jpg"
    },
    {
        id: "elden-ring",
        title: "Elden Ring",
        description:
            "Explorá las Tierras Intermedias y enfrentá desafíos legendarios.",
        slogan: "Convertite en el Señor del Círculo.",
        image: "images/games/elden-ring/cover.jpg"
    },
    {
        id: "red-dead-redemption-2",
        title: "Red Dead Redemption 2",
        description:
            "Recorré el salvaje oeste y sobreviví junto a la banda de Van der Linde.",
        slogan: "El destino se escribe en el salvaje oeste.",
        image: "images/games/red-dead-redemption-2/cover.jpg"
    }
];


let currentFeaturedIndex = 0;
let heroImageRequest = 0;

function updateHeroBanner() {
    const heroTitle = document.querySelector("#hero-title");
    const heroDescription = document.querySelector("#hero-description");
    const heroSlogan = document.querySelector("#hero-slogan");
    const heroImage = document.querySelector("#hero-img");
    const heroLink = document.querySelector("#hero-link");

    // Si esta página no tiene banner, no hacemos nada.
    if (
        !heroTitle ||
        !heroDescription ||
        !heroSlogan ||
        !heroImage ||
        !heroLink
    ) {
        return;
    }

    const featuredGame = featuredGames[currentFeaturedIndex];

    heroTitle.textContent = featuredGame.title;
    heroDescription.textContent = featuredGame.description;
    heroSlogan.textContent = featuredGame.slogan;

    heroImage.alt = featuredGame.title;


// Identificamos esta solicitud de cambio.
const currentRequest = ++heroImageRequest;

// Preparamos la nueva imagen antes de mostrarla.
const newImage = new Image();
newImage.src = featuredGame.image;

heroImage.classList.add("is-changing");

newImage.onload = function () {
    // Ignoramos las solicitudes que quedaron desactualizadas.
    if (currentRequest !== heroImageRequest) {
        return;
    }

    heroImage.src = newImage.src;
    heroImage.alt = featuredGame.title;

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            // Solo la solicitud más reciente puede mostrar la imagen.
            if (currentRequest === heroImageRequest) {
                heroImage.classList.remove("is-changing");
            }
        });
    });
};

newImage.onerror = function () {
    // No dejamos la imagen invisible si ocurre un error.
    if (currentRequest === heroImageRequest) {
        heroImage.classList.remove("is-changing");
    }
};



    heroLink.href = "game.html?game=" + featuredGame.id;
}

// Navegación del carrusel.
const prevButton = document.querySelector("#hero-prev");
const nextButton = document.querySelector("#hero-next");


// Avanzar al siguiente juego.
if (nextButton) {
    nextButton.addEventListener("click", function () {
        currentFeaturedIndex++;

        if (currentFeaturedIndex >= featuredGames.length) {
            currentFeaturedIndex = 0;
        }

        updateHeroBanner();
        restartHeroRotation();
    });
}


// Volver al juego anterior.
if (prevButton) {
    prevButton.addEventListener("click", function () {
        currentFeaturedIndex--;

        if (currentFeaturedIndex < 0) {
            currentFeaturedIndex = featuredGames.length - 1;
        }

        updateHeroBanner();
        restartHeroRotation();
    });
}

// Mostramos el primer juego al cargar la página.
updateHeroBanner();


// Rotación automática del carrusel.
const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

let heroRotationTimer = null;

function startHeroRotation() {
    // Evitamos iniciar la rotación si el usuario prefiere
    // reducir las animaciones o si el temporizador ya existe.
    if (reduceMotion.matches || heroRotationTimer !== null) {
        return;
    }

    heroRotationTimer = setInterval(function () {
        currentFeaturedIndex++;

        if (currentFeaturedIndex >= featuredGames.length) {
            currentFeaturedIndex = 0;
        }

        updateHeroBanner();
    }, 6000);
}

function stopHeroRotation() {
    if (heroRotationTimer !== null) {
        clearInterval(heroRotationTimer);
        heroRotationTimer = null;
    }
}

function restartHeroRotation() {
    stopHeroRotation();
    startHeroRotation();
}

// Iniciamos la rotación automática.
startHeroRotation();

// Si cambia la preferencia de movimiento del sistema,
// adaptamos el comportamiento del carrusel.
reduceMotion.addEventListener("change", function (event) {
    if (event.matches) {
        stopHeroRotation();
    } else {
        startHeroRotation();
    }
});




// ==================================================
// 4. CATÁLOGO GENERAL DE JUEGOS
// ==================================================

const games = {
    "elden-ring": {
        title: "Elden Ring",
        image: "images/games/elden-ring/cover.jpg",
        intro: "Explorá las Tierras Intermedias y su historia épica.",
        description:
            "Explorá las Tierras Intermedias, enfrentá enemigos formidables y transformate en el próximo Elden Lord.",
        developer: "FromSoftware",
        price: 39999,
        platform: "PC",
        genre: "RPG, Acción",
        categories: ["RPG", "Acción"],
        releaseDate: "25 de febrero de 2022"
    },

    "cyberpunk-2077": {
        title: "Cyberpunk 2077",
        image: "images/games/cyberpunk/cover.jpg",
        intro:
            "Explorá Night City, una metrópolis futurista donde cada decisión puede cambiar tu destino.",
        description:
            "Convertite en V, un mercenario que busca sobrevivir en una ciudad dominada por la tecnología, las corporaciones y el crimen.",
        developer: "CD Projekt Red",
        price: 29999,
        platform: "PC",
        genre: "RPG, Acción, Mundo abierto",
        categories: ["RPG", "Acción", "Mundo abierto"],
        releaseDate: "10 de diciembre de 2020"
    },

    "red-dead-redemption-2": {
        title: "Red Dead Redemption 2",
        image: "images/games/red-dead-redemption-2/cover.jpg",
        intro:
            "Recorré el salvaje oeste americano y sobreviví junto a la banda de Van der Linde.",
        description:
            "Acompañá a Arthur Morgan y a su banda en una historia de lealtad, supervivencia y crimen durante los últimos años del salvaje oeste.",
        developer: "Rockstar Games",
        price: 19999,
        platform: "PC",
        genre: "Acción, Aventura, Mundo abierto",
        categories: ["Acción", "Aventura", "Mundo abierto"],
        releaseDate: "5 de noviembre de 2019"
    }
};


// ==================================================
// 5. CARGAR LA PÁGINA DEL JUEGO SELECCIONADO
// ==================================================

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get("game");
const selectedGame = games[gameId];

console.log("Identificador del juego:", gameId);
console.log("Juego seleccionado:", selectedGame);

// Detectamos la página de producto.
const gameTitle = document.querySelector("#game-title");

if (gameTitle) {
    const gameError = document.querySelector("#game-error");
    const gameHeader = document.querySelector(".game-page-header");
    const gameProduct = document.querySelector("#game-product");
    const gameDetails = document.querySelector("#game-details");

    if (selectedGame) {
        console.log("Actualizando la página con:", selectedGame.title);

        // Ocultamos el error y mostramos las secciones.
        if (gameError) {
            gameError.hidden = true;
        }

        if (gameHeader) {
            gameHeader.hidden = false;
        }

        if (gameProduct) {
            gameProduct.hidden = false;
        }

        if (gameDetails) {
            gameDetails.hidden = false;
        }

        // Actualizamos el título.
        gameTitle.textContent = selectedGame.title;

        // Actualizamos la portada.
        const productImage = document.querySelector("#game-cover-img");

        if (productImage) {
            productImage.src = selectedGame.image;
            productImage.alt = "Portada de " + selectedGame.title;
        }

        // Actualizamos la introducción.
        const productIntro = document.querySelector("#game-intro");

        if (productIntro) {
            productIntro.textContent = selectedGame.intro;
        }

        // Actualizamos la descripción.
        const productDescription = document.querySelector(
            "#game-description"
        );

        if (productDescription) {
            productDescription.textContent = selectedGame.description;
        }

        // Actualizamos el precio.
        const productPrice = document.querySelector("#game-price");

        if (productPrice) {
            productPrice.textContent = "$" + selectedGame.price;
        }

        // Actualizamos la plataforma.
        const productPlatform = document.querySelector("#game-platform");

        if (productPlatform) {
            productPlatform.textContent = selectedGame.platform;
        }

        // Actualizamos el género.
        const productGenre = document.querySelector("#game-genre");

        if (productGenre) {
            productGenre.textContent = selectedGame.genre;
        }

        // Actualizamos las categorías.
        const gameCategories = document.querySelector("#game-categories");

        if (gameCategories) {
            gameCategories.innerHTML = "";

            selectedGame.categories.forEach(function (category) {
                const categoryItem = document.createElement("li");
                categoryItem.textContent = category;
                gameCategories.appendChild(categoryItem);
            });
        }

        // Actualizamos el desarrollador.
        const productDeveloper = document.querySelector(
            "#game-developer"
        );

        if (productDeveloper) {
            productDeveloper.textContent = selectedGame.developer;
        }

        // Actualizamos la fecha de lanzamiento.
        const productReleaseDate = document.querySelector(
            "#game-release-date"
        );

        if (productReleaseDate) {
            productReleaseDate.textContent = selectedGame.releaseDate;
        }
    } else {
        console.log("El juego solicitado no existe en el catálogo.");

        if (gameError) {
            gameError.hidden = false;
        }

        if (gameHeader) {
            gameHeader.hidden = true;
        }

        if (gameProduct) {
            gameProduct.hidden = true;
        }

        if (gameDetails) {
            gameDetails.hidden = true;
        }
    }
}