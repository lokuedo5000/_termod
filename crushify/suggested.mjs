import path from "path";

import PathUtils from "../../utils/craftshelf-fy/js/pathUtils.mjs";
const { __dirname } = PathUtils.getFileDetails(import.meta.url);




export default [
  {
    name: "help",
    alias: ["h"],
    description: "Muestra la lista de comandos disponibles",
    examples: ["help", "h"],
    handler: path.join(__dirname, "exec", "help.mjs"),
  },
  {
    name: "toPNG",
    alias: ["png"],
    description: "Convert images to PNG format",
    examples: ["toPNG --file=/file.jpg --dest=(desktop)", "toPNG --folder=/folder --dest=(desktop)/imgs"],
    handler: path.join(__dirname, "exec", "png.mjs"),
  },
  {
    name: "toWEBP",
    alias: ["webp"],
    description: "Convert images to WEBP format",
    examples: ["toWEBP --file=/file.jpg --dest=(desktop)", "toWEBP --folder=/folder --dest=(desktop)/imgs"],
    handler: path.join(__dirname, "exec", "webp.mjs"),
  },
  {
    name: "toJPGE",
    alias: ["jpg"],
    description: "Convert images to JPGE format",
    examples: ["toJPGE --file=/file.jpg --dest=(desktop)", "toJPGE --folder=/folder --dest=(desktop)/imgs"],
    handler: path.join(__dirname, "exec", "jpge.mjs"),
  },
  {
    name: "toGIF",
    alias: ["gif"],
    description: "Convert images to GIF format",
    examples: ["toGIF --file=/file.jpg --dest=(desktop)", "toGIF --folder=/folder --dest=(desktop)/imgs"],
    handler: path.join(__dirname, "exec", "gif.mjs"),
  },
];
