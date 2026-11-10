import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const [command,args,cwd] of [['node',['scripts/build.cjs'],path.join(root,'app')],['node',['scripts/prepare-worker.mjs'],root],['bash',['scripts/build.sh'],root],['node',['scripts/validate-artifact.mjs'],root]])execFileSync(command,args,{cwd,stdio:'inherit'});
