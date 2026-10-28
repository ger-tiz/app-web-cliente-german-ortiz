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
        price: 47200,
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
    },

        "hades": {
        title: "Hades",
        image: "images/games/hades/cover.jpg",
        intro: "Descendé al inframundo y enfrentá los desafíos de la mitología griega.",
        description: "Encarná a Zagreus, el príncipe del inframundo, y luchá para escapar del reino de Hades en una aventura de acción con elementos roguelike.",
        developer: "Supergiant Games",
        price: 14999,
        platform: "PC",
        genre: "Acción, RPG",
        categories: ["Acción", "RPG"],
        releaseDate: "17 de septiembre de 2020"
    },

    "war-dogs": {
        title: "War Dogs",
        image: "images/games/wardogs/cover.png",
        intro: "Prepará tu estrategia y equipate para el combate.",
        description: "Descubrí una experiencia de combate y estrategia en War Dogs.",
        developer: "Bulkhead Interactive",
        price: 19999,
        platform: "PC",
        genre: "Acción, Estrategia",
        categories: ["Acción", "Estrategia"],
        releaseDate: "10 de septiembre de 2026"
    },

        "silent-hill": {
        title: "Silent Hill Townfall",
        image: "images/games/silent-hill/cover.webp",
        intro: "Adentrate en un pueblo inquietante lleno de misterios.",
        description: "Explorá un entorno de terror psicológico, resolvé enigmas y enfrentá los horrores que esconde Silent Hill.",
        developer: "Konami",
        price: 24999,
        platform: "PC",
        genre: "Terror, RPG",
        categories: ["Terror", "RPG"],
        releaseDate: "24 de septiembre de 2026"
    },

    "ace-combat": {
        title: "Ace Combat",
        image: "images/games/ace-combat/cover.jpg",
        intro: "Despegá y preparate para dominar los cielos.",
        description: "Pilotá aviones de combate, participá en misiones aéreas y enfrentá desafíos en el campo de batalla.",
        developer: "Bandai Namco",
        price: 17999,
        platform: "PC",
        genre: "Acción, Simulación",
        categories: ["Acción", "Simulación"],
        releaseDate: "Por confirmar"
    },

        "space-marine-2": {
        title: "Warhammer 40,000: Space Marine 2",
        image: "images/games/space-marine-2/cover.avif",
        intro: "Convertite en un Marine Espacial y defendé a la humanidad.",
        description: "Enfrentá hordas de enemigos en combates intensos ambientados en el universo de Warhammer 40,000.",
        developer: "Saber Interactive",
        price: 29999,
        platform: "PC",
        genre: "Acción, Disparos",
        categories: ["Acción"],
        releaseDate: "9 de septiembre de 2024"
    },

    "graveyard-keeper-2": {
        title: "Graveyard Keeper 2",
        image: "images/games/graveyard-keeper-2/cover.jpg",
        intro: "Administrá tu cementerio y descubrí los secretos de un mundo peculiar.",
        description: "Explorá una aventura de gestión, fabricación y exploración en un mundo medieval lleno de posibilidades.",
        developer: "Por confirmar",
        price: 24999,
        platform: "PC",
        genre: "Simulación, RPG, Estrategia",
        categories: ["Simulación", "RPG", "Estrategia"],
        releaseDate: "Por confirmar"
    },

    "ori-and-the-blind-forest": {
        title: "Ori and the Blind Forest",
        image: "images/games/ori-and-the-blind-forest/cover.jpg",
        intro: "Descubrí un bosque mágico en una aventura inolvidable.",
        description: "Acompañá a Ori en una aventura de plataformas que combina exploración, desafíos y una historia emotiva.",
        developer: "Moon Studios",
        price: 12999,
        platform: "PC",
        genre: "Acción, Aventura, Plataformas",
        categories: ["Acción", "Aventura"],
        releaseDate: "11 de marzo de 2015"
    },

    "bioshock-collection": {
        title: "BioShock: The Collection",
        image: "images/games/bioshock-collection/cover.jpg",
        intro: "Explorá mundos extraordinarios donde cada decisión tiene consecuencias.",
        description: "Descubrí una colección de aventuras de acción en primera persona ambientadas en universos llenos de misterios.",
        developer: "2K",
        price: 19999,
        platform: "PC",
        genre: "Acción, Terror",
        categories: ["Acción", "Terror"],
        releaseDate: "16 de septiembre de 2016"
    },

        "the-witcher-3": {
        title: "The Witcher 3",
        image: "images/games/the-witcher-3/cover.jpg",
        intro: "Convertite en Geralt de Rivia y recorré un mundo de fantasía lleno de peligros.",
        description: "Emprendé una aventura de rol de mundo abierto, aceptá contratos de monstruos y seguí una historia marcada por tus decisiones.",
        developer: "CD Projekt Red",
        price: 21999,
        platform: "PC",
        genre: "RPG, Acción",
        categories: ["RPG", "Acción"],
        releaseDate: "19 de mayo de 2015"
    },

    "fallout-new-vegas": {
        title: "Fallout: New Vegas",
        image: "images/games/fallout-new-vegas/cover.jpeg",
        intro: "Explorá el yermo de Mojave y decidí el destino de New Vegas.",
        description: "Recorré un mundo posapocalíptico, conocé distintas facciones y tomá decisiones que pueden cambiar el futuro de la región.",
        developer: "Obsidian Entertainment",
        price: 14999,
        platform: "PC",
        genre: "RPG, Acción",
        categories: ["RPG", "Acción"],
        releaseDate: "19 de octubre de 2010"
    },

    "dead-space": {
        title: "Dead Space",
        image: "images/games/dead-space/cover.jpg",
        intro: "Sobreviví al horror que acecha en una nave espacial abandonada.",
        description: "Acompañá a Isaac Clarke en una experiencia de terror y supervivencia mientras investigás una nave infestada de criaturas aterradoras.",
        developer: "EA Redwood Shores",
        price: 19999,
        platform: "PC",
        genre: "Terror, Acción",
        categories: ["Terror", "Acción"],
        releaseDate: "27 de enero de 2023"
    },

    "alien-isolation": {
        title: "Alien: Isolation",
        image: "images/games/alien-isolation/cover.avif",
        intro: "Escondete, explorá y sobreviví a una amenaza implacable.",
        description: "Explorá una estación espacial y utilizá el sigilo y la estrategia para sobrevivir mientras una criatura te persigue.",
        developer: "Creative Assembly",
        price: 17999,
        platform: "PC",
        genre: "Terror, Acción",
        categories: ["Terror", "Acción"],
        releaseDate: "7 de octubre de 2014"
    },

    "xcom-2": {
        title: "XCOM 2",
        image: "images/games/xcom-2/cover.jpg",
        intro: "Liderá la resistencia humana contra una fuerza alienígena.",
        description: "Organizá escuadrones, administrá recursos y dirigí operaciones tácticas por turnos para combatir la ocupación alienígena.",
        developer: "Firaxis Games",
        price: 12999,
        platform: "PC",
        genre: "Estrategia, Acción",
        categories: ["Estrategia", "Acción"],
        releaseDate: "5 de febrero de 2016"
    },

    "stardew-valley": {
        title: "Stardew Valley",
        image: "images/games/stardew-valley/cover.avif",
        intro: "Construí una nueva vida en una granja y descubrí los secretos del valle.",
        description: "Cultivá la tierra, criá animales, conocé a los habitantes del pueblo y explorá las minas en una aventura de simulación y rol.",
        developer: "ConcernedApe",
        price: 9999,
        platform: "PC",
        genre: "Simulación, RPG",
        categories: ["Simulación", "RPG"],
        releaseDate: "26 de febrero de 2016"
    },

    "hollow-knight": {
        title: "Hollow Knight",
        image: "images/games/hollow-knight/cover.webp",
        intro: "Explorá un reino subterráneo lleno de secretos y criaturas.",
        description: "Aventurate por Hallownest en un juego de acción y plataformas con combates exigentes, exploración y un mundo interconectado.",
        developer: "Team Cherry",
        price: 11999,
        platform: "PC",
        genre: "Acción, Aventura",
        categories: ["Acción", "Aventura"],
        releaseDate: "24 de febrero de 2017"
    },

    "disco-elysium": {
        title: "Disco Elysium: The Final Cut",
        image: "images/games/disco-elysium/cover.jpg",
        intro: "Investigá un asesinato en una ciudad marcada por sus conflictos.",
        description: "Interpretá a un detective, interrogá personajes y tomá decisiones que definirán tu investigación y tu identidad.",
        developer: "ZA/UM",
        price: 14999,
        platform: "PC",
        genre: "RPG, Aventura",
        categories: ["RPG", "Aventura"],
        releaseDate: "30 de marzo de 2021"
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


// ==================================================
// 6. CARRITO: ALMACENAMIENTO DE PRODUCTOS
// ==================================================

const CART_STORAGE_KEY = "brutalGamingCart";

// Obtener los productos guardados.
function getCart() {
    try {
        const cart = JSON.parse(
            localStorage.getItem(CART_STORAGE_KEY)
        );

        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("No se pudo leer el carrito:", error);
        return [];
    }
}

// Guardar los productos.
function saveCart(cart) {
    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );
}

