dashboard
=========

This is a simple dashboard-skeleton, which allows the submission of
events into a rotating buffer.  New events push out old ones, and
we keep the most recent 1000 events .

The server accepts events via UDP packets.  Submission is handled
via [node.js](http://nodejs.org), and storage is handled by [Redis](http://redis.io/).


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

Here is some simple perl code for posting a message:

    #!/usr/bin/perl

    use strict;
    use warnings;

    use IO::Socket;

    #  The message to send.
    my $msg = "I like cake.";

    # Create the socket.
    my $sock = IO::Socket::INET->new( Proto    => 'udp',
                                      PeerPort => 4433,
                                      PeerAddr => "127.0.0.1",
                                ) or die "Failed to create socket.";
    $sock->send( $msg );
    exit(0);


That will try to send the message to `127.0.0.1:4433`, and should be
an excellent starting point for you.
