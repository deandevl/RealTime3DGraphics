/**
 * Created by Rick on 2022-02-03.
 */
'use strict';

const vertex_shader = `#version 300 es

precision mediump float;

uniform mat4 u_modelview_m4;
uniform mat4 u_projection_m4;
uniform mat4 u_normal_m4;

in vec3 a_vertexposition_v3;
in vec3 a_vertexnormal_v3;

// Varyings
out vec3 v_normal_v3;
out vec3 v_eye_v3;

void main(void) {
  vec4 vertex_v4 = u_modelview_m4 * vec4(a_vertexposition_v3, 1.0);
  // Set varyings to be used inside of fragment shader
  v_normal_v3 = vec3(u_normal_m4 * vec4(a_vertexnormal_v3, 1.0));
  v_eye_v3 = -vec3(vertex_v4.xyz);
  gl_Position = u_projection_m4 * u_modelview_m4 * vec4(a_vertexposition_v3, 1.0);
}
`

const fragment_shader = `#version 300 es

precision mediump float;

uniform float u_shininess_f;
// Lights
uniform vec3 u_lightdirection_v3;
uniform vec4 u_lightambient_v4;
uniform vec4 u_lightdiffuse_v4;
uniform vec4 u_lightspecular_v4;
// Materials
uniform vec4 u_materialambient_v4;
uniform vec4 u_materialdiffuse_v4;
uniform vec4 u_materialspecular_v4;

// Varyings
in vec3 v_normal_v3;
in vec3 v_eye_v3;

out vec4 frag_color_v4;

void main(void) {
  // Normalized light direction
  vec3 L_v3 = normalize(u_lightdirection_v3);

  // Normalized normal
  vec3 N_v3 = normalize(v_normal_v3);

  float lambertTerm_f = dot(N_v3, -L_v3);
  // Ambient
  vec4 Ia_v4 = u_lightambient_v4 * u_materialambient_v4;
  // Diffuse
  vec4 Id_v4 = vec4(0.0, 0.0, 0.0, 1.0);
  // Specular
  vec4 Is_v4 = vec4(0.0, 0.0, 0.0, 1.0);

  if (lambertTerm_f > 0.0) {
    Id_v4 = u_lightdiffuse_v4 * u_materialdiffuse_v4 * lambertTerm_f;
    vec3 E_v3 = normalize(v_eye_v3);
    vec3 R_v3 = reflect(L_v3, N_v3);
    float specular_f = pow( max(dot(R_v3, E_v3), 0.0), u_shininess_f);
    Is_v4 = u_lightspecular_v4 * u_materialspecular_v4 * specular_f;
  }

  // Final fargment color takes into account all light values that
  // were computed within the fragment shader
  frag_color_v4 = vec4(vec3(Ia_v4 + Id_v4 + Is_v4), 1.0);
}
`

export {
  vertex_shader,
  fragment_shader
}