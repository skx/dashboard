/**
 * Trivial UDP-based "dashboard server" written in node.js, using
 * redis for storage.
 *
 * Remote clients will send UDP-packages to :4433, which will be stored
 * in a list.
 *
 * Each new entry may be retrieved, in order of submission, and the
 * list is capped at 1000 entries - new additions will push older ones
 * out of the way.
 *
 * Steve
 * --
 */


/**
 * Standard UDP library, supplied with node.js
 */
var dgram = require("dgram");


/**
 * Redis client library, located in this repository.
 */
var redis = require("./node_redis/index.js");



/**
 * Create a Redis client object.
 */
var redis = redis.createClient();

redis.on("error", function (err) {
    console.log("Error talking to redis " + err);
});



/**
 * Create a UDP-socket for listening upon.
 */
var server = dgram.createSocket("udp4");

server.on("message", function (msg, rinfo) {

    /**
     * The data we add to the list is:
     *     IP # DATE # Msg
     *
     * This is more annoying than setting these in separate keys,
     * and then pushing the identifier onto the list.
     *
     *     dashboard:N:date   -> date
     *     dashboard:N:source -> IP
     *     dashboard:N:body   -> Body
     *
     * But it means we don't have to worry about orphaned data
     * when this list is trimmed.
     */
    var data = rinfo.address + "#" + new Date() + "#" + msg;

    /**
     * Now we'll add the data entry, and ensure we don't have "too many".
     */
    redis.lpush( "dashboard", data );
    redis.ltrim( "dashboard", "0", "1000" );
});



/**
 * When we start up show a mesage.
 */
server.on("listening", function () {
    var address = server.address();
    console.log("server listening " + address.address + ":" + address.port);
});



/**
 * Start the server listening, looping on new connections.
 */
server.bind("4433");
