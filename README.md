This chat provides Operators and Customers with the following functions:
- images and videos upload
- multiple operators
- marking messages as seen
- typing events
- offline replies via email
- logging messages
- persistent messages on refresh
- customers can respond from the emails and come back to chat
- automatic urls previews
- filtering tracking parameters from urls
- bidirectional sanitization

<img src="https://raw.githubusercontent.com/sorinbotirla/powerchat/refs/heads/main/screenshots/operator-chat.jpg" />
<img src="https://raw.githubusercontent.com/sorinbotirla/powerchat/refs/heads/main/screenshots/client-chat.jpg" />

Check the screenshots folder for more.


<h2>Setting up</h2>

you'll need to set up a few things like database configurations for the conversations and messages storage,
websocket configuration for real time messaging.

<h3>config.php</h3>
this file handles the configuration for the index.php (API file) that is responsible with the database management and email settings. Change everything you need.


<h3>powerchat_websocket_server.py</h3>
this is the websocket server file, written in Python. Change the port, timezone, cert and key path accordingly.

<h3>watchdog.sh</h3>
this file is a watchdog that checks if the websocket server is still running. It will restart it automatically if you add this script to your cron for every minute.
Change the cd path to the folder where the websocket python script is located. This file will also restart the websocket server at 3:00 AM to clear eventual overhead.

<h3>assets/js/client.js and assets/js/operator.js</h3>
these files are used for the customer and operator chat. You'll need to change the 
_self.websocketUrl, // url for the websocket server (just the domain)
_self.apiUrl, // url for your chat index.php (API file)
_self.operatorAvatarUrl, // the url for the operator avatar, it can be like https://yourdomain/assets/img/operator-avatar.png
_self.attachmentsUrl, // the url for the attachments folder
_self.websocketPort // the port for the websocket server, ex 5678
to your desired configuration.
You have an avatar icon in assets/img but you can use your own for the operators.

<h3>Requirements and dependencies</h3>
PHP 5.6 (minimum), MySQL, Python 3, Websockets and Pytz (it will scream for dependencies anyway when you try to run it).
A SSL Certificate (.crt) and Key (.key) You'll get them from your host provider and even Let's Encrypt works. Just set up the path for them in the python script. Otherwise the websocket server won't work.

Of course, you will have to open the websocket desired port trough your firewall if you have one.

