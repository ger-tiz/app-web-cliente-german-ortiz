// ============================================
// AUTENTICACIÓN
// Brutal Gaming Argentina
// ============================================


// ============================================
// GESTIÓN DE SESIÓN
// ============================================

// Recuperar la sesión cuando se carga cualquier página.
async function checkSession() {

    if (!window.supabaseClient) {
        console.error("El cliente de Supabase no está inicializado.");
        return;
    }

    try {

        const { data, error } = await window.supabaseClient.auth.getSession();

        if (error) {
            console.error("Error al recuperar la sesión:", error.message);
            return;
        }

        updateAccountLink(data.session?.user ?? null);

    } catch (error) {

        console.error("Error inesperado al recuperar la sesión:", error);

    }

}

// ============================================
// ACTUALIZAR ENCABEZADO
// ============================================

async function updateAccountLink(user) {

    const accountLink = document.querySelector("#account-link");

    // Si la página no tiene el enlace, no hacemos nada.
    if (!accountLink) return;

    // Si no hay usuario conectado.
    if (!user) {
        accountLink.textContent = "Mi cuenta";
        accountLink.href = "my-account.html";

        // Eliminar el botón de cerrar sesión.
        document.querySelector("#logout-item")?.remove();

        return;
    }

    try {

        // Consultar el nombre del usuario en profiles.
        const { data, error } = await window.supabaseClient
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

        if (error || !data) {
            console.error("No se pudo obtener el perfil:", error?.message);
            accountLink.textContent = "Mi cuenta";
            return;
        }

        // Mostrar el nombre del usuario.
        accountLink.textContent = data.username;
        accountLink.href = "my-account.html";

        // Buscar el contenedor de las acciones del usuario.
        const userActions = document.querySelector(".user-actions ul");

        // Evitar agregar varios botones al actualizar la sesión.
        let logoutItem = document.querySelector("#logout-item");

        if (!logoutItem && userActions) {

            logoutItem = document.createElement("li");
            logoutItem.id = "logout-item";

            const logoutButton = document.createElement("button");
            logoutButton.type = "button";
            logoutButton.textContent = "Cerrar sesión";
            logoutButton.id = "logout-button";
            logoutButton.addEventListener("click", async () => {

    const { error } = await window.supabaseClient.auth.signOut();

    if (error) {
        console.error("Error al cerrar sesión:", error.message);
    }

    });

            logoutItem.appendChild(logoutButton);
            userActions.appendChild(logoutItem);

        }

    } catch (error) {

        console.error("Error al actualizar el encabezado:", error);

    }

}

// Escuchar cambios en el estado de autenticación.
if (window.supabaseClient) {

    window.supabaseClient.auth.onAuthStateChange((event, session) => {

        setTimeout(() => {
            updateAccountLink(session?.user ?? null);
        }, 0);

    });

}

// Recuperar la sesión inicial.
if (window.supabaseClient) {

    window.supabaseClient.auth.getSession().then(({ data, error }) => {

        if (error) {
            console.error("Error al recuperar la sesión:", error.message);
            return;
        }

        updateAccountLink(data.session?.user ?? null);

    });

}


const registerForm = document.querySelector("#register-form");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username = document.querySelector("#register-username").value.trim();
        const email = document.querySelector("#register-email").value.trim();
        const password = document.querySelector("#register-password").value;
        const passwordConfirm = document.querySelector("#register-password-confirm").value;

        const message = document.querySelector("#auth-message");

        // Comprobar que las contraseñas coincidan.
        if (password !== passwordConfirm) {
            message.textContent = "Las contraseñas no coinciden.";
            return;
        }

        // Comprobar que Supabase esté disponible.
        if (!window.supabaseClient) {
            message.textContent = "No se pudo conectar con el servicio. Intentá nuevamente.";
            console.error("El cliente de Supabase no está inicializado.");
            return;
        }

        message.textContent = "Creando cuenta...";

        try {

            // Registrar usuario en Supabase Auth.
            const { data, error } = await window.supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: "http://127.0.0.1:5500/my-account.html",
                data: {
                    username: username
                }
            }
        });

            if (error) {
                console.error("Error de registro:", error.message);
                message.textContent = "No se pudo crear la cuenta. Revisá los datos e intentá nuevamente.";
                return;
            }

            // Confirmar resultado del registro.
            if (data.session) {
                message.textContent = "¡Cuenta creada correctamente!";
            } else {
                message.textContent = "Revisá tu correo para confirmar tu cuenta.";
            }

            registerForm.reset();

        } catch (error) {

            console.error("Error inesperado:", error);
            message.textContent = "Ocurrió un problema de conexión. Intentá nuevamente.";

        }

    });

}

// ============================================
// INICIO DE SESIÓN
// ============================================

const loginForm = document.querySelector("#login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.querySelector("#login-email").value.trim();
        const password = document.querySelector("#login-password").value;

        const message = document.querySelector("#auth-message");

        // Comprobar que Supabase esté disponible.
        if (!window.supabaseClient) {
            message.textContent = "No se pudo conectar con el servicio. Intentá nuevamente.";
            console.error("El cliente de Supabase no está inicializado.");
            return;
        }

        message.textContent = "Iniciando sesión...";

        try {

            // Autenticar al usuario.
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error("Error de inicio de sesión:", error.message);
                message.textContent = "Correo o contraseña incorrectos.";
                return;
            }

            message.textContent = "¡Inicio de sesión correcto!";

            console.log("Usuario autenticado:", data.user.id);

            // Redirigir al inicio después de iniciar sesión.
            window.location.href = "index.html";
        } catch (error) {

            console.error("Error inesperado:", error);
            message.textContent = "Ocurrió un problema de conexión. Intentá nuevamente.";

        }

    });

}