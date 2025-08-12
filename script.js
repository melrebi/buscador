const webAppUrl = "https://script.google.com/macros/s/AKfycbytcfgYivgEDt0Hv34XfrM8r2Bkr3Lqu7Ycph3O-PTrKtfd2bpSpFOoQL-UbvVD0vFknw/exec";

function buscar() {
  const expediente = document.getElementById("expedienteInput").value.trim();
  const resultadosDiv = document.getElementById("resultados");

  if (!expediente) {
    resultadosDiv.innerHTML = "<p class='error'>Por favor ingresa un expediente.</p>";
    return;
  }

  resultadosDiv.innerHTML = "<p class='loading'>Buscando...</p>";

  fetch(`${webAppUrl}?expediente=${encodeURIComponent(expediente)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        resultadosDiv.innerHTML = "<p class='error'>No se encontraron resultados.</p>";
      } else {
        mostrarResultados(data);
      }
    })
    .catch(err => {
      console.error(err);
      resultadosDiv.innerHTML = "<p class='error'>Error en la búsqueda.</p>";
    });
}

function mostrarResultados(data) {
  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = "";

  data.forEach(row => {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");

    tarjeta.innerHTML = `
      <h3>Expediente: ${row[0]}</h3>
      <p><strong>Nombre:</strong> ${row[1]}</p>
      <p><strong>Técnico:</strong> ${row[2]}</p>
      <p><strong>Ingreso:</strong> ${row[3]}</p>
      <p><strong>Inspección:</strong> ${row[4]}</p>
    `;

    resultadosDiv.appendChild(tarjeta);
  });
}