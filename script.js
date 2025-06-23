// === Datos de niveles y direcciones ===
const niveles = [
  { size: 6, palabras: ["SOL", "LUNA", "MAR"] },
  { size: 8, palabras: ["PLANETA", "ESTRELLA", "GALAXIA"] },
  { size: 10, palabras: ["ASTEROIDES", "ASTRONOMIA", "TELESCOPO"] },
];

const direcciones = [
  [0, 1], [1, 0], [1, 1], [-1, 1],
  [0, -1], [-1, 0], [-1, -1], [1, -1]
];

// === Variables globales ===
let nivelActual = 0;
let seleccion = [];
let palabrasEncontradas = [];
let isMouseDown = false;

const fondo = document.getElementById("fondo");
const encontrada = document.getElementById("encontrada");

// === Mostrar secciones dinámicamente ===
function mostrarSeccion(id) {
  ["portada", "juego"].forEach(seccion =>
    document.getElementById(seccion).style.display = (seccion === id ? "block" : "none")
  );
}

// === Función para iniciar el juego ===
function iniciarJuego() {
  nivelActual = 0;
  mostrarSeccion("juego");
  fondo.currentTime = 0;
  fondo.play();
  generarSopa();
}

function volverAPortada() {
  fondo.pause();
  mostrarSeccion("portada");
}

window.onload = () => mostrarSeccion("portada");

// === Función que genera la sopa de letras ===
function generarSopa() {
  let generado = false;
  while (!generado) generado = construirSopa();
}

// === Utilidad para letra aleatoria ===
const letraAleatoria = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));

// === Construcción del grid ===
function construirSopa() {
  const sopaDiv = document.getElementById("sopa");
  const palabrasDiv = document.getElementById("palabras");
  const nivel = niveles[nivelActual];

  document.getElementById("nivel").innerText = "Nivel: " + (nivelActual + 1);
  sopaDiv.innerHTML = "";
  palabrasDiv.innerHTML = "Palabras: " + nivel.palabras.join(", ");
  palabrasEncontradas = [];
  seleccion = [];

  const grid = Array(nivel.size).fill().map(() => Array(nivel.size).fill(''));

  for (const palabra of nivel.palabras) {
    if (!insertarPalabraEnGrid(grid, palabra.toUpperCase())) return false;
  }

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (!grid[i][j]) grid[i][j] = letraAleatoria();
    }
  }

  sopaDiv.style.gridTemplateColumns = `repeat(${nivel.size}, auto)`;

  grid.forEach((fila, i) => fila.forEach((letra, j) => {
    const celda = document.createElement("div");
    celda.className = "celda";
    celda.innerText = letra;
    celda.dataset.fila = i;
    celda.dataset.col = j;

    // Asignar eventos con objeto y bucle
    ["mousedown", "mouseover", "mouseup"].forEach(evento =>
      celda.addEventListener(evento, { mousedown: comenzarSeleccion, mouseover: extenderSeleccion, mouseup: terminarSeleccion }[evento])
    );

    sopaDiv.appendChild(celda);
  }));

  return true;
}

// === Inserta palabra en la sopa en una dirección válida ===
function insertarPalabraEnGrid(grid, palabra) {
  const size = grid.length;
  let intentos = 0;

  while (intentos++ < 100) {
    const [dx, dy] = direcciones[Math.floor(Math.random() * direcciones.length)];
    const fila = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    const coords = [];

    for (let k = 0; k < palabra.length; k++) {
      const ni = fila + dx * k;
      const nj = col + dy * k;

      if (ni < 0 || nj < 0 || ni >= size || nj >= size || 
          (grid[ni][nj] && grid[ni][nj] !== palabra[k])) {
        coords.length = 0;
        break;
      }
      coords.push([ni, nj]);
    }

    if (coords.length === palabra.length) {
      coords.forEach(([ni, nj], i) => grid[ni][nj] = palabra[i]);
      return true;
    }
  }

  return false;
}

// === Comienzo de selección ===
function comenzarSeleccion(e) {
  isMouseDown = true;
  limpiarSeleccion();
  e.target.classList.add("seleccionada");
  seleccion.push(e.target);
}

function extenderSeleccion(e) {
  if (!isMouseDown || seleccion.includes(e.target)) return;
  e.target.classList.add("seleccionada");
  seleccion.push(e.target);
}

function terminarSeleccion() {
  if (!isMouseDown) return;
  isMouseDown = false;

  const palabraSeleccionada = seleccion.map(c => c.innerText).join("");

  // Comparar directamente sin map
  if (niveles[nivelActual].palabras.some(p => p.toUpperCase() === palabraSeleccionada)) {
    marcarPalabraComoEncontrada(palabraSeleccionada);

    if (palabrasEncontradas.length === niveles[nivelActual].palabras.length) {
      setTimeout(() => {
        if (++nivelActual < niveles.length) {
          alert(`¡Completaste el nivel ${nivelActual}! Pasas al siguiente nivel.`);
          generarSopa();
        } else {
          alert("Ganaste! Has completado todos los niveles, juego finalizado.");
          volverAPortada();
        }
      }, 500);
    }
  } else {
    limpiarSeleccion();
  }

  seleccion = [];
}

// === Marca una palabra encontrada visualmente y en datos ===
function marcarPalabraComoEncontrada(palabra) {
  encontrada.play();
  seleccion.forEach(c => {
    c.classList.remove("seleccionada");
    c.classList.add("encontrada");
  });
  palabrasEncontradas.push(palabra);
}

function limpiarSeleccion() {
  document.querySelectorAll(".seleccionada").forEach(c => c.classList.remove("seleccionada"));
}
