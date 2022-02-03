/**
 * Created by Rick on 2022-02-03.
 */
'use strict';


const vertex_shader = `#version 300 es

precision mediump float;

uniform mat4 u_modelview_m4;
uniform mat4 u_projection_m4;
uniform mat4 u_normal_m4;
uniform vec3 u_lightposition_v3;

in vec3 a_vertexposition_v3;
in vec3 a_vertexnormal_v3;

// Varyings
out vec3 v_normal_v3;
out vec3 v_lightray_v3;
out vec3 v_eye_v3;

void main(void) {
  vec4 vertex_v4 = u_modelview_m4 * vec4(a_vertexposition_v3, 1.0);
  vec4 light_v4 = u_modelview_m4 * vec4(u_lightposition_v3, 1.0);

  // Set varyings to be used inside of fragment shader
  v_normal_v3 = vec3(u_normal_m4 * vec4(a_vertexnormal_v3, 1.0));
  v_lightray_v3 = vertex_v4.xyz - light_v4.xyz;
  v_eye_v3 = -vec3(vertex_v4.xyz);

  gl_Position = u_projection_m4 * u_modelview_m4 * vec4(a_vertexposition_v3, 1.0);
}
`

const fragment_shader = `#version 300 es

precision mediump float;

uniform float u_shininess_f;
uniform vec3 u_lightambient_v3;
uniform vec3 u_materialdiffuse_v3;
uniform vec3 u_materialspecular_v3;

in vec3 v_normal_v3;
in vec3 v_lightray_v3;
in vec3 v_eye_v3;

out vec4 fragcolor_v4;

void main(void) {
  vec3 L_v3 = normalize(v_lightray_v3);
  vec3 N_v3 = normalize(v_normal_v3);
  float lambertTerm_f = dot(N_v3, -L_v3);
  vec3 finalColor_v3 = u_lightambient_v3;

  if (lambertTerm_f > 0.0) {
    finalColor_v3 += u_materialdiffuse_v3 * lambertTerm_f;
    vec3 E_v3 = normalize(v_eye_v3);
    vec3 R_v3 = reflect(L_v3, N_v3);
    float specular_f = pow( max(dot(R_v3, E_v3), 0.0), u_shininess_f);
    finalColor_v3 += u_materialspecular_v3 * specular_f;
  }

  fragcolor_v4 = vec4(finalColor_v3, 1.0);
}
`

export {
  vertex_shader,
  fragment_shader
}