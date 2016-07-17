if [[ ! -f favicon.png ]]; then
    convert _origin.png -resize 256x256 -colors 256 favicon.png
    optipng -o7 -zm1-9 -strip all favicon.png
fi

echo $RANDOM; sed -i "" "s/#.*/# $(printf %04x $RANDOM $RANDOM)/g" mono.appcache
