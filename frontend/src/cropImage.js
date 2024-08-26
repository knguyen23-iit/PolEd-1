const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const radianAngle = getRadianAngle(rotation);
  const rotatedWidth = Math.abs(Math.cos(radianAngle)) * image.width + Math.abs(Math.sin(radianAngle)) * image.height;
  const rotatedHeight = Math.abs(Math.sin(radianAngle)) * image.width + Math.abs(Math.cos(radianAngle)) * image.height;

  // Set the canvas size to the rotated image's bounding box size
  canvas.width = rotatedWidth;
  canvas.height = rotatedHeight;

  // Translate and rotate the canvas context to the center
  ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
  ctx.rotate(radianAngle);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw the rotated image on the canvas
  ctx.drawImage(image, 0, 0);

  // Calculate the new crop area relative to the rotated image
  const croppedData = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // Set the canvas to the final crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Place the cropped image data on the canvas
  ctx.putImageData(croppedData, 0, 0);

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(URL.createObjectURL(file));
    }, "image/jpeg");
  });
}
