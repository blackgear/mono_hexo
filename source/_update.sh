if [[ ! -f favicon.png ]]; then
    convert _origin.png -resize 256x256 favicon.png
    optipng -o7 favicon.png
fi

echo $RANDOM; sed -i "" "s/#.*/# $(printf %04x $RANDOM $RANDOM)/g" mono.appcache
