/**
 * Created by Rick on 2022-01-25.
 */
'use strict';

/**
 * VertexArrayObjectClass provides a way of creating a Vertex Array Object.
 *   For a description see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGLVertexArrayObject)
 *
 */
export default class VertexArrayObjectClass {
  /**
   * Create an instance of VertexArrayObject
   * @param {WebGLRenderingContext} gl The WebGL context
   */
  constructor(gl) {
    this.gl = gl;
    this.vao = gl.createVertexArray();
    // Make vao the one we're currently working with
    gl.bindVertexArray(this.vao);
  }

  /**
   * Rebind the Vertex Array Object
   */
  rebind(){
    this.gl.bindVertexArray(this.vao);
  }
  /**
   * Clean the buffer reference from the graphics hardware
   */
  clean(){
    this.gl.bindVertexArray(null);
  }
  /**
   * Deletes this classes Vertex Array Object instance
   */
  delete(){
    this.gl.deleteVertexArray(this.vao);
  }
}