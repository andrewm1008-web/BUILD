const {getSession,freshSession,setSession}=require('../_strava');
module.exports=async(req,res)=>{
  try{
    let session=getSession(req);if(!session){res.statusCode=401;res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({connected:false}))}
    session=await freshSession(session);setSession(res,session);
    const after=req.query?.after?Number(req.query.after):Math.floor(Date.now()/1000)-86400*120;
    const url=`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`;
    const r=await fetch(url,{headers:{Authorization:`Bearer ${session.access_token}`}});if(!r.ok)throw new Error('Strava activity request failed');
    const rows=await r.json();
    const activities=rows.filter(a=>/Run/i.test(a.sport_type||a.type||'')).map(a=>({id:String(a.id),name:a.name,distanceKm:a.distance/1000,movingSeconds:a.moving_time,date:(a.start_date_local||a.start_date||'').slice(0,10),source:'strava-api',averageHeartrate:a.average_heartrate||null,elevationGain:a.total_elevation_gain||null}));
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({connected:true,athlete:session.athlete,activities}));
  }catch(err){res.statusCode=500;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({connected:true,error:'sync_failed'}))}
};
