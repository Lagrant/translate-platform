from flask import Flask
import os
from datetime import timedelta
from .util import ListConverter
app = Flask(__name__)
# log = app.logger
# app.run('127.0.0.1', debug=True, port=5000, ssl_context=('D:\OpenSSL-Win64\bin\server.crt', 'D:\OpenSSL-Win64\bin\server.key'))
# 用于加密，作为盐混在原始的字符串中，然后用加密算法进行加密
app.config['SECRET_KEY'] = os.urandom(24)
# 设定session的保存时间，当session.permanent=True的时候
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.url_map.converters['list'] = ListConverter

#app.register_blueprint(console)
#ksw now
from . import view
# text_OCR--------------------------------------------------

if __name__ == '__main__':
    app.run()
