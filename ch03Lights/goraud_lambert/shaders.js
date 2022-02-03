/**
 * Created by Rick on 2022-01-27.
 */
'use strict';

const vertex_shader = `#version 300 es

precision mediump float;

uniform mat4 u_modelview_m4;
uniform mat4 u_projection_m4;
uniform mat4 u_normal_m4;
uniform vec3 u_lightdirection_v3;
uniform vec3 u_lightdiffuse_v3;
uniform vec3 u_materialdiffuse_v3;

in vec3 a_vertexposition_v3;
in vec3 a_vertexnormal_v3;

out vec4 v_color_v4;

void main(void) {
  // Calculate the normal vector
  vec3 N_v3 = normalize(vec3(u_normal_m4 * vec4(a_vertexnormal_v3, 1.0)));

  // Normalized light direction
  vec3 L_v3 = normalize(u_lightdirection_v3);

  // Dot product of the normal product and negative light direction vector
  float lambertTerm_f = dot(N_v3, -L_v3);

  // Calculating the diffuse color based on the Lambertian reflection model
  vec3 Id = u_materialdiffuse_v3 * u_lightdiffuse_v3 * lambertTerm_f;

  // Set the varying to be used inside of the fragment shader
  v_color_v4 = vec4(Id, 1.0);

  // Setting the vertex position
  gl_Position = u_projection_m4 * u_modelview_m4 * vec4(a_vertexposition_v3, 1.0);
}
`

const fragment_shader = `#version 300 es

precision mediump float;

// Expect the interpolated value from the vertex shader
in vec4 v_color_v4;

// Return the final color as fragColor
out vec4 fragcolor_v4;

void main(void)  {
  // Simply set the value passed in from the vertex shader
  fragcolor_v4 = v_color_v4;
}
`

export {
  vertex_shader,
  fragment_shader
}