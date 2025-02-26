let grid, next;
let dA = 1, dB = 0.7;
let feedSlider, killSlider, sizeSlider;
let feed = 0.052;
let kill = 0.062;
let textureSize = 360;
let img, tiger;
let feedLabel, killLabel, sizeLabel;

function preload() {
  tiger = loadModel('assets/tiger.obj', true);
}

function setup() {
  createCanvas(600, 600, WEBGL);
  pixelDensity(1);

  // Etiquetas y sliders
  feedLabel = createSpan("Feed Rate: ");
  feedLabel.position(10, 5);
  feedSlider = createSlider(0.01, 0.1, feed, 0.001);
  feedSlider.position(100, 10);

  killLabel = createSpan("Kill Rate: ");
  killLabel.position(10, 35);
  killSlider = createSlider(0.01, 0.1, kill, 0.001);
  killSlider.position(100, 40);

  sizeLabel = createSpan("Texture Size: ");
  sizeLabel.position(10, 65);
  sizeSlider = createSlider(256, 1024, textureSize, 32);
  sizeSlider.position(100, 70);

  setupGrid();
  img = createGraphics(textureSize, textureSize);
  textureWrap(REPEAT);
}

function setupGrid() {
  textureSize = sizeSlider.value();
  grid = [];
  next = [];

  for (let x = 0; x < textureSize; x++) {
    grid[x] = [];
    next[x] = [];
    for (let y = 0; y < textureSize; y++) {
      grid[x][y] = { a: 1, b: 0 };
      next[x][y] = { a: 1, b: 0 };
    }
  }

  // Aplicar ruido Perlin para generar patrones más orgánicos
  perlinNoisePattern();
}

function perlinNoisePattern() {
  noiseDetail(8, 0.5); // Ajuste fino del ruido Perlin
  for (let x = 0; x < textureSize; x++) {
    for (let y = 0; y < textureSize; y++) {
      let value = noise(x * 0.05, y * 0.05); // Ajusta la escala del ruido
      if (value > 0.6) { // Umbral para definir manchas
        grid[x][y].b = random(0.5, 1);
      }
    }
  }
}


function draw() {
  background(200);
  orbitControl();

  // Actualizar valores desde los sliders
  feed = feedSlider.value();
  kill = killSlider.value();

  // Verificar si cambió el tamaño de la textura
  if (textureSize !== sizeSlider.value()) {
    setupGrid();
  }

  // Simulación de reacción-difusión
  for (let x = 1; x < textureSize - 1; x++) {
    for (let y = 1; y < textureSize - 1; y++) {
      let a = grid[x][y].a;
      let b = grid[x][y].b;
      let laplaceA = laplace(x, y, 'a');
      let laplaceB = laplace(x, y, 'b');

      next[x][y].a = a + (dA * laplaceA - a * b * b + feed * (1 - a));
      next[x][y].b = b + (dB * laplaceB + a * b * b - (kill + feed) * b);

      next[x][y].a = constrain(next[x][y].a, 0, 1);
      next[x][y].b = constrain(next[x][y].b, 0, 1);
    }
  }

  [grid, next] = [next, grid];

  // Generar la textura con mejor contraste
  img.loadPixels();
  for (let x = 0; x < textureSize; x++) {
    for (let y = 0; y < textureSize; y++) {
      let b = grid[x][y].b;
      let c = color(255 * (1 - b), 50, 255 * b, 255); // Más contraste con magenta y blanco
      img.set(x, y, c);
    }
  }
  img.updatePixels();

  // Renderizar el modelo con la textura
  noStroke();
  texture(img);
  lights();
  rotateX(PI);
  rotateY(PI / 2);
  scale(2);
  model(tiger);
}

function laplace(x, y, type) {
  let sum = 0;
  let weight = [0.05, 0.2, -1, 0.2, 0.05];
  let indices = [-1, 0, 1];

  for (let i of indices) {
    for (let j of indices) {
      let factor = weight[abs(i) + abs(j)];
      sum += grid[x + i][y + j][type] * factor;
    }
  }
  return sum;
}
