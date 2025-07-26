#!/usr/bin/env python
import os, psutil, json, time, datetime, subprocess, pytz, sys, asyncio, logging, websockets, ssl, glob, base64, signal
from urllib.parse import unquote, quote

PORT = "5678"
TIMEZONE = 'Europe/Bucharest' # change to your timezone
SSL_CERT_PATH = "certkey/cert.crt" # change to your ssl cert path
SSL_KEY_PATH = "certkey/key.key" # change to your ssl key path
os.environ['TZ'] = TIMEZONE
# Setup logging
logging.basicConfig()

# SSL context
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
cert, key = [SSL_CERT_PATH, SSL_KEY_PATH]
ssl_context.load_cert_chain(cert, keyfile=key)

# Shared state and connected users
STATE = {"onlineUsers": 0, "onlineOperators": 0, "value": 0}
USERS = {}

def currentMillis():
    return round(time.time() * 1000)

def timeFromMilliseconds( milliseconds ):
	seconds, milliseconds = divmod(milliseconds,1000)
	minutes, seconds = divmod(seconds, 60)
	hours, minutes = divmod(minutes, 60)
	days, hours = divmod(hours, 24)
	seconds = seconds + milliseconds/1000
	return [days, hours, minutes, seconds]

def state_event():
    return json.dumps({"type": "state", **STATE})

def users_event():
    return json.dumps({"type": "users", "count": len(USERS)})

async def notify_state():
    if USERS:
        message = state_event()
        await asyncio.gather(*(user.send(message) for user in USERS))

async def notify_users():
    if USERS:
        message = users_event()
        await asyncio.gather(*(user.send(message) for user in USERS))

async def register(websocket):
    USERS[websocket] = {
        "attr": None,
        "uuid": None,
        "operator": None,
        "windowuuid": None,
        "response": False,
        "online": 1
    }
    STATE["onlineUsers"] = len(USERS)

async def unregister(websocket):
    if websocket in USERS:
        #get uuid
        uuid = USERS[websocket].get("uuid")
        attr = USERS[websocket].get("attr")
        operator = USERS[websocket].get("operator")
        clientemail = USERS[websocket].get("clientemail")
        clientname = USERS[websocket].get("clientname")
#         print(str(json.dumps({"uuid": uuid, "attr": attr, "operator": operator})))
        if (attr == "client"): #a client disconnected
            print("customer "+str(clientname)+" disconnected")
            for user in USERS:
                #let operator know when client disconnected
                if USERS[user]["uuid"] == uuid and USERS[user]["attr"] == "operator":
                    messageJson = {
                        "comm": "clientDisconnected",
                        "data": {
                            "uuid": uuid,
                            "attr": "client",
                            "message": "customer left the chat",
                            "clientemail": clientemail,
                            "clientname": clientname,
                            "isonline": 0
                        }
                    }
                    quoted = quote(json.dumps(messageJson))
                    message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                    try:
                        await user.send(message2)
                    except websockets.exceptions.ConnectionClosed:
                        await unregister(user)
        elif (attr == "operator"): #an operator disconnected
             print("operator "+str(operator)+" disconnected")
             for user in USERS:
                 #let client know when operator disconnected
                 if USERS[user]["uuid"] == uuid and USERS[user]["attr"] == "client":
                     messageJson = {
                         "comm": "clientDisconnected",
                         "data": {
                             "uuid": uuid,
                             "attr": "operator",
                             "operator": operator,
                             "message": operator+" left the chat",
                             "isonline": 0
                         }
                     }
                     quoted = quote(json.dumps(messageJson))
                     message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                     try:
                         await user.send(message2)
                     except websockets.exceptions.ConnectionClosed:
                         await unregister(user)
        del USERS[websocket]
    STATE["onlineUsers"] = len(USERS)