// Agregar un juego al carrito.
function addToCart(gameId) {
    const game = games[gameId];

    if (!game) {
        console.error("No se encontró el juego:", gameId);
        return false;
    }

    const cart = getCart();

    const existingItem = cart.find(function (item) {
        return item.id === gameId;
    });

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: gameId,
            title: game.title,
            image: game.image,
            price: game.price,
            quantity: 1
        });
    }

    saveCart(cart);

    return true;
}


// Conectar el botón de la ficha del juego.
const addToCartButton = document.querySelector("#add-to-cart");

if (addToCartButton && selectedGame) {
    addToCartButton.addEventListener("click", function () {
        const added = addToCart(gameId);

        if (added) {
            window.location.href = "cart.html";
        }
    });
}


// ==================================================
// 7. CARRITO: MOSTRAR PRODUCTOS
// ==================================================

function renderCart() {
    // Obtener los elementos del HTML.
    const cartList = document.querySelector(".cart-list");
    const cartSubtotal = document.querySelector(".cart-subtotal");
    const cartIva = document.querySelector(".cart-iva");
    const cartTotal = document.querySelector(".cart-total");
    const cartSummary = document.querySelector(".cart-summary");
    const cartEmpty = document.querySelector(".cart-empty");

    // Si no estamos en la página del carrito, salir.
    if (
        !cartList ||
        !cartSubtotal ||
        !cartTotal ||
        !cartSummary ||
        !cartEmpty
    ) {
        return;
    }

    // Obtener los productos guardados.
    const cart = getCart();

    // Limpiar la lista antes de mostrar los productos.
    cartList.innerHTML = "";

    // Calcular el subtotal.
    let subtotal = 0;

    // Mostrar el estado correspondiente del carrito.
    if (cart.length === 0) {
        cartEmpty.hidden = false;
        cartSummary.hidden = true;
        return;
    }

    cartEmpty.hidden = true;
    cartSummary.hidden = false;

// Crear un elemento por cada juego.
    cart.forEach(function (item) {
        const itemPrice = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;

        subtotal += itemPrice * quantity;

        // Contenedor principal del producto.
        const listItem = document.createElement("li");
        listItem.classList.add("cart-item");

        // Imagen del juego.
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.title;

        // Contenedor de la información.
        const information = document.createElement("div");
        information.classList.add("cart-item-information");

        // Título del juego.
        const title = document.createElement("h2");
        title.textContent = item.title;

        // Precio unitario.
        const price = document.createElement("p");
        price.classList.add("cart-item-price");
        price.textContent =
            "Precio unitario: " + formatPrice(itemPrice);

    // Contenedor de los controles de cantidad.
    const quantityControls = document.createElement("div");
    quantityControls.classList.add("cart-quantity-controls");

    // Texto de cantidad.
    const quantityLabel = document.createElement("span");
    quantityLabel.textContent = "Cantidad:";

    // Botón para reducir la cantidad.
    const decreaseButton = document.createElement("button");
    decreaseButton.type = "button";
    decreaseButton.textContent = "−";
    decreaseButton.classList.add("cart-quantity-button");
    decreaseButton.setAttribute("aria-label", "Reducir cantidad de " + item.title);

    // Mostrar la cantidad actual.
    const quantityText = document.createElement("span");
    quantityText.classList.add("cart-item-quantity");
    quantityText.textContent = quantity;

    // Botón para aumentar la cantidad.
    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.textContent = "+";
    increaseButton.classList.add("cart-quantity-button");
    increaseButton.setAttribute("aria-label", "Aumentar cantidad de " + item.title);

    // Reducir la cantidad sin eliminar el producto.
    decreaseButton.addEventListener("click", function () {
    const updatedCart = getCart();
    const product = updatedCart.find(function (cartItem) {
        return cartItem.id === item.id;
    });

    if (!product || product.quantity <= 1) {
        return;
    }

    product.quantity -= 1;

    saveCart(updatedCart);
    renderCart();

    });


    // Aumentar la cantidad.
    increaseButton.addEventListener("click", function () {
        const updatedCart = getCart();
        const product = updatedCart.find(function (cartItem) {
            return cartItem.id === item.id;
        });

        if (!product) return;

        product.quantity += 1;

        saveCart(updatedCart);
        renderCart();
    });

    // Agrupar los controles.
    quantityControls.append(
        quantityLabel,
        decreaseButton,
        quantityText,
        increaseButton
    );

    // Subtotal del juego.
    const itemTotal = document.createElement("p");
    itemTotal.classList.add("cart-item-total");
    itemTotal.textContent =
        "Subtotal del juego: " + formatPrice(itemPrice * quantity);

    // Botón para eliminar el producto.
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Eliminar producto";
    removeButton.classList.add("cart-remove-button");

    removeButton.addEventListener("click", function () {
        const updatedCart = getCart();

        const remainingCart = updatedCart.filter(function (cartItem) {
            return cartItem.id !== item.id;
        });

        saveCart(remainingCart);
        renderCart();
    });

    // Agrupar toda la información.
    information.append(
        title,
        price,
        quantityControls,
        itemTotal,
        removeButton
    );



        // Agregar imagen e información al producto.
        listItem.append(
            image,
            information
        );

        // Agregar el producto a la lista.
        cartList.appendChild(listItem);
    });

    // Calcular el IVA incluido en los precios finales.
    const iva = subtotal * 21 / 121;

    // Calcular el subtotal sin IVA.
    const subtotalSinIva = subtotal - iva;

    // Actualizar los importes del resumen.
    cartSubtotal.textContent = formatPrice(subtotalSinIva);
    cartIva.textContent = formatPrice(iva);
    cartTotal.textContent = formatPrice(subtotal);
    }

