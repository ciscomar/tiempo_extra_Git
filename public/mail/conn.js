
const nodeMailer = require('nodeMailer');
const middleware = {};


  middleware.transport = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        secure: false,
        port: 465,
        secure:true,
        auth:{
          user: "del.tristone@gmail.com",
          pass: "*******"
        }
    
      });


module.exports = middleware;
