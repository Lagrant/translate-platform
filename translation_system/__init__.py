from flask import Flask
import os
from datetime import timedelta
from .util import ListConverter
import logging
app = Flask(__name__)
# log = app.logger
# app.run('127.0.0.1', debug=True, port=5000, ssl_context=('D:\OpenSSL-Win64\bin\server.crt', 'D:\OpenSSL-Win64\bin\server.key'))
# 用于加密，作为盐混在原始的字符串中，然后用加密算法进行加密
app.config['SECRET_KEY'] = os.urandom(24)
# 设定session的保存时间，当session.permanent=True的时候
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.url_map.converters['list'] = ListConverter

# 这里登陆的是root用户，要填上自己的密码，MySQL的默认端口是3306，填上之前创建的数据库名jianshu,连接方式参考 \
#  http://docs.sqlalchemy.org/en/latest/dialects/mysql.html
# qYA2iIFnIJScti3s
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://mks:mks2019.@localhost:3306/mks?charset=utf8'
# 设置这一项是每次请求结束后都会自动提交数据库中的变动
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SQLALCHEMY_POOL_SIZE'] = 100
app.config['SQLALCHEMY_POOL_RECYCLE'] = 3600

log_path = './error/'
if not os.path.exists(log_path):
    os.makedirs(log_path)
handler = logging.FileHandler(os.path.join(log_path, 'flask.log'), encoding='UTF-8')
handler.setLevel(logging.DEBUG)
app.logger.addHandler(handler)

#app.register_blueprint(console)
#ksw now
from . import view
# text_OCR--------------------------------------------------

if __name__ == '__main__':
    app.run()