// Formatear importes en pesos argentinos.
function formatPrice(amount) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(amount);
}

// Ejecutar el renderizado al cargar la página.
renderCart();






// ==================================================
// 7. FILTROS DEL CATÁLOGO DE LA TIENDA
// ==================================================

const gameSearch = document.querySelector("#game-search");
const gameList = document.querySelector(".game-list");
const priceRange = document.querySelector("#price-range");
const priceValue = document.querySelector("#price-value");
const noResults = document.querySelector("#no-results");
const categoryCheckboxes = document.querySelectorAll(
    'input[name="category"]'
);

if (gameSearch && gameList && priceRange && priceValue) {

    const gameItems = gameList.querySelectorAll(":scope > li");

    // Actualizar el precio mostrado.
    function updatePriceLabel() {
        const formattedPrice = Number(priceRange.value)
            .toLocaleString("es-AR");

        priceValue.textContent = `$${formattedPrice}`;
    }

    // Obtener las categorías seleccionadas.
    function getSelectedCategories() {
        return Array.from(categoryCheckboxes)
            .filter(function (checkbox) {
                return checkbox.checked;
            })
            .map(function (checkbox) {
                return checkbox.value;
            });
    }

    // Comprobar si un juego pertenece a alguna categoría seleccionada.
    function matchesSelectedCategories(item, selectedCategories) {

        // Sin categorías seleccionadas, no se aplica este filtro.
        if (selectedCategories.length === 0) {
            return true;
        }

        const categoryElements = item.querySelectorAll(
            ".game-categories li"
        );

        const gameCategories = Array.from(categoryElements)
            .map(function (category) {
                return category.textContent
                    .trim()
                    .toLowerCase();
            });

        const categoryMap = {
            action: "acción",
            rpg: "rpg",
            horror: "terror",
            strategy: "estrategia",
            simulation: "simulación"
        };

        return selectedCategories.some(function (selectedCategory) {
            const categoryName = categoryMap[selectedCategory];

            return categoryName &&
                gameCategories.includes(categoryName);
        });
    }

    // Aplicar todos los filtros.

function filterGames() {

    const searchText = gameSearch.value
        .trim()
        .toLowerCase();

    const maxPrice = Number(priceRange.value);
    const selectedCategories = getSelectedCategories();

    let visibleGames = 0;

    gameItems.forEach(function (item) {

        const titleElement = item.querySelector(".game-card h3");
        const priceElement = item.querySelector(".game-price strong");

        if (!titleElement || !priceElement) {
            return;
        }

        const gameTitle = titleElement.textContent
            .trim()
            .toLowerCase();

        const gamePrice = Number(
            priceElement.textContent.replace(/\D/g, "")
        );

        const matchesName = gameTitle.includes(searchText);
        const matchesPrice = gamePrice <= maxPrice;

        const matchesCategories = matchesSelectedCategories(
            item,
            selectedCategories
        );

        const matchesAllFilters =
            matchesName &&
            matchesPrice &&
            matchesCategories;

        // Mostrar u ocultar la tarjeta.
        item.hidden = !matchesAllFilters;

        // Contar los juegos que cumplen todos los filtros.
        if (matchesAllFilters) {
            visibleGames++;
        }
    });

    // Mostrar el mensaje únicamente si no quedan juegos visibles.
    noResults.hidden = visibleGames > 0;
}



    // Eventos de búsqueda y precio.
    gameSearch.addEventListener("input", filterGames);

    priceRange.addEventListener("input", function () {
        updatePriceLabel();
        filterGames();
    });

    // Eventos de las categorías.
    categoryCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", filterGames);
    });

    // Inicializar los filtros.
    updatePriceLabel();
    filterGames();
}




