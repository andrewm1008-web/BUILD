const {clearSession}=require('../_strava');
module.exports=async(req,res)=>{clearSession(res);res.statusCode=302;res.setHeader('Location','/?strava=disconnected');res.end()};
