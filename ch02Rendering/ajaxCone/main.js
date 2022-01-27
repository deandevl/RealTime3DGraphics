/**
 * Created by Rick on 2022-01-26.
 */
'use strict';

import {vertex_shader, fragment_shader} from "./shaders.js";
import ArrayBufferClass from "../../web-gl-helpers/ArrayBufferClass.js";
import ElementArrayBufferClass from "../../web-gl-helpers/ElementArrayBufferClass.js";
import UniformClass from "../../web-gl-helpers/UniformClass.js";
import VertexArrayObjectClass from "../../web-gl-helpers/VertexArrayObjectClass.js";
import {resizeCanvasToDisplaySize} from "../../web-gl-helpers/HelperFunctions.js";
import {createShader} from "../../web-gl-helpers/HelperFunctions.js";
import {createGLcontext} from "../../web-gl-helpers/HelperFunctions.js";
import {createProgram} from "../../web-gl-helpers/HelperFunctions.js";
import {initializeContext} from "../../web-gl-helpers/HelperFunctions.js";

import {
  create as m4_create,
  perspective as m4_perspective,
  translate as m4_translate} from '../../gl-matrix/esm/mat4.js';

async function loadGeometry(file_path){
  const response = await fetch(file_path);
  return await response.json();
}

try {
  const context = createGLcontext('my_canvas');
  const gl = context.gl;
  const canvas = context.canvas;

  //Global variables
  let indices_length = 0;

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

  // Create a VAO instance
  // Associate shader attributes with corresponding data buffers
  const vaoObj = new VertexArrayObjectClass(gl);

  // Setting up the VBO at 'a_position_v3'
  const positionBuffer = new ArrayBufferClass(gl, gl.FLOAT, program, 'a_position_v3');
  // Create instructions for VAO to use later in the draw
  positionBuffer.bufferFormat(3, false, 0, 0);

  // Setting up the IBO
  const elementBuffer = new ElementArrayBufferClass(gl, "Uint16Array");

  // Define the uniforms
  // Define 'u_modelcolor_v3'
  const u_modelcolor = new UniformClass(gl, program, 'u_modelcolor_v3', 'uniform3fv');
  // Define 'u_modelview_m4'
  const u_modelview = new UniformClass(gl, program, 'u_modelview_m4', 'uniformMatrix4fv');
  // Define 'u_projection_m4'
  const u_projection = new UniformClass(gl, program, 'u_projection_m4', 'uniformMatrix4fv');

  // Define the projection matrix
  const projection_m4 = m4_create();
  m4_perspective(projection_m4, 45, gl.canvas.width / gl.canvas.height, 0.1, 10000);
  // Set the uniform 'u_projection'
  u_projection.setData(projection_m4);

  // Define the translation
  const modelview_m4 = m4_create();
  m4_translate(modelview_m4, modelview_m4, [0, 0, -5]);
  // Set the uniform 'u_modelview'
  u_modelview.setData(modelview_m4);

  function draw(){
    initializeContext(gl,[0.0,0.0,0.0,1.0]);

    // Bind VAO
    vaoObj.bind();
    // Draw wire
    gl.drawElements(gl.LINE_LOOP, indices_length, gl.UNSIGNED_SHORT, 0);

    // Draw solid
    //gl.drawElements(gl.TRIANGLES, indices_length, gl.UNSIGNED_SHORT, 0);

    // Clean the Vertex Array Object
    vaoObj.clean();
  }

  // Although we don't necessarily need to call `draw` on every
  // rendering cycle in this example, we will soon cover why this is important
  function render() {
    requestAnimationFrame(render);
    draw();
  }

  // Load the geometry and set the respective vertex shader variables
  loadGeometry('../../models/cone1.json').then((data) => {
    positionBuffer.setData(data.vertices, gl.STATIC_DRAW);
    elementBuffer.setData(data.indices, gl.STATIC_DRAW);
    u_modelcolor.setData(data.color);

    indices_length = data.indices.length;
    // Start rendering
    render();
  })

} catch (e) {
  console.log(e.message);
}

