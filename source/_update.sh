#!/usr/bin/env bash
# -*- coding: utf-8 -*-

convert _origin.png -resize 256x256 +dither -colors 64 -depth 8 favicon.png
optipng -o7 -zm1-9 -strip all favicon.png

sed -i "" "s/#.*/#$(printf %x $(date +%s))/g" mono.appcache
