const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
test('deployment output includes all cached assets and no server/test/secret files',()=>{
 cp.execFileSync(process.execPath,['scripts/build.cjs']);
 const ctx={URL,Set,self:{registration:{scope:'https://build.example/'},addEventListener(){}}};
 const assets=vm.runInNewContext(fs.readFileSync('sw.js','utf8')+'\nASSETS;',ctx);
 for(const asset of assets){const file=asset==='./'?'index.html':asset.replace(/^\.\//,'');assert.ok(fs.existsSync(path.join('public',file)),file)}
 for(const file of ['.env','.env.example','api','lib','tests','package.json','README.md'])assert.equal(fs.existsSync(path.join('public',file)),false,file);
});
