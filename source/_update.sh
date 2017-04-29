#!/usr/bin/env bash
# -*- coding: utf-8 -*-

[ ! -f favicon.png ] && convert _origin.png -resize 256x256 +dither -colors 64 -depth 8 favicon.png && optipng -o7 -zm1-9 -strip all favicon.png

cat << _EOF_ > mono.appcache
CACHE MANIFEST
#$(printf %x $(date +%s))
mono.css
favicon.ico
NETWORK:
*
_EOF_
