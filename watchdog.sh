#!/bin/bash

cd /FOLDER WHERE powerchat_websocket_server.py EXISTS # ex /home/powerchat/

HOUR=$(date +'%H')
MIN=$(date +'%M')

# If it's exactly 3:00 AM, force restart to refresh any possible overhead
if [ "$HOUR" -eq 3 ] && [ "$MIN" -eq 0 ]; then
    pkill -f powerchat_websocket_server.py
    # Wait until the process is fully stopped
    while pgrep -f powerchat_websocket_server.py > /dev/null; do
        sleep 1
    done
    nohup python3 powerchat_websocket_server.py >/dev/null 2>&1 &
    exit 0
fi

# Normal watchdog behavior
scan=$(pgrep -fc powerchat_websocket_server.py)
if [ "$scan" -ge 1 ]; then
    # already running, do nothing
    :
else
    nohup python3 powerchat_websocket_server.py >/dev/null 2>&1 &
fi