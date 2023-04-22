#! /bin/bash

# copies CNAME to tempfile, builds static site, deletes contents of docs/, copies build files over to docs/, copies CNAME back to docs/
cp docs/CNAME /tmp/CNAME
npm run build
rm -rf docs/*
cp -r build/* docs/
cp /tmp/CNAME docs/CNAME
