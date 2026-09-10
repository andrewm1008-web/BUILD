const {tokenExchange,setSession,origin,cookies}=require('../_strava');
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){res.statusCode=405;res.setHeader('Allow','GET');return res.end()}
  try{
    const u=new URL(req.url,origin(req));
    if(u.searchParams.get('error')){res.statusCode=302;res.setHeader('Location','/?strava=denied');res.setHeader('Set-Cookie','build_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');return res.end()}
    const code=u.searchParams.get('code'),state=u.searchParams.get('state');
    if(!code||!state||state!==cookies(req).build_oauth_state){res.statusCode=400;return res.end('Invalid Strava callback.')}
    const data=await tokenExchange({client_id:process.env.STRAVA_CLIENT_ID,client_secret:process.env.STRAVA_CLIENT_SECRET,code,grant_type:'authorization_code'});
    setSession(res,{access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at,athlete:data.athlete?{id:data.athlete.id,firstname:data.athlete.firstname,lastname:data.athlete.lastname}:null});
    res.setHeader('Set-Cookie',[res.getHeader('Set-Cookie'),'build_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0']);
    res.statusCode=302;res.setHeader('Location','/?strava=connected');res.end();
  }catch(err){res.statusCode=500;res.end('Strava connection failed.');}
};
