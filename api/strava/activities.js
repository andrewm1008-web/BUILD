const {getSession,freshSession,setSession}=require('../_strava');
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
  const reply=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data))};
  if(req.method!=='GET'){res.setHeader('Allow','GET');return reply(405,{error:'method_not_allowed'})}
  try{
    let session=getSession(req);if(!session)return reply(401,{connected:false});
    session=await freshSession(session);setSession(res,session);
    const after=req.query?.after!=null?Number(req.query.after):Math.floor(Date.now()/1000)-86400*120;
    if(!Number.isFinite(after)||after<0)return reply(400,{error:'invalid_date'});
    const activities=[];let truncated=false;
    for(let page=1;page<=10;page++){
      const url=`https://www.strava.com/api/v3/athlete/activities?after=${Math.floor(after)}&per_page=100&page=${page}`;
      const r=await fetch(url,{headers:{Authorization:`Bearer ${session.access_token}`}});
      if(r.status===401)return reply(401,{connected:false});
      if(r.status===429)return reply(429,{error:'rate_limited'});
      if(!r.ok)throw Error('Strava activity request failed');
      const rows=await r.json();if(!Array.isArray(rows))throw Error('Invalid Strava response');
      activities.push(...rows.filter(a=>/^(Run|TrailRun|VirtualRun)$/.test(a.sport_type||a.type||'')).map(a=>({id:String(a.id),name:a.name,distanceKm:a.distance/1000,movingSeconds:a.moving_time,date:(a.start_date_local||a.start_date||'').slice(0,10),source:'strava-api',averageHeartrate:a.average_heartrate||null})));
      if(rows.length<100)break;
      if(page===10)truncated=true;
    }
    return reply(200,{connected:true,athlete:session.athlete,activities,truncated});
  }catch{return reply(502,{error:'sync_failed'})}
};