async def messageParser(websocket):
    await register(websocket)
    try:
        async for message in websocket:
            message = unquote(unquote(base64.b64decode(message).decode('utf-8')))
            data = json.loads(message)

            #HAS FILES STRING
            filesString = ""
            if "data" in data and "files" in data["data"]:
                filesString = data["data"]["files"]

            #MESSAGES WITH CONN ATTRIBUTE
            if "comm" in data:
                #CONNECTED EVENT
                if data["comm"] == "clientConnected" and "data" in data: #a new connection
                    if "attr" in data["data"] and data["data"].get("attr") == "client" and "uuid" in data["data"] and "clientemail" in data["data"]  and "clientname" in data["data"] and "windowuuid" in data["data"]: #a client connected
                        USERS[websocket]["attr"] = "client"
                        USERS[websocket]["uuid"] = data["data"]["uuid"]
                        USERS[websocket]["clientemail"] = data["data"]["clientemail"]
                        USERS[websocket]["clientname"] = data["data"]["clientname"]
                        USERS[websocket]["windowuuid"] = data["data"]["windowuuid"]
                        USERS[websocket]["isonline"] = 1
                        print("client "+str(data["data"]["clientname"])+" connected");

                        #let operator know when user connected
                        for user in USERS:
                            if USERS[user]["uuid"] == data["data"]["uuid"] and USERS[user]["attr"] == "operator":
                                messageJson = {
                                    "comm": "clientConnected",
                                    "data": {
                                        "uuid": data["data"]["uuid"],
                                        "attr": "client",
                                        "clientemail": data["data"]["clientemail"],
                                        "clientname": data["data"]["clientname"],
                                        "message": "customer joined the chat",
                                        "isonline": 1
                                    }
                                }
                                quoted = quote(json.dumps(messageJson))
                                message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                                try:
#                                     print("Sending to:", USERS[user])
#                                     print("Sending message:", messageJson)
                                    await user.send(message2)
                                except websockets.exceptions.ConnectionClosed:
                                    await unregister(user)

                    elif data["data"].get("attr") == "operator" and "operator" in data["data"] and "uuid" in data["data"] and "windowuuid" in data["data"]: #an operator connected
                        USERS[websocket]["operator"] = data["data"]["operator"]
                        USERS[websocket]["attr"] = "operator"
                        USERS[websocket]["uuid"] = data["data"]["uuid"]
                        USERS[websocket]["windowuuid"] = data["data"]["windowuuid"]
                        USERS[websocket]["isonline"] = 1
                        print("operator "+str(data["data"]["operator"])+" connected");

                        #let client know when operator connected
                        for user in USERS:
                            if USERS[user]["uuid"] == data["data"]["uuid"] and USERS[user]["attr"] == "client":
                                messageJson = {
                                    "comm": "clientConnected",
                                    "data": {
                                        "uuid": data["data"]["uuid"],
                                        "attr": "operator",
                                        "operator": data["data"]["operator"],
                                        "message": data["data"]["operator"]+" joined the chat",
                                        "isonline": 1
                                    }
                                }
                                quoted = quote(json.dumps(messageJson))
                                message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                                try:
                #                                     print("Sending to:", USERS[user])
                #                                     print("Sending message:", messageJson)
                                    await user.send(message2)
                                except websockets.exceptions.ConnectionClosed:
                                    await unregister(user)
                #TEXT & FILES MESSAGES
                elif data["comm"] == "newMessage" and "data" in data: #a new message
                    #CLIENT SENDS A MESSAGE
                    if data["data"].get("attr") == "client" and "clientemail" in data["data"] and "clientname" in data["data"]: #from a client
                        #TBA LOG CLIENT MESSAGE TO DB

                        # Forward message from client to all operators
                        for user in USERS:
                            if USERS[user]["attr"] == "operator":
                                messageJson = {
                                    "comm": "newMessage",
                                    "data": {
                                        "uuid": data["data"]["uuid"],
                                        "message": data["data"]["message"],
                                        "clientemail": data["data"]["clientemail"],
                                        "clientname": data["data"]["clientname"],
                                        "attr": "client",
                                        "response": True,
                                        "files": filesString,
                                        "isonline": 1
                                    }
                                }
                                quoted = quote(json.dumps(messageJson))
                                message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                                try:
                                    print("Sending to:", USERS[user])
                                    print("Sending message:", messageJson)
                                    await user.send(message2)
                                except websockets.exceptions.ConnectionClosed:
                                    await unregister(user)
                    #OPERATOR SENDS A MESSAGE
                    elif data["data"].get("attr") == "operator": #from an operator
                        #TBA LOG OPERATOR MESSAGE TO DB


                        # Forward message from operator to matching client and also to other operators but not to the same operator
                        for user in USERS:
                            if (USERS[user]["uuid"] == data["data"]["uuid"] and USERS[user]["attr"] == "client") or (USERS[user]["attr"] == "operator" and USERS[user]["operator"] != data["data"]["operator"]):
                                messageJson = {
                                    "comm": "newMessage",
                                    "data": {
                                        "uuid": data["data"]["uuid"],
                                        "message": data["data"]["message"],
                                        "operator": data["data"]["operator"],
                                        "attr": "operator",
                                        "response": True,
                                        "files": filesString,
                                        "isonline": 1
                                    }
                                }
                                quoted = quote(json.dumps(messageJson))
                                message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                                try:
                                    print("Sending to:", USERS[user])
                                    print("Sending message:", messageJson)
                                    await user.send(message2)
                                except websockets.exceptions.ConnectionClosed:
                                    await unregister(user)

