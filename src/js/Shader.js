export default class Shader {
  constructor(gl) {
    this.gl = gl;
    this.uniforms = [];
    this.positionLocation = null;
  }

  createProgram(vertexSource, fragmentSource) {
    const gl = this.gl;
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    const vertSrc = gl.shaderSource(vertShader, vertexSource);
    const fragSrc = gl.shaderSource(fragShader, fragmentSource);

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
    this.program = program;
  }

  useProgram() {
    this.gl.useProgram(this.program);
  }

  addUniform(name, type) {
    const uniform = this.gl.getUniformLocation(this.program, name);
    const u = {
      name,
      type,
      uniform,
    };
    this.uniforms.push(u);
  }

  setUniform() {
    const name = arguments[0];
    const u = this.uniforms.find((u) => u.name === name);
    if (u) {
      switch (u.type) {
        case "4fv":
          this.gl.uniformMatrix4fv(u.uniform, false, arguments[1]);
          return;
        case "1f":
          this.gl.uniform1f(u.uniform, arguments[1]);
          return;
        case "2f":
          this.gl.uniform2f(u.uniform, arguments[1], arguments[2]);
          return;
        case "1i":
          this.gl.uniform1i(u.uniform, arguments[1]);
          return;
      }
    }
  }

  setPositions(name) {
    this.positionLocation = this.gl.getAttribLocation(this.program, name);
    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.vertexAttribPointer(
      this.positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
  }
}
