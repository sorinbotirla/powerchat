<?php
require_once("config.php");
require_once 'vendor/autoload.php';
require_once("mobiledetect.php");
//mail
use DeviceDetector\ClientHints;
use DeviceDetector\DeviceDetector;
use DeviceDetector\Parser\Device\AbstractDeviceParser;
//mail
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;


function endsWith( $haystack, $needle ) {
    $length = strlen( $needle );
    if( !$length ) {
        return true;
    }
    return substr( $haystack, -$length ) === $needle;
}


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
if(isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: X-Requested-With, uploadfiles, content-type, content-length, accept, uuid');


class SimpleImage {
    public $image;
    public $imageType;
    public function load($filename) {
        $imageInfo = getimagesize($filename);
        $this->imageType = $imageInfo[2];
        if ($this->imageType == IMAGETYPE_JPEG) {
            $this->image = imagecreatefromjpeg($filename);
        } else if ($this->imageType == IMAGETYPE_GIF) {
            $this->image = imagecreatefromgif($filename);
        } else if ($this->imageType == IMAGETYPE_PNG) {
            $this->image = imagecreatefrompng($filename);
        }
    }
    public function save($filename, $imageType = IMAGETYPE_JPEG, $compression = 50, $permissions = null) {
        if ($imageType == IMAGETYPE_JPEG) {
            imagejpeg($this->image,$filename,$compression);
        } else if ($imageType == IMAGETYPE_GIF) {
            imagegif($this->image,$filename);
        } else if ($imageType == IMAGETYPE_PNG) {
            imagepng($this->image,$filename);
        }
        if ($permissions != null) {
            chmod($filename,$permissions);
        }
    }
    public function output($imageType = IMAGETYPE_JPEG) {
        if ($imageType == IMAGETYPE_JPEG) {
            imagejpeg($this->image);
        } else if ($imageType == IMAGETYPE_GIF) {
            imagegif($this->image);
        } else if ($imageType == IMAGETYPE_PNG) {
            imagepng($this->image);
        }
    }
    public function getWidth() {
        return imagesx($this->image);
    }
    public function getHeight() {
        return imagesy($this->image);
    }
    public function resizeToHeight($height) {
        $ratio = $height / $this->getHeight();
        $width = $this->getWidth() * $ratio;
        $this->resize($width,$height);
    }
    public function resizeToWidth($width) {
        $ratio = $width / $this->getWidth();
        $height = $this->getheight() * $ratio;
        $this->resize($width,$height);
    }
    public function scale($scale) {
        $width = $this->getWidth() * $scale/100;
        $height = $this->getheight() * $scale/100;
        $this->resize($width,$height);
    }
    public function resize($width,$height) {
        $newImage = imagecreatetruecolor($width, $height);
        imagecopyresampled($newImage, $this->image, 0, 0, 0, 0, $width, $height, $this->getWidth(), $this->getHeight());
        $this->image = $newImage;
    }
}

class PowerSupport {
    public $smtpServer;
    public $smtpUsername;
    public $smtpPassword;
    public $smtpPort;
    public $request;
    public $headers;
    public $files;
    public $conn = null;
    public $config;
    public $root;
    public $userAgent;
    public $detect;
    public $Mobile_Detect;
    public $DeviceDetector;
    private $monitorFile;
    private $onlineOperatorsFile;
    private $attachmentsPath;
    private $attachmentsUrl;
    private $operatorEmailTemplate;

    public function __construct(){
        $this->smtpServer = POWERCHAT_EMAIL_SMTP_SERVER;
        $this->smtpUsername = POWERCHAT_EMAIL_SMTP_USER;
        $this->smtpPassword = POWERCHAT_EMAIL_SMTP_PASS;
        $this->smtpPort = POWERCHAT_EMAIL_SMTP_PORT;

        $this->root = POWERCHAT_URL_DOMAIN;
        $this->monitorFile = POWERCHAT_MONITOR_JSON_FILE;
        $this->onlineOperatorsFile = POWERCHAT_ONLINE_OPERATORS_JSON_FILE;
        $this->attachmentsPath = POWERCHAT_ATTACHMENTS_PATH;
        $this->attachmentsUrl = POWERCHAT_ATTACHMENTS_URL;
        $this->operatorEmailTemplate = POWERCHAT_TEMPLATE_OPERATOR_EMAIL_REPLY;

        $this->headers = apache_request_headers();
        $this->request = $_REQUEST;
        $this->files = $_FILES;
        if (
            (isset($this->headers["uploadfiles"]) && !empty($this->headers["uploadfiles"])
                && isset($this->files) && !empty($this->files))
            || (isset($this->request["method"]) && !empty($this->request["method"]))
            || (isset($this->request["c"]) && !empty($this->request["c"]))
        ) {
            $this->requestHandler($this->request, $this->headers, $this->files);
        }
    }

    private function arrayIntersect($array1, $array2) {
        $a1 = $a2 = array();

        // we don't care about keys anyway + avoids dupes
        foreach ($array1 as $value) {
            $a1[$value] = $value;
        }
        foreach ($array2 as $value) {
            $a2[$value] = 1;
        }

        // unset different values values
        foreach ($a1 as $value) {
            if (!isset($a2[$value])) {
                unset($a1[$value]);
            }
        }

        return array_values($a1);
    }

    private function checkParam($param){
        if (!isset($param) || null == $param) {
            return false;
        } else if (is_string($param)) {
            return trim($param) != "";
        } elseif (is_numeric($param)){
            return 0 < $param;
        } elseif (is_bool($param)){
            return $param;
        } else {
            return !(!isset($param) || empty($param));
        }
    }

    public function get_http_cookie_variables() {

        $domains_counter = [];
        $http_cookie_variables = [];
        foreach(explode(';', $_SERVER['HTTP_COOKIE']) as $cookie_variable_string) {
            $key_value = explode('=', $cookie_variable_string);
            $cookie_var_name = trim($key_value[0]);
            if (!isset($domains_counter[$cookie_var_name]) || is_null($domains_counter[$cookie_var_name])) {
                $domains_counter[$cookie_var_name] = 0;
            }

            $http_cookie_variables[$cookie_var_name][$domains_counter[$cookie_var_name]] = urldecode(trim($key_value[1]));
            $domains_counter[$cookie_var_name]++;
        }

        return $http_cookie_variables;
    }

    public function objectToArray($obj){
        if (is_object($obj) || is_array($obj)) {
            $ret = (array)$obj;
            foreach ($ret as &$item) {
                $item = $this->objectToArray($item);
            }
            return $ret;
        } else {
            return $obj;
        }
    }

    public function isJson($string) {
        if (!is_string($string)) return false;

        $string = trim($string);

        if ($string === '') {
            return false;
        };

        // Decode JSON
        $decoded = json_decode($string, true);

        // Check for decoding errors and ensure result is array or object
        return (json_last_error() === JSON_ERROR_NONE && (is_array($decoded) || is_object($decoded)));
    }

    public function isBase64($str){
        return base64_encode(base64_decode($str, true)) === $str;
    }

    public function millitime() {
        $microtime = microtime();
        $comps = explode(' ', $microtime);

        // Note: Using a string here to prevent loss of precision
        // in case of "overflow" (PHP converts it to a double)
        return intval(sprintf('%d%03d', $comps[1], $comps[0] * 1000));
//        return "ok";
    }

    public function firstDayOfTheMonth($month = "this"){
        $allowedMonths = ["last", "this", "next"];
        $validMonth = false;
        if (isset($month) && !empty($month)) {
            if (in_array($month, $allowedMonths)) {
                $validMonth = true;
            }
        }
        if (!$validMonth) {
            $month = "this";
        }
//        $d = new DateTime(date("Y-m-d", strtotime("first day of this month")));
        $d = new DateTime(date("Y-m-d", strtotime("first day of ".$month." month")));
        return (int) ($d->format('U')."000");
    }

    public function sortArrayByKey(&$array, $key, $string = false, $asc = true){
        if ($string) {
            usort($array,function ($a, $b) use(&$key,&$asc) {
                if ($asc) {
                    return strcmp(strtolower($a[$key]), strtolower($b[$key]));
                } else {
                    return strcmp(strtolower($b[$key]), strtolower($a[$key]));
                }
            });
        } else {
            usort($array, function ($a, $b) use(&$key,&$asc) {
                if ($a[$key] == $b[$key]){
                    return 0;
                }
                if ($asc) {
                    return ($a[$key] < $b[$key]) ? -1 : 1;
                } else {
                    return ($a[$key] > $b[$key]) ? -1 : 1;
                }
            });
        }
    }

    public function UUID(){
        $b = random_bytes(16);
        $b[6] = chr(ord($b[6]) & 0x0f | 0x40);
        $b[8] = chr(ord($b[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
    }

    private function generatePowerSupportSid(){
        $token = "";
        $token = implode("",array_reverse(str_split(str_replace("=", "",base64_encode(md5(implode("",array_reverse(str_split(base64_encode(implode("-",array_reverse(str_split(md5(date("m").date("Y")."nu43ic5b4gnuf34".date("H")."4iboxy{{#efewgg*<nzg6BGb6E^Ff43g".date("d")."nu43@#_JG#HU!mfg4ic5b4}#|gnuf34".date("H")))))))))))))));
        $salt = implode("",array_reverse(str_split(str_replace("=", "",base64_encode(md5(implode("",array_reverse(str_split(base64_encode(implode("-",array_reverse(str_split(md5(date("Y").date("Y")."hcog4bchnf9oh48g54dcyv".date("H")."ionohB&G*BH#FH*N*o9h9f4hmp;h;".date("d")."bkl9b7k86j7h65epP<MKP(:JNHG".date("m")))))))))))))));
        $token .= $salt;
        return $token;
    }

    private function validatePowerSupportSid($sid = null){
        return (null != $sid && is_string($sid) && strlen(trim($sid)) > 0 && $sid == $this->generatePowerSupportSid()) ? true : false;
    }

    private function getPwrSid($user = null){
        return (null != $user) ? [ "status" => true, "data" => ["pwrsid" => $this->generatePowerSupportSid()], "msg" => ""] : ["status" => false, "data" => [], "msg" => "UNAUTHORIZED"];
    }

    private function connect(){
        if ($this->conn == null) {
            $host = POWERCHAT_DB_SERVER;
            $db   = POWERCHAT_DB_NAME;
            $user = POWERCHAT_DB_USER;
            $pass = POWERCHAT_DB_PASS;
            $charset = POWERCHAT_DB_CHARSET;

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                $this->conn = new PDO($dsn, $user, $pass, $options);
            } catch (\PDOException $e) {
                throw new \PDOException($e->getMessage(), (int)$e->getCode());
            }
        }
    }

    public function parseAgent($userAgent = false) {
        $result = [
            "status" => false,
            "data" => [],
            "msg" => ""
        ];

        if (false != $userAgent) {
            if ($this->isBase64($userAgent)) {
                $userAgent = base64_decode($userAgent);
            }
            $this->userAgent = $userAgent;
        } else {
            $this->userAgent = $_SERVER['HTTP_USER_AGENT'];
        }


        $this->Mobile_Detect = new Mobile_Detect;
        $this->Mobile_Detect->setUserAgent($this->userAgent);

        $this->DeviceDetector = new DeviceDetector($this->userAgent);
        $this->DeviceDetector->parse();


        $resp = [
            "agent" => (string) "",
            "bot" => "",
            "isdesktop" => "",
            "ismobile" => "",
            "istablet" => "",
            "isios" => "",
            "isandroid" => ""
        ];

        if ($this->DeviceDetector->isBot()) {
            $resp = [
                "agent" => (string) $this->userAgent,
                "bot" => $this->DeviceDetector->getBot(),
                "isdesktop" => $this->Mobile_Detect->isDesktop() || !$this->Mobile_Detect->isMobile(),
                "ismobile" => $this->Mobile_Detect->isMobile(),
                "istablet" => $this->Mobile_Detect->isTablet(),
                "isios" => $this->Mobile_Detect->isiOS(),
                "isandroid" => $this->Mobile_Detect->isAndroidOS()
            ];
        } else {
            $resp = [
                "agent" => (string) $this->userAgent,
                "bot" => false,
                "client" => $this->DeviceDetector->getClient(),
                "os" => $this->DeviceDetector->getOs(),
                "devicename" => $this->DeviceDetector->getDeviceName(),
                "brandname" => $this->DeviceDetector->getBrandName(),
                "model" => $this->DeviceDetector->getModel(),
                "isdesktop" => $this->Mobile_Detect->isDesktop() || !$this->Mobile_Detect->isMobile(),
                "ismobile" => $this->Mobile_Detect->isMobile(),
                "istablet" => $this->Mobile_Detect->isTablet(),
                "isios" => $this->Mobile_Detect->isiOS(),
                "isandroid" => $this->Mobile_Detect->isAndroidOS()
            ];
        }


        $result["data"] = $resp;
        $result["status"] = true;

        return $result;
    }

    public function saveDevice($uuid = false, $userAgent = false){
        $result = [
            "status" => false,
            "data" => [],
            "msg" => ""
        ];

        if (isset($uuid) && !empty($uuid)) {
            if (false == $userAgent) {
                $userAgent = $_SERVER['HTTP_USER_AGENT'];
            }
            if ($this->isBase64($userAgent)) {
                $userAgent = base64_decode($userAgent);
            }

            $this->userAgent = $userAgent;
            $data = $this->parseAgent($this->userAgent)["data"];

            if (isset($data["bot"])) {
                if (false == $data["bot"]) {
                    if (
                        isset($data["agent"])
                        && isset($data["client"])
                        && isset($data["os"])
                        && isset($data["devicename"])
                        && isset($data["brandname"])
                        && isset($data["model"])
                        && isset($data["isdesktop"])
                        && isset($data["ismobile"])
                        && isset($data["istablet"])
                        && isset($data["isios"])
                        && isset($data["isandroid"])
                    ) {
                        $deviceid = md5(base64_encode($uuid.base64_encode(urlencode(json_encode($data)))));



                        $pdoBindings = [
                            ":deviceagent" => (!empty($data["agent"])) ? $data["agent"] : "",
                            ":deviceclienttype" => (isset($data["client"]["type"]) && !empty($data["client"]["type"])) ? $data["client"]["type"] : "",
                            ":deviceclientname" => (isset($data["client"]["name"]) && !empty($data["client"]["name"])) ? $data["client"]["name"] : "",
                            ":deviceclientversion" => (isset($data["client"]["version"]) && !empty($data["client"]["version"])) ? $data["client"]["version"] : "",
                            ":deviceclientengine" => (isset($data["client"]["engine"]) && !empty($data["client"]["engine"])) ? $data["client"]["engine"] : "",
                            ":deviceosname" => (isset($data["os"]["name"]) && !empty($data["os"]["name"])) ? $data["os"]["name"] : "",
                            ":deviceosversion" => (isset($data["os"]["version"]) && !empty($data["os"]["version"])) ? $data["os"]["version"] : "",
                            ":deviceosplatform" => (isset($data["os"]["platform"]) && !empty($data["os"]["platform"])) ? $data["os"]["platform"] : "",
                            ":devicename" => (isset($data["devicename"]) && !empty($data["devicename"])) ? $data["devicename"] : "",
                            ":devicebrandname" => (isset($data["brandname"]) && !empty($data["brandname"])) ? $data["brandname"] : "",
                            ":devicemodel" => (isset($data["model"]) && !empty($data["model"])) ? $data["model"] : "",
                            ":deviceisdesktop" => (true == $data["isdesktop"]) ? 1 : 0,
                            ":deviceismobile" => (true == $data["ismobile"]) ? 1 : 0,
                            ":deviceistablet" => (true == $data["istablet"]) ? 1 : 0,
                            ":deviceisios" => (true == $data["isios"]) ? 1 : 0,
                            ":deviceisandroid" => (true == $data["isandroid"]) ? 1 : 0,
                            ":deviceid" => $deviceid,
                            ":uuid" => $uuid
                        ];

                        $sql = "UPDATE `pwr_conversations` ";
                        $sql .= " SET ";
                        $sql .= " `deviceagent` = :deviceagent, ";
                        $sql .= " `deviceclienttype` = :deviceclienttype, ";
                        $sql .= " `deviceclientname` = :deviceclientname, ";
                        $sql .= " `deviceclientversion` = :deviceclientversion, ";
                        $sql .= " `deviceclientengine` = :deviceclientengine, ";
                        $sql .= " `deviceosname` = :deviceosname, ";
                        $sql .= " `deviceosversion` = :deviceosversion, ";
                        $sql .= " `deviceosplatform` = :deviceosplatform, ";
                        $sql .= " `devicename` = :devicename, ";
                        $sql .= " `devicebrandname` = :devicebrandname, ";
                        $sql .= " `devicemodel` = :devicemodel, ";
                        $sql .= " `deviceisdesktop` = :deviceisdesktop, ";
                        $sql .= " `deviceismobile` = :deviceismobile, ";
                        $sql .= " `deviceistablet` = :deviceistablet, ";
                        $sql .= " `deviceisios` = :deviceisios, ";
                        $sql .= " `deviceisandroid` = :deviceisandroid, ";
                        $sql .= " `deviceid` = :deviceid ";
                        $sql .= " WHERE ";
                        $sql .= " `uuid` = :uuid ";

                        try {
//                            echo json_encode($pdoBindings); die;
                            $this->connect();
                            $stmt = $this->conn->prepare($sql);
                            $stmt->execute($pdoBindings);
                            $result["status"] = true;
                        } catch (\Exception $e) {
                            $result["msg"] .= $e->getMessage();
                        }
                    }
                }
            }

            $result["data"] = $data;
        }

        return $result;
    }

    public function getIp() {
        $ipaddress = '';
        if (getenv('HTTP_CLIENT_IP'))
            $ipaddress = getenv('HTTP_CLIENT_IP');
        else if(getenv('HTTP_X_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
        else if(getenv('HTTP_X_FORWARDED'))
            $ipaddress = getenv('HTTP_X_FORWARDED');
        else if(getenv('HTTP_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_FORWARDED_FOR');
        else if(getenv('HTTP_FORWARDED'))
            $ipaddress = getenv('HTTP_FORWARDED');
        else if(getenv('REMOTE_ADDR'))
            $ipaddress = getenv('REMOTE_ADDR');
        else
            $ipaddress = 'UNKNOWN';
        return $ipaddress;
    }

    private function getTime(){
        $currentTime = $this->millitime();
        $currentTimeStr = date("d-m-Y")."T".date("H:i:s", ($currentTime / 1000));
        return ["micros" => $currentTime, "datestr" => $currentTimeStr];
    }

    private function checkClientUUID($uuid = null){
        $result = [
            "status" => false,
            "data" => [],
            "msg" => ""
        ];

        if (null !== $uuid) {
            try {
                $this->connect();
                $sql = "SELECT ";
                $sql .= " `id`, ";
                $sql .= " `uuid`, ";
                $sql .= " `created`, ";
                $sql .= " `updated`, ";
                $sql .= " `operator`, ";
                $sql .= " `clientname`, ";
                $sql .= " `clientemail`, ";
                $sql .= " `operatorread`, ";
                $sql .= " `newmessages`, ";
                $sql .= " `color`, ";
                $sql .= " `operatoranswered`, ";
                $sql .= " `waitingforclientresponse` ";
                $sql .= " FROM `pwr_conversations` ";
                $sql .= " WHERE ";
                $sql .= " `uuid` = :uuid ";
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([":uuid" => $uuid]);
                $sqlResult = $stmt->fetch(PDO::FETCH_ASSOC);
                if (false != $sqlResult && isset($sqlResult["uuid"]) && $sqlResult["uuid"] == $uuid) {
                    $result["status"] = true;
                    $result["data"] = $sqlResult;
                }
            } catch (\Exception $e) {
                $result["msg"] .= $e->getMessage();
            }
        }

        return $result;
    }

    public function sendNoReplyMail($from = ["address" => "", "name" => ""], $to = ["address" => "", "name" => ""], $subject = "", $content = ""){
        $result = [
            "status" => false,
            "data" => [],
            "msg" => ""
        ];

//        if ($this->checkFakeAccess()) {
        try {
            $mail = new PHPMailer(true);
            //Server settings
//          $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      // Enable verbose debug output
            $mail->isSMTP();                                            // Send using SMTP
            $mail->Host       = $this->smtpServer;                   // Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
            $mail->Username   = $this->smtpUsername;             // SMTP username
            $mail->Password   = $this->smtpPassword;             // SMTP password
//          $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
            $mail->Port       = $this->smtpPort;                                    // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above


            //Recipients
            $mail->setFrom($from["address"], $from["name"]);
            $mail->addAddress($to["address"]);     // Add a recipient
            $mail->addReplyTo($from["address"], $from["name"]);

            // Content
            $mail->isHTML(true);                                // Set email format to HTML
            $mail->Subject = $subject;
            $mail->Body    = $content;
            $mail->AltBody = strip_tags($content);

            $mail->send();
            $result["status"] = true;
            $result["msg"] = "Email has been sent";
        } catch (\Exception $e) {
            $result["msg"] = "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
        }
//        } else {
//            $result["msg"] = "3";
//        }
        return $result;
    }

    private function getEmailTemplate($message, $clientEmail, $clientName, $currentDate, $uuid){
        $template = "";
        if (file_exists(__DIR__."/templates/".$this->operatorEmailTemplate)) {
            $template = file_get_contents(__DIR__."/templates/".$this->operatorEmailTemplate);
            $template = str_replace("{{currentdate}}", $currentDate, $template);
            $template = str_replace("{{clientname}}", $clientName, $template);
            $template = str_replace("{{clientemail}}", $clientEmail, $template);
            $template = str_replace("{{uuid}}", $uuid, $template);
            $template = str_replace("{{message}}", $message, $template);
        }

        return $template;
    }

    private function logMessage($message = null){
        $result = [
            "status" => false,
            "data" => [],
            "msg" => "",
            "conversationCreate" => [],
            "datestr" => ""
        ];

        $result["messagedata"] = $message;

        $currentTime = $this->millitime();

        $result["datestr"] = date("Y-m-d", $currentTime / 1000)."T".date("H:i:s", $currentTime / 1000);

        if (null !== $message) {
            if (isset($message["comm"]) && $message["comm"] == "newMessage"
            && isset($message["data"]) && !empty($message["data"])
            && (isset($message["data"]["message"]) && !empty($message["data"]["message"]) || isset($message["data"]["files"]) && !empty($message["data"]["files"]))
            && isset($message["data"]["uuid"]) && !empty($message["data"]["uuid"])
//            && isset($message["data"]["windowuuid"]) && !empty($message["data"]["windowuuid"])
            ) {
                $result["msg"] .= "a";
                if (isset($message["data"]["clientname"]) && !empty($message["data"]["clientname"]) && is_string($message["data"]["clientname"]) && $this->isBase64($message["data"]["clientname"])
                && isset($message["data"]["clientemail"]) && !empty($message["data"]["clientemail"]) && is_string($message["data"]["clientemail"]) && $this->isBase64($message["data"]["clientemail"])) {
                    $result["msg"] .= "b";
                    if (!isset($message["data"]["color"]) || empty($message["data"]["color"])) {
                        $message["data"]["color"] = "#000000";
                    }
                    $result["conversationCreate"] = $this->createConversation($message["data"]["uuid"], $message["data"]["clientemail"], $message["data"]["clientname"], $message["data"]["color"]);
                }
                if (isset($message["data"]["operator"]) && !empty($message["data"]["operator"])) { // operator sends a message
                    $result["msg"] .= "c";
                    if (isset($message["data"]["isonline"]) && 0 == $message["data"]["isonline"]) { // the client is offline, the operator sends an email to the client
                        $result["msg"] .= "d";
                        // email this message to client
                        if (file_exists(__DIR__.'/phpmailer/vendor/autoload.php')) {
                            $result["msg"] .= "e";

                            require_once(__DIR__ . '/phpmailer/vendor/autoload.php');
                            try {
                                $result["msg"] .= "f";
                                //get client email and name
                                $clientEmail = "";
                                $clientName = "";
                                $currentDate = date("Y-m-d H:i");

                                $sqlClientData = "SELECT ";
                                $sqlClientData .= " `clientemail`, ";
                                $sqlClientData .= " `clientname`, ";
                                $sqlClientData .= " `uuid` ";
                                $sqlClientData .= " FROM ";
                                $sqlClientData .= " `pwr_conversations` ";
                                $sqlClientData .= " WHERE ";
                                $sqlClientData .= " `uuid` = :uuid ";
                                $this->connect();
                                $stmtClientData = $this->conn->prepare($sqlClientData);
                                $stmtClientData->execute([
                                    ":uuid" => $message["data"]["uuid"]
                                ]);
                                $sqlResultClientData = $stmtClientData->fetch(PDO::FETCH_ASSOC);
                                $result["convdata"] = $sqlResultClientData;

                                if (false != $sqlResultClientData && isset($sqlResultClientData["clientemail"]) && !empty($sqlResultClientData["clientemail"])
                                    && isset($sqlResultClientData["clientname"]) && !empty($sqlResultClientData["clientname"])
                                    && isset($sqlResultClientData["uuid"]) && !empty($sqlResultClientData["uuid"])
                                ) {
                                    $result["msg"] .= "g";
                                    $clientEmail = rawurldecode(base64_decode($sqlResultClientData["clientemail"]));
                                    $clientName = rawurldecode(base64_decode($sqlResultClientData["clientname"]));

                                    $emailHtml = $this->getEmailTemplate($message["data"]["message"], $clientEmail, $clientName, $currentDate, $sqlResultClientData["uuid"]);

                                    $emailResponse = $this->sendNoReplyMail(
                                        ["address" => $this->smtpUsername, "name" => POWERCHAT_EMAIL_REPLY_NAME], // from: address, name
                                        ["address" => $clientEmail, "name" => $clientName],  // to: address, name
                                        POWERCHAT_EMAIL_REPLY_SUBJECT." ". $currentDate,  //subject
                                        $emailHtml // body
                                    );
                                    $result["emailstatus"] = $emailResponse["status"];
                                    $result["msg"] .= $emailResponse["msg"];

                                    $message["data"]["emailed"] = 1;
                                }

                            } catch (\Exception $e) {
                                $result["msg"] .= "h";
                                $result["msg"] .= $e->getMessage();
                            }
                        }
                    }
                    try {
                        $result["msg"] .= "i";
                        $this->connect();
                        $sql = "UPDATE ";
                        $sql .= " `pwr_conversations` ";
                        $sql .= " SET ";
                        $sql .= " `updated` = :currenttime, ";
                        $sql .= " `operator` = :operator, ";
                        $sql .= " `operatorread` = :operatorread, ";
                        $sql .= " `newmessages` = :newmessages, ";
                        $sql .= " `operatoranswered` = :operatoranswered ";

                        if (isset($message["data"]["isonline"]) && 0 == $message["data"]["isonline"]) {
                            $sql .= " ,`waitingforclientresponse` = :waitingforclientresponse ";
                        }

                        $sql .= " WHERE `uuid` = :uuid ";
                        $stmt = $this->conn->prepare($sql);
                        $pdoBindings = [
                            ":currenttime" => $currentTime,
                            ":operatorread" => 1,
                            ":operatoranswered" => 1,
                            ":newmessages" => 0,
                            ":operator" => $message["data"]["operator"],
                            ":uuid" => $message["data"]["uuid"]
                        ];
                        if (isset($message["data"]["isonline"]) && 0 == $message["data"]["isonline"]) {
                            $pdoBindings[":waitingforclientresponse"] = 1; // lock the conversation until the client responds
                        }
                        $stmt->execute($pdoBindings);
                    } catch (\Exception $e) {
                        $result["msg"] .= "j";
                        $result["msg"] .= $e->getMessage();
                    }
                } else if (isset($message["data"]["clientname"]) && !empty($message["data"]["clientname"]) && is_string($message["data"]["clientname"]) && $this->isBase64($message["data"]["clientname"])
                && isset($message["data"]["clientemail"]) && !empty($message["data"]["clientemail"]) && is_string($message["data"]["clientemail"]) && $this->isBase64($message["data"]["clientemail"])) { // the client sends a message
                    $result["msg"] .= "k";
                    try {
                        $result["msg"] .= "l";
                        $this->connect();
                        $sql = "UPDATE ";
                        $sql .= " `pwr_conversations` ";
                        $sql .= " SET ";
                        $sql .= " `updated` = :currenttime, ";
                        $sql .= " `clientname` = :clientname, ";
                        $sql .= " `clientemail` = :clientemail, ";
                        $sql .= " `operatorread` = :operatorread, ";
                        $sql .= " `newmessages` = `newmessages` + 1, ";
                        $sql .= " `operatoranswered` = :operatoranswered, ";
                        $sql .= " `waitingforclientresponse` = :waitingforclientresponse ";
                        $sql .= " WHERE `uuid` = :uuid ";
                        $stmt = $this->conn->prepare($sql);
                        $pdoBindings = [
                            ":currenttime" => $currentTime,
                            ":operatorread" => 0,
                            ":operatoranswered" => 0,
                            ":clientemail" => $message["data"]["clientemail"],
                            ":clientname" => $message["data"]["clientname"],
                            ":uuid" => $message["data"]["uuid"],
                            ":waitingforclientresponse" => 0
                        ];
                        $stmt->execute($pdoBindings);
                    } catch (\Exception $e) {
                        $result["msg"] .= "m";
                        $result["msg"] .= $e->getMessage();
                    }
                }
                try {
                    $result["msg"] .= "n";
                    $this->connect();
                    $sql2 = "INSERT INTO ";
                    $sql2 .= " `pwr_messages` ";
                    $sql2 .= " ( ";
                    $sql2 .= " `uuid`, ";
                    $sql2 .= " `messageid`, ";
                    $sql2 .= " `message`, ";
                    $sql2 .= " `created`, ";
                    $sql2 .= " `author`, ";
                    $sql2 .= " `files`, ";
                    $sql2 .= " `emailed` ";
                    $sql2 .= " ) ";
                    $sql2 .= " VALUES ";
                    $sql2 .= " ( ";
                    $sql2 .= " :uuid, ";
                    $sql2 .= " :messageid, ";
                    $sql2 .= " :message, ";
                    $sql2 .= " :created, ";
                    $sql2 .= " :author, ";
                    $sql2 .= " :files, ";
                    $sql2 .= " :emailed ";
                    $sql2 .= " ) ";
                    $sql2 .= " ON DUPLICATE KEY UPDATE ";
                    $sql2 .= " `message` = `message` ";
                    $stmt2 = $this->conn->prepare($sql2);
                    $stmt2->execute([
                        ":uuid" => $message["data"]["uuid"],
                        ":messageid" => md5($message["data"]["uuid"].$currentTime),
                        ":message" => $message["data"]["message"],
                        ":created" => $currentTime,
                        ":author" => (isset($message["data"]["operator"]) && !empty($message["data"]["operator"])) ? $message["data"]["operator"] : "Client",
                        ":files" => (isset($message["data"]["files"]) && !empty($message["data"]["files"]) && is_string($message["data"]["files"]) && $this->isBase64($message["data"]["files"])) ? $message["data"]["files"] : "",
                        ":emailed" => (isset($message["data"]["emailed"]) && !empty($message["data"]["emailed"]) && 1 == $message["data"]["emailed"]) ? 1 : 0
                    ]);
                    $result["status"] = true;
                } catch (\Exception $e) {
                    $result["msg"] .= "o";
                    $result["msg"] .= $e->getMessage();
                }
            }
        }

        return $result;
    }

    private function createConversation($uuid = null, $clientemail = null, $clientname = null, $color = null, $customerId = null) {
        $result = [
            "status" => false,
            "data" => [],
            "msg" => "",
            "log" => "a",
            "inp" => [
                "uuid" => $uuid,
                "clientemail" => $clientemail,
                "clientname" => $clientname,
                "color" => $color,
                "customerId" => $customerId,
            ]
        ];

        $currentTime = $this->millitime();

        if (null !== $uuid
            && null !== $clientemail && is_string($clientemail) && $this->isBase64($clientemail)
            && null !== $clientname && is_string($clientname) && $this->isBase64($clientname)) {
            $result["log"] .= "b";
            // check if conversation uuid already exist
            $uuidExists = $this->checkClientUUID($uuid)["status"];
            if (true == $uuidExists) {
                $result["log"] .= "c";
                // exists
                $result["status"] = true;
            } else {
                $result["log"] .= "d";
                $this->connect();
                // does't exist, create it
                $sql = "INSERT INTO ";
                $sql .= " `pwr_conversations` ";
                $sql .= " ( ";
                $sql .= " `uuid`, ";
                $sql .= " `created`, ";
                $sql .= " `updated`, ";
                $sql .= " `clientname`, ";
                $sql .= " `clientemail`, ";
                $sql .= " `color` ";

                if (isset($customerId) && is_numeric($customerId)) {
                    $result["log"] .= "e";
                    $sql .= " ,`clientid` ";
                }
                $sql .= " ) ";
                $sql .= " VALUES ";
                $sql .= " ( ";
                $sql .= " :uuid, ";
                $sql .= " :created, ";
                $sql .= " :updated, ";
                $sql .= " :clientname, ";
                $sql .= " :clientemail, ";
                $sql .= " :color ";
                if (isset($customerId) && is_numeric($customerId)) {
                    $result["log"] .= "f";
                    $sql .= " ,:customerid ";
                }
                $sql .= " ) ";
                $sql .= " ON DUPLICATE KEY UPDATE ";
                $sql .= " `updated` = VALUES(`updated`), ";
                $sql .= " `clientname` = VALUES(`clientname`), ";
                $sql .= " `clientemail` = VALUES(`clientemail`) ";
                if (isset($customerId) && is_numeric($customerId)) {
                    $sql .= " ,`clientid` = VALUES(`clientid`) ";
                }
                try {
                    $result["log"] .= "g";
                    $stmt = $this->conn->prepare($sql);
                    $pdoBindings = [
                        ":uuid" => $uuid,
                        ":clientname" => trim($clientname),
                        ":clientemail" => trim($clientemail),
                        ":created" => $currentTime,
                        ":updated" => $currentTime,
                        ":color" => $color
                    ];
                    if (isset($customerId) && is_numeric($customerId)) {
                        $result["log"] .= "h";
                        $pdoBindings[":customerid"] = intval($customerId);
                    }
                    $stmt->execute($pdoBindings);
                    $result["status"] = true;
                } catch (\Exception $e) {
                    $result["log"] .= "i";
                    $result["msg"] .= $e->getMessage();
                }
            }
        }

        if (true == $result["status"]) {
            $result["log"] .= "j";
            // add device info
            try {
                $result["log"] .= "k";
                $this->saveDevice($uuid);
            } catch (\Exception $e) {
                $result["log"] .= "l";
                $result["msg"] .= $e->getMessage();
            }
        }

        return $result;
    }

    private function getConversationMessages($uuid = null, $operator = null, $show = null){
        $result = [
            "status" => false,
            "data" => [],
            "msg" => ""
        ];

        if (null !== $uuid) {
            try {
                $sql = "SELECT ";
                $sql .= " pm.`id`, ";
                $sql .= " pm.`uuid`, ";
                $sql .= " pm.`messageid`, ";
                $sql .= " pm.`message`, ";
                $sql .= " pm.`created`, ";
                $sql .= " pm.`author`, ";
                $sql .= " pc.`clientname`, ";
                $sql .= " pc.`clientemail`, ";
                $sql .= " pc.`operatorread`, ";
                $sql .= " pc.`newmessages`, ";
                $sql .= " pc.`color`, ";
                $sql .= " pc.`operatoranswered`, ";
                $sql .= " pc.`waitingforclientresponse`, ";
                $sql .= " pm.`files`, ";
                $sql .= " pm.`seen`, ";
                $sql .= " pm.`emailed` ";
                $sql .= " FROM ";
                $sql .= " `pwr_messages` pm ";
                $sql .= " LEFT JOIN `pwr_conversations` pc ";
                $sql .= " ON pc.`uuid` = pm.`uuid` ";
                $sql .= " WHERE ";
                $sql .= " pm.`uuid` = :uuid ";
                $sql .= " ORDER BY `created` ASC ";
                $this->connect();
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([":uuid" => $uuid]);
                $sqlResult = $stmt->fetchAll(PDO::FETCH_ASSOC);
                if (false != $sqlResult) {
                    $result["data"] = $sqlResult;
                    $result["status"] = true;
                }
            } catch (\Exception $e) {
                $result["msg"] .= $e->getMessage();
            }

            if (null !== $operator) {
                // is operator
                // update messages
                try {
                    $sql = "UPDATE ";
                    $sql .= " `pwr_messages` ";
                    $sql .= " SET ";
                    $sql .= " `seen` = :seen ";
                    $sql .= " WHERE ";
                    $sql .= " `uuid` = :uuid ";
                    $sql .= " AND `author` = :client ";
                    $this->connect();
                    $stmt = $this->conn->prepare($sql);
                    $stmt->execute([":seen" => 1, ":uuid" => $uuid, ":client" => "Client"]);
                } catch (\Exception $e) {
                    $result["msg"] .= $e->getMessage();
                }

                //update conversation
                try {
                    $sql = "UPDATE ";
                    $sql .= " `pwr_conversations` ";
                    $sql .= " SET ";
                    $sql .= " `operatorread` = :seen, ";
                    $sql .= " `newmessages` = :nonewmessages ";
                    $sql .= " WHERE ";
                    $sql .= " `uuid` = :uuid ";
                    $this->connect();
                    $stmt = $this->conn->prepare($sql);
                    $stmt->execute([":seen" => 1, ":nonewmessages" => 0, ":uuid" => $uuid]);
                } catch (\Exception $e) {
                    $result["msg"] .= $e->getMessage();
                }
            } else {
//                // is client
            }
        }

        return $result;
    }

    private function getStoredConversations($filters = []){
        $result = [
            "status" => false,
            "data" => [
                "items" => [],
                "showing" => 0,
                "total" => 0,
                "pages" => 1,
                "filters" => $filters
            ],
            "msg" => ""
        ];

        $start = 0;
        $limit = 40;
        $show = "all";
        $totalItems = 0;
        $page = 1;
        $search = "";

        if (isset($filters) && is_array($filters)) {
            if (isset($filters["show"]) && in_array($filters["show"], ["all", "unread", "notreplied"])) {
                $show = $filters["show"];
            }
            if (isset($filters["page"]) && is_numeric($filters["page"]) && intval($filters["page"]) > 0) {
                $page = intval($filters["page"]);
                $start = ($page - 1) * $limit;
            }
            if (isset($filters["search"]) && is_string($filters["search"]) && strlen(trim($filters["search"])) >= 3) {
                $search = trim($filters["search"]);
            }
        }

        // get total items

        try {
            $sqlCount = "SELECT COUNT(*) as `total` FROM `pwr_conversations` pc ";
            $sqlConditionsCount = [];
            $pdoBindingsCount = [];
            if ("unread" == $show) {
                array_push($sqlConditionsCount, "(pc.`newmessages` > 0)");
            } else if ("notreplied" == $show) {
                array_push($sqlConditionsCount, "(pc.`operatoranswered` = 0)");
            }
            if ("" != $search) {
                array_push($sqlConditionsCount, "(pc.`clientname` LIKE :clientname)");
                $pdoBindingsCount[":clientname"] = base64_encode(rawurlencode($search));
            }

            array_push($sqlConditionsCount, "(EXISTS (SELECT 1 FROM `pwr_messages` pm WHERE pm.`uuid` = pc.`uuid`))");

            if (count($sqlConditionsCount) > 0) {
                $sqlCount .= " WHERE  ";
                $sqlCount .= " ".implode(" AND ", $sqlConditionsCount)." ";
            }
            $this->connect();
            $stmtCount = $this->conn->prepare($sqlCount);
            $result["sqlCount"] = $sqlCount;
            $result["bindingsCount"] = $pdoBindingsCount;
            $result["sqlConditionsCount"] = $sqlConditionsCount;
            $stmtCount->execute($pdoBindingsCount);
            $sqlResultCount = $stmtCount->fetch(PDO::FETCH_ASSOC);
            if (false != $sqlResultCount && isset($sqlResultCount["total"]) && is_numeric($sqlResultCount["total"])) {
                $totalItems = intval($sqlResultCount["total"]);
                $result["data"]["total"] = $totalItems;
                $result["data"]["pages"] = ceil($totalItems / $limit);
            }
        } catch (\Exception $e) {
            $result["msg"] .= $e->getMessage();
        }

        try {
            $sqlConditions = [];
            $pdoBindings = [
                ":start" => $start,
                ":limit" => $limit
            ];

            if ("unread" == $show) {
                array_push($sqlConditions, "(pc.`newmessages` > 0)");
            } else if ("notreplied" == $show) {
                array_push($sqlConditions, "(pc.`operatoranswered` = 0)");
            }
            if ("" != $search) {
                array_push($sqlConditions, "(CONVERT(FROM_BASE64(pc.`clientname`) USING utf8) LIKE :clientname)");
                $pdoBindings[":clientname"] = "%".$search."%";
            }

            array_push($sqlConditions, "(EXISTS (SELECT 1 FROM `pwr_messages` pm WHERE pm.`uuid` = pc.`uuid`))");

            $sql = "SELECT ";
            $sql .= " pc.`id`, ";
            $sql .= " pc.`uuid`, ";
            $sql .= " pc.`created`, ";
            $sql .= " pc.`updated`, ";
            $sql .= " pc.`operator`, ";
            $sql .= " pc.`clientname`, ";
            $sql .= " pc.`clientemail`, ";
            $sql .= " pc.`clientid`, ";
            $sql .= " pc.`operatorread`, ";
            $sql .= " pc.`newmessages`, ";
            $sql .= " pc.`color`, ";
            $sql .= " pc.`operatoranswered`, ";
            $sql .= " pc.`waitingforclientresponse`, ";
            $sql .= " pc.`deviceagent`, ";
            $sql .= " pc.`deviceclienttype`, ";
            $sql .= " pc.`deviceclientname`, ";
            $sql .= " pc.`deviceclientversion`, ";
            $sql .= " pc.`deviceclientengine`, ";
            $sql .= " pc.`deviceosname`, ";
            $sql .= " pc.`deviceosversion`, ";
            $sql .= " pc.`deviceosplatform`, ";
            $sql .= " pc.`devicename`, ";
            $sql .= " pc.`devicebrandname`, ";
            $sql .= " pc.`devicemodel`, ";
            $sql .= " pc.`deviceisdesktop`, ";
            $sql .= " pc.`deviceismobile`, ";
            $sql .= " pc.`deviceistablet`, ";
            $sql .= " pc.`deviceisios`, ";
            $sql .= " pc.`deviceisandroid`, ";
            $sql .= " pc.`deviceid` ";
            $sql .= " FROM ";
            $sql .= " `pwr_conversations` pc ";
            if (count($sqlConditions) > 0) {
                $sql .= " WHERE ";
                $sql .= " ".implode(" AND ", $sqlConditions)." ";
            }
            $sql .= " ORDER BY pc.`updated` DESC ";
            $sql .= " LIMIT :limit ";
            $sql .= " OFFSET :start ";

            $result["sql"] = str_replace(["\r", "\n", "\t"], "", $sql);
            $result["bindings"] = $pdoBindings;

            $this->connect();
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($pdoBindings);
            $sqlResult = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (false != $sqlResult) {
                foreach ($sqlResult as $i => $conversationItem) {
                    $sqlLastMessage = "SELECT ";
                    $sqlLastMessage .= " pm.`message`, ";
                    $sqlLastMessage .= " pm.`created`, ";
                    $sqlLastMessage .= " pm.`author`, ";
                    $sqlLastMessage .= " pm.`files`, ";
                    $sqlLastMessage .= " pm.`seen`, ";
                    $sqlLastMessage .= " pm.`emailed` ";
                    $sqlLastMessage .= " FROM ";
                    $sqlLastMessage .= " `pwr_messages` pm ";
                    $sqlLastMessage .= " WHERE pm.`uuid` = :uuid ";
                    $sqlLastMessage .= " ORDER BY `created` DESC ";
                    $sqlLastMessage .= " LIMIT 1 ";
                    $pdoBindingsLastMessage = [":uuid" => $conversationItem["uuid"]];
                    $stmtLastMessage = $this->conn->prepare($sqlLastMessage);
                    $stmtLastMessage->execute($pdoBindingsLastMessage);
                    $sqlResultLastMessage = $stmtLastMessage->fetch(PDO::FETCH_ASSOC);
                    $sqlResult[$i]["lastmessage"] = [];
                    if (false != $sqlResultLastMessage) {
                        $sqlResult[$i]["lastmessage"] = $sqlResultLastMessage;
                        if ("Client" == $sqlResult[$i]["lastmessage"]["author"]) {
                            $sqlResult[$i]["lastmessage"]["author"] = rawurldecode(base64_decode($conversationItem["clientname"]));
                        }
                    }
                }
                $result["data"]["items"] = $sqlResult;
                $result["data"]["showing"] = count($sqlResult);
                $result["status"] = true;
            }
        } catch (\Exception $e) {
            $result["msg"] .= $e->getMessage();
        }

        return $result;
    }

    //save an image from a path, to a destination, by giving an size name
    function saveImage($imgFile, $fileDestination, $dimensionName) {
        $image = new SimpleImage();
        $image->load($imgFile);
        //specs for each product image size
        switch ($dimensionName) {
            case "full":
                $image->resizeToWidth(2400); // width is 2400 px, height will be adjusted automatically, maintaining proportions
                break;
            case "thumb":
                $image->resizeToWidth(100); // width is 244 px, height will be adjusted automatically, maintaining proportions
                break;
        }

        $image->save($fileDestination);
    }

    private function uploadImages($files = null, $conversationUUID = null){
        $result = [
            "status" => false,
            "data" => [
                "oldProductImagesData" => [],
                "headers" => $this->headers,
                "files" => []
            ],
            "msg" => ""
        ];

        // tba check if uuid exists

        $currentTime = $this->millitime();

        if (null != $files && null !== $conversationUUID) {
            foreach ($files['file']['name'] as $key => $val) {
                $isImage = false;
                $isVideo = false;

                $fileNameWithExtension = $files['file']['name'][$key];

                $result["data"]["files"][$key] = [];
                $result["data"]["files"][$key]["log"] = "a";
                // get file extension
                $ext = pathinfo($fileNameWithExtension, PATHINFO_EXTENSION);
                switch(strtolower(trim($ext))) {
                    case "mp4":
                    case "m4v":
                        $isVideo = true;
                        break;
                }

                // get filename without extension
                $fileNameWithoutExtension = pathinfo($fileNameWithExtension, PATHINFO_FILENAME);

                $fileNameToStore = strtolower(trim($fileNameWithoutExtension)."-".$currentTime. '.' . trim($ext));

                $originalFilePath = strtolower($this->attachmentsPath."/".$conversationUUID ."/original/". $fileNameToStore);
                $optimizedFilePath = strtolower($this->attachmentsPath."/".$conversationUUID ."/optimized/". $fileNameToStore);

                $result["data"]["files"][$key]["success"] = false;
                $result["data"]["files"][$key]["errors"] = [];
                $result["data"]["files"][$key]["originalname"] = $fileNameWithoutExtension. "." . trim($ext);
                $result["data"]["files"][$key]["storedname"] = $fileNameToStore;


                // never assume the upload succeeded
                if ($files['file']['error'][$key] !== UPLOAD_ERR_OK) {
                    $result["data"]["files"][$key]["log"] .= "b";
                    array_push($result["data"]["files"][$key]["errors"], "Upload failed with error code " . $files['file']['error']);
                } else {
                    $result["data"]["files"][$key]["log"] .= "c";
                }
                if (false == $isVideo) {
                    $info = getimagesize($files['file']['tmp_name'][$key]);
                    if ($info === FALSE) {
                        $result["data"]["files"][$key]["log"] .= "d";
                        array_push($result["data"]["files"][$key]["errors"], "Unable to determine image type of uploaded file");
                    } else {
                        $result["data"]["files"][$key]["log"] .= "e";
                        $result["data"]["files"][$key]["info"] = $info;
                        $result["data"]["files"][$key]["width"] = $info[0];
                        $result["data"]["files"][$key]["height"] = $info[1];
                    }

                    if (($info[2] !== IMAGETYPE_GIF) && ($info[2] !== IMAGETYPE_JPEG) && ($info[2] !== IMAGETYPE_PNG)) {
                        $result["data"]["files"][$key]["log"] .= "f";
                        array_push($result["data"]["files"][$key]["errors"], "Not a gif/jpeg/png");
                    } else {
                        $isImage = true;
                        $result["data"]["files"][$key]["log"] .= "g";
                    }
                }


                if (!file_exists(strtolower($this->attachmentsPath."/".$conversationUUID))) {
                    $result["data"]["files"][$key]["log"] .= "j";
                    mkdir(strtolower($this->attachmentsPath."/".$conversationUUID), 0777);
                }
                if (!file_exists(strtolower($this->attachmentsPath."/".$conversationUUID."/original/"))) {
                    $result["data"]["files"][$key]["log"] .= "j2";
                    mkdir(strtolower($this->attachmentsPath."/".$conversationUUID."/original/"), 0777);
                }
                if (false == $isVideo) {
                    if (!file_exists(strtolower($this->attachmentsPath . "/" . $conversationUUID . "/optimized/"))) {
                        $result["data"]["files"][$key]["log"] .= "j3";
                        mkdir(strtolower($this->attachmentsPath . "/" . $conversationUUID . "/optimized/"), 0777);
                    }
                }


                if (count($result["data"]["files"][$key]["errors"]) == 0) {
                    $result["data"]["files"][$key]["log"] .= "m";
                    try {
                        $result["data"]["files"][$key]["log"] .= "n";
                        //move uploaded image to the original images folder
                        move_uploaded_file($files['file']['tmp_name'][$key], strtolower($originalFilePath));

                        if (false == $isVideo) {
                            $sizePath = strtolower($optimizedFilePath);
                            $this->saveImage(strtolower($originalFilePath), strtolower($sizePath), "thumb");
                            if (file_exists($sizePath)) {
                                $result["data"]["files"][$key]["log"] .= "[Q_Q_1]";
                            } else {
                                $result["data"]["files"][$key]["log"] .= "[QERR_QERR_1___" . $sizePath . "___" . strtolower($optimizedFilePath) . "]";
                            }
                        }
                    } catch (\Exception $e) {
                        $result["data"]["files"][$key]["log"] .= "r";
                        array_push($result["data"]["files"][$key]["errors"], $e->getMessage());
                    }
                }

                if (count($result["data"]["files"][$key]["errors"]) == 0) {
                    $result["data"]["files"][$key]["log"] .= "s";
                }
                $result["data"]["files"][$key]["success"] = (count($result["data"]["files"][$key]["errors"]) == 0) ? true : false;
            }
        }

        // update db

        return $result;
    }

    private function markAsSeen($uuid = null, $source = null) {
        $result = [
            "status" => false,
            "data" => [
                "uuid" => $uuid,
                "source" => $source
            ],
            "msg" => ""
        ];

        if (null !== $uuid && null !== $source) {
            $result["msg"] .= "a";
            if ("client" == $source) {
                $result["msg"] .= "b";
                // update messages
                try {
                    $result["msg"] .= "c";
                    $sql = "UPDATE ";
                    $sql .= " `pwr_messages` ";
                    $sql .= " SET ";
                    $sql .= " `seen` = :seen ";
                    $sql .= " WHERE ";
                    $sql .= " `uuid` = :uuid ";
                    $sql .= " AND `author` != :client ";
                    $this->connect();
                    $stmt = $this->conn->prepare($sql);
                    $stmt->execute([":seen" => 1, ":uuid" => $uuid, ":client" => "Client"]);
                    $result["status"] = true;
                } catch (\Exception $e) {
                    $result["msg"] .= "d";
                    $result["msg"] .= $e->getMessage();
                }
            } else if ("operator" == $source) {
                $result["msg"] .= "e";
                // update messages
                try {
                    $result["msg"] .= "f";
                    $sql = "UPDATE ";
                    $sql .= " `pwr_messages` ";
                    $sql .= " SET ";
                    $sql .= " `seen` = :seen ";
                    $sql .= " WHERE ";
                    $sql .= " `uuid` = :uuid ";
                    $sql .= " AND `author` = :client ";
                    $this->connect();
                    $stmt = $this->conn->prepare($sql);
                    $stmt->execute([":seen" => 1, ":uuid" => $uuid, ":client" => "Client"]);
                    $result["status"] = true;
                } catch (\Exception $e) {
                    $result["msg"] .= "g";
                    $result["msg"] .= $e->getMessage();
                }

                //update conversation
                try {
                    $result["msg"] .= "h";
                    $sql = "UPDATE ";
                    $sql .= " `pwr_conversations` ";
                    $sql .= " SET ";
                    $sql .= " `operatorread` = :seen, ";
                    $sql .= " `newmessages` = :nonewmessages ";
                    $sql .= " WHERE ";
                    $sql .= " `uuid` = :uuid ";
                    $this->connect();
                    $stmt = $this->conn->prepare($sql);
                    $stmt->execute([":seen" => 1, ":nonewmessages" => 0, ":uuid" => $uuid]);
                    $result["status"] = true;
                } catch (\Exception $e) {
                    $result["msg"] .= "i";
                    $result["msg"] .= $e->getMessage();
                }
            }
        }

        return $result;
    }

    private function getUnreadMessages($uuid = null){
        $result = [
            "status" => false,
            "data" => [],
            "msg" => ""
        ];

        if (null !== $uuid) {
            try {
                $sql = "SELECT ";
                $sql .= " `newmessages` ";
                $sql .= " FROM `pwr_conversations` ";
                $sql .= " WHERE `uuid` = :uuid ";
                $this->connect();
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([":uuid" => $uuid]);
                $sqlResult = $stmt->fetch(PDO::FETCH_ASSOC);
                if (false != $sqlResult) {
                    $result["data"] = [
                        "newmessages" => intval($sqlResult["newmessages"]),
                        "uuid" => base64_encode(rawurlencode($uuid))
                    ];
                    $result["status"] = true;
                }
            } catch (\Exception $e) {
                $result["msg"] .= $e->getMessage();
            }
        }

        return $result;
    }

    private function getTotalUnreadMessages(){
        $result = 0;

        try {
            $sql = "SELECT ";
            $sql .= " SUM(`newmessages`) as `newmessages` ";
            $sql .= " FROM `pwr_conversations` ";
            $sql .= " WHERE `newmessages` > 0 ";
            $this->connect();
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $sqlResult = $stmt->fetch(PDO::FETCH_ASSOC);
            if (false != $sqlResult && isset($sqlResult["newmessages"]) && is_numeric($sqlResult["newmessages"])) {
                $result = intval($sqlResult["newmessages"]);
            }
        } catch (\Exception $e) {
//                $result["msg"] .= $e->getMessage();
        }

        return $result;
    }

    private function manageOperator($operator = "Operator"){
        $template = file_get_contents(__DIR__.'/operator.html');
        $template = str_replace("{{operator}}", $operator, $template);
        return $template;
    }

    public function getCurrentChatOperatorFileData(){
        return (array)$this->objectToArray(json_decode(file_get_contents($this->monitorFile)));
    }

    public function getOnlineOperatorsFileData(){
        return (array)$this->objectToArray(json_decode(file_get_contents($this->onlineOperatorsFile)));
    }

    //onlineOperatorsFile

    public function handShake($incomingData = [], $operator = null){
        $incomingData = (array) $this->objectToArray($incomingData);
        $onlineOperators = [];
        $openedConversations = (array) $this->objectToArray($incomingData["openedConversations"]);
        $viewingConversations = (array) $this->objectToArray($incomingData["viewingConversations"]);
        $currentTime = $this->millitime();

        $fileData = $this->getCurrentChatOperatorFileData();
        $onlineOperatorsData = $this->getOnlineOperatorsFileData();
        $timeNow = $this->millitime();
        foreach ($openedConversations as $incomingOrderId => $incomingOrder){
            $openedConversations[$incomingOrderId]["date"] = $timeNow;
            $openedConversations[$incomingOrderId]["timesince"] = 0;
            if (isset($fileData[$incomingOrderId])) {
                if (isset($fileData[$incomingOrderId]["timesince"])) { // was recorded
                    if ($fileData[$incomingOrderId]["operator"] != $openedConversations[$incomingOrderId]["operator"]) { //was opened by someone else
                        if ($fileData[$incomingOrderId]["timesince"] > 5000) { // is not still opened
                            $fileData[$incomingOrderId] = $openedConversations[$incomingOrderId];
                        } else { // is still opened
                            $timeSince = (int)(((int)$this->millitime()) - ((int)$fileData[$incomingOrderId]["date"]));
                            $fileData[$incomingOrderId]["timesince"] = $timeSince;
                        }
                    } else { // was opened by the same user
                        $fileData[$incomingOrderId] = $openedConversations[$incomingOrderId];
                    }
                }
            } else { // was not recorded
                $fileData[$incomingOrderId] = $openedConversations[$incomingOrderId];
            }
        }
        foreach ($fileData as $fileOrderId => $fileOrder){
            $timeSince = (int)(((int)$this->millitime()) - ((int)$fileOrder["date"]));
            $fileData[$fileOrderId]["timesince"] = $timeSince;
        }

        $fileData = (array)$this->objectToArray($fileData);

        foreach ($fileData as $fileOrderId => $fileOrder){
            if (abs(((int)$fileData[$fileOrderId]["timesince"])) > 5000) {
                unset($fileData[$fileOrderId]);
            }
        }

        file_put_contents($this->monitorFile, json_encode($fileData));


        $operatorIsInArray = false;
        if (is_array($onlineOperatorsData)) {
            if (count($onlineOperatorsData) > 0) {
                foreach ($onlineOperatorsData as $i => $operatorItem) {
                    if (isset($operatorItem["operator"]) && $operatorItem["operator"] == $operator) {
                        $operatorIsInArray = true;
                        $onlineOperatorsData[$i]["lastseen"] = $currentTime;
                    }
                }
            }

            if (false == $operatorIsInArray) {
                array_push($onlineOperatorsData, ["operator" => $operator, "lastseen" => $currentTime]);
            }

            $filteredOnlineOperatorsData = [];
            foreach ($onlineOperatorsData as $i => $operatorItem) {
                if (isset($operatorItem["operator"]) && isset($operatorItem["lastseen"]) && is_numeric($operatorItem["lastseen"]) && intval($currentTime) - intval($operatorItem["lastseen"]) < 5000) {
                    array_push($filteredOnlineOperatorsData, $operatorItem);
                }
            }

            file_put_contents($this->onlineOperatorsFile, json_encode($filteredOnlineOperatorsData));
        }
        return [
            "openedConversations" => $fileData,
            "viewingConversations" => [],
            "onlineOperators" => $filteredOnlineOperatorsData
        ];
    }

    private function hslToHex($h, $s, $l) {
        $s /= 100;
        $l /= 100;
        $c = (1 - abs(2 * $l - 1)) * $s;
        $x = $c * (1 - abs(fmod($h / 60, 2) - 1));
        $m = $l - $c / 2;
        $r = 0; $g = 0; $b = 0;

        if ($h < 60) {
            $r = $c; $g = $x;
        } else if ($h < 120) {
            $r = $x; $g = $c;
        } else if ($h < 180) {
            $g = $c; $b = $x;
        } else if ($h < 240) {
            $g = $x; $b = $c;
        } else if ($h < 300) {
            $r = $x; $b = $c;
        } else {
            $r = $c; $b = $x;
        }

        $r = round(($r + $m) * 255);
        $g = round(($g + $m) * 255);
        $b = round(($b + $m) * 255);

        return sprintf("#%02x%02x%02x", $r, $g, $b);
    }

    private function getRandomColor($brightness) {
        $brightness = max(0, min(100, $brightness));
        $h = rand(0, 359);
        $s = 50; // 50% desaturated
        $l = $brightness;
        return $this->hslToHex($h, $s, $l);
    }

    private function checkIfEmailed($uuid = null){
        $result = [
            "status" => false,
            "data" => [],
            "msg" => ""
        ];

        if (null !== $uuid && is_string($uuid) && strlen(trim($uuid)) >0) {
            $sql = "SELECT ";
            $sql .= " `uuid`, ";
            $sql .= " `author`, ";
            $sql .= " `created`, ";
            $sql .= " `emailed` ";
            $sql .= " FROM `pwr_messages` ";
            $sql .= " WHERE `uuid` = :uuid ";
            $sql .= " ORDER BY ";
            $sql .= " `created` DESC ";
            $sql .= " LIMIT 1 ";
            try {
                $this->connect();
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([":uuid" => $uuid]);
                $sqlResult = $stmt->fetch(PDO::FETCH_ASSOC);
                if (false != $sqlResult && isset($sqlResult["emailed"]) && 1 == $sqlResult["emailed"]) {
                    $result["status"] = true;
                    $result["data"] = $sqlResult;
                }
            } catch (\Exception $e) {
                $result["msg"] .= $e->getMessage();
            }
        }

        return $result;
    }

    private function getUrlPreview($url = null){
        $result = [
            "status" => false,
            "data" => [],
            "msg" => ""
        ];

        // Strict URL check
        if (empty($url) || !is_string($url) || !preg_match('#^https?://#i', $url)) {
            $result["msg"] = "Invalid URL";
            return $result;
        }

        $context = stream_context_create(['http'=>['timeout' => 4, 'user_agent' => 'Mozilla/5.0']]);
        $html = @file_get_contents($url, false, $context);

        if ($html === false) {
            $result["msg"] = "Unable to fetch URL";
            return $result;
        }

        libxml_use_internal_errors(true);
        $doc = new DOMDocument();

        try {
            $doc->loadHTML($html);
        } catch (\Exception $e) {
            $result["msg"] = "HTML parse error: " . $e->getMessage();
            return $result;
        }

        $xpath = new DOMXPath($doc);
        $getMeta = function($property, $xpath) {
            $metas = $xpath->query("//meta[@property='$property']");
            if ($metas->length > 0) return $metas->item(0)->getAttribute('content');
            $metas = $xpath->query("//meta[@name='$property']");
            if ($metas->length > 0) return $metas->item(0)->getAttribute('content');
            return null;
        };

        // Use ternary instead of null coalesce
        $title = $getMeta('og:title', $xpath);
        if (!$title && $doc->getElementsByTagName('title')->item(0)) {
            $title = $doc->getElementsByTagName('title')->item(0)->textContent;
        }
        $desc = $getMeta('og:description', $xpath) ? $getMeta('og:description', $xpath) : ($getMeta('description', $xpath) ? $getMeta('description', $xpath) : "");
        $image = $getMeta('og:image', $xpath) ? $getMeta('og:image', $xpath) : "";

        $result["status"] = true;
        $result["data"] = [
            'title' => $title ? $title : "",
            'description' => $desc ? $desc : "",
            'image' => $image ? $image : "",
            'url' => $url,
        ];

        return $result;
    }

    private function getOnlineOperators(){
        $result = [
            "status" => false,
            "data" => 0,
            "msg" => ""
        ];

        $currentTime = $this->millitime();

        $onlineOperatorsData = $this->getOnlineOperatorsFileData();
        $filteredOnlineOperatorsData = [];
        foreach ($onlineOperatorsData as $o => $onlineOperator) {
            if (isset($onlineOperator["lastseen"]) && is_numeric($onlineOperator["lastseen"]) && intval($currentTime) - intval($onlineOperator["lastseen"]) < 5000) {
                array_push($filteredOnlineOperatorsData, $onlineOperator);
            }
        }
        $totalOnlineOperators = count($filteredOnlineOperatorsData);
        file_put_contents($this->onlineOperatorsFile, json_encode($filteredOnlineOperatorsData));
        if ($totalOnlineOperators > 0) {
            $result["status"] = true;
            $result["data"] = $totalOnlineOperators;
        }
        return $result;
    }

    private function requestHandler($request = [], $headers = [], $files = []){
        $request = $this->objectToArray($request);
        $headers = $this->objectToArray($headers);
        $files = $this->objectToArray($files);
        if (isset($request["method"]) && !empty($request["method"]) && is_string($request["method"]) && strlen(trim($request["method"])) > 0) {
            switch (strtolower($request["method"])) {
                case "gettime":
                    echo json_encode($this->getTime());
                    break;
                case "checkclientuuid":
                    $allowed = false;
                    if (isset($request["data"]) && !empty($request["data"])) {
                        if (is_string($request["data"]) && $this->isBase64($request["data"])) {
                            $request["data"] = rawurldecode(base64_decode($request["data"]));
                            if ($this->isJson($request["data"])) {
                                $request["data"] = $this->objectToArray(json_decode($request["data"]));
                                if (isset($request["data"]["clientuuid"]) && !empty($request["data"]["clientuuid"])
                                ) {
                                    $allowed = true;
                                }

                            }
                        }
                    }
                    if (true == $allowed) {
                        echo json_encode($this->checkClientUUID($request["data"]["clientuuid"]));
                    } else {
                        echo json_encode([
                            "status" => false
                        ]);
                    }
                    break;
                case "getconversationmessages":
                    $allowed = false;
                    $operator = null;
                    if (isset($request["data"]) && !empty($request["data"])) {
                        if (is_string($request["data"]) && $this->isBase64($request["data"])) {
                            $request["data"] = rawurldecode(base64_decode($request["data"]));
                            if (isset($request["operator"]) && !empty($request["operator"]) && is_string($request["operator"]) && $this->isBase64($request["operator"])) {
                                $operator = rawurldecode(base64_decode($request["operator"]));
                            }
                            $allowed = true;
                        }
                    }
                    if (true == $allowed) {
                        echo json_encode($this->getConversationMessages($request["data"], $operator));
                    } else {
                        echo json_encode([
                            "status" => false
                        ]);
                    }
                    break;
                case "logmessage":
                    $allowed = false;
                    if (isset($request["data"]) && !empty($request["data"])) {
                        if (is_string($request["data"]) && $this->isBase64($request["data"])) {
                            $request["data"] = rawurldecode(base64_decode($request["data"]));
                            if ($this->isJson($request["data"])) {
                                $request["data"] = $this->objectToArray(json_decode($request["data"]));
                                $allowed = true;
                            }
                        }
                    }
                    if (true == $allowed) {
                        echo json_encode($this->logMessage($request["data"]));
                    } else {
                        echo json_encode([
                            "status" => false
                        ]);
                    }
                    break;
                case "getstoredconversations":
                    $filters = [];
                    // Check for "show" parameter (optional)
                    if (isset($request["filters"]) && !empty($request["filters"]) && is_string($request["filters"]) && strlen(trim($request["filters"])) && $this->isBase64($request["filters"])) {
                        $request["filters"] = rawurldecode(base64_decode($request["filters"]));
                        if ($this->isJson($request["filters"])) {
                            $filters = $this->objectToArray(json_decode($request["filters"]));
                        }
                    }
                    echo json_encode($this->getStoredConversations($filters));
                    break;
                case "markasseen":
                    $allowed = false;
                    $source = null;
                    if (isset($request["uuid"]) && !empty($request["uuid"])) {
                        $request["uuid"] = rawurldecode(base64_decode($request["uuid"]));
                        if (
                             isset($request["clientname"]) && !empty($request["clientname"])
                          && isset($request["clientemail"]) && !empty($request["clientemail"])
                        ) {
                            $request["clientname"] = rawurldecode(base64_decode($request["clientname"]));
                            $request["clientemail"] = rawurldecode(base64_decode($request["clientemail"]));
                            $source = "client";
                            $allowed = true;
                        } else if (isset($request["operator"]) && !empty($request["operator"])) {
                            $request["operator"] = rawurldecode(base64_decode($request["operator"]));
                            $source = "operator";
                            $allowed = true;
                        }
                    }
                    if (true == $allowed && null !== $source) {
                        echo json_encode($this->markAsSeen($request["uuid"], $source));
                    } else {
                        echo json_encode([
                            "status" => false
                        ]);
                    }
                    break;
                case "getunreadmessages":
                    if (isset($request["uuid"]) && !empty($request["uuid"]) && $this->isBase64($request["uuid"])) {
                        $request["uuid"] = rawurldecode(base64_decode($request["uuid"]));
                        echo json_encode($this->getUnreadMessages($request["uuid"]));
                    } else {
                        echo json_encode([
                            "status" => false
                        ]);
                    }
                    break;
                case "gettotalunreadmessages":
                    echo json_encode($this->getTotalUnreadMessages());
                    break;
                case "getpwrsid":
                    if (isset($request["user"]) && !empty($request["user"])) {
                        echo json_encode($this->getPwrSid($request["user"]));
                    } else {
                        echo json_encode([
                            "status" => false
                        ]);
                    }
                    break;
                case "manageoperator":
                    $allowed = false;

                    $request["pwrsid"] = $this->generatePowerSupportSid(); // FOR TESTING ONLY, REMOVE And generate it yourself



                    if (isset($request["pwrsid"]) && !empty($request["pwrsid"]) && $this->validatePowerSupportSid($request["pwrsid"])) {
                        $allowed = true;
                    }
                    if (true == $allowed) {
                        echo $this->manageOperator();
                    } else {
                        echo json_encode([
                            "status" => false
                        ]);
                    }
                    break;
                case "checkifemailed":
                    if (isset($request["uuid"]) && !empty($request["uuid"]) && is_string($request["uuid"]) && $this->isBase64($request["uuid"])) {
                        $request["uuid"] = rawurldecode(base64_decode($request["uuid"]));
                        echo json_encode($this->checkIfEmailed($request["uuid"]));
                    } else {
                        echo json_encode([
                            "status" => false
                        ]);
                    }
                    break;
                case "geturlpreview":
                    if (isset($request["url"]) && !empty($request["url"]) && is_string($request["url"]) && $this->isBase64($request["url"])) {
                        $request["url"] = rawurldecode(base64_decode($request["url"]));
                        echo json_encode($this->getUrlPreview($request["url"]));
                    } else {
                        echo json_encode([
                            "status" => false
                        ]);
                    }
                    break;
                case "getonlineoperators":
                    echo json_encode($this->getOnlineOperators());
                    break;
                case "parseagent":
                    $allowed = false;
                    if (isset($request["useragent"]) && !empty($request["useragent"])) {
                        if ($this->isBase64($request["useragent"])) {
                            $request["useragent"] = base64_decode($request["useragent"]);
                            $allowed = true;
                        }
                    }
                    if (true == $allowed) {
                        echo json_encode($this->parseAgent($request["useragent"]));
                    } else {
                        echo json_encode($this->parseAgent());
                    }
            }
        } else if (isset($request["c"]) && !empty($request["c"])) {
            $log = "X";
            if ($this->isBase64($request["c"])) {
                $log = "1";
                $c = rawurldecode(base64_decode($request["c"]));
                if ($this->isJson($c)) {
                    $log = "2";
                    $c = (array)json_decode($c);
                    if ($this->checkParam($c["method"])) {
                        $log = "3";
                        switch (strtolower(trim($c["method"]))) {
                            case "handshake":
                                $dataValid = false;
                                $operatorValid = false;
                                $log = "4";
                                if ($this->checkParam($c["data"])) {
                                    $log .= "b";
                                    if ($this->isBase64($c["data"])){
                                        $log .= "c";
                                        $data = rawurldecode(base64_decode($c["data"]));
                                        if ($this->isJson($data)) {
                                            $log .= "d";
                                            $data = (array)$this->objectToArray(json_decode($data));
                                            $dataValid = true;
                                        }
                                    }
                                }

                                $operator = null;
                                if (isset($c["operator"]) && !empty($c["operator"]) && is_string($c["operator"])) {
                                    if ($this->isBase64($c["operator"])){
                                        $operator = rawurldecode(base64_decode($c["operator"]));
                                        $operatorValid = true;
                                    }
                                }

                                if (true == $dataValid && true == $operatorValid) {
                                    $log .= "e";
                                    echo json_encode([
                                        "time" => $this->millitime(),
                                        "data" => $this->handShake($data, $operator)
                                    ]);
                                } else {
                                    $log .= "f";
                                    echo json_encode([
                                        "status" => false,
                                        "log" => $log
                                    ]);
                                }
                                break;
                            case "getdata":
                                echo json_encode([
                                    "time" => $this->millitime(),
                                    "data" => $this->getCurrentChatOperatorFileData()
                                ]);
                                break;
                            case "getonline":
                                echo json_encode([
                                    "time" => $this->millitime(),
                                    "data" => $this->getOnlineOperatorsFileData()
                                ]);
                                break;
                        }
                    }
                }
            }
        } else {
            if (
                isset($headers["uploadfiles"]) && !empty($headers["uploadfiles"])
                && isset($headers["uuid"]) && !empty($headers["uuid"])
                && isset($files) && !empty($files)
            ) {
                echo json_encode($this->uploadImages($files, $headers["uuid"]));
            } else {
                echo json_encode([
                    "status" => false
                ]);
            }
        }
    }
}

new PowerSupport();
?>