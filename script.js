const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let petX = document.body.offsetWidth / 2;
let petY = document.body.offsetHeight / 2;

const petSizeWidth = 200;

let nextPetMoveAccStamp = Date.now();
let petMoveAngleVel = 0;
let petMoveAngleAcc = 0;
let petMoveDistanceVel = 0;
let petMoveDistanceAcc = 0;

let petMoveAngle = 0;
let petMoveDistance = 0;

const petMoveAngleVelMax = 0.2;
const petMoveDistanceVelMax = 0.01;

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

let petShapeNum = 0;
let petShapeAteCount = 0;
let petShapeBaseMax = 150;
let petShapeAteMax = petShapeBaseMax;
let hueRotate = 0;

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

let mouthWidth;
let mouthHeight;
let mouthX;
let mouthY;

let lastFetch = 0;
let clipboardText = "";
let clipboardItems = [];

const toEat = [];
let toEatSince = null;

let bubbleRadiusMin = 10;
let bubbleRadiusMax = 300;
let bubbleRadius = bubbleRadiusMin;
let newBubbleRadius = null;
let newBubbleRadiusTime = null;
let newBubbleRadiusBefore = null;
let bubbleAnimTime = 750;

document.addEventListener("mousemove", async (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (lastFetch + 500 < Date.now()) await fetchClipboard();
});

document.addEventListener("keydown", async (e) => {
  if (e.key === "v" && (e.ctrlkey || e.metaKey)) {
    e.preventDefault();

    await fetchClipboard();

    if (clipboardItems.length === 0) return;

    await navigator.clipboard.writeText("");

    toEatSince = Date.now();

    toEat.push(
      ...clipboardItems.map((item) => ({
        char: item.char,
        angleRad: item.angleRad,
        x: mouseX + item.distance * Math.cos(item.angleRad),
        y: mouseY + item.distance * Math.sin(item.angleRad),
        rotation: item.rotation,
        rotationChange: item.rotationChange,
        spinOffset: item.spinOffset,
        speed: getRandomArbitrary(4, 5),
        alpha: 1,
        remove: false,
      }))
    );

    clipboardItems = [];

    newBubbleRadius = bubbleRadiusMin;
    newBubbleRadiusTime = Date.now();
    newBubbleRadiusBefore = bubbleRadius;
  }
});

