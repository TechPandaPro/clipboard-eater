const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// const img = new Image();

const images = {
  ellipse: { image: null, imageRatio: null },
  polygon: { image: null, imageRatio: null },
  rectangle: { image: null, imageRatio: null },
  star: { image: null, imageRatio: null },
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
      if (loadedCount === petShapes.length) start();
    },
    { once: true }
  );
  image.src = `pet_components/${imageKey}.svg`;
}

function start() {
  const drawWidth = 200;
  const petShape = images[petShapes[1]];
  ctx.drawImage(
    petShape.image,
    50,
    50,
    drawWidth,
    petShape.imageRatio * drawWidth
  );
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

// img.addEventListener(
//   "load",
//   () => {
//     const ratio = img.height / img.width;
//     const drawWidth = 250;
//     ctx.drawImage(img, 50, 50, drawWidth, ratio * drawWidth);
//   },
//   { once: true }
// );

// img.src = `pet_components/${petShapes[1]}.svg`;
