dashboard
=========

This is a simple dashboard-skeleton, which allows the submission of
events into a rotating buffer.  New events push out old ones, and
we cap the events to the the most recent 1000.

Submission is handled via [node.js](http://nodejs.org), and storage is handled
by [Redis](http://redis.io/).

This server was discussed in the article [Building a simple dashboard with redis and node.js ](http://www.debian-administration.org/article/682).



Installation
------------

Assuming you have `node.js` and `redis` installed then you may launch
the server by running:

     nodejs ./dashboard.js

This will result in a process accepting UDP submissions on port 4433.



Submitting Events
-----------------

Submitting events is as simple as firing UDP packets at the server which
is now running.

> **NOTE**:  The server will bind on all available interfaces, so you should firewall submissions from malicious hosts.

There is a sample perl-client included to submit events to the `dashboard.js` server
running on the localhost.

    perl submit.pl "This is a test"
    perl submit.pl "I like cake."


Viewing Events
--------------

There is a simple Ruby-based server supplied which would make a good
starting point for a more featureful event-viewer.

Assuming you have Ruby, and the sinatra + redis gems installed you can
launch the server with:

     cd ./viewer/
     ./server

This will launch a server which will process two URLs:

*  http://localhost:9999/
   *  The front-page of the application.
*  http://localhost:9999/events/
   *  Return a JSON array of hashes, corresponding to each message.

The front-page uses jQuery to dynamically load the JSON array and display it.  You
can see [a screenshot here](https://raw.github.com/skx/dashboard/master/viewer/screenshot.png).


Problems
--------

Plus report an issue via the github repository:

* https://github.com/skx/dashboard



License
-------

BSD 3-clause.


Author
------

Steve Kemp <steve@steve.org.uk>
