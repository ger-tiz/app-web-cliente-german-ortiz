console.log("JavaScript conectado correctamente");

const passwordInputs = document.querySelectorAll(
    "#login-password, #register-password, #register-password-confirm"
);

const togglePasswordButtons = document.querySelectorAll(
    ".toggle-password, #toggle-password"
);

togglePasswordButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const passwordInput = button.previousElementSibling;

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            button.textContent = "Ocultar contraseña";
        } else {
            passwordInput.type = "password";
            button.textContent = "Mostrar contraseña";
        }
    });
});

const registrationForm = document.querySelector(".account-registration form");

if (registrationForm) {
    const password = document.querySelector("#register-password");
    const passwordConfirm = document.querySelector("#register-password-confirm");
    const passwordError = document.querySelector("#password-error");

    function validatePasswords() {
        if (password.value !== passwordConfirm.value) {
            passwordError.hidden = false;
            return false;
        }

        passwordError.hidden = true;
        return true;
    }

    registrationForm.addEventListener("submit", function (event) {
        if (!validatePasswords()) {
            event.preventDefault();
        }
    });

    password.addEventListener("input", validatePasswords);
    passwordConfirm.addEventListener("input", validatePasswords);
}