/**
 * Created by Rick on 2022-01-24.
 */
'use strict';

import {vertex_shader, fragment_shader} from "./shaders.js";
import ArrayBufferClass from "../../web-gl-helpers/ArrayBufferClass.js";
import ElementArrayBufferClass from "../../web-gl-helpers/ElementArrayBufferClass.js";
import {resizeCanvasToDisplaySize} from "../../web-gl-helpers/HelperFunctions.js";
import {createShader} from "../../web-gl-helpers/HelperFunctions.js";
import {createGLcontext} from "../../web-gl-helpers/HelperFunctions.js";
import {createProgram} from "../../web-gl-helpers/HelperFunctions.js";
import {initializeContext} from "../../web-gl-helpers/HelperFunctions.js";

try {
  const context = createGLcontext('my_canvas');
  const gl = context.gl;
  const canvas = context.canvas;

  // Check canvas width and height
  resizeCanvasToDisplaySize(canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Create shader objects
  const vShader = createShader(gl, gl.VERTEX_SHADER, vertex_shader);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragment_shader);

  // Create a WebGLProgram
  const program = createProgram(gl, vShader, fShader);
  // Tell context to use our program (a pair of shaders)
  gl.useProgram(program);

  // Set up the buffers for the square
  const vertices = [
    -0.5, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0,
    0.0, 1.0, 0.0
  ];
  // Indices defined in counter-clockwise order
  const indices = [0, 1, 2,  0, 2, 3,  4, 0, 3];

  // Setting up the VBO at 'a_position_v3'
  const positionAttrib = new ArrayBufferClass(gl, gl.FLOAT, program, 'a_position_v3');
  positionAttrib.setData(vertices, gl.STATIC_DRAW);
  positionAttrib.bufferFormat(3, false, 0, 0);

  // Setting up the IBO
  const elementAttrib = new ElementArrayBufferClass(gl, "Uint16Array");
  elementAttrib.setData(indices, gl.STATIC_DRAW);

  // Bind IBO
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementAttrib.indexBuffer);

  initializeContext(gl,[0.0,0.0,0.0,1.0]);

  // Draw to the scene using triangle primitives
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  // Clean
  positionAttrib.delete();
  elementAttrib.delete();

} catch (e) {
  console.log(e.message);
}
