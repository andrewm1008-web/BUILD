const {clearSession,origin}=require('../../lib/strava.cjs');
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.statusCode=405;res.setHeader('Allow','POST');return res.end()}
  if(req.headers.origin&&req.headers.origin!==origin(req)){res.statusCode=403;return res.end()}
  clearSession(res);res.statusCode=204;res.end();
};
