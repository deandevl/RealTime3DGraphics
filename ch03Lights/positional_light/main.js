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
  denormalizeColor,
  hexToRGB,
  normalizeColor,
  rgbToHex
} from "../../web-gl-helpers/HelperFunctions.js";

import {
  create as m4_create,
  identity as m4_idenity,
  perspective as m4_perspective,
  copy as m4_copy,
  invert as m4_invert,
  transpose as m4_transpose,
  translate as m4_translate,
  rotate as m4_rotate} from '../../gl-matrix/esm/mat4.js';

import {toRadian} from "../../gl-matrix/esm/common.js";

try {
  //Global variables
  const context = createGLcontext('my_canvas');
  const gl = context.gl;
  const canvas = context.canvas;

  const
    light_position_v3 = [4.5, 3, 15],
    light_ambient_v4 = [1, 1, 1, 1],
    light_diffuse_v4 = [1, 1, 1, 1],
    light_specular_v4 = [1, 1, 1, 1];

  const
    material_ambient_v4 = [0.1, 0.1, 0.1, 1],
    material_diffuse_v4 = [0.5, 0.8, 0.1, 1],
    material_specular_v4 = [0.6, 0.6, 0.6, 1];

  let
    shininess = 50,
    distance = -100;

  let
    normal_m4 = m4_create(),
    modelview_m4 = m4_create();

  // Animation related variables
  // The amount of angle we rotate the sphere around the y axis
  let y_angle = 0,
  // Keep track of last time
    lastTime;

  const objects = [];

  async function loadGeometry(filePath, alias){
    const resp = await fetch(filePath);
    if(resp.ok){
      const data = await resp.json();
      data.alias = alias;
      // Configure VAO
      const vaoObj = new VertexArrayObjectClass(gl);

      // Setting up the VBO at 'a_position_v3'
      const positionBuffer = new ArrayBufferClass(gl, gl.FLOAT, program, 'a_position_v3');
      positionBuffer.setData(data.vertices, gl.STATIC_DRAW);
      // Create instructions for VAO to use later in the draw
      positionBuffer.bufferFormat(3, false, 0, 0);

      // Setting up the VBO at 'a_normal_v3'
      // Calculate the normals
      const normals = calculateNormals(data.vertices, data.indices);
      const normalsBuffer = new ArrayBufferClass(gl, gl.FLOAT, program, 'a_normal_v3');
      normalsBuffer.setData(normals, gl.STATIC_DRAW);
      // Create instructions for VAO to use later in the draw
      normalsBuffer.bufferFormat(3, false, 0, 0);

      // Setting up the IBO
      const indexBuffer = new ElementArrayBufferClass(gl, "Uint16Array");
      indexBuffer.setData(data.indices, gl.STATIC_DRAW);

      // Attach values to be able to reference later for drawing
      data.vao = vaoObj;
      data.ibo = indexBuffer;

      // Push onto objects for later reference
      objects.push(data);

      // Clean
      cleanBuffers(gl);
    }else {
      throw new Error(`Loading geometry from ${filePath}, Status: ${resp.status}`);
    }
  }

  // Configure `gl`
  initializeContext(gl,);
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

  // Define the uniforms
  // Define 'u_modelview_m4' -- this will be modified in the draw() function
  const u_modelview = new UniformClass(gl, program, 'u_modelview_m4', 'uniformMatrix4fv');

  // Define 'u_projection_m4' -- this does not change and will not be modified in draw() function
  const u_projection = new UniformClass(gl, program, 'u_projection_m4', 'uniformMatrix4fv');
  const projection_m4 = m4_create();
  m4_perspective(projection_m4, 45, gl.canvas.width / gl.canvas.height, 0.1, 1000);
  // Set the uniform 'u_projection'
  u_projection.setData(projection_m4);

  // Define 'u_normal_m4' -- this will be modified in the draw() function
  const u_normal = new UniformClass(gl, program, 'u_normal_m4', 'uniformMatrix4fv');

  // Define 'u_lightposition_v3' and initialize it
  const u_lightposition = new UniformClass(gl, program, 'u_lightposition_v3', 'uniform3fv');
  u_lightposition.setData([-light_position_v3[0], -light_position_v3[1], light_position_v3[2]]);

  // Define 'u_lightambient_v4' and initialize it
  const u_lightambient = new UniformClass(gl, program, 'u_lightambient_v4', 'uniform4fv');
  u_lightambient.setData(light_ambient_v4);

  // Define 'u_lightdiffuse_v4' and initialize it
  const u_lightdiffuse = new UniformClass(gl, program, 'u_lightdiffuse_v4', 'uniform4fv');
  u_lightdiffuse.setData(light_diffuse_v4)

  // Define 'u_lightspecular_v4' and initialize it
  const u_lightspecular = new UniformClass(gl, program, 'u_lightspecular_v4', 'uniform4fv');
  u_lightspecular.setData(light_specular_v4);

  // Define 'u_materialambient_v4' and initialize it
  const u_materialambient = new UniformClass(gl, program, 'u_materialambient_v4', 'uniform4fv');
  u_materialambient.setData(material_ambient_v4);

  // Define 'u_materialdiffuse_v4' and initialize it
  const u_materialdiffuse = new UniformClass(gl, program, 'u_materialdiffuse_v4', 'uniform4fv');
  u_materialdiffuse.setData(material_diffuse_v4);

  // Define 'u_materialspecular_v4' and initialize it
  const u_materialspecular = new UniformClass(gl, program, 'u_materialspecular_v4', 'uniform4fv');
  u_materialspecular.setData(material_specular_v4);

  // Define 'u_shininess_f' and initialize it
  const u_shininess = new UniformClass(gl, program, 'u_shininess_f', 'uniform1f');
  u_shininess.setData(shininess);

  async function loadOjects(){
    await loadGeometry('./geometries/plane.json', 'plane');
    await loadGeometry('./geometries/cone2.json', 'cone');
    await loadGeometry('./geometries/sphere1.json', 'sphere');
    await loadGeometry('./geometries/sphere3.json', 'light');
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

  function draw(){
    // Iterate over every object
    objects.forEach(object => {
      // Update the uniform 'u_modelview_m4' matrix
      m4_idenity(modelview_m4);
      m4_translate(modelview_m4, modelview_m4, [0, 0, distance]);
      m4_rotate(modelview_m4, modelview_m4, toRadian(y_angle), [0, 1, 0]);

      // If object is the light, we update its position
      if(object.alias === 'light'){
        m4_translate(modelview_m4, modelview_m4, u_lightposition.data);
      }
      // Update the uniform 'u_modelview'
      u_modelview.setData(modelview_m4);

      // Update the uniform 'u_normal' matrix
      m4_copy(normal_m4, modelview_m4);
      m4_invert(normal_m4, normal_m4);
      m4_transpose(normal_m4, normal_m4);
      u_normal.setData(normal_m4);

      // Set material lighting data
      u_materialambient.setData(object.ambient);
      u_materialdiffuse.setData(object.diffuse);
      u_materialspecular.setData(object.specular);

      // Rebind VertexArray
      object.vao.rebind();
      object.ibo.rebind();

      // Draw
      gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);

      // Clean
      cleanBuffers(gl);
    })
  }

  // UI stuff
  // Sphere Color
  const sphere_color_ele = document.getElementById("sphere_color_input");
  // Set the initial value
  let rgb = [0,255,0];
  sphere_color_ele.value = rgbToHex(rgb);
  sphere_color_ele.addEventListener("change", (e) => {
    const str = e.target.value;
    const rgb = hexToRGB(str);
    const val = normalizeColor(rgb);
    const object = objects.find(obj => {obj.alias === 'sphere'});
    object.diffuse = [...val, 1];
  })

  // Cone color
  const cone_color_ele = document.getElementById("cone_color_input");
  // Set the initial value
  rgb = [235, 0, 210];
  cone_color_ele.value = rgbToHex(rgb);
  cone_color_ele.addEventListener("change", (e) => {
    const str = e.target.value;
    const rgb = hexToRGB(str);
    const val = normalizeColor(rgb);
    const object = objects.find(obj => {obj.alias === 'cone'});
    object.diffuse = [...val, 1];
  })

  // Shininess
  const shininess_ele = document.getElementById("shininess_input");
  const shininess_out_ele = document.getElementById("shininess_out");
  shininess_ele.value = shininess;
  shininess_out_ele.value = shininess;
  shininess_ele.addEventListener("change", (e) => {
    const val = parseFloat(e.target.value);
    u_shininess.setData(val);
    shininess_out_ele.value = e.target.value;
  })

  const x_translate_ele = document.getElementById("x_trans_input");
  const x_out_ele = document.getElementById("x_out");
  const x_value = light_position_v3[0].toString();
  // Set the initial value
  x_translate_ele.value = x_value;
  x_out_ele.value = x_value;
  x_translate_ele.addEventListener("change", (e) => {
    light_position_v3[0] = parseInt(e.target.value);
    u_lightposition.setData(light_position_v3);
    x_out_ele.value = e.target.value;
  })

  const y_translate_ele = document.getElementById("y_trans_input");
  const y_out_ele = document.getElementById("y_out");
  const y_value = light_position_v3[1].toString();
  // Set the initial value
  y_translate_ele.value = y_value;
  y_out_ele.value = y_value;
  y_translate_ele.addEventListener("change", (e) => {
    light_position_v3[1] = parseInt(e.target.value);
    u_lightposition.setData(light_position_v3);
    y_out_ele.value = e.target.value;
  })

  const z_translate_ele = document.getElementById("z_trans_input");
  const z_out_ele = document.getElementById("z_out");
  const z_value = light_position_v3[2].toString();
  // Set the initial value
  z_translate_ele.value = z_value;
  z_out_ele.value = z_value;
  z_translate_ele.addEventListener("change", (e) => {
    light_position_v3[2] = parseInt(e.target.value);
    u_lightposition.setData(light_position_v3);
    z_out_ele.value = e.target.value;
  })

  const distance_ele = document.getElementById("distance_input");
  const distance_out_ele = document.getElementById("distance_out");
  distance_ele.value = distance;
  distance_out_ele.value = distance;
  distance_ele.addEventListener("change", (e) => {
    distance = parseFloat(e.target.value);
    distance_out_ele.value = e.target.value;
  })

  function render() {
    requestAnimationFrame(render);
    draw();
    increase_y_angle();
  }

  loadOjects().then(() => {
    render();
  })
} catch (e) {
  console.log(e.message);
}