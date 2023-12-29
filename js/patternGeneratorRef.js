

const canvas = document.getElementById("my-canvas");
var context;
var img;
const size = 10;
var stitches = parseInt(document.getElementsByName("stitches")[0].value);
var offsetX = parseInt(document.getElementsByName("offsetX")[0].value) * size;
var offsetY = parseInt(document.getElementsByName("offsetY")[0].value) * size;
var rows = parseInt(document.getElementsByName("rows")[0].value);
var imageSize = parseInt(document.getElementsByName("size")[0].value);
var brightness = parseInt(document.getElementsByName("brightness")[0].value);
var width = size * stitches;
var height = size * rows;
var middle = Math.floor(stitches / 2);


// Function to draw a single stitch
function drawSingleStitch(context, x, y, size, fill = false) {
    context.lineWidth = 0.25;
    context.fillStyle = "rgba(0,0,0,0)"

    if (fill) {
        context.fillStyle = "white";
        context.fillRect(x, y, size, size);
    } else {
        context.strokeStyle = "red";
        context.strokeRect(x, y, size, size);
    }
}

function fetchSettings() {
    stitches = parseInt(document.getElementsByName("stitches")[0].value);
    offsetX = parseInt(document.getElementsByName("offsetX")[0].value) * size;
    offsetY = parseInt(document.getElementsByName("offsetY")[0].value) * size;
    rows = parseInt(document.getElementsByName("rows")[0].value);
    imageSize = parseInt(document.getElementsByName("size")[0].value);
    brightness = parseInt(document.getElementsByName("brightness")[0].value);
    width = size * stitches;
    height = size * rows;
    middle = Math.floor(stitches / 2);
}

// Function to draw the mitten pattern
function drawMitten() {

    // Factor to round the top of the generated mitten pattern
    let roundingOffset = 0;
    const factor = parseInt(document.getElementsByName("factor")[0].value) / 100;

    // Draw each rectangle representing one knit stitch
    const totalStitches = Math.ceil(stitches * rows);

    Array(totalStitches).fill(0).forEach((_, i) => {
        const stitchX = (i * size) % width;
        const rowY = size * Math.floor((i * size) / width);

        // if a rouhnding factor is provided, add into sqrt based function
        // to ensure that rounding is stronger at the top of the mitten and 
        // smoothens out towards the edges
        if (factor) {
            roundingOffset = Math.ceil((factor * (3 + 0.9 * Math.sqrt(rowY))) * size);
        }

        // calculate edges of mitten top and 
        // only render stiches inside of the mitten bounds
        const stitchOutOfBoundsLeft = stitchX < (middle * size - rowY / size * size - roundingOffset);
        const stitchOutOfBoundsRight = stitchX > (middle * size + rowY / size * size + roundingOffset);
        const stichInsideBounds = !(stitchOutOfBoundsLeft || stitchOutOfBoundsRight)
        if (stichInsideBounds) drawSingleStitch(context, stitchX, rowY, size);
        else drawSingleStitch(context, stitchX, rowY, size, true);
    });
}

// Function to draw the facility grid
function drawFacilityGrid() {
    context.lineWidth = 0.8;

    // Draw vertical grid every five stitches
    Array(Math.ceil(stitches / 5)).fill(0).forEach((_, i) => {
        context.beginPath();

        // Exclude first line from the pattern
        if (i === 0) return;

        context.moveTo(size * i * 5, 0);
        context.lineTo(size * i * 5, rows * size);
        context.stroke();
    });

    // Draw horizontal grid every five stitches
    Array(Math.ceil(rows / 5)).fill(0).forEach((_, i) => {
        context.beginPath();

        // Exclude first line from the pattern
        if (i === 0) return;

        context.moveTo(0, size * i * 5);
        context.lineTo(rows * size, size * i * 5);
        context.stroke();
    });
}

// Main draw function
function generatePattern() {
    fetchSettings()
    if (img !== undefined) renderImage(img)
    drawMitten(context, stitches, rows, size);
    drawFacilityGrid(context, stitches, rows, size);

}

function renderImage(img) {
    context.clearRect(0, 0, width, height)
    context.canvas.width = stitches * size;
    context.canvas.height = rows * size;
    const scaleFactor = imageSize / 100
    const aspectRatio = height / width
    context.drawImage(img, offsetX, offsetY + (middle * size), scaleFactor * img.width, scaleFactor * img.height);

    const pixelationFactor = 10
    const originalImageData = context.getImageData(
        0,
        0,
        width,
        height
    ).data;

    for (let y = 0; y < height; y += pixelationFactor) {
        for (let x = 0; x < width; x += pixelationFactor) {
            // extracting the position of the sample pixel
            const pixelIndexPosition = (x + y * width) * 4;
            // drawing a square replacing the current pixels

            const r = originalImageData[pixelIndexPosition]
            const g = originalImageData[pixelIndexPosition + 1]
            const b = originalImageData[pixelIndexPosition + 2]
            const a = originalImageData[pixelIndexPosition + 3]

            const greyscale = (r + b + g + brightness) > 382 ? 255 : 0

            context.fillStyle = `rgba(
                ${greyscale},
                ${greyscale},
                ${greyscale},
                ${a}
              )`;
            context.fillRect(x, y, pixelationFactor, pixelationFactor);
        }
    }


}

function readImage(input) {

    context.clearRect(0, 0, width, height);
    let imgSrc = '';
    if (input.value !== '') {
        imgSrc = window.URL.createObjectURL(input.files[0]);
    }
    img = new Image();
    img.src = imgSrc;

    img.onload = function () {
        renderImage(img)
        drawMitten()
        drawFacilityGrid()
    }


}

// Event listeners
window.addEventListener("load", () => {
    if (canvas.getContext) {
        context = canvas.getContext("2d");
        context.canvas.width = stitches * size;
        context.canvas.height = rows * size;

        drawMitten();
        drawFacilityGrid();
    } else {
        alert("Your browser does not support canvas and can therefore not display this app.");
    }
});
window.addEventListener("submit", (e) => {
    e.preventDefault();
    generatePattern();
});
window.addEventListener("keypress", (e) => {
    if (e.key === "Enter") generatePattern();
});
