"use strict";

const mouse = {
  x: null,
  y: null,
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
  // console.log(`mouse: ${mouse.x}, ${mouse.y}`);
});

export default mouse;
