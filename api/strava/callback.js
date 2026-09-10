const {tokenExchange,setSession,origin}=require('../_strava');
function cookie(req,name){return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),decodeURIComponent(x.slice(i+1))]}))[name]}
module.exports=async(req,res)=>{
  try{
    const u=new URL(req.url,origin(req));
    const code=u.searchParams.get('code'),state=u.searchParams.get('state');
    if(!code||!state||state!==cookie(req,'build_oauth_state')){res.statusCode=400;return res.end('Invalid Strava callback.')}
    const data=await tokenExchange({client_id:process.env.STRAVA_CLIENT_ID,client_secret:process.env.STRAVA_CLIENT_SECRET,code,grant_type:'authorization_code'});
    setSession(res,{access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at,athlete:data.athlete?{id:data.athlete.id,firstname:data.athlete.firstname,lastname:data.athlete.lastname}:null});
    res.statusCode=302;res.setHeader('Location','/?strava=connected');res.end();
  }catch(err){res.statusCode=500;res.end('Strava connection failed.');}
};
