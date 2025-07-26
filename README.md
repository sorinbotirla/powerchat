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
- customer device profiling

<table>
  <td>
    <h3>Operator chat</h3>
    <img src="https://raw.githubusercontent.com/sorinbotirla/powerchat/refs/heads/main/screenshots/operator-chat.jpg" />
  </td>
  <td>
    <h3>Customer chat</h3>
    <img src="https://raw.githubusercontent.com/sorinbotirla/powerchat/refs/heads/main/screenshots/client-chat.jpg" />
  </td>
</table>


Check the screenshots folder for more.


<h2>Setting up</h2>

you'll need to set up a few things like database configurations for the conversations and messages storage,
websocket configuration for real time messaging.

<h3>config.php</h3>
this file handles the configuration for the index.php (API file) that is responsible with the database management and email settings. Change everything you need.


<h3>powerchat_websocket_server.py</h3>
this is the websocket server file, written in Python. Change the port, timezone, cert and key path accordingly.

<h3>watchdog.sh</h3>
this file is a watchdog that checks if the websocket server is still running. It will restart it automatically if you add this script to your cron for every minute.<br />
Change the cd path to the folder where the websocket python script is located. This file will also restart the websocket server at 3:00 AM to clear eventual overhead.

<h3>assets/js/client.js and assets/js/operator.js</h3>
these files are used for the customer and operator chat. You'll need to change the <br />
_self.websocketUrl, // url for the websocket server (just the domain)<br />
_self.apiUrl, // url for your chat index.php (API file)<br />
_self.operatorAvatarUrl, // the url for the operator avatar, it can be like https://yourdomain/assets/img/operator-avatar.png<br />
_self.attachmentsUrl, // the url for the attachments folder<br />
_self.websocketPort // the port for the websocket server, ex 5678<br />
to your desired configuration.<br />
You have an avatar icon in assets/img but you can use your own for the operators.<br />

<h3>Requirements and dependencies</h3>
PHP 5.6 (minimum), MySQL, Python 3, Websockets and Pytz (it will scream for dependencies anyway when you try to run it).<br />
A SSL Certificate (.crt) and Key (.key) You'll get them from your host provider and even Let's Encrypt works. Just set up the path for them in the python script. Otherwise the websocket server won't work.
<br /><br />
Of course, you will have to open the websocket desired port trough your firewall if you have one.

<h3>Testing</h3>
Operator chat will be available at https:// your url here / path to the index.php?method=manageoperator<br />
Customer chat will be available at https:// your url here / path to the client.html (you can replace later this path with your desired application if you plan to integrate it)

In production you will need a second parameter called pwrsid and the value can be generated with $this->generatePowerSupportSid(); <br />
Then remove the following line from the "manageoperator" clause, in index.php<br />
<strong>$request["pwrsid"] = $this->generatePowerSupportSid();</strong><br />

Of course, feel free to change this with your own protection measures
