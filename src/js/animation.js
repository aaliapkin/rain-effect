import mouse from "js/mouse";
import { mapclamp } from "js/lib";

import vertexShaderSource from "shaders/rain.vert";
import fragmentShaderSource from "shaders/rain.frag";

const config = {
  shut: true,
};

function distance(d1, d2 = { x: 0, y: 0 }) {
  return Math.sqrt((d2.x - d1.x) ** 2 + (d2.y - d1.y) ** 2);
}

function getVectorTo(origin, target) {
  const dist = distance(origin, target);
  if (dist === 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: (target.x - origin.x) / dist,
    y: (target.y - origin.y) / dist,
  };
}

function mapArrValue(arr, val, max) {
  let interval = max / (arr.length - 1);
  let i = Math.floor(val / interval);
  let w = (val % interval) / interval;
  let smoothstep = 3 * w ** 2 - 2 * w ** 3;
  let ret = arr[i] * (1 - smoothstep) + arr[i + 1] * smoothstep;
  if (ret === NaN) {
    debugger;
  }
  return ret;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be downloaded over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    // if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    //   // Yes, it's a power of 2. Generate mips.
    //   gl.generateMipmap(gl.TEXTURE_2D);
    // } else {
    //   // No, it's not a power of 2. Turn off mips and set
    //   // wrapping to clamp to edge
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //   gl.generateMipmap(gl.TEXTURE_2D);
    // }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

class Animation {
  cnv = null;
  ctx = null;
  size = { w: 0, h: 0, cx: 0, cy: 0 };

  lastFrameTime = 0;
  currentFrameTime = 0;
  fps = 60;
  fpsHistory = [];

  zoom_center = [0.0, 0.0];
  target_zoom_center = [0.0, 0.0];
  zoom_size = 4.0;
  stop_zooming = true;
  zoom_factor = 1.0;
  max_iterations = 500;

  proj = [
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
  ];

  xmin = -2.0;
  xmax = 1.0;
  ymin = -1.5;
  ymax = 1.5;

  zoom = true;
  zoomInterval = undefined;
  interval = 50;
  psize = 5.0;
  startTime = 0.0;
  time = 0.0;
  texture = null;

  uvmouse = {
    x: 0.0,
    y: 0.0,
  };
  lastmousepos = {
    x: 0.0,
    y: 0.0,
  };
  mouseintensity = 0.0;

  // Uniforms

  u_MVP = null;
  u_lBounds = null;
  u_time = null;
  u_Size = null;
  u_Sampler = null;
  u_Mouse = null;
  u_MouseInt = null;
  u_asp = null;

  init() {
    this.createCanvas();
    this.updateAnimation();
  }

  calculateMVP() {
    let left, right, top, bottom, far, near;
    const ratio = this.size.w / this.size.h;

    left = 0;
    right = 1;

    bottom = 1;
    top = 0;

    near = 0.0;
    far = 1.0;

    // prettier-ignore
    this.proj = [ 
      2 / (right - left),                   0,                 0,  -(right + left) / (right - left),
                       0,  2 / (top - bottom),                 0,  -(top + bottom) / (top - bottom),
                       0,                   0,  2 / (far - near),      -(far + near) / (far - near),
                       0,                   0,                 0,                                 1,
    ];
  }

  createProgram() {
    gl = this.ctx;

    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    const vertSrc = gl.shaderSource(vertShader, vertexShaderSource);
    const fragSrc = gl.shaderSource(fragShader, fragmentShaderSource);

    gl.compileShader(vertShader, vertSrc);
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      alert("Error compiling vertex shader");
      console.log(gl.getShaderInfoLog(vertShader));
    }

    gl.compileShader(fragShader, fragSrc);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      alert("Error compiling fragment shader");
      console.log(gl.getShaderInfoLog(fragShader));
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.log("Error validating program ", gl.getProgramInfoLog(program));
      return;
    }
    return program;
  }

  createCanvas() {
    this.cnv = document.createElement(`canvas`);
    document.body.appendChild(this.cnv);
    this.cnv.id = "canvas";

    const gl = (this.ctx = this.cnv.getContext("webgl2"));

    const program = this.createProgram();
    gl.useProgram(program);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // prettier-ignore
    const positions = [
      -1.0, -1.0, 
       1.0, -1.0, 
       1.0,  1.0, 
      -1.0,  1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // prettier-ignore
    const indices = [
      0, 1, 2, 
      2, 3, 0
    ];

    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );

    const position_attrib_location = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(position_attrib_location);
    gl.vertexAttribPointer(position_attrib_location, 2, gl.FLOAT, false, 0, 0);

    this.u_MVP = gl.getUniformLocation(program, "u_MVP");
    this.u_lBounds = gl.getUniformLocation(program, "u_bounds");
    this.u_time = gl.getUniformLocation(program, "u_time");
    this.u_Size = gl.getUniformLocation(program, "u_Size");
    this.u_Sampler = gl.getUniformLocation(program, "u_Sampler");
    this.u_Mouse = gl.getUniformLocation(program, "u_Mouse");
    this.u_MouseInt = gl.getUniformLocation(program, "u_MouseInt");
    this.u_asp = gl.getUniformLocation(program, "u_asp");

    this.setCanvasSize();
    window.addEventListener(`resize`, () => {
      this.setCanvasSize();
    });

    this.startTime = Date.now();

    this.texture = loadTexture(gl, "img/bg1.jpg");
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }

  setCanvasSize() {
    this.size.w = this.cnv.width = window.innerWidth;
    this.size.h = this.cnv.height = window.innerHeight;
    this.size.cx = this.size.w / 2;
    this.size.cy = this.size.h / 2;
    this.ctx.viewport(0, 0, this.size.w, this.size.h);
  }

  getMouse() {
    let x = mouse.x;
    let y = mouse.y;

    // console.log(this.mouseintensity);

    if (isFinite(x) && isFinite(y)) {
      this.uvmouse = {
        x: mapclamp(x, 0, this.size.w, 0, 1),
        y: mapclamp(y, 0, this.size.h, 0, 1),
      };

      const dx = x - this.lastmousepos.x;
      const dy = y - this.lastmousepos.y;
      const d = dx * dx + dy * dy;

      this.lastmousepos = {
        ...{ x, y },
      };

      if (d > 0) {
        this.mouseintensity -= mapclamp(d, 0, 2000, 0.0, 0.1);
        this.mouseintensity = this.mouseintensity < 0 ? 0 : this.mouseintensity;
        return;
      }
    }
    this.mouseintensity += 0.01;
    this.mouseintensity = this.mouseintensity > 1 ? 1 : this.mouseintensity;
  }

  updateCanvas() {
    const gl = this.ctx;

    this.time = (Date.now() - this.startTime) / 1000.0;

    this.calculateMVP();

    gl.uniformMatrix4fv(this.u_MVP, false, this.proj);
    gl.uniform4f(this.u_lBounds, this.xmin, this.xmax, this.ymin, this.ymax);
    gl.uniform1f(this.u_time, this.time);
    gl.uniform1f(this.u_Size, this.psize);

    this.getMouse();
    gl.uniform2f(this.u_Mouse, this.uvmouse.x, this.uvmouse.y);
    gl.uniform1f(this.u_MouseInt, this.mouseintensity);

    gl.uniform1f(this.u_asp, this.size.w / this.size.h);
    gl.uniform1i(this.u_Sampler, 0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  onmousedown = (e) => {
    e.preventDefault();

    if (e.button === 0) {
      this.zoom = true;
    }

    if (e.button === 2) {
      this.zoom = false;
    }

    if (!this.zoomInterval) {
      this.zoomInterval = setInterval(this.onZooming, this.interval);
    }
  };

  onZooming = () => {
    let factor = 1;
    let step = Math.max(this.currentFrameTime, this.interval) / 1000.0;

    if (this.zoom === true) {
      factor -= step;
    }

    if (this.zoom === false) {
      factor += step;
    }

    let xpos = mapclamp(mouse.x, 0, this.size.w, this.xmin, this.xmax);
    let ypos = mapclamp(mouse.y, 0, this.size.h, this.ymax, this.ymin);

    let offsetx = xpos * (1 - factor);
    let offsety = ypos * (1 - factor);

    this.xmin = offsetx + this.xmin * factor;
    this.xmax = offsetx + this.xmax * factor;
    this.ymin = offsety + this.ymin * factor;
    this.ymax = offsety + this.ymax * factor;
  };

  clearZoom = (e) => {
    clearInterval(this.zoomInterval);
    this.zoomInterval = undefined;
  };

  oncontextmenu = (e) => {
    e.preventDefault();
  };

  calculateFps() {
    if (this.lastFrameTime == 0) {
      this.lastFrameTime = this.time;
    } else {
      this.currentFrameTime = this.time - this.lastFrameTime;
      this.fpsHistory.push(1 / this.currentFrameTime);
      this.lastFrameTime = this.time;
      if (this.fpsHistory.length > 20) {
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        const avg = sum / this.fpsHistory.length || 0;
        this.fps = avg;
        this.fpsHistory = [];
        if (config.shut !== true) {
          console.log("Animation fps ", Math.round(this.fps, 0));
        }
      }
    }
  }

  // animation loop
  updateAnimation() {
    this.updateCanvas();
    this.calculateFps();
    window.requestAnimationFrame(() => {
      this.updateAnimation();
    });
  }
}

window.onload = () => {
  new Animation().init();
};
