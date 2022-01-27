/**
 * Created by Rick on 2022-01-25.
 */
'use strict';

const vertex_shader = `#version 300 es

precision mediump float;

in vec3 a_position_v3;

void main(void) {
  gl_PointSize = 40.0;
  gl_Position = vec4(a_position_v3, 1.0);
}
`

const fragment_shader = `#version 300 es

precision mediump float;

out vec4 frag_color_v4;

void main(void) {
  frag_color_v4 = vec4(0.5, 0.5, 1.0, 1.0);
}
`

export {
  vertex_shader,
  fragment_shader
}