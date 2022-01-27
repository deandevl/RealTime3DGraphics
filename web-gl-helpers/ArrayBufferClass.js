/**
 * Created by Rick on 2021-12-11.
 */
'use strict';

/**
 * ArrayBufferClass provides functions for working with a vertex shader's attribute variables.
 *   The class establishes an array buffer for sending vertex attributes, such as vertex coordinates,
 *   texture coordinate data, or vertex color data through the graphics hardware pipeline.
 *   See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer) for a
 *     description of data buffers.
 *   See [WebGL Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html) for
 *     an explanation on data buffers.
 *
 */
export default class ArrayBufferClass {
  /**
   * Create an AttributeClass instance
   * @param {WebGLRenderingContext} gl The WebGL context
   * @param {number} type  Specifying the [data type]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer}
   *   of each element in the array.
   * @param {WebGLProgram} program The WebGL program.
   * @param {string} name The name of the attribute variable used in the vertex shader code.
   */
  constructor(gl,type, program, name) {
    this.gl = gl;
    this.buffer_type = 'ARRAY';
    this.data_type = type;
    // Look up where the attribute needs to go
    this.attributeLocation = this.gl.getAttribLocation(program, name);
    this.arrayBuffer = this.gl.createBuffer();
  }

  /**
   * Describes how the attribute is read from the buffer pipeline.
   * @param {number} size  The number of components per vertex attribute. Must be 1, 2, 3, or 4.
   * @param {boolean} normalize Specifying whether integer data values should be normalized.
   * @param {number} stride Specifying the offset in bytes between the beginning of consecutive vertex attributes.
   * @param {number} offset Specifying an offset in bytes of the first component in the vertex attribute array.
   */
  bufferFormat(size, normalize, stride, offset) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.arrayBuffer);
    // Tell the attribute how to get data out of the internal ARRAY_BUFFER
    this.gl.vertexAttribPointer(
      this.attributeLocation,
      size,
      this.data_type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(this.attributeLocation);
  }

  /**
   * Initializes and creates the buffer object's data store.
   * @param {Array} attributes Array containing
   *   vertex attributes, such as vertex coordinates, texture coordinate data, or vertex color data.
   * @param {number} usage Specifies the intended [usage pattern]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData} of the data store for optimization purposes.
   */
  setData(attributes, usage){
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.arrayBuffer);
    // Check if we need to flatten 'attributes'
    let values;
    values = attributes;
    if(typeof(attributes[0]) == 'number'){
      values = new Array(attributes.length);
      for(let i = 0; i<attributes.length; i++)
        values[i] = attributes[i];
    }else if(Array.isArray(attributes)){
      values = new Array(attributes.length * attributes[0].length);
      for(let i = 0; i < attributes.length; i++) {
        for(let j = 0; j < attributes[0].length; j++){
          values[i * attributes[0].length + j] = attributes[i][j];
        }
      }
    }

    // Set geometry
    switch(this.data_type){
      case this.gl.FLOAT:
        this.gl.bufferData(
          this.gl.ARRAY_BUFFER,
          new Float32Array(values),
          usage
        );
      break;
      case this.gl.UNSIGNED_BYTE:
        this.gl.bufferData(
          this.gl.ARRAY_BUFFER,
          new Uint8Array(values),
          usage
        );
        break;
    }
  }

  /**
   * Delete this classes array buffer instance
   */
  delete(){
    this.gl.deleteBuffer(this.arrayBuffer);
  }
}