function update() {
  if (nextPetMoveAccStamp <= Date.now()) {
    nextPetMoveAccStamp = Date.now() + 5000;
    petMoveAngleAcc = getRandomArbitrary(-0.4, 0.4);
    petMoveDistanceAcc = getRandomArbitrary(0, 0.3);
  }

  petMoveAngleVel = Math.max(
    Math.min(petMoveAngleVel + petMoveAngleAcc, petMoveAngleVelMax),
    -petMoveAngleVelMax
  );
  petMoveDistanceVel = Math.min(
    petMoveDistanceVel + petMoveDistanceAcc,
    petMoveDistanceVelMax
  );

  petMoveAngle += petMoveAngleVel;
  petMoveDistance += petMoveDistanceVel;

  const petMoveRad = petMoveAngle * (Math.PI / 180);

  petX += petMoveDistance * Math.cos(petMoveRad);
  petY += petMoveDistance * Math.sin(petMoveRad);

  const petShape = images[petShapes[petShapeNum]];
  const petSizeHeight = petShape.imageRatio * petSizeWidth;

  const scale = getPetScale();

  const widthLargerBy = petSizeWidth * (scale - 1);
  const heightLargerBy = petSizeHeight * (scale - 1);

  const leftBoundary = widthLargerBy / 2;
  const rightBoundary = canvas.width - petSizeWidth - widthLargerBy / 2;
  const topBoundary = heightLargerBy / 2;
  const bottomBoundary = canvas.height - petSizeHeight - heightLargerBy / 2;

  const oldPetX = petX;
  const oldPetY = petY;

  petX = Math.max(Math.min(petX, rightBoundary), leftBoundary);
  petY = Math.max(Math.min(petY, bottomBoundary), topBoundary);

  if (oldPetX !== petX || oldPetY !== petY) {
    petMoveAngleAcc += 180;

    petMoveAngleVel = 0;
    petMoveDistanceVel = 0;

    petMoveDistance = 0;
  }

  if (newBubbleRadius) {
    const t =
      Math.min(Date.now() - newBubbleRadiusTime, bubbleAnimTime) /
      bubbleAnimTime;
    const progression =
      t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2;
    bubbleRadius =
      newBubbleRadiusBefore +
      (newBubbleRadius - newBubbleRadiusBefore) * progression;
    if (newBubbleRadius > newBubbleRadiusBefore)
      bubbleRadius = Math.min(bubbleRadius, newBubbleRadius);
    else bubbleRadius = Math.max(bubbleRadius, newBubbleRadius);
    if (bubbleRadius === newBubbleRadius) {
      newBubbleRadiusBefore = null;
      newBubbleRadiusTime = null;
      newBubbleRadius = null;
    }
  }
  clipboardItems.map((item) => {
    item.angleRad += item.orbitChange;
    item.rotation += item.rotationChange;
  });

  const fixedMouthX = mouthX + mouthWidth / 2;
  const fixedMouthY = mouthY + (mouthHeight * 4) / 1.5;

  for (const char of toEat) {
    if (
      getRandomInt(0, 10) === 0 ||
      !("cachedChangeX" in char) ||
      !("cachedChangeY" in char)
    ) {
      const direction = Math.atan2(char.y - fixedMouthY, char.x - fixedMouthX);
      char.cachedChangeX = Math.cos(direction) * -char.speed;
      char.cachedChangeY = Math.sin(direction) * -char.speed;
    }

    char.x += char.cachedChangeX;
    char.y += char.cachedChangeY;
  }

  const removeToEat = toEat
    .filter(
      (char) =>
        char.remove ||
        (Math.abs(char.x - fixedMouthX) < 20 &&
          Math.abs(char.y - fixedMouthY) < 20)
    )
    .map((remove) => {
      remove.remove = true;
      remove.alpha = Math.max(remove.alpha - 0.07, 0);
      return remove;
    });

  for (const remove of removeToEat) {
    if (remove.alpha <= 0) toEat.splice(toEat.indexOf(remove), 1);
  }

  if (removeToEat.length >= 1 && toEat.length === 0) toEatSince = Date.now();

  petShapeAteCount += removeToEat.length;

  if (petShapeAteCount >= petShapeAteMax) {
    petShapeNum = getRandomInt(0, petShapes.length - 1);
    petShapeAteMax +=
      petShapeAteCount - petShapeAteMax + petShapeAteCount * 0.05;
    petShapeAteCount = 0;
    hueRotate = getRandomInt(0, 359);
  }
}

