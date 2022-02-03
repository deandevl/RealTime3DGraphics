/**
 * Created by Rick on 2022-01-11.
 */
'use strict';

/** @function createGLcontext
 * Create a WebGLRenderingContext from a canvas id.
 *
 * @param {string} canvas_id The html dom id for the canvas.
 * @param {string} context_type The context type. Acceptable values are '2d', 'webgl', 'webgl2', 'bitmaprenderer'.
 * @param {Object} options A set of options for the context. See {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext}.
 * @returns {{gl: WebGLRenderingContext, canvas: HTMLElement}}
 */
function createGLcontext(canvas_id, context_type='webgl2', options){
  // One-time initialization of the scene.
  const canvas = document.getElementById(canvas_id);
  if(!canvas){
    throw new Error(`HelperFunctions-createGLContext-Error: Could not locate canvas element with id ${canvas_id}`);
  }
  // Create a WebGLRenderingContext
  const gl = canvas.getContext(context_type, options);

  return {
    gl: gl,
    canvas: canvas
  };
}

/** @function
 * Initialize the WebGLRenderingContext by clearing the canvas and giving by default a white background.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to be initialized.
 * @param {number[]} color_v4 A 4 element array where the first three values are the normalized RGB values for
 *   the canvas background. The fourth is the alpha value.
 */
function initializeContext(gl, color_v4 = [0.9, 0.9, 0.9, 1]){
  // Clear the canvas (red, gree, blue, alpha)
  gl.clearColor(color_v4[0], color_v4[1], color_v4[2], color_v4[3]);  // clear to black, fully opaque
  gl.clearDepth(1.0);  // clear everything
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
}

/** @function
 * Check that the size of the canvas with the css values for width and height are the same.
 *
 * @param {HTMLElement} canvas The HTML canvas element whose size is to be checked.
 * @returns {boolean} Returns TRUE if the size was reassigned.
 */
function resizeCanvasToDisplaySize(canvas){
  // Lookup the size the browser is displaying the canvas in css pixels
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size
  const needResize = canvas.width !== displayWidth ||
    canvas.height !== displayHeight;

  if(needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

/**
 * // Given a canvas element, expand it to the size of the window
 // and ensure that it automatically resizes as the window changes
 * @param {HTMLElement} canvas The HTML canvas element whose size is to be resized.
 */
function autoResizeCanvas(canvas){
  const expandFullScreen = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  expandFullScreen();
  // Resize screen when the browser has triggered the resize event
  window.addEventListener('resize', expandFullScreen);
}

/** @function
 * Create a complete rendering program {WebGLProgram}
 *
 * @param {WebGLRenderingContext} gl The WebGL context from the canvas.
 * @param {WebGLShader} vertex_shader The program's vertex shader.
 * @param {WebGLShader} frag_shader The program's fragment shader.
 * @returns {WebGLProgram}
 */
function createProgram(gl, vertex_shader, frag_shader){
  const program = gl.createProgram();

  // Attach the shader objects
  gl.attachShader(program, vertex_shader);
  gl.attachShader(program, frag_shader);

  // Link the WebGLProgram object
  gl.linkProgram(program);

  // Check for success
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if(!success) {
    const program_info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`HelperFunctions-createProgram-Error: ${program_info}`);
  }else {
    return program;
  }
}

/** @function
 * Creates a shader object {WebGLShader} given
 *   the source code. See [WebGLShader]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader}
 *
 * @param {WebGLRenderingContext} gl The WebGL context from the canvas
 * @param {number} type The type of shader, either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
 * @param {string} source The code/text of the shader.
 * @returns {WebGLShader}
 */
function createShader(gl, type, source){
  const shader = gl.createShader(type);
  // Put the source code into the gl shader object
  gl.shaderSource(shader, source);
  // Compile the shader code
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if(!success){
    const shader_info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`HelperFunctions-createShader-Error: ${shader_info}`);
  }else {
    return shader;
  }
}

/**
 * Clean the Vertex Array Object(vbo) buffer, the
 *   vertex buffer, and the element array buffer.
 *
 * @param {WebGLRenderingContext} gl The WebGL context from the canvas
 */
function cleanBuffers(gl){
  if(gl !== undefined){
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }
}