#                     print("USERS:", USERS)
#                     print("Incoming message:", data)

                #TYPING EVENT
                elif data["comm"] == "typingEvent" and "data" in data: #is typing
                    #CLIENT IS TYPING
                    if data["data"].get("attr") == "client" and "clientemail" in data["data"] and "clientname" in data["data"]: #client is typing
                        # Forward typing event from client to matching operator
                        print(str(data["data"]["clientname"])+" is typing..");
                        for user in USERS:
                            #forward typing event to all operators
                            if USERS[user]["attr"] == "operator":
                                messageJson = {
                                    "comm": "typingEvent",
                                    "data": {
                                        "uuid": data["data"]["uuid"],
                                        "clientemail": data["data"]["clientemail"],
                                        "clientname": data["data"]["clientname"],
                                        "attr": "client",
                                        "isonline": 1
                                    }
                                }
                                quoted = quote(json.dumps(messageJson))
                                message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                                try:
#                                     print("Sending to:", USERS[user])
#                                     print("Sending message:", messageJson)
                                    await user.send(message2)
                                except websockets.exceptions.ConnectionClosed:
                                    await unregister(user)

                    #OPERATOR IS TYPING
                    elif data["data"].get("attr") == "operator": #operator is typing
                        # Forward typing event from operator to matching client
                        print(str(data["data"]["operator"])+" is typing..");
                        for user in USERS:
                            if USERS[user]["uuid"] == data["data"]["uuid"] and USERS[user]["attr"] == "client":
                                messageJson = {
                                    "comm": "typingEvent",
                                    "data": {
                                        "uuid": data["data"]["uuid"],
                                        "operator": data["data"]["operator"],
                                        "attr": "operator",
                                        "isonline": 1
                                    }
                                }
                                quoted = quote(json.dumps(messageJson))
                                message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                                try:
#                                     print("Sending to:", USERS[user])
#                                     print("Sending message:", messageJson)
                                    await user.send(message2)
                                except websockets.exceptions.ConnectionClosed:
                                    await unregister(user)

#                     print("USERS:", USERS)


                #SEEN EVENT
                elif data["comm"] == "seenEvent" and "data" in data: #is seeing other's messages
                    #CLIENT HAS SEEN OPERATOR'S MESSAGES
                    if data["data"].get("attr") == "client" and "clientemail" in data["data"] and "clientname" in data["data"]: #client has seen operator's messages
                        # Forward seen event from client to matching operator
                        print(str(data["data"]["clientname"])+" has seen..");
                        for user in USERS:
                            if USERS[user]["uuid"] == data["data"]["uuid"] and USERS[user]["attr"] == "operator":
                                messageJson = {
                                    "comm": "seenEvent",
                                    "data": {
                                        "uuid": data["data"]["uuid"],
                                        "clientemail": data["data"]["clientemail"],
                                        "clientname": data["data"]["clientname"],
                                        "attr": "client",
                                        "isonline": 1
                                    }
                                }
                                quoted = quote(json.dumps(messageJson))
                                message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                                try:
