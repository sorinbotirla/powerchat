<?php
//url
defined("POWERCHAT_URL_DOMAIN") or define("POWERCHAT_URL_DOMAIN", ""); // your domain
defined("POWERCHAT_URL") or define("POWERCHAT_URL", ""); // full url to the chat
defined("POWERCHAT_ATTACHMENTS_PATH") or define("POWERCHAT_ATTACHMENTS_PATH", "attachments"); // attachments folder path
defined("POWERCHAT_ATTACHMENTS_URL") or define("POWERCHAT_ATTACHMENTS_URL", ""); // attachments folder url
defined("POWERCHAT_MONITOR_JSON_FILE") or define("POWERCHAT_MONITOR_JSON_FILE", "currentchatoperator.json"); // json file with current operators reading conversations
defined("POWERCHAT_ONLINE_OPERATORS_JSON_FILE") or define("POWERCHAT_ONLINE_OPERATORS_JSON_FILE", "onlineoperators.json"); // json file with current online operators

//database
defined("POWERCHAT_DB_SERVER") or define("POWERCHAT_DB_SERVER", "localhost");
defined("POWERCHAT_DB_NAME") or define("POWERCHAT_DB_NAME", ""); // DATABASE NAME
defined("POWERCHAT_DB_USER") or define("POWERCHAT_DB_USER", ""); // DATABASE USER
defined("POWERCHAT_DB_PASS") or define("POWERCHAT_DB_PASS", ""); // DATABASE PASSWORD
defined("POWERCHAT_DB_CHARSET") or define("POWERCHAT_DB_CHARSET", "utf8mb4");

//timezone
defined("POWERCHAT_TIMEZONE") or define("POWERCHAT_TIMEZONE", "Europe/Bucharest");

//debugging
defined("POWERCHAT_DEBUGGING") or define("POWERCHAT_DEBUGGING", true); // false in production

//email
defined("POWERCHAT_EMAIL_SMTP_SERVER") or define("POWERCHAT_EMAIL_SMTP_SERVER", ""); // change to your email server
defined("POWERCHAT_EMAIL_SMTP_USER") or define("POWERCHAT_EMAIL_SMTP_USER", ""); // change to your email user
defined("POWERCHAT_EMAIL_SMTP_PASS") or define("POWERCHAT_EMAIL_SMTP_PASS", ""); // change to your email password
defined("POWERCHAT_EMAIL_SMTP_PORT") or define("POWERCHAT_EMAIL_SMTP_PORT", 465); // change to your email outgoing port
defined("POWERCHAT_EMAIL_REPLY_NAME") or define("POWERCHAT_EMAIL_REPLY_NAME", "PowerChat");
defined("POWERCHAT_EMAIL_REPLY_SUBJECT") or define("POWERCHAT_EMAIL_REPLY_SUBJECT", "Reply from PowerChat");
defined("POWERCHAT_TEMPLATE_OPERATOR_EMAIL_REPLY") or define("POWERCHAT_TEMPLATE_OPERATOR_EMAIL_REPLY", "operator-email-reply.html");

if (true == POWERCHAT_DEBUGGING){
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

set_time_limit(180);
ini_set('upload_max_size' , '25M');
ini_set('post_max_size' , '256M');
ini_set('max_execution_time' , 180);
ini_set('memory_limit' , '512M');

date_default_timezone_set(POWERCHAT_TIMEZONE);
?>