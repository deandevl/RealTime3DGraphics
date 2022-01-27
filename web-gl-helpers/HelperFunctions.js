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
 * @param {number[]} color_v4 A 4 element vector where the first three values are the RGB values for
 *   the canvas background. The fourth is the alpha value.
 */
function initializeContext(gl, color_v4 = [255.0,255.0,255.0,1.0]){
  // Clear the canvas (red, gree, blue, alpha)
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(color_v4[0], color_v4[1], color_v4[2], color_v4[3]);  // clear to black, fully opaque
  gl.clearDepth(1.0);  // clear everything
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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

export{
  createGLcontext,
  initializeContext,
  resizeCanvasToDisplaySize,
  autoResizeCanvas,
  createProgram,
  createShader,
  cleanBuffers
}