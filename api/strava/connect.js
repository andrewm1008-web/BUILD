const crypto=require('crypto');
const {origin}=require('../_strava');
module.exports=async(req,res)=>{
  if(!process.env.STRAVA_CLIENT_ID||!process.env.STRAVA_CLIENT_SECRET){res.statusCode=503;return res.end('Strava is not configured yet.')}
  const state=crypto.randomBytes(18).toString('hex');
  res.setHeader('Set-Cookie',`build_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  const redirect=`${origin(req)}/api/strava/callback`;
  const url=new URL('https://www.strava.com/oauth/authorize');
  url.searchParams.set('client_id',process.env.STRAVA_CLIENT_ID);
  url.searchParams.set('redirect_uri',redirect);
  url.searchParams.set('response_type','code');
  url.searchParams.set('approval_prompt','auto');
  url.searchParams.set('scope','activity:read_all');
  url.searchParams.set('state',state);
  res.statusCode=302;res.setHeader('Location',url.toString());res.end();
};
