#!/usr/bin/perl

use strict;
use warnings;

use IO::Socket;

my $msg = shift( @ARGV );
exit(0) unless( defined( $msg ) && length($msg) );

my $sock = IO::Socket::INET->new( Proto    => 'udp',
                                  PeerPort => 4433,
                                  PeerAddr => "localhost",
                                ) ;

$sock->send( $msg );
exit(0);

