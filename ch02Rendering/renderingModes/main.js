/**
 * Created by Rick on 2022-01-25.
 */
'use strict';

import {vertex_shader, fragment_shader} from "./shaders.js";
import ArrayBufferClass from "../../web-gl-helpers/ArrayBufferClass.js";
import ElementArrayBufferClass from "../../web-gl-helpers/ElementArrayBufferClass.js";
import VertexArrayObjectClass from "../../web-gl-helpers/VertexArrayObjectClass.js";
import {resizeCanvasToDisplaySize} from "../../web-gl-helpers/HelperFunctions.js";
import {createShader} from "../../web-gl-helpers/HelperFunctions.js";
import {createGLcontext} from "../../web-gl-helpers/HelperFunctions.js";
import {createProgram} from "../../web-gl-helpers/HelperFunctions.js";
import {initializeContext} from "../../web-gl-helpers/HelperFunctions.js";
import {cleanBuffers} from "../../web-gl-helpers/HelperFunctions.js";


try {
  const context = createGLcontext('my_canvas');
  const gl = context.gl;
  const canvas = context.canvas;

  let renderingMode = 'NONE';
  let indices;

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

  // Set up the buffers for the geometry
  const vertices = [
    -0.5, -0.5, 0,
    -0.25, 0.5, 0,
    0.0, -0.5, 0,
    0.25, 0.5, 0,
    0.5, -0.5, 0
  ];

  // Create a VAO instance
  // Associate shader attributes with corresponding data buffers
  const vaoObj = new VertexArrayObjectClass(gl);

  // Setting up the VBO at 'a_position_v3'
  const positionAttrib = new ArrayBufferClass(gl, gl.FLOAT, program, 'a_position_v3');
  positionAttrib.setData(vertices, gl.STATIC_DRAW);
  // Create instructions for VAO to use later in the draw
  positionAttrib.bufferFormat(3, false, 0, 0);

  // Setting up the IBO
  const elementAttrib = new ElementArrayBufferClass(gl, "Uint16Array");

  // Clean vao buffer, position array buffer, element array buffer
  cleanBuffers(gl);

  function draw(){
    initializeContext(gl,[0.0,0.0,0.0,1.0]);

    // rebind VAO
    vaoObj.rebind();

    switch(renderingMode){
      case 'TRIANGLES': {
        indices = [0, 1, 2, 2, 3, 4];
        elementAttrib.setData(indices, gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        break;
      }
      case 'LINES': {
        indices = [1, 3, 0, 4, 1, 2, 2, 3];
        elementAttrib.setData(indices, gl.STATIC_DRAW);
        gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
        break;
      }
      case 'POINTS': {
        indices = [1, 2, 3];
        elementAttrib.setData(indices, gl.STATIC_DRAW);
        gl.drawElements(gl.POINTS, indices.length, gl.UNSIGNED_SHORT, 0);
        break;
      }
      case 'LINE_LOOP': {
        indices = [2, 3, 4, 1, 0];
        elementAttrib.setData(indices, gl.STATIC_DRAW);
        gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
        break;
      }
      case 'LINE_STRIP': {
        indices = [2, 3, 4, 1, 0];
        elementAttrib.setData(indices, gl.STATIC_DRAW);
        gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
        break;
      }
      case 'TRIANGLE_STRIP': {
        indices = [0, 1, 2, 3, 4];
        elementAttrib.setData(indices, gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
        break;
      }
      case 'TRIANGLE_FAN': {
        indices = [0, 1, 2, 3, 4];
        elementAttrib.setData(indices, gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLE_FAN, indices.length, gl.UNSIGNED_SHORT, 0);
        break;
      }
    }
    // Clean VAO
    vaoObj.clean();
  }

  function render() {
    requestAnimationFrame(render);
    draw();
  }

  // GUI support
  const select_render = document.getElementById('select_render');
  select_render.addEventListener('change', (e) => {
    renderingMode = e.target.value;
  })

  render();
} catch (e) {
  console.log(e.message);
}