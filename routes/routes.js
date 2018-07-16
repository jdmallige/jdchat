var http=require('http')
var bodyParser=require('body-parser');
var mongo=require('mongoose');
var socket=require('socket.io');
var cookieParser=require('cookie-parser');



//database schema 
//profile schema
var myschema=new mongo.Schema({
    name: String,
    sex : String,
    age: String,
    time: {type:Date,default:Date.now} });

//chat schema
var cschema=new mongo.Schema({
    name:String,
    msg:String,
    time: {type:Date, default:Date.now} });

var model=mongo.model('chatprofile',myschema);
var cmodel=mongo.model('chats',cschema);

//mongo connection

mongo.connect('mongodb://jagdish123:mallige123@ds018848.mlab.com:18848/jddb');
/// bodyparser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var data;
var load;
var n; 
var s;
var a;
module.exports= function(app,server){

    app.use(cookieParser());



    // establishing socket.io

    var io=socket(server);


    app.get('/',function(req,res){
     //   res.render('home');
        if(req.cookies!=undefined){
            cmodel.find({},function(err,data){
                if(err){console.log(err);}
                else{
                     load=data;
                 }
                     res.render('chat',{load:load,acct:req.cookies.user,sex:'male'});
        });
    }
   else{
    res.render('home');
   } 
});
    app.post('/enter', urlencodedParser ,function(req,res){
        
        data=req.body;
        n=data.name;
        s=data.sex;
        a=data.age
        
        res.cookie('user',data.name,{maxAge:60000,httpOnly: true});
        console.log(req.cookies);
        model(data).save(function(err,data){
            if(err){console.log(err);}
            else{
               // console.log("data pushed"+data);
            }
        });
        res.render('enter',data);
       
    });

    //get req to chat.ejs
    app.post('/chat',function(req,res){
        res.render('chat')
    });
    app.get('/chat',function(req,res) {
        var load=[{}];

        
        var q=cmodel.find({}).sort({'time':-1}).limit(18);
            
            
           q.exec(function(err,data){
            if(err){console.log(err+"jd error");}
            else{
                 load=data;
                 load.reverse();
                 
                 console.log(load);
            }
                 res.render('chat',{load:load,acct:n,sex:s});
        
                 
            
        });
        
    });

    //socket handling
    
    

    io.on('connection',function(socket){
        
        socket.on('chat',function(data){
            io.sockets.emit('chat',data);
            cmodel(data).save(function(err){
                if(err){console.log(err);}
                else{
                    
                }
            })
        });
        socket.on('typing',function(data){
            socket.broadcast.emit('typing',data);
            //console.log(name);
        })
        
    });






}