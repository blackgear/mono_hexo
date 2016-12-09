#!/usr/bin/env bash
# -*- coding: utf-8 -*-

convert _origin.png -background white -alpha remove \
    \( -clone 0 -resize 16x16 -fuzz 10% -transparent white \) \
    \( -clone 0 -resize 32x32 -fuzz 10% -transparent white \) \
    \( -clone 0 -resize 48x48 -fuzz 10% -transparent white \) \
    \( -clone 0 -resize 256x256 -transparent white \) \
    -delete 0 +dither -colors 64 -depth 8 favicon.ico

sed -i "" "s/#.*/#$(printf %x $(date +%s))/g" mono.appcache
