import { getSocket } from "./sockets";

const canvas = document.getElementById("jsCanvas");
const controls = document.getElementById("jsControls");
const ctx = canvas.getContext("2d");
const colors = document.getElementsByClassName("jsColor");
const range = document.getElementById("jsRange");
const mode = document.getElementById("jsMode");

const INIITAL_COLOR = "#2c2c2c";
const CANVAS_SIZE = 700;

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

ctx.fillStyle = "white";
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.strokeStyle = INIITAL_COLOR;
ctx.fillStyle = INIITAL_COLOR;
ctx.lineWidth = 2.5;

let painting = false;
let filling = false;

const stopPainting = () => painting = false;
const startPinting = () => painting = true;

const beginPath = (x,y) => {
    ctx.beginPath();
    ctx.moveTo(x,y);
};

const strokePath = (x,y) => {
    ctx.lineTo(x,y);
    ctx.stroke();
};

const onMouseMove = (event) => {
        const x = event.offsetX;
        const y = event.offsetY;
    if (!painting) {
        beginPath(x,y);
        getSocket().emit(window.events.beginPath, { x, y });
    } else {
        strokePath(x,y);
        getSocket().emit(window.events.strokePath, { x, y });
    }
};

const pickColor = (color) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
};

const handleColorClick = (event) => {
    const color = event.target.style.backgroundColor;
    pickColor(color);
    getSocket().emit(window.events.pickColor, { color });
};

const selectLineWidth = (size) => {
    ctx.lineWidth = size;
};

const handleRangeChange = (event) => {
    const size = event.target.value
    selectLineWidth(size);
    getSocket().emit(window.events.selectLineWidth, { size });
};

const handleModeClick = () => {
    if (filling) {
        filling = false;
        mode.innerText = "Fill";
    } else {
        filling = true;
        mode.innerText = "Paint";
    }
};

const fill = () => {
    ctx.fillRect(0,0,canvas.width,canvas.height);
};

const handleCanvasClick = () => {
    if (filling) {
        fill();
        getSocket().emit(window.events.fill);
    }
};

const handleCM = (event) => {
    event.preventDefault();
};

Array.from(colors).forEach(color =>
    color.addEventListener("click", handleColorClick)
);

if (range) {
    range.addEventListener("input", handleRangeChange);
}

if (mode) {
    mode.addEventListener("click", handleModeClick);
}

export const handleBeganPath = ({ x, y }) => beginPath(x, y);
export const handleStrokedPath = ({ x, y }) => strokePath(x, y);
export const handlePickedColor = ({ color }) => pickColor(color);
export const handleSelectedLineWidth = ({ size }) => selectLineWidth(size);
export const handleFilled = () => fill();

export const enableCanvas = () => {
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", startPinting);
    canvas.addEventListener("mouseup", stopPainting);
    canvas.addEventListener("mouseleave", stopPainting);
    canvas.addEventListener("click", handleCanvasClick);
};

export const disableCanvas = () => {
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mousedown", startPinting);
    canvas.removeEventListener("mouseup", stopPainting);
    canvas.removeEventListener("mouseleave", stopPainting);
    canvas.removeEventListener("click", handleCanvasClick);
};

export const hideCanvasControls = () => {
    controls.style.display = "none";
};
export const showCanvasControls = () => {
    controls.style.display = "flex";
};
export const resetCanvas = () => {
    ctx.fillStyle = "#fff";
    fill();
};


if (canvas) {
    canvas.addEventListener("contextmenu", handleCM);
    hideCanvasControls();
}