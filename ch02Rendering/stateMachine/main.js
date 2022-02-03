/**
 * Created by Rick on 2022-01-25.
 */
//'use strict';

// import {vertex_shader, fragment_shader} from "./shaders.js";
import ArrayBufferClass from "../../web-gl-helpers/ArrayBufferClass.js";
import ElementArrayBufferClass from "../../web-gl-helpers/ElementArrayBufferClass.js";
import UniformClass from "../../web-gl-helpers/UniformClass.js";
import VertexArrayObjectClass from "../../web-gl-helpers/VertexArrayObjectClass.js";
import {resizeCanvasToDisplaySize} from "../../web-gl-helpers/HelperFunctions.js";
import {createShader} from "../../web-gl-helpers/HelperFunctions.js";
import {createGLcontext} from "../../web-gl-helpers/HelperFunctions.js";
import {createProgram} from "../../web-gl-helpers/HelperFunctions.js";
import {initializeContext} from "../../web-gl-helpers/HelperFunctions.js";
import {cleanBuffers} from "../../web-gl-helpers/HelperFunctions.js";

import {
  create as m4_create,
  perspective as m4_perspective,
  translate as m4_translate} from '../../gl-matrix/esm/mat4.js';

try {
  const context = createGLcontext('my_canvas');
  const gl = context.gl;
  const canvas = context.canvas;

  // Global variables for GUI
  let vboName,
    iboName,
    vboSize = 0,
    iboSize = 0,
    vboUsage,
    iboUsage,
    isVerticesVbo = false,
    isConeVertexBufferVbo = false,
    doRender = false;

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

  const vertices = [
    1.5, 0, 0,
    -1.5, 1, 0,
    -1.5, 0.809017, 0.587785,
    -1.5, 0.309017, 0.951057,
    -1.5, -0.309017, 0.951057,
    -1.5, -0.809017, 0.587785,
    -1.5, -1, 0,
    -1.5, -0.809017, -0.587785,
    -1.5, -0.309017, -0.951057,
    -1.5, 0.309017, -0.951057,
    -1.5, 0.809017, -0.587785
  ];

  const indices = [
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 5,
    0, 5, 6,
    0, 6, 7,
    0, 7, 8,
    0, 8, 9,
    0, 9, 10,
    0, 10, 1
  ];

  // Create a VAO instance
  // Associate shader attributes with corresponding data buffers
  const vaoObj = new VertexArrayObjectClass(gl);

  // Setting up the VBO at 'a_position_v3'
  const positionBuffer = new ArrayBufferClass(gl, gl.FLOAT, program, 'a_position_v3');
  positionBuffer.setData(vertices, gl.STATIC_DRAW);
  // Create instructions for VAO to use later in the draw
  positionBuffer.bufferFormat(3, false, 0, 0);

  // Setting up the IBO
  const elementBuffer = new ElementArrayBufferClass(gl, "Uint16Array");
  elementBuffer.setData(indices, gl.STATIC_DRAW);

  // Define the uniforms
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

  // Set the GUI global variables based on the parameter type
  if(positionBuffer.arrayBuffer === gl.getParameter(gl.ARRAY_BUFFER_BINDING)){
    vboName = 'coneVertexBuffer';
  }
  if(elementBuffer.indexBuffer === gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING)){
    iboName = 'coneIndexBuffer';
  }

  vboSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
  vboUsage = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_USAGE);

  iboSize = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE);
  iboUsage = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_USAGE);


  try {
    isVerticesVbo = gl.isBuffer(vertices);
  }
  catch (e) {
    isVerticesVbo = false;
  }
  isConeVertexBufferVbo = gl.isBuffer(positionBuffer.arrayBuffer);

  // Clean buffers
  cleanBuffers(gl);

  function draw(){
    initializeContext(gl,[0.0,0.0,0.0,1.0]);

    // rebind VAO
    vaoObj.rebind();

    // Draw
    gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);

    // Clean VAO
    vaoObj.clean();
  }

  function render() {
    if(doRender){
      requestAnimationFrame(render);
      draw();
    }
  }

  // Helper function that updates the elements in the DOM with the
  // appropriate information for illustration purposes
  function updateInfo() {
    document.getElementById('t-vbo-name').innerText = vboName;
    document.getElementById('t-ibo-name').innerText = iboName;
    document.getElementById('t-vbo-size').innerText = vboSize;
    document.getElementById('t-vbo-usage').innerText = vboUsage;
    document.getElementById('t-ibo-size').innerText = iboSize;
    document.getElementById('t-ibo-usage').innerText = iboUsage;
    document.getElementById('s-is-vertices-vbo').innerText = isVerticesVbo ? 'Yes' : 'No';
    document.getElementById('s-is-cone-vertex-buffer-vbo').innerText = isConeVertexBufferVbo ? 'Yes' : 'No';
  }

  function startRender(){
    render()
    // Update the info after we've rendered
    updateInfo();
  }

  const start_render = document.getElementById('start_render')
  start_render.addEventListener('change', (e) => {
    if(e.target.checked){
      doRender = true;
      startRender();
    }else {
      doRender = false;
    }
  })
} catch (e) {
  console.log(e.message);
}