function draw() {
  ctx.save();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const currDate = Date.now();

  const petShape = images[petShapes[petShapeNum]];
  const eyesBack = images.eyes_back;
  const eyesFront = images.eyes_front;
  const mouth = images.mouth;

  const spinRad = petMoveAngle * (Math.PI / 180);

  const petSizeHeight = petShape.imageRatio * petSizeWidth;

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

  mouthWidth = petSizeWidth / 13;
  mouthHeight = mouth.imageRatio * mouthWidth;
  mouthX = eyesBackX + eyesBackWidth / 2 - mouthWidth / 2;
  mouthY = eyesBackY + 42;

  ctx.save();

  const scale = getPetScale();

  ctx.translate(petCenterX, petCenterY);
  ctx.scale(scale, scale);
  ctx.rotate(spinRad);
  ctx.translate(-petCenterX, -petCenterY);

  ctx.save();
  ctx.filter = `hue-rotate(${hueRotate}deg) brightness(${
    (petShapeAteCount / petShapeAteMax) * 200 + 100
  }%)`;
  ctx.drawImage(petShape.image, petX, petY, petSizeWidth, petSizeHeight);
  ctx.restore();

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

  ctx.save();
  ctx.translate(mouthX + mouthWidth / 2, mouthY);
  let ratio;
  ratio = Math.min((Date.now() - toEatSince) / 150, 1);
  if (toEat.length === 0) ratio = 1 - ratio;
  ctx.scale(1 + 5 * ratio, 1 + 3 * ratio);
  ctx.translate(-(mouthX + mouthWidth / 2), -mouthY);
  ctx.drawImage(mouth.image, mouthX, mouthY, mouthWidth, mouthHeight);
  ctx.restore();

  ctx.restore();

  ctx.save();

  const shakeIntensity =
    (Math.max(bubbleRadius - bubbleRadiusMax * 0.3, 0) /
      (bubbleRadiusMax * 0.3)) *
    5;
  ctx.translate(
    getRandomArbitrary(-shakeIntensity, shakeIntensity),
    getRandomArbitrary(-shakeIntensity, shakeIntensity)
  );

  ctx.beginPath();
  ctx.arc(mouseX, mouseY, bubbleRadius, 0, 2 * Math.PI, false);
  ctx.fillStyle = "rgb(50 50 50)";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const char of clipboardItems) {
    if (char.appearAt > currDate) ctx.globalAlpha = 0;
    else ctx.globalAlpha = Math.min((currDate - char.appearAt) / 200, 1) * 0.5;

    const offsetX = char.distance * Math.cos(char.angleRad);
    const offsetY = char.distance * Math.sin(char.angleRad);

    const textX = mouseX + offsetX;
    const textY = mouseY + offsetY;

    if (char.rotation !== 0) {
      ctx.save();

      ctx.translate(textX + char.spinOffset, textY + char.spinOffset);
      ctx.rotate(char.rotation);
      ctx.translate(-(textX + char.spinOffset), -(textY + char.spinOffset));
    }

    ctx.fillText(char.char, textX, textY);

    if (char.rotation !== 0) ctx.restore();
  }

  for (const char of toEat) {
    if (char.rotation !== 0) {
      ctx.save();

      ctx.translate(char.x + char.spinOffset, char.y + char.spinOffset);
      ctx.rotate(char.rotation);
      ctx.translate(-(char.x + char.spinOffset), -(char.y + char.spinOffset));
    }

    ctx.globalAlpha = 0.5 * char.alpha;

    ctx.fillText(char.char, char.x, char.y);

    if (char.rotation !== 0) ctx.restore();
  }

  ctx.restore();

  // const toDrawVals = {
  //   nextPetMoveAccStamp,
  //   petMoveAngleVel,
  //   petMoveAngleAcc,
  //   petMoveDistanceVel,
  //   petMoveDistanceAcc,
  //   petMoveAngle,
  //   petMoveDistance,
  //   petMoveAngleVelMax,
  //   petMoveDistanceVelMax,
  // };

  // ctx.fillStyle = "#ffffff";
  // ctx.font = "bold 13px sans-serif";

  // let i = 0;
  // for (const key in toDrawVals) {
  //   ctx.fillText(`${key}: ${toDrawVals[key]}`, 100, 100 + i * 30);
  //   i++;
  // }

  ctx.restore();

  window.requestAnimationFrame(draw);
}

async function fetchClipboard() {
  lastFetch = Date.now();

  let newClipboardText;

  try {
    newClipboardText = (await navigator.clipboard.readText()) ?? "";
  } catch (err) {
    console.log(
      "Could not fetch clipboard (check if the document is focused!)"
    );
    console.error(err);
    return;
  }

  if (clipboardText !== newClipboardText) {
    clipboardText = newClipboardText;
    const newItems = clipboardText.split("").filter((char) => char.trim());

    newBubbleRadiusBefore = bubbleRadius;
    newBubbleRadiusTime = Date.now();
    newBubbleRadius =
      newItems.length === 0
        ? bubbleRadiusMin
        : Math.min(25 + newItems.length / 10, bubbleRadiusMax);

    let totalSpinning = 0;
    clipboardItems = newItems.map((char) => {
      const angleRad = getRandomArbitrary(0, 360) * (180 / Math.PI);
      const distance = getRandomArbitrary(0, newBubbleRadius * 0.95 - 7);
      const appearAt =
        Date.now() +
        (bubbleAnimTime / 1.2) * (distance / (newBubbleRadius * 0.95 - 7)) -
        getRandomInt(0, 200);
      const orbitChange = getRandomArbitrary(-0.5, 0.5) * (Math.PI / 180);
      let rotationChange = 0;
      if (totalSpinning < 200) {
        rotationChange = getRandomArbitrary(-1, 1) * (Math.PI / 180);
        totalSpinning++;
      }
      const spinOffset = getRandomInt(-10, 10);
      return {
        char,
        angleRad,
        distance,
        appearAt,
        orbitChange,
        rotation: 0,
        rotationChange,
        spinOffset,
      };
    });
  }
}

function getPetScale() {
  return 1 + Math.log(petShapeAteMax - petShapeBaseMax + 1) / 25;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// min and max are inclusive
function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
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