#                                     print("Sending to:", USERS[user])
#                                     print("Sending message:", messageJson)
                                    await user.send(message2)
                                except websockets.exceptions.ConnectionClosed:
                                    await unregister(user)

                    #OPERATOR HAS SEEN CLIENT'S MESSAGES
                    elif data["data"].get("attr") == "operator": #operator has seen client's messages
                        # Forward seen event from operator to matching client
                        print(str(data["data"]["operator"])+" has seen..");
                        for user in USERS:
                            if USERS[user]["uuid"] == data["data"]["uuid"] and USERS[user]["attr"] == "client":
                                messageJson = {
                                    "comm": "seenEvent",
                                    "data": {
                                        "uuid": data["data"]["uuid"],
                                        "operator": data["data"]["operator"],
                                        "attr": "operator",
                                        "isonline": 1
                                    }
                                }
                                quoted = quote(json.dumps(messageJson))
                                message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                                try:
#                                     print("Sending to:", USERS[user])
#                                     print("Sending message:", messageJson)
                                    await user.send(message2)
                                except websockets.exceptions.ConnectionClosed:
                                    await unregister(user)

#                     print("USERS:", USERS)
                #REQUESTING CONVERSATIONS
                elif data["comm"] == "getConversationsUUIDS" and "data" in data:
                    #IF IS OPERATOR
                    if data["data"].get("attr") == "operator":
                        USERS[websocket]["operator"] = data["data"]["operator"]
                        USERS[websocket]["attr"] = "operator"
                        USERS[websocket]["uuid"] = data["data"]["uuid"]
                        USERS[websocket]["windowuuid"] = data["data"]["windowuuid"]
                        print(str(data["data"]["operator"])+" requested conversation UUIDS");
                        usersUUIDSData = {
                            "uuids": [USERS[user] for user in USERS if USERS[user]["attr"] == "client"]
                        }
                        print("UUIDS: "+str(json.dumps(usersUUIDSData)))
                        quoted = quote(json.dumps(usersUUIDSData))
                        message2 = base64.b64encode(quoted.encode("utf-8")).decode("utf-8")
                        await websocket.send(message2)

                #ASSIGNING CLIENT UUID
                elif data["comm"] == "assignUUID" and "data" in data:
                    #IF IS OPERATOR
                    if data["data"].get("attr") == "operator":
                        USERS[websocket]["operator"] = data["data"]["operator"]
                        USERS[websocket]["attr"] = "operator"
                        USERS[websocket]["uuid"] = data["data"]["message"]
                        USERS[websocket]["windowuuid"] = data["data"]["windowuuid"]
                        print(str(data["data"]["operator"])+" assigned UUID "+str(data["data"]["message"]));
            pass
    except websockets.exceptions.ConnectionClosedError as e:
        # Optional: log a message at info/debug level
        logging.info(f"WebSocket closed: {e}")
    except Exception as e:
        # Log other errors
        logging.exception("Unexpected error in messageParser")
    finally:
        await unregister(websocket)


async def shutdown(server, loop):
#     print("Shutting down websocket server gracefully...")
    # Close server
    server.close()
    await server.wait_closed()

    # Unregister all users and close websockets
    close_tasks = []
    for ws in list(USERS.keys()):
        close_tasks.append(ws.close())
    await asyncio.gather(*close_tasks, return_exceptions=True)

    # Cancel all other tasks
    tasks = [t for t in asyncio.all_tasks(loop) if t is not asyncio.current_task(loop)]
    [task.cancel() for task in tasks]
    await asyncio.gather(*tasks, return_exceptions=True)
    loop.stop()

async def main():
    # Start server
    server = await websockets.serve(messageParser, "0.0.0.0", PORT, ssl=ssl_context)
    loop = asyncio.get_running_loop()

    # Register signal handlers
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, lambda sig=sig: asyncio.create_task(shutdown(server, loop)))

#     print("WebSocket server started!")
    try:
        await asyncio.Future()  # run forever
    except asyncio.CancelledError:
        pass

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
#         print("Keyboard interrupt received. Exiting.")
        pass