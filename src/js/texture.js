export default class Texture {
  constructor(gl) {
    this.gl = gl;
    this.level = 0;
    this.internalFormat = this.gl.RGBA;
    this.border = 0;
    this.format = this.gl.RGBA;
    this.srcFormat = this.gl.RGBA;
    this.type = this.gl.UNSIGNED_BYTE;
    this.data = null;
    this.srcType = this.gl.UNSIGNED_BYTE;
    this.pixel = new Uint8Array([106, 163, 149, 255]);
    this.texture = null;
  }

  fromUrl(url) {
    const gl = this.gl;

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      this.level,
      this.internalFormat,
      this.width,
      this.height,
      this.border,
      this.srcFormat,
      this.srcType,
      this.pixel
    );

    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        this.level,
        this.internalFormat,
        this.srcFormat,
        this.srcType,
        image
      );

      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR
      );
    };
    image.src = url;

    return this.texture;
  }

  empty(targetTextureWidth, targetTextureHeight) {
    const gl = this.gl;

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    this.data = null;

    this.targetTextureWidth = targetTextureWidth;
    this.targetTextureHeight = targetTextureHeight;

    gl.texImage2D(
      gl.TEXTURE_2D,
      this.level,
      this.internalFormat,
      this.targetTextureWidth,
      this.targetTextureHeight,
      this.border,
      this.srcFormat,
      this.srcType,
      this.data
    );

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return this.texture;
  }
}
