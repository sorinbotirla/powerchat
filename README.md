<h1>PowerChat</h1>
<br />
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
<br />

Check the <a href="https://github.com/sorinbotirla/powerchat/tree/main/screenshots">screenshots folder</a> for more.
<br />
<br />

This chat provides Operators and Customers with the following functions:
- websockets for real time messaging
- images and videos upload (including drag & drop)
- multiple operators can handle multiple customers
- leaving chat / joining chat info
- marking messages as seen
- typing events
- when the customers leave the chat, operators can reply via email
- customers can respond from the emails and come back to chat continuing the conversation
- logging messages in mysql database
- persistent messages on refresh
- persistent customer sessions
- automatic urls previews
- filtering tracking parameters from urls
- bidirectional sanitization
- customer device profiling (os, browser, device)
- responsive customer chat
<br />
<br />


<h2>Setting up</h2>
you'll need to set up a few things like database configurations for the conversations and messages storage,
websocket configuration for real time messaging.

<h3><a href="https://github.com/sorinbotirla/powerchat/blob/main/config.php">config.php</a></h3>
this file handles the configuration for the <a href="https://github.com/sorinbotirla/powerchat/blob/main/index.php">index.php</a> (API file) that is responsible with the database management and email settings. Change everything you need.


<h3><a href="https://github.com/sorinbotirla/powerchat/blob/main/powerchat_websocket_server.py">powerchat_websocket_server.py</a></h3>
this is the websocket server file, written in Python. Change the port, timezone, cert and key path accordingly.

<h3><a href="https://github.com/sorinbotirla/powerchat/blob/main/watchdog.sh">watchdog.sh</a></h3>
this file is a watchdog that checks if the websocket server is still running. It will restart it automatically if you add this script to your cron for every minute.<br />
Change the cd path to the folder where the websocket python script is located. This file will also restart the websocket server at 3:00 AM to clear eventual overhead.

<h3><a href="https://github.com/sorinbotirla/powerchat/blob/main/assets/js/client.js">assets/js/client.js</a> and <a href="https://github.com/sorinbotirla/powerchat/blob/main/assets/js/operator.js">assets/js/operator.js</a></h3>
these files are used for the customer and operator chat. You'll need to change the <br />
_self.websocketUrl, // url for the websocket server (just the domain)<br />
_self.apiUrl, // url for your chat <a href="https://github.com/sorinbotirla/powerchat/blob/main/index.php">index.php</a> (API file)<br />
_self.operatorAvatarUrl, // the url for the operator avatar, it can be like https://yourdomain/assets/img/operator-avatar.png<br />
_self.attachmentsUrl, // the url for the attachments folder<br />
_self.websocketPort // the port for the websocket server, ex 5678<br />
to your desired configuration.<br />
You have an avatar icon in assets/img but you can use your own for the operators.<br />
<br />
<br />

<h2>Requirements and dependencies</h2>

PHP 5.6 (minimum), MySQL, Python 3, Websockets and Pytz (it will scream for dependencies anyway when you try to run it).<br />
A SSL Certificate (.crt) and Key (.key) You'll get them from your host provider and even Let's Encrypt works. Just set up the path for them in the python script. Otherwise the websocket server won't work.
<br /><br />
Of course, you will have to open the websocket desired port trough your firewall if you have one.

<h2>Testing</h2>
Operator chat will be available at https:// your url here / path to the <a href="https://github.com/sorinbotirla/powerchat/blob/main/index.php">index.php</a>?method=manageoperator<br />
Customer chat will be available at https:// your url here / path to the client.html (you can replace later this path with your desired application if you plan to integrate it)<br />
If you use the chat with multiple operators, handle the operator name change yourself. The default name is Operator.<br />
Customers are required to write their names and email addresses to join the chat. Make sure you change the Terms and Conditions URL of the agreement checkbox.

In production you will need a second parameter called pwrsid and the value<br />
can be generated with $this->generatePowerSupportSid(); <br />
Then remove the following line from the "manageoperator" clause, in index.php<br />
<strong>$request["pwrsid"] = $this->generatePowerSupportSid();</strong><br />

Of course, feel free to change this with your own protection measures
