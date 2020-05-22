import requests
import random
import string
import hashlib
from . import app

log = app.logger

# lei: 1560007402734
# shawn: 1559660394246
# lei: 84bbe6c31c32aa15dd363bbe46015c3ba8eb7670
# shawn: 7efbf332ac0ce7ed3b8255df09270435d0986345
appid = "1560007402734" 
privatekey = "84bbe6c31c32aa15dd363bbe46015c3ba8eb7670" 
def generate_md5(filename):
    md5file = open(filename, 'rb')
    md5 = hashlib.md5(md5file.read()).hexdigest()
    md5file.close()
    return md5

def generate_token(dict_to_Send, parameter_list):
    parameter_list.sort()
    string_A = ""
    for parameter in parameter_list:
        string_A += str(parameter) + "=" + str(dict_to_Send[parameter]) + "&"

    string_A = string_A[:-1]
    m1 = hashlib.md5()
    m1.update(string_A.encode("utf-8"))
    token = m1.hexdigest().upper()

    return token

def upload_to_fanyigou(current_book_name, source_language, target_language):
    nonce_str = ''.join(random.sample(string.ascii_letters + string.digits, 16))
    dict_to_Send = {}
    dict_to_Send["appid"] = appid
    dict_to_Send["nonce_str"] = nonce_str
    dict_to_Send["from"] = source_language
    dict_to_Send["to"] = target_language
    dict_to_Send["privatekey"] = privatekey
    dict_to_Send["md5"] = generate_md5(current_book_name)
    parameter_list = ["appid", "nonce_str", "from", "to", "md5", "privatekey"]
    token = generate_token(dict_to_Send, parameter_list)
    dict_to_Send["token"] = token

    
    post_book = {"file": open(current_book_name, "rb")}
    res = requests.post("https://www.fanyigou.com/TranslateApi/api/uploadTranslate",
        params=dict_to_Send, files=post_book)
    
    dict_from_server = res.json()
    code = dict_from_server["code"]
    log.info(dict_from_server)
    if code == 100:
        ret_data = dict_from_server["data"]
        tid = ret_data["tid"]
        return tid, dict_from_server["msg"]
    else: 
        return False, dict_from_server["msg"]

def query_process(tid):
    nonce_str = ''.join(random.sample(string.ascii_letters + string.digits, 16))
    dict_to_Send = {}
    dict_to_Send["appid"] = appid
    dict_to_Send["nonce_str"] = nonce_str
    dict_to_Send["tid"] = tid
    dict_to_Send["privatekey"] = privatekey
    parameter_list = ["appid", "nonce_str", "tid", "privatekey"]
    token = generate_token(dict_to_Send, parameter_list)
    dict_to_Send["token"] = token

    res = requests.post("https://www.fanyigou.com/TranslateApi/api/queryTransProgress",
        params=dict_to_Send)

    dict_from_server = res.json()
    if dict_from_server["code"] == 100:
        return dict_from_server["data"]
    else: 
        return False

def download_file(cur_dir, tid):
    nonce_str = ''.join(random.sample(string.ascii_letters + string.digits, 16))
    dict_to_Send = {}
    dict_to_Send["appid"] = appid
    dict_to_Send["nonce_str"] = nonce_str
    dict_to_Send["tid"] = tid
    dict_to_Send["dtype"] = "2"
    dict_to_Send["privatekey"] = privatekey
    parameter_list = ["appid", "nonce_str", "tid", "dtype", "privatekey"]
    token = generate_token(dict_to_Send, parameter_list)
    dict_to_Send["token"] = token
    #修改文件名，将文件下载入特定文件夹
    res = requests.post("https://www.fanyigou.com/TranslateApi/api/downloadFile",
        params=dict_to_Send)
    if res.headers["Content-Type"].find("application/octet-stream") != -1:
        with open(cur_dir, "wb") as f:
            f.write(res.content)
        return True
    else: 
        return False