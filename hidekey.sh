#!/bin/sh
awk '{ if (/api.trello.com\/1\/client\.js/) print "	<script src=\"//api.trello.com/1/client.js?key=YOUR_API_KEY_HERE\"></script>"; else print $0; }'
exit 0

