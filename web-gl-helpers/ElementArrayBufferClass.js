/**
 * Created by Rick on 2022-01-15.
 */
'use strict';
/**
 * ElementArrayBufferClass provides a way of defining vertex indices
 *   and using gl.drawElements for drawing the geometry.
 *   See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer) for a
 *     description of data buffers.
 *   See [WebGL2 Indexed Vertices]{@link https://webgl2fundamentals.org/webgl/lessons/webgl-indexed-vertices.html}
 *     for using indexed vertices.
 */
export default class ElementArrayBufferClass {
  /**
   * Create an instance of ElementArrayBufferClass
   * @param gl {WebGLRenderingContext} gl The WebGL context
   * @param type {string} The numeric type for the indices.
   *   Acceptable values are "Uint8Array" or "Uint16Array".
   */
  constructor(gl, type) {
    this.gl = gl;
    this.buffer_type = 'ELEMENT';
    this.data_type = type;
    this.buffer_length = 0;
    // Create a buffer to put the element index values
    this.indexBuffer = gl.createBuffer();
  }

  /**
   * Set the indices of the geometry's vertices
   * @param {number[]} indices A numeric array of vertex indices.
   * @param {number} usage Specifies the intended [usage pattern]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData} of the data store for optimization purposes.
   */
  setData(indices, usage) {
    this.buffer_length = indices.length;
    // Bind this.buffer to WebGL's internal ELEMENT_ARRAY_BUFFER
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    switch(this.data_type){
      case "Uint8Array":
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
          new Uint8Array(indices), usage);
        break;
      case "Uint16Array":
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(indices), usage);
        break;
    }
  }

  /**
   * Rebind the index buffer
   */
  rebind(){
    // Bind this.buffer to WebGL's internal ELEMENT_ARRAY_BUFFER
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  /**
   * Delete this classes index buffer instance
   */
  delete(){
    this.gl.deleteBuffer(this.indexBuffer);
  }
}