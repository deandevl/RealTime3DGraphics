/**
 * Created by Rick on 2022-01-31.
 */
'use strict';

const vertex_shader = `#version 300 es

precision mediump float;

uniform mat4 u_modelview_m4;
uniform mat4 u_projection_m4;
uniform mat4 u_normal_m4;

// Lights
uniform vec3 u_lightdirection_v3;
uniform vec4 u_lightambient_v4;
uniform vec4 u_lightdiffuse_v4;
uniform vec4 u_lightspecular_v4;
// Materials
uniform vec4 u_materialambient_v4;
uniform vec4 u_materialdiffuse_v4;
uniform vec4 u_materialspecular_v4;
uniform float u_shininess_f;

in vec3 a_vertexposition_v3;
in vec3 a_vertexnormal_v3;

out vec4 v_vertexcolor_v4;

void main(void) {
  vec4 vertex_v4 = u_modelview_m4 * vec4(a_vertexposition_v3, 1.0);

  // Calculate the normal vector
  vec3 N_v3 = vec3(u_normal_m4 * vec4(a_vertexnormal_v3, 1.0));

  // Normalized light direction
  vec3 L_v3 = normalize(u_lightdirection_v3);

  // Dot product of the normal product and negative light direction vector
  float lambertTerm_f = dot(N_v3, -L_v3);

  // Ambient
  vec4 Ia_v4 = u_lightambient_v4 * u_materialambient_v4;
  // Diffuse
  vec4 Id_v4 = vec4(0.0, 0.0, 0.0, 1.0);
  // Specular
  vec4 Is_v4 = vec4(0.0, 0.0, 0.0, 1.0);

  if (lambertTerm_f > 0.0) {
    Id_v4 = u_lightdiffuse_v4 * u_materialdiffuse_v4 * lambertTerm_f;
    vec3 eyeVec_v3 = -vec3(vertex_v4.xyz);
    vec3 E_v3 = normalize(eyeVec_v3);
    vec3 R_v3 = reflect(L_v3, N_v3);
    float specular_f = pow(max(dot(R_v3, E_v3), 0.0), u_shininess_f);
    Is_v4 = u_lightspecular_v4 * u_materialspecular_v4 * specular_f;
  }

  // Set varying to be used in fragment shader
  v_vertexcolor_v4 = vec4(vec3(Ia_v4 + Id_v4 + Is_v4), 1.0);
  
  gl_Position = u_projection_m4 * vertex_v4;
}
`

const fragment_shader = `#version 300 es

precision mediump float;

in vec4 v_vertexcolor_v4;
out vec4 frag_color_v4;

void main(void) {
  frag_color_v4 = v_vertexcolor_v4;
}  
`

export {
  vertex_shader,
  fragment_shader
}