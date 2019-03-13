import ast
import copy
import pandas as pd
import numpy as np
import csv
import os
from io import StringIO
import sys
import platform
import random
import shutil
import smtplib
from datetime import timedelta, datetime
from email.header import Header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import pymysql
from flask import Flask, request, json, render_template, session, jsonify, url_for, current_app, g, redirect
from xlrd import open_workbook
from werkzeug.utils import secure_filename

'''
from aip import AipOcr  # 引入百度api
import jieba

from docx import Document

# 用于执行病毒查杀
import pyclamd
# 连接百度服务器的密钥
APP_ID = '14658891'
API_KEY = 'zWn97gcDqF9MiFIDOeKVWl04'
SECRET_KEY = 'EEGvCjpzTtWRO3GIxqz94NLz99YSBIT9'
# 连接百度服务器
# 输入三个密钥，返回服务器对象
client = AipOcr(APP_ID, API_KEY, SECRET_KEY)
'''

app = Flask(__name__)
# app.run('127.0.0.1', debug=True, port=5000, ssl_context=('D:\OpenSSL-Win64\bin\server.crt', 'D:\OpenSSL-Win64\bin\server.key'))
# 用于加密，作为盐混在原始的字符串中，然后用加密算法进行加密
app.config['SECRET_KEY'] = os.urandom(24)
# 设定session的保存时间，当session.permanent=True的时候
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

#ksw now

@app.route('/')
@app.route('/index')
def index():
    g.count = 0
    session['cluster_method'] = 'KMeans'
    session['embedding_method'] = 'Principal_Component_Analysis'
    session['visualization_method'] = 'Radviz'
    session['cluster_parameters'] = {}
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        print(user1)
        return render_template('datagoo_homepage.html', user=user1)
    else:
        return render_template('datagoo_homepage.html')


@app.route('/login/', methods=['GET', 'POST'])
def user_login():
    return render_template('user/login.html')


# 验证密码
@app.route('/login/pass/', methods=['GET', 'POST'])
def login_pass():
    # 添加数据到session中
    data = request.get_json('data')
    email = data['email']
    pas = data['password']
    theuser = user.query.filter_by(email=email).first()
    if theuser is None:
        return "account not exist"
    elif not theuser.check_password_hash(pas):
        return "password not right"
    else:
        session['email'] = email
        session['user_id'] = theuser.id
        session.permanent = True
        login1 = login(email=email)
        db.session.add(login1)
        db.session.commit()

        if session.get("last_page"):
            print(session.get("last_page"))
            page = session.get("last_page")
            return page
        else:
            return '/'


@app.route('/login/pass/name/', methods=['GET', 'POST'])
def login_pass_name():
    name = request.get_json()['name']
    user1 = user.query.filter_by(username=name).first()
    if user1 is not None:
        return "true"
    else:
        return "false"


# 发送邮件
def sendmail(to_mail, num):
    # 邮件外主体
    smtp = ''
    smtpserver = "smtp.qq.com"
    smtpport = 465
    from_mail = "1361377791@qq.com"
    password = "ejpulrvmshuyibba"
    # 邮件内容主体
    subject = "激活您的DaGoo账户"
    from_name = "DaGoo"
    body = num + "\n以上是您的验证码，请在五分钟内填写。如非本人操作，请忽略此邮件。\n" \
                 "Here is your verification code, please fill in within five minutes. " \
                 "Ignore this message if it is not my operation.\n"
    msgtext = MIMEText(body, "plain", "utf-8")
    msg = MIMEMultipart()
    msg['Subject'] = Header(subject, "utf-8")
    msg["From"] = Header(from_name + "<" + from_mail + ">", "utf-8")
    msg["To"] = to_mail
    msg.attach(msgtext)
    try:
        smtp = smtplib.SMTP_SSL(smtpserver, smtpport)
        # smtp.starttls()
        smtp.login(from_mail, password)
        smtp.sendmail(from_mail, to_mail, msg.as_string())
        smtp.quit()
        return True
    except Exception as e:
        print(e)
        smtp.quit()
        return False


def mycopyfile(srcfile, dstfile):
    if not os.path.isfile(srcfile):
        return False
    else:
        fpath, fname = os.path.split(dstfile)
        if not os.path.exists(fpath):
            os.makedirs(fpath)
        shutil.copyfile(srcfile, dstfile)
        print("copy %s->%s" % (srcfile, dstfile))


