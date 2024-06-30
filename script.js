const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// const img = new Image();

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
      if (loadedCount === Object.keys(images).length) start();
    },
    { once: true }
  );
  image.src = `pet_components/${imageKey}.svg`;
}

function start() {
  const petShape = images[petShapes[1]];
  const eyesBack = images.eyes_back;
  const eyesFront = images.eyes_front;
  const mouth = images.mouth;

  const petSizeWidth = 200;
  const petSizeHeight = petShape.imageRatio * petSizeWidth;
  const petX = 50;
  const petY = 50;

  const eyesBackWidth = petSizeWidth / 2.7;
  const eyesBackHeight = eyesBack.imageRatio * eyesBackWidth;
  const eyesBackX = petX + petSizeWidth / 2 - eyesBackWidth / 2;
  const eyesBackY = petY + petSizeHeight / 2.3 - eyesBackHeight / 2;

  const radius = 5;
  const eyeAngle = 225;
  const eyeOffsetX = radius * Math.cos((Math.PI / 180) * eyeAngle);
  const eyeOffsetY = radius * Math.sin((Math.PI / 180) * eyeAngle);

  const eyesFrontWidth = eyesBackWidth;
  const eyesFrontHeight = eyesFront.imageRatio * eyesFrontWidth;
  const eyesFrontX = eyesBackX + eyeOffsetX;
  const eyesFrontY = eyesBackY + eyeOffsetY;
  // const eyesFrontX = eyesBackX - 3;
  // const eyesFrontY = eyesBackY - 3;

  const mouthWidth = petSizeWidth / 13;
  const mouthHeight = mouth.imageRatio * mouthWidth;
  const mouthX = eyesBackX + eyesBackWidth / 2 - mouthWidth / 2;
  const mouthY = eyesBackY + 42;

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
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
