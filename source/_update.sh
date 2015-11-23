convert _origin.png -resize 256x256 apple-touch-icon.png
optipng -o7 apple-touch-icon.png

convert _origin.png  -bordercolor white -border 0 \
    \( -clone 0 -resize 16x16 \) \
    \( -clone 0 -resize 32x32 \) \
    \( -clone 0 -resize 48x48 \) \
    \( -clone 0 -resize 64x64 \) \
    -delete 0 -alpha off -colors 256 favicon.ico

echo $RANDOM; sed -i "" "s/#.*/# $(printf %04x $RANDOM $RANDOM)/g" mono.appcache
