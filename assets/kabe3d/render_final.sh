#!/bin/bash
cd "$(dirname "$0")"
python3 -m http.server 8765 >/dev/null 2>&1 & SRV=$!
sleep 1
node vid.js 1 30 0 63 out/part1.mp4 > r1.log 2>&1 &
P1=$!
node vid.js 1 30 63 125.6 out/part2.mp4 > r2.log 2>&1 &
P2=$!
wait $P1 $P2
kill $SRV
printf "file 'part1.mp4'\nfile 'part2.mp4'\n" > out/parts.txt
ffmpeg -v error -y -f concat -safe 0 -i out/parts.txt -c copy out/tavaf_video_sessiz.mp4 && echo ALLDONE || echo FAILED
