const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let spinDeg = 0;

const images = {
  ellipse: { image: null, imageRatio: null },
  polygon: { image: null, imageRatio: null },
  rectangle: { image: null, imageRatio: null },
  star: { image: null, imageRatio: null },
  eyes_back: { image: null, imageRatio: null },
  eyes_front: { image: null, imageRatio: null },
  mouth: { image: null, imageRatio: null },
};

const petShapes = ["ellipse", "polygon", "rectangle", "star"];

let loadedCount = 0;

for (const imageKey in images) {
  const imageObj = images[imageKey];
  const image = new Image();
  image.addEventListener(
    "load",
    () => {
      imageObj.image = image;
      imageObj.imageRatio = image.height / image.width;
      loadedCount++;
      if (loadedCount === Object.keys(images).length) {
        setInterval(update, 16);
        draw();
      }
    },
    { once: true }
  );
  image.src = `pet_components/${imageKey}.svg`;
}

let mouseX;
let mouseY;

let lastFetch = 0;
let clipboardItems = [];

let bubbleRadiusMin = 10;
let bubbleRadiusMax = 35;
let bubbleRadius = bubbleRadiusMin;

document.addEventListener("mousemove", async (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (lastFetch + 5000 < Date.now()) await fetchClipboard();
});

document.addEventListener("keydown", async (e) => {
  if (e.key === "v" && (e.ctrlkey || e.metaKey)) {
    e.preventDefault();
    await fetchClipboard();
    await navigator.clipboard.writeText("");
  }
});

function update() {
  // TODO: improve update function, this is just an example
  spinDeg += 0.5;
}

function draw() {
  ctx.save();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const petShape = images[petShapes[1]];
  const eyesBack = images.eyes_back;
  const eyesFront = images.eyes_front;
  const mouth = images.mouth;

  const spinRad = spinDeg * (Math.PI / 180);

  const petSizeWidth = 200;
  const petSizeHeight = petShape.imageRatio * petSizeWidth;
  const petX = 50;
  const petY = 50;

  const petCenterX = petX + petSizeWidth / 2;
  const petCenterY = petY + petSizeHeight / 2;

  const eyesBackWidth = petSizeWidth / 2.7;
  const eyesBackHeight = eyesBack.imageRatio * eyesBackWidth;
  const eyesBackX = petX + petSizeWidth / 2 - eyesBackWidth / 2;
  const eyesBackY = petY + petSizeHeight / 2.3 - eyesBackHeight / 2;

  let eyeRadians = Math.atan2(
    mouseY - (eyesBackY + eyesBackHeight / 2),
    mouseX - (eyesBackX + eyesBackWidth / 2)
  );

  eyeRadians = eyeRadians - spinRad;

  if (Number.isNaN(eyeRadians)) eyeRadians = 225 * (Math.PI / 180);

  const radius = 5;
  const eyeOffsetX = radius * Math.cos(eyeRadians);
  const eyeOffsetY = radius * Math.sin(eyeRadians);

  const eyesFrontWidth = eyesBackWidth;
  const eyesFrontHeight = eyesFront.imageRatio * eyesFrontWidth;
  const eyesFrontX = eyesBackX + eyeOffsetX;
  const eyesFrontY = eyesBackY + eyeOffsetY;

  const mouthWidth = petSizeWidth / 13;
  const mouthHeight = mouth.imageRatio * mouthWidth;
  const mouthX = eyesBackX + eyesBackWidth / 2 - mouthWidth / 2;
  const mouthY = eyesBackY + 42;

  ctx.save();

  ctx.translate(petCenterX, petCenterY);
  ctx.rotate(spinRad);
  ctx.translate(-petCenterX, -petCenterY);

  ctx.drawImage(petShape.image, petX, petY, petSizeWidth, petSizeHeight);

  ctx.drawImage(
    eyesBack.image,
    eyesBackX,
    eyesBackY,
    eyesBackWidth,
    eyesBackHeight
  );

  ctx.drawImage(
    eyesFront.image,
    eyesFrontX,
    eyesFrontY,
    eyesFrontWidth,
    eyesFrontHeight
  );

  ctx.drawImage(mouth.image, mouthX, mouthY, mouthWidth, mouthHeight);

  ctx.restore();

  ctx.beginPath();
  ctx.arc(mouseX, mouseY, bubbleRadius, 0, 2 * Math.PI, false);
  ctx.fillStyle = "rgb(50 50 50)";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const char of clipboardItems) {
    const offsetX = char.distance * Math.cos(char.angleRad);
    const offsetY = char.distance * Math.sin(char.angleRad);
    console.log(offsetX);
    console.log(offsetY);
    ctx.fillText(char.char, mouseX + offsetX, mouseY + offsetY);
  }

  ctx.restore();

  window.requestAnimationFrame(draw);
}

async function fetchClipboard() {
  lastFetch = Date.now();
  const items = ((await navigator.clipboard.readText()) ?? "")
    .split("")
    .filter((char) => char)
    .map((char) => ({
      char,
      angleRad: getRandomArbitrary(0, 360) * (180 / Math.PI),
      distance: getRandomArbitrary(0, bubbleRadius - 5),
    }));
  return items;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
