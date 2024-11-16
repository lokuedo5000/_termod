import path from "path";

import PathUtils from "../../src/utils/craftshelf-fy/js/pathUtils.mjs";
const { __dirname } = PathUtils.getFileDetails(import.meta.url);

export default [
  {
    name: "help",
    alias: ["h"],
    description: "Muestra la lista de comandos disponibles",
    examples: ["help", "h"],
    handler: path.join(__dirname, "exec", "help.mjs"),
  },
];
