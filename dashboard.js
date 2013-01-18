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
 *
 * Copyright (c) 2013, Steve Kemp
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * 3. All advertising materials mentioning features or use of this software
 *    must display the following acknowledgement:
 *      This product includes software developed by the Steve Kemp.
 *
 * THIS SOFTWARE IS PROVIDED BY Steve Kemp ''AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Steve Kemp BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
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
