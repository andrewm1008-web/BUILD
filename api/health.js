module.exports=async(req,res)=>{res.statusCode=200;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,app:'BUILD',version:'0.4.1'}))};
