#!/usr/bin/env bash
# -*- coding: utf-8 -*-
echo $RANDOM;
convert _origin.png -resize 256x256 +dither -colors 64 -strip favicon.ico
sed -i "" "s/#.*/# $(printf %04x $RANDOM $RANDOM)/g" mono.appcache