# 前台传过来的数据都是已经被验证好格式的，传到后台以后只需要进行数据库的比对即可
# 需要验证的内容为：数据库中是否已经存在该用户。如果存在，那么弹出提示信息
# 新建一个用户需要完成的内容有：
# 给该用户的邮箱发送邮件；为该用户在服务器新增一个个人文件夹存储个人信息
# 由于涉及到文件的路径，管理起来有点麻烦所以暂时先不考虑
@app.route('/login/signup/', methods=['GET', 'POST'])
def login_signup():
    data = request.get_json('data')
    email = data['email']
    cur_dir = "./static/user"
    if os.path.isdir(cur_dir):
        os.makedirs('./static/user/' + email)
        cur_dir = cur_dir + "/" + email
        print(cur_dir, "/img")
        os.makedirs(cur_dir + "/img")
        os.makedirs(cur_dir + "/code")
        os.makedirs(cur_dir + "/report")
        os.makedirs(cur_dir + "/data")
        cur_dir = cur_dir + "/code"
        os.makedirs(cur_dir + "/Clean")
        os.makedirs(cur_dir + "/Statistic")
        os.makedirs(cur_dir + "/Mining")
        os.makedirs(cur_dir + "/Visualiztion")
        srcfile = 'static/user/service/img/user_img.jpg'
        dstfiel = 'static/user/' + email + '/img/user_img.jpg'
        mycopyfile(srcfile, dstfiel)
    else:
        return "error"
    verify = data['verify']
    confirm1 = mailconfirm.search(email, verify)
    if confirm1 is not None:  # 首先看验证码是否正确
        theuser = user.query.filter_by(email=email).first()
        if theuser is not None:  # 然后看用户是否存在
            return "email already exist"
        name = data['username']
        pas = data['password']
        typ = data['tp']  # 以数字的形式存储用户权限级别
        if typ == 'Primary VIP':
            typ = 1
        elif typ == 'Intermediate VIP':
            typ = 2
        elif typ == 'Senior VIP':
            typ = 3
        else:
            typ = 0
        user1 = user(email=email, username=name, password=pas, permission=typ)
        db.session.add(user1)
        db.session.delete(confirm1)
        db.session.commit()
        session['email'] = email
        session.permanent = True
        return "success"
    else:  # 验证码不正确或者已经过期
        return "Verification code error"


# 发送验证码并将验证码存到数据库
@app.route('/login/verify/', methods=['GET', 'POST'])
def login_verify():
    data = request.get_json('data')
    email = data['email']
    num = str(random.randint(1000, 9999))
    send = sendmail(email, num)
    if send:
        confirm1 = mailconfirm.query.filter_by(email=email).first()
        if confirm1 is not None:
            confirm1.num = num
            confirm1.invalid = datetime.now() + timedelta(minutes=5)
        else:
            conf1 = mailconfirm(email=email, num=num)
            db.session.add(conf1)
        db.session.commit()
        return "success"
    else:
        return "fail to send the mail"


# 验证验证码，过期或者成功都删除这个验证码
@app.route('/forget/verify/', methods=['GET', 'POST'])
def forget_verify():
    data = request.get_json('data')
    email = data['email']
    verify = data['verify']
    confirm1 = mailconfirm.query.filter_by(email=email, num=verify).first()
    if confirm1 is not None:
        db.session.delete(confirm1)
        db.session.commit()
        if confirm1.invalid > datetime.now():
            print("session deleted.")
            return "success"
        else:
            return "false"
    else:
        return "false"


@app.route('/forget/change/', methods=['GET', 'POST'])
def forget_change():
    data = request.get_json('data')
    email = data['email']
    password = data['password']
    print("email")
    user1 = user.query.filter_by(email=email).first()
    if user1 is not None:
        user1.password(password)
        db.session.commit()
        return "success"
    else:
        return "false"


@app.route('/user/')
def user_user():
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is not None:
            email = user1.email
            cur_dir = './static/user/' + email
            print(cur_dir)
            if os.path.exists(cur_dir):
                return render_template('user/user.html', user=user1)
            else:
                return "Unknown error"

        else:
            return "404 NOT FOUND"
    return render_template('user/login.html')


# 下一步，需要将用户的头像进行压缩
@app.route('/user/change/', methods=['GET', 'POST'])
def user_change():
    email = request.form.get('email')
    name = request.form.get('username')
    password = request.form.get('password')
    gender = request.form.get('gender')
    signature = request.form.get('signature')
    user1 = user.query.filter_by(email=email).first()
    if user1 is not None:
        user1.username = name
        user1.password(password)
        if gender == 'male':
            user1.gender = True
        else:
            user1.gender = False
        user1.signature = signature
        db.session.commit()
        return "success"
    else:
        return "false"


@app.route('/user/change/img/', methods=['GET', 'POST'])
def user_change_img():
    file = request.files['file']
    if file and '.' in file.filename:
        file_types = ['jpg','jpeg','png','pdf']
        this_type = file.filename.rsplit('.', 1)[1]
        for file_type in file_types:
            old_file = 'static/user/' + session.get('email') + '/img/user_img.'+file_type
            if os.path.exists(old_file):
                os.remove(old_file)
        if this_type in file_types:
            old_file = 'static/user/' + session.get('email') + '/img/user_img.jpg'
            file.save(old_file)
            return 'success'
    else:
        return "filename invalid or network error"


@app.route('/products', methods=['POST', 'GET'])
def products():
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        return render_template('products.html', user=user1)
    else:
        return render_template('products.html')


@app.route('/contact_us', methods=['POST', 'GET'])
def contact_us():
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        return render_template('contact_us.html', user=user1)
    else:
        return render_template('contact_us.html')


@app.route('/about_us', methods=['POST', 'GET'])
def about_us():
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        return render_template('about_us.html', user=user1)
    else:
        return render_template('about_us.html')


@app.route('/gallery/', methods=['POST', 'GET'])
def gallery():
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        return render_template('gallery.html', user=user1)
    else:
        return render_template('gallery.html')


@app.route('/master/', methods=['POST', 'GET'])
def master():
    return render_template('geogoo/master.html')


@app.route('/masterpoint/', methods=['POST', 'GET'])
def masterpoint():
    return render_template('geogoo/masterpoint.html')


@app.route('/BusRoute/', methods=['POST', 'GET'])
def BusRoute():
	return render_template('geogoo/BusRoute.html')


@app.route('/PM25/', methods=['POST', 'GET'])
def PM25():
	return render_template('geogoo/PM25.html')


# text_OCR--------------------------------------------------

if __name__ == '__main__':
    app.run()
