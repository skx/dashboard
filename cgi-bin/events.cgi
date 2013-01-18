#!/usr/bin/perl -w
#
# A simple script to display the most recent 100 entries from the
# redis-store.
#
# Steve
# --



#
#  Copyright (c) 2013, Steve Kemp
#  All rights reserved.
#
#  Redistribution and use in source and binary forms, with or without
#  modification, are permitted provided that the following conditions are met:
#
#  1. Redistributions of source code must retain the above copyright
#     notice, this list of conditions and the following disclaimer.
#
#  2. Redistributions in binary form must reproduce the above copyright
#     notice, this list of conditions and the following disclaimer in the
#     documentation and/or other materials provided with the distribution.
#
#  3. All advertising materials mentioning features or use of this software
#     must display the following acknowledgement:
#       This product includes software developed by the Steve Kemp.
#
#  THIS SOFTWARE IS PROVIDED BY Steve Kemp ''AS IS'' AND ANY
#  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
#  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
#  DISCLAIMED. IN NO EVENT SHALL Steve Kemp BE LIABLE FOR ANY
#  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
#  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
#  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
#  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
#  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
#  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#
#


use strict;
use warnings;
use CGI;


#
# The modules we require.
#
my %required = ( "Time::Duration" => "libtime-duration-perl",
                 "Date::Parse"    => "libtimedate-perl",
                 "Redis"          => "libredis-perl"
               );


#
#  Attempt to load each module, and show a pretty message
# if any are unavailabe.
#
foreach my $mod ( keys %required )
{
    my $eval = "use $mod;";
    eval($eval);
    if ($@)
    {
        print <<EOF;
Content-type: text/html


<p>Missing module <tt>Time::Duration</tt>.  To fix this run:</p>
<pre>
# apt-get install libtime-duration-perl
</pre>
EOF
        exit(0);
    }
}



#
#  We have everything we need - so show the header.
#
print "Content-type: text/html\n\n";

#
#  Get the starting time, and connect to redis.
#
my $now   = time();
my $redis = new Redis();

#
#  Get the most recent 100 entries.
#
my @values = $redis->lrange( "dashboard", 0, 100 );


print <<EOH;
<table width="100%">
 <tr>
  <th align="left">Source</th>
  <th align="left">Message</th>
  <th align="right">Time</th>
 </tr>
EOH


foreach my $entry (@values)
{
    my $ip;
    my $time;
    my $msg;

    if ( $entry =~ /^([^#]+)#([^#]+)#(.*)$/ )
    {
        $ip   = $1;
        $time = $2;
        $msg  = $3;
    }
    else
    {
        next;
    }

    # parse submission time into seconds-past-epoch.
    $time = str2time($time);

    # make the duration in a pretty fashion.
    $time = ago( $now - $time, 1 );

    print " <tr>\n";
    print "  <td align=\"left\">" . $ip . "</td>\n";
    print "  <td align=\"left\">" . $msg . "</td>\n";
    print "  <td align=\"right\">$time</td>\n";
    print " </tr>\n";
}

print <<EOF;
</table>
EOF
