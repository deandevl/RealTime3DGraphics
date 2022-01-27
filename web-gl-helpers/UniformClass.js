/**
 * Created by Rick on 2021-12-11.
 */
'use strict';

/**
 * UniformClass creates and sets various types
 *   of [uniform variables]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}
 *   defined in shader code.
 */
export default class UniformClass {
  /**
   * Create a UninformClass instance
   * @param {WebGLRenderingContext} gl The WebGL context.
   * @param {WebGLProgram} program The WebGL program.
   * @param {string} name The name of the uniform variable used in the shader code.
   * @param {string} type The type of uniform variable.
   */
  constructor(gl, program, name, type) {
    this.gl = gl;
    this.data_type = type;
    // Look up where the uniform needs to go
    this.uniformLocation = gl.getUniformLocation(program, name);
  }

  /**
   * Set the value of the uniform variable.
   * @param {number[]} args Array of values for the uniform variable.
   *   The number of array elements submitted depends on the type of
   *   variable being set.
   */
  setData(...args){
    switch (this.data_type) {
      case 'uniform1f':
        this.gl.uniform1f(this.uniformLocation, args[0]);
        break;
      case 'uniform2f':
        this.gl.uniform2f(this.uniformLocation, args[0], args[1]);
        break;
      case 'uniform4f':
        this.gl.uniform4f(this.uniformLocation, args[0], args[1], args[2], args[3]);
        break;
      case 'uniform2fv':
        this.gl.uniform2fv(this.uniformLocation, args[0]);
        break;
      case 'uniform3fv':
        this.gl.uniform3fv(this.uniformLocation, args[0]);
        break;
      case 'uniform4fv':
        this.gl.uniform4fv(this.uniformLocation, args[0]);
        break;
      case 'uniformMatrix3fv':
        this.gl.uniformMatrix3fv(this.uniformLocation,false,args[0]);
        break;
      case 'uniformMatrix4fv':
        this.gl.uniformMatrix4fv(this.uniformLocation,false,args[0]);
        break;
      default:
        throw new Error(`UniformClass: function ${this.type} has not been implemented.`);
    }
  }
}