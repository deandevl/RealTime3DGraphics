/**
 * Created by Rick on 2021-12-09.
 */
'use strict';

/**
 * ReadShaderCodeClass handles reading the shader files from a local file
 *   or http server.
 *
 */
export default class ReadShaderCodeClass {
  /**
   * A static function that downloads shader code from a list of shader files.
   * @param shader_files_list A string array of shader file/url paths
   * @param debug A boolean which if true logs diagnostic messages to the console
   * @returns {Promise<*[]>} Returns a Promise which when fulfilled returns a list of shader code
   */
  static async downloadShaders(shader_files_list, debug = false){
    try {
      const shaders_list = [];
      for(let j = 0; j < shader_files_list.length; j += 1) {
        let shader_url = shader_files_list[j];
        let data = await ReadShaderCodeClass.#get_data(shader_url);
        // Save the shaders in an array
        shaders_list.push(data);
        if(debug){
          console.log(`Downloaded shader code ${shader_url}`);
        }
      }
      return shaders_list;
    }catch(e){
      console.log(`downloadShaders Error: ${e}`);
    }
  }
  /**
   * A static function for the code/text of a single shader file.
   * @param url The url to the shader file from the http server
   * @returns {Promise<null>} Returns a Promise which if fulfilled returns
   *   a file's text of shader code
   */
  static async #get_data(url) {
    let data = null;
    let resp = null;
    try{
      resp = await fetch(url);
      if(resp.ok){
        data = await resp.text();
      }
    }catch(e){
      throw new Error(`downloadShaders fetch error: ${e.message}`);
    }
    if(!data){
      throw new Error(`downloadShaders fetch status: ${resp.status}`)
    }else {
      return data;
    }
  }
}