// Returns computed normals for provided vertices.
// Note: Indices have to be completely defined--NO TRIANGLE_STRIP only TRIANGLES.
function calculateNormals(vs, ind) {
  const
    x = 0,
    y = 1,
    z = 2,
    ns = [];

  // For each vertex, initialize normal x, normal y, normal z
  for (let i = 0; i < vs.length; i += 3) {
    ns[i + x] = 0.0;
    ns[i + y] = 0.0;
    ns[i + z] = 0.0;
  }

  // We work on triads of vertices to calculate
  for (let i = 0; i < ind.length; i += 3) {
    // Normals so i = i+3 (i = indices index)
    const v1 = [], v2 = [], normal = [];

    // p2 - p1
    v1[x] = vs[3 * ind[i + 2] + x] - vs[3 * ind[i + 1] + x];
    v1[y] = vs[3 * ind[i + 2] + y] - vs[3 * ind[i + 1] + y];
    v1[z] = vs[3 * ind[i + 2] + z] - vs[3 * ind[i + 1] + z];

    // p0 - p1
    v2[x] = vs[3 * ind[i] + x] - vs[3 * ind[i + 1] + x];
    v2[y] = vs[3 * ind[i] + y] - vs[3 * ind[i + 1] + y];
    v2[z] = vs[3 * ind[i] + z] - vs[3 * ind[i + 1] + z];

    // Cross product by Sarrus Rule
    normal[x] = v1[y] * v2[z] - v1[z] * v2[y];
    normal[y] = v1[z] * v2[x] - v1[x] * v2[z];
    normal[z] = v1[x] * v2[y] - v1[y] * v2[x];

    // Update the normals of that triangle: sum of vectors
    for (let j = 0; j < 3; j++) {
      ns[3 * ind[i + j] + x] = ns[3 * ind[i + j] + x] + normal[x];
      ns[3 * ind[i + j] + y] = ns[3 * ind[i + j] + y] + normal[y];
      ns[3 * ind[i + j] + z] = ns[3 * ind[i + j] + z] + normal[z];
    }
  }

  // Normalize the result.
  // The increment here is because each vertex occurs.
  for (let i = 0; i < vs.length; i += 3) {
    // With an offset of 3 in the array (due to x, y, z contiguous values)
    const nn = [];
    nn[x] = ns[i + x];
    nn[y] = ns[i + y];
    nn[z] = ns[i + z];

    let len = Math.sqrt((nn[x] * nn[x]) + (nn[y] * nn[y]) + (nn[z] * nn[z]));
    if (len === 0) len = 1.0;

    nn[x] = nn[x] / len;
    nn[y] = nn[y] / len;
    nn[z] = nn[z] / len;

    ns[i + x] = nn[x];
    ns[i + y] = nn[y];
    ns[i + z] = nn[z];
  }

  return ns;
}

/**
 * Convert hex string color to rgb array
 *
 * @param hex_str A hex string in form '#_____'
 * @returns {number[]} An 3 element array of integers for RGB color
 */
function hexToRGB(hex_str) {
  const hex = parseInt(hex_str.replace(/^#/, ''), 16);
  const red = (hex >> 16) & 0xFF;
  const green = (hex >> 8) & 0xFF;
  const blue = hex & 0xFF;
  return [red, green, blue];
}

/**
 * Convert rgb array to hex string
 *
 * @param {number[]} rgb A integer array for RGB color
 * @returns {string} A hex string of the RGB color
 */
function rgbToHex(rgb){
  const red = rgb[0] << 16;
  const green = rgb[1] << 8;
  const blue = rgb[2];

  return "#" + ((1 << 24) + red + green + blue).toString(16).slice(1,7);
}

/**
 * De-normalize colors from 0-1 to 0-255
 *
 * @param {number[]} color A normalized color array with values from 0-1
 * @returns {number[]} An integer color array with values from 0-255
 */
function denormalizeColor(color) {
  return color.map((c) => c * 255);
}

// Normalize colors from 0-255 to 0-1
/**
 *
 * @param color An integer RGB color array with values from 0-255
 * @returns {number[]} A normalized RGB color array with values from 0-1
 */
function normalizeColor(color) {
  return color.map((c) => c / 255);
}

export{
  createGLcontext,
  initializeContext,
  resizeCanvasToDisplaySize,
  autoResizeCanvas,
  createProgram,
  createShader,
  cleanBuffers,
  calculateNormals,
  hexToRGB,
  rgbToHex,
  denormalizeColor,
  normalizeColor
}