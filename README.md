This chat provides Operators and Customers with the following functions:
- images and videos upload
- multiple operators
- marking messages as seen
- typing events
- offline replies via email
- logging messages
- persistent messages on refresh
- customers can respond from the emails and come back to chat

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
these files are used for the customer and operator chat. You'll need to change the _self.websocketUrl, _self.apiUrl, _self.operatorAvatarUrl, _self.attachmentsUrl, _self.websocketPort to your desired configuration.
