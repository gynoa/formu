
const formulario = document.getElementById("formulario");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("btnEnviar");
const marcoEnvio = document.getElementById("marcoEnvio");
const campoFecha = document.getElementById("fecha");
let envioEnCurso = false;
let temporizadorRespuesta;
let temporizadorRecarga;

function actualizarFecha() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    campoFecha.value = `${hoy.getFullYear()}-${mes}-${dia}`;
}

actualizarFecha();

// Pega aquí la URL de tu aplicación web de Apps Script.
// Debe terminar en /exec, NO es el enlace de Google Sheets.
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbzH6WMykjwG5h2PcJCHlwYpPuRwN-Z7fhJOvfKWKsqNLukLY3Zxxjvq2Axmw5q_nKQMcw/exec";

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    if (URL_APPS_SCRIPT === "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT") {
        mensaje.textContent = "Primero debes configurar la conexión.";
        mensaje.style.color = "red";
        return;
    }

    actualizarFecha();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const empresa = document.getElementById("empresa").value.trim();

    if (!nombre || !correo || !telefono || !empresa) {
        mensaje.textContent = "Complete todos los campos.";
        mensaje.style.color = "red";
        return;
    }

    // Preparar el envío al iframe oculto.
    formulario.action = URL_APPS_SCRIPT;
    formulario.method = "POST";
    formulario.target = "marcoEnvio";

    envioEnCurso = true;
    boton.disabled = true;
    boton.textContent = "Enviando...";
    mensaje.textContent = "";

    temporizadorRespuesta = window.setTimeout(function() {
        if (!envioEnCurso) {
            return;
        }

        envioEnCurso = false;
        boton.disabled = false;
        boton.textContent = "Enviar registro";
        mensaje.textContent =
            "No recibimos respuesta. Verifique si el registro se guardó antes de volver a enviarlo.";
        mensaje.style.color = "#b42318";
    }, 30000);

    // Enviar el formulario a Google Apps Script.
    HTMLFormElement.prototype.submit.call(formulario);
});

marcoEnvio.addEventListener("load", function() {
    if (!envioEnCurso) {
        return;
    }

    window.clearTimeout(temporizadorRecarga);
    temporizadorRecarga = window.setTimeout(actualizarFormulario, 1500);
});

// Recibir la respuesta de Google Apps Script.
window.addEventListener("message", function(event) {
    const resultado = event.data;

    if (!envioEnCurso || !resultado || resultado.origen !== "FormularioQR") {
        return;
    }

    if (resultado.estado === "ok") {
        mensaje.textContent = "¡Registro enviado correctamente!";
        mensaje.style.color = "green";
        window.clearTimeout(temporizadorRecarga);
        temporizadorRecarga = window.setTimeout(actualizarFormulario, 1000);
    } else {
        window.clearTimeout(temporizadorRespuesta);
        window.clearTimeout(temporizadorRecarga);
        envioEnCurso = false;
        mensaje.textContent = resultado.mensaje || "No se pudo guardar el registro.";
        mensaje.style.color = "#b42318";
        boton.disabled = false;
        boton.textContent = "Enviar registro";
    }
});

function actualizarFormulario() {
    if (!envioEnCurso) {
        return;
    }

    envioEnCurso = false;
    window.clearTimeout(temporizadorRespuesta);
    window.location.reload();
}
