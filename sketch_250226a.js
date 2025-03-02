let grid, next;
let dA = 1.0, dB = 0.2, feed = 0.07, kill = 0.055;
let cols, rows, colorA, colorB;
let graphics;  // Buffer para la textura
let tigre;     // Modelo 3D del tigre

function preload() {
  tigre = loadModel('tiger.obj', true);  // Cargar modelo
}

function setup() {
  createCanvas(600, 600, WEBGL);
  pixelDensity(1);
  noStroke(); // Elimina los bordes de los modelos 3D
  cols = rows = 200;  // Reducir resolución para rendimiento

  // Buffer para dibujar la textura
  graphics = createGraphics(cols, rows);
  graphics.pixelDensity(1);

  // Definir colores
  colorA = color(255, 165, 0);
  colorB = color(139, 69, 19);

  // Inicializar matrices
  grid = Array.from({ length: cols }, () => Array.from({ length: rows }, () => ({ a: 1, b: 0 })));
  next = Array.from({ length: cols }, () => Array.from({ length: rows }, () => ({ a: 1, b: 0 })));

  // Crear perturbación inicial
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (random(1) < 0.03) { 
        grid[x][y].b = 1;
      }
    }
  }
}

function draw() {
  background(200);
  orbitControl();
  
  // Generar textura
  graphics.loadPixels();
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let a = grid[x][y].a;
      let b = grid[x][y].b;
      let amt = constrain(b - a, 0, 1);
      let c = lerpColor(colorA, colorB, amt);
      let pix = (x + y * cols) * 4;
      graphics.pixels[pix] = red(c);
      graphics.pixels[pix + 1] = green(c);
      graphics.pixels[pix + 2] = blue(c);
      graphics.pixels[pix + 3] = 255;
    }
  }
  graphics.updatePixels();

  // Aplicar reacción-difusión
  for (let x = 1; x < cols - 1; x++) {
    for (let y = 1; y < rows - 1; y++) {
      let a = grid[x][y].a, b = grid[x][y].b;
      let laplaceA = calculateLaplacian(x, y, 'a');
      let laplaceB = calculateLaplacian(x, y, 'b');
      let reaction = a * b * b;
      next[x][y].a = a + (dA * laplaceA - reaction + feed * (1 - a));
      next[x][y].b = b + (dB * laplaceB + reaction - (kill + feed) * b);
      next[x][y].a = constrain(next[x][y].a, 0, 1);
      next[x][y].b = constrain(next[x][y].b, 0, 1);
    }
  }
  [grid, next] = [next, grid];

  // Dibujar el tigre con textura
  push();
  rotateY(PI/2);         // Rotar 180° en Y
  rotateX(PI);     // Rotar 90° en X
  texture(graphics);   // Aplicar la textura generada
  model(tigre);
  pop();
}

function calculateLaplacian(x, y, type) {
  let sum = 0;
  sum += grid[x + 1][y][type] * 0.2;
  sum += grid[x - 1][y][type] * 0.2;
  sum += grid[x][y + 1][type] * 0.2;
  sum += grid[x][y - 1][type] * 0.2;
  sum += grid[x + 1][y + 1][type] * 0.05;
  sum += grid[x - 1][y - 1][type] * 0.05;
  sum += grid[x + 1][y - 1][type] * 0.05;
  sum += grid[x - 1][y + 1][type] * 0.05;
  sum -= grid[x][y][type];
  return sum;
}
