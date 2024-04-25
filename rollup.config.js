import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import ts from 'rollup-plugin-ts';

export default [
	{
		input: "src/index.ts",
		output: [
			{ file: "dist/index.cjs.js", format: 'cjs', sourcemap: true },
			{ file: "dist/index.esm.js", format: 'esm', sourcemap: true },
		],
		plugins: [
			peerDepsExternal(),
			ts(),
		],
	}
];
