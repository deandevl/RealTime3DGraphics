/**
 * Created by Rick on 2022-01-29.
 */
'use strict';

import {vertex_shader, fragment_shader} from "./shaders.js";
import ArrayBufferClass from "../../web-gl-helpers/ArrayBufferClass.js";
import ElementArrayBufferClass from "../../web-gl-helpers/ElementArrayBufferClass.js";
import UniformClass from "../../web-gl-helpers/UniformClass.js";
import VertexArrayObjectClass from "../../web-gl-helpers/VertexArrayObjectClass.js";
import {
  createGLcontext,
  initializeContext,
  resizeCanvasToDisplaySize,
  createShader,
  createProgram,
  cleanBuffers,
  calculateNormals,
} from "../../web-gl-helpers/HelperFunctions.js";

import {
  create as m4_create,
  perspective as m4_perspective,
  copy as m4_copy,
  invert as m4_invert,
  transpose as m4_transpose,
  translate as m4_translate} from '../../gl-matrix/esm/mat4.js';

import {toRadian} from "../../gl-matrix/esm/common.js";

try {
  //Global variables
  const context = createGLcontext('my_canvas');
  const gl = context.gl;
  const canvas = context.canvas;

  // Configure `gl`
  initializeContext(gl)

  const
    light_direction_v3 = [0, 0, -1],
    light_ambient_v4 = [0.01, 0.01, 0.01, 1],
    light_diffuse_v4 = [0.5, 0.5, 0.5, 1],
    material_diffuse_v4 = [0.1, 0.5, 0.8, 1];

  // Orientation values for later reference
  let azimuth = 0,
    elevation = 0;
  const incrementValue = 10;

  // Check canvas width and height
  resizeCanvasToDisplaySize(canvas);
  // Set viewport
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Create shader objects
  const vShader = createShader(gl, gl.VERTEX_SHADER, vertex_shader);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragment_shader);

  // Create a WebGLProgram
  const program = createProgram(gl, vShader, fShader);
  // Tell context to use our program (a pair of shaders)
  gl.useProgram(program);

  const vertices = [
    -20, -8, 20, // 0
    -10, -8, 0,  // 1
    10, -8, 0,   // 2
    20, -8, 20,  // 3
    -20, 8, 20,  // 4
    -10, 8, 0,   // 5
    10, 8, 0,    // 6
    20, 8, 20    // 7
  ];

  const indices = [
    0, 5, 4,
    1, 5, 0,
    1, 6, 5,
    2, 6, 1,
    2, 7, 6,
    3, 7, 2
  ];

  // Calculate the normals
  const normals = calculateNormals(vertices, indices);

  // Create a VAO instance
  // Associate shader attributes with corresponding data buffers
  const vaoObj = new VertexArrayObjectClass(gl);

  // Setting up the VBO at 'a_position_v3'
  const vertexpositionBuffer = new ArrayBufferClass(gl, gl.FLOAT, program, 'a_position_v3');
  vertexpositionBuffer.setData(vertices, gl.STATIC_DRAW);
  // Create instructions for VAO to use later in the draw
  vertexpositionBuffer.bufferFormat(3, false, 0, 0);

  // Setting up the VBO at 'a_normal_v3'
  const vertexnormalsBuffer = new ArrayBufferClass(gl, gl.FLOAT, program, 'a_normal_v3');
  vertexnormalsBuffer.setData(normals, gl.STATIC_DRAW);
  // Create instructions for VAO to use later in the draw
  vertexnormalsBuffer.bufferFormat(3, false, 0, 0);

  // Setting up the IBO
  const elementBuffer = new ElementArrayBufferClass(gl, "Uint16Array");
  elementBuffer.setData(indices, gl.STATIC_DRAW);

  // Define the uniforms
  // Define 'u_modelview_m4' -- this does not change and will not be modified in draw() function
  const u_modelview = new UniformClass(gl, program, 'u_modelview_m4', 'uniformMatrix4fv');
  const modelview_m4 = m4_create();
  m4_translate(modelview_m4, modelview_m4, [0, 0, -40]);
  // Set the uniform 'u_modelview'
  u_modelview.setData(modelview_m4);

  // Define 'u_projection_m4' -- this does not change and will not be modified in draw() function
  const u_projection = new UniformClass(gl, program, 'u_projection_m4', 'uniformMatrix4fv');
  const projection_m4 = m4_create();
  m4_perspective(projection_m4, 45, gl.canvas.width / gl.canvas.height, 0.1, 10000);
  // Set the uniform 'u_projection'
  u_projection.setData(projection_m4);

  // Define 'u_normal_m4' -- this does not change and will not be modified in draw() function
  const u_normal = new UniformClass(gl, program, 'u_normal_m4', 'uniformMatrix4fv');
  const normal_m4 = m4_create();
  m4_copy(normal_m4, modelview_m4);
  m4_invert(normal_m4,normal_m4);
  m4_transpose(normal_m4, normal_m4);
  u_normal.setData(normal_m4);

  // Define 'u_lightdirection_v3' and initialize it
  const u_lightdirection = new UniformClass(gl, program, 'u_lightdirection_v3', 'uniform3fv');
  u_lightdirection.setData([-light_direction_v3[0], -light_direction_v3[1], light_direction_v3[2]]);

  // Define 'u_lightambient_v4' and initialize it
  const u_lightambient = new UniformClass(gl, program, 'u_lightambient_v4', 'uniform4fv');
  u_lightambient.setData(light_ambient_v4);

  // Define 'u_lightdiffuse_v4' and initialize it
  const u_lightdiffuse = new UniformClass(gl, program, 'u_lightdiffuse_v4', 'uniform4fv');
  u_lightdiffuse.setData(light_diffuse_v4);

  // Define 'u_materialdiffuse_v4' and initialize it
  const u_materialdiffuse = new UniformClass(gl, program, 'u_materialdiffuse_v4', 'uniform4fv');
  u_materialdiffuse.setData(material_diffuse_v4);

  function draw() {
    // rebind VAO
    vaoObj.rebind();

    // rebind Element Array Buffer
    elementBuffer.rebind();

    // Draw
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    //Clean
    cleanBuffers(gl);
  }

  function render() {
    requestAnimationFrame(render);
    draw();
  }

  // ui stuff
  function processKey(ev){
    switch (ev.keyCode) {
      // left arrow
      case 37: {
        azimuth -= incrementValue;
        break;
      }
      // up arrow
      case 38: {
        elevation += incrementValue;
        break;
      }
      // right arrow
      case 39: {
        azimuth += incrementValue;
        break;
      }
      // down arrow
      case 40: {
        elevation -= incrementValue;
        break;
      }
    }
    azimuth %= 360;
    elevation %= 360;

    const theta = toRadian(elevation);
    const phi = toRadian(azimuth);

    // Spherical to cartesian coordinate transformation
    light_direction_v3[0] = Math.cos(theta) * Math.sin(phi);
    light_direction_v3[1] = Math.sin(theta);
    light_direction_v3[2] = Math.cos(theta) * -Math.cos(phi);

    u_lightdirection.setData(light_direction_v3);
  }

  // Invoke `processKey` on the `onkeydown` event
  document.onkeydown = processKey;

  // Start the rendering of scene
  render();

} catch (e) {
  console.log(e.message);
}