import typescript from "rollup-plugin-typescript2";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";

const plugins = [
  nodeResolve(),
  commonjs(),
  typescript({
    typescript: require("typescript"),
    abortOnError: false,
  }),
];

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.module,
        format: "esm",
      },
      {
        file: pkg.main,
        format: "cjs",
      },
    ],
    plugins,
    external: Object.keys(pkg.peerDependencies),
  },
  {
    input: "src/react/index.ts",
    output: [
      {
        file: "dist/react.es.js",
        format: "esm",
      },
    ],
    plugins,
    external: Object.keys(pkg.peerDependencies),
  },
];
