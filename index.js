/*
 *
 * Primary for API
 *
 */
// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config  = require('./config');

//Initialize the HTTP server
var httpServer = http.createServer(function(req,res){
    //Get the Url and parse it
    var parseUrl = url.parse(req.url, true);

    //Get the path
    var path = parseUrl.pathname;
    var trimmedparth = path.replace(/^\/+|\/+$/g,'');

    //Get the query string as an object
    var queryStringObject = parseUrl.query;

    //Get the Http method
    var method = req.method.toLowerCase();

    //Get the headers as an object
    var headers = req.headers;

    //Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data); 
    });
    req.on('end', function(){
        buffer += decoder.end;

        //Choose handler this request should goto. If one is not found, use the notFound handler
        var chosenHandler = typeof(router[trimmedparth]) !== 'undefined' ? router[trimmedparth] : handlers.notFound;

        console.log(chosenHandler);

        //Construct the data object to send to the handler
        var data = {
            'trimmedparth': trimmedparth,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload':buffer  
        };

        //Router the request o the handler specified in the router
        chosenHandler(data, function(statusCode,payload){
            //Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            
            //Use the payload called back the by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};
            
            //Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            //Return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            //Log the request path
            // console.log('data: ', data.queryStringObject.name);
            console.log('Returning this response: ', statusCode,payloadString);
        });     
    });
});

//Start the HTTP server
httpServer.listen(config.httpPort, function(){
    console.log('The server is listening on port ' + config.httpPort);
});

//Define the handlers
var handlers = {};

//hello handler
handlers.hello = function(data, callback){
    //Callback a http status code, and payload object
    callback(200,{message: 'Hello, welcome to my world!'});
};

//Not found handler
handlers.notFound =  function(data, callback){
    callback(404);
};

//Define a request router
var router = {
    'hello' : handlers.hello
};