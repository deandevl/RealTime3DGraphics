/**
 * Created by Rick on 2022-02-03.
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
  denormalizeColor,
  hexToRGB,
  normalizeColor,
  rgbToHex
} from "../../web-gl-helpers/HelperFunctions.js";

import {
  create as m4_create,
  perspective as m4_perspective,
  copy as m4_copy,
  invert as m4_invert,
  transpose as m4_transpose,
  translate as m4_translate,
  rotate as m4_rotate, identity as m4_identity
} from '../../gl-matrix/esm/mat4.js';

import {toRadian} from "../../gl-matrix/esm/common.js";

try {
  //Global variables
  const context = createGLcontext('my_canvas');
  const gl = context.gl;
  const canvas = context.canvas;
  let clear_color = [0.9, 0.4, 0.9, 1.0];

  const
    light_position_v3 = [100, 400, 100],
    light_ambient_v3 = [0.1, 0.1, 0.1];

  const
    material_diffuse_v3 = [0.8, 0.8, 0.8],
    material_specular_v3 = [0.5, 0.5, 0.5];

  let
    normal_m4 = m4_create(),
    modelview_m4 = m4_create();

  let
    shininess = 50,
    distance = -120;

      // Animation related variables
  // The amount of angle we rotate the sphere around the y axis
  let
    y_angle = 0,
    // Keep track of last time
    lastTime,
    rotate_axis = [0, 1, 0];

  // Car parts (179)
  const parts = [];

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

  // Define the uniforms
  // Define 'u_modelview_m4' -- this will be modified in the draw() function
  const u_modelview = new UniformClass(gl, program, 'u_modelview_m4', 'uniformMatrix4fv');

  // Define 'u_projection_m4' -- this does not change and will not be modified in draw() function
  const u_projection = new UniformClass(gl, program, 'u_projection_m4', 'uniformMatrix4fv');
  const projection_m4 = m4_create();
  m4_perspective(projection_m4, 45, gl.canvas.width / gl.canvas.height, 1, 10000);
  // Set the uniform 'u_projection'
  u_projection.setData(projection_m4);

  // Define 'u_normal_m4' -- this will be modified in the draw() function
  const u_normal = new UniformClass(gl, program, 'u_normal_m4', 'uniformMatrix4fv');

  // Define 'u_lightposition_v3' and initialize it
  const u_lightposition = new UniformClass(gl, program, 'u_lightposition_v3', 'uniform3fv');
  u_lightposition.setData([light_position_v3[0], light_position_v3[1], light_position_v3[2]]);

  // Define 'u_lightambient_v3' and initialize it
  const u_lightambient = new UniformClass(gl, program, 'u_lightambient_v3', 'uniform3fv');
  u_lightambient.setData(light_ambient_v3);

  // Define 'u_materialdiffuse_v3' and initialize it
  const u_materialdiffuse = new UniformClass(gl, program, 'u_materialdiffuse_v3', 'uniform3fv');
  u_materialdiffuse.setData(material_diffuse_v3);

  // Define 'u_materialspecular_v3' and initialize it
  const u_materialspecular = new UniformClass(gl, program, 'u_materialspecular_v3', 'uniform3fv');
  u_materialspecular.setData(material_specular_v3);

  // Define 'u_shininess_f' and initialize it
  const u_shininess = new UniformClass(gl, program, 'u_shininess_f', 'uniform1f');
  u_shininess.setData(shininess);

  //Clean
  cleanBuffers(gl);

  // UI stuff
  // Car Color
  const car_color_ele = document.getElementById("car_color_input");
  // Set the initial value
  let rgb_denormalize = denormalizeColor(material_diffuse_v3);
  car_color_ele.value = rgbToHex(rgb_denormalize);
  car_color_ele.addEventListener("change", (e) => {
    const str = e.target.value;
    const rgb = hexToRGB(str);
    const val = normalizeColor(rgb);
    u_materialdiffuse.setData(val);
  })

  // Background clear_color
  const background_color_ele = document.getElementById('background_color_input');
  // Set the initial value
  rgb_denormalize = denormalizeColor(clear_color);
  background_color_ele.value = rgbToHex(rgb_denormalize);
  background_color_ele.addEventListener("change", (e) => {
    const str = e.target.value;
    const rgb = hexToRGB(str);
    clear_color = normalizeColor(rgb);
  })

  // Shininess
  const shininess_ele = document.getElementById('shininess_input');
  const shininess_out_ele = document.getElementById('shininess_out');
  shininess_ele.value = shininess.toString();
  shininess_out_ele.value = shininess.toString();
  shininess_ele.addEventListener("change", (e) => {
    const val = parseFloat(e.target.value);
    shininess_out_ele.value = val;
    u_shininess.setData(val)
  })

  // Light translate X
  const x_translate_ele = document.getElementById("x_trans_input");
  const x_out_ele = document.getElementById("x_out");
  const x_value = light_position_v3[0].toString();
  // Set the initial value
  x_translate_ele.value = x_value;
  x_out_ele.value = x_value;
  x_translate_ele.addEventListener("change", (e) => {
    light_position_v3[0] = parseInt(e.target.value);
    x_out_ele.value = e.target.value;
    //u_lightposition.setData([-light_position_v3[0], -light_position_v3[1], light_position_v3[2]]);
    u_lightposition.setData(light_position_v3);
  })

  // Light translate Y
  const y_translate_ele = document.getElementById("y_trans_input");
  const y_out_ele = document.getElementById("y_out");
  const y_value = light_position_v3[1].toString();
  // Set the initial value
  y_translate_ele.value = y_value;
  y_out_ele.value = y_value;
  y_translate_ele.addEventListener("change", (e) => {
    light_position_v3[1] = parseInt(e.target.value);
    y_out_ele.value = e.target.value;
    //u_lightposition.setData([-light_position_v3[0], -light_position_v3[1], light_position_v3[2]]);
    u_lightposition.setData(light_position_v3);
  })

  // Light translate Z
  const z_translate_ele = document.getElementById("z_trans_input");
  const z_out_ele = document.getElementById("z_out");
  const z_value = light_position_v3[2].toString();
  // Set the initial value
  z_translate_ele.value = z_value;
  z_out_ele.value = z_value;
  z_translate_ele.addEventListener("change", (e) => {
    light_position_v3[2] = parseInt(e.target.value);
    z_out_ele.value = e.target.value;
    //u_lightposition.setData([-light_position_v3[0], -light_position_v3[1], light_position_v3[2]]);
    u_lightposition.setData(light_position_v3);
  })

  const distance_ele = document.getElementById("distance_input");
  const distance_out_ele = document.getElementById("distance_out");
  distance_ele.value = distance;
  distance_out_ele.value = distance;
  distance_ele.addEventListener("change", (e) => {
    distance = parseFloat(e.target.value);
    distance_out_ele.value = e.target.value;
  })

  function draw() {
    initializeContext(gl, clear_color);
    // Update the uniform 'u_modelview_m4' matrix
    m4_identity(modelview_m4);
    m4_translate(modelview_m4, modelview_m4, [0, 0, distance]);
    // Modify modelview_m4 matrix with a rotation amount of y_angle from
    //   frame animation
    m4_rotate(modelview_m4, modelview_m4, toRadian(y_angle), rotate_axis);
    m4_rotate(modelview_m4, modelview_m4, toRadian(20), [1,0,0]);
    // Update the uniform 'u_modelview' with the new y-axis rotation
    u_modelview.setData(modelview_m4);

    // Update the uniform 'u_normal' matrix
    m4_copy(normal_m4, modelview_m4);
    m4_invert(normal_m4, normal_m4);
    m4_transpose(normal_m4, normal_m4);
    // Set the uniform 'u_normal' matrix
    u_normal.setData(normal_m4);

    // Iterate over every part inside of the `parts` array
    parts.forEach(part => {
      part.vao.rebind();
      part.ibo.rebind();
      // Draw
      gl.drawElements(gl.TRIANGLES, part.ibo.buffer_length, gl.UNSIGNED_SHORT, 0);
    });
  }

  // Simple animation function for changing the y_angle which
  //   multiplies the amount of rotation to modelview_m4 matrix
  function increase_y_angle() {
    let timeNow = new Date().getTime();
    if (lastTime) {
      const elapsed = timeNow - lastTime;
      y_angle += (90 * elapsed) / 4000.0;
    }
    lastTime = timeNow;
  }

  function render() {
    requestAnimationFrame(render);
    draw();
    increase_y_angle();
  }

  async function loadGeometry(){
    for(let i = 1; i < 179; i++){
      const part = {};
      const response = await fetch(`../../models/nissan-gtr/part${i}.json`);
      // Push data onto parts array
      const data = await response.json();

      // Create a VAO instance
      // Associate shader attributes with corresponding data buffers
      const vao = new VertexArrayObjectClass(gl);

      // Vertices
      // Setting up the VBO at 'a_vertexposition_v3'
      const vertexpositionBuffer = new ArrayBufferClass(gl, gl.FLOAT, program, 'a_vertexposition_v3');
      vertexpositionBuffer.setData(data.vertices, gl.STATIC_DRAW);
      // Create instructions for VAO to use later in the draw
      vertexpositionBuffer.bufferFormat(3, false, 0, 0);

      // Normals
      // Calculate the normals
      const normals = calculateNormals(data.vertices, data.indices);
      // Setting up the VBO at 'a_vertexnormal_v3'
      const vertexnormalBuffer = new ArrayBufferClass(gl, gl.FLOAT, program, 'a_vertexnormal_v3');
      vertexnormalBuffer.setData(normals, gl.STATIC_DRAW);
      // Create instructions for VAO to use later in the draw
      vertexnormalBuffer.bufferFormat(3, false, 0, 0);

      // Setting up the IBO
      const indexBuffer = new ElementArrayBufferClass(gl, "Uint16Array");
      indexBuffer.setData(data.indices, gl.STATIC_DRAW);

      // Attach values to be able to reference later for drawing
      part.vao = vao;
      part.ibo = indexBuffer;
      // Push onto objects for later reference
      parts.push(part);

      // Clean
      cleanBuffers(gl);
    }
  }

  loadGeometry().then(() => {
    render();
  })
} catch (e) {
  console.log(e.message);
}
