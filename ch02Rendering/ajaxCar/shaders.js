/**
 * Created by Rick on 2022-01-25.
 */
'use strict';

const vertex_shader = `#version 300 es

precision mediump float;

uniform mat4 u_modelview_m4;
uniform mat4 u_projection_m4;

in vec3 a_position_v3;

void main(void) {
  gl_Position = u_projection_m4 * u_modelview_m4 * vec4(a_position_v3, 1.0);
}
`

const fragment_shader = `#version 300 es

precision mediump float;

out vec4 frag_color_v4;

void main(void) {
  frag_color_v4 = vec4(1.0, 1.0, 1.0, 1.0);
}
`

export {
  vertex_shader,
  fragment_shader
}