import ast
import copy
import pandas as pd
import numpy as np
import csv
import os
from io import StringIO
import sys
from .util import ListConverter
from .pdf_operator import merge, merge_all, split
import platform
import random
import shutil
import smtplib
from datetime import timedelta, datetime
from email.header import Header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import pymysql
from flask import Flask, request, json, render_template, session, jsonify, url_for, current_app, g, redirect, Response, flash, send_file
from xlrd import open_workbook
from .model import user, login, mailconfirm, db, book, task, project, translators_tasks
from werkzeug.utils import secure_filename
from PyPDF2 import PdfFileReader, PdfFileWriter
from . import app
from .SQLEncoder import AlchemyEncoder
from .miner import parse
from .ahocorasick import AhoCorasick
from .fanyigou import upload_to_fanyigou, query_process, download_file

log = app.logger

#book_list should have been unique to each account, but now, simply set
#a globle variable and remains modifying in the future

n_t_s = {}

@app.route('/')
@app.route('/index')
def index():
    g.count = 0
    
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        print(user1)
        return render_template('regulator_homepage.html', user=user1)
    else:
        return render_template('regulator_homepage.html')


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
    smtp = None
    smtpserver = "smtp.qq.com"
    smtpport = 465
    from_mail = "1361377791@qq.com"
    password = "ejpulrvmshuyibba"
    # 邮件内容主体
    subject = "Activate your account"
    from_name = "Translation"
    body = num + "Here is your verification code, please fill in within five minutes. " \
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
        if smtp is not None:
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
    cur_dir = "./data/user"
    if os.path.isdir(cur_dir):
        os.makedirs('./data/user/' + email)
        cur_dir = cur_dir + "/" + email
        """
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
        """
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
        typ = data['tp']  # 以数字的形式存储用户角色
        if typ == 'Manager':
            typ = 1
        elif typ == 'Translator':
            typ = 0
        user1 = user(email=email, username=name, password=pas, role=typ)
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
            cur_dir = './data/user/' + email
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
            old_file = 'data/user/' + session.get('email') + '/img/user_img.'+file_type
            if os.path.exists(old_file):
                os.remove(old_file)
        if this_type in file_types:
            old_file = 'data/user/' + session.get('email') + '/img/user_img.jpg'
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


@app.route('/whether_login', methods=['POST','GET'])
def whether_login():
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        log.info("user role is %s", user1.role)
        if user1 is None:
            return "false"
        return "true"
    return "false"

@app.route('/upload_file/<filename>', methods=['POST','GET'])
def upload_file(filename):
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        if request.method == 'POST':
            if 'file' not in request.files:
                flash('No File')
                return redirect(request.url)
            
            project_id = request.form.get("projectId", type = str, default = None)
            current_project = project.query.filter_by(id=project_id).first()
            project_name = current_project.name
            cur_dir = "./data/user/" + email + "/" + project_name
            
            f = request.files['file']
            fname = secure_filename(f.filename)
            path_file_name = cur_dir + "/" + fname
            f.save(path_file_name)

            file_type = fname.split(".")[-1]
            language = "en"
            
            parse(path_file_name)
            pdf_reader = PdfFileReader(path_file_name)
            page_num = pdf_reader.getNumPages()
            
            book1 = book(book_name = path_file_name, file_type = file_type, language = language, page_number = page_num, project_id = project_id)
            db.session.add(book1)
            db.session.commit()
            return Response('Uploaded file successfully', status=200)
    else:
        return "false"
    '''
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        if request.method == 'POST':
            return

            
    else:
        return render_template('user/login.html')
    '''

@app.route('/page_number/<projectID>', methods=['POST','GET'])
def get_page_num(projectID):
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"

        current_book = book.query.filter_by(project_id=projectID).first()
        page_number = current_book.page_number
        log.info(page_number)
        return jsonify(page_number)
    else:
        return "false" 

@app.route('/set_setting_list', methods=['POST','GET'])
def set_setting_list():
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        if request.method == 'POST':
            setting_list = json.loads(request.get_data())
            log.info(setting_list)
            cur_dir = "./data/user/" + email
            cur_dir = cur_dir + "/" + setting_list["name"]
            if not os.path.exists(cur_dir):
                os.makedirs(cur_dir)
            project1 = project(name = setting_list["name"], manager_id = user1.id, deadline = setting_list["ddl"],
             href = setting_list["href"], from_language = "en")
            db.session.add(project1)
            db.session.commit()

            response_list = {}
            response_list["projectId"] = project1.id
            response_list["status"] = 200
            return jsonify(response_list)
    else:
        return "false"

@app.route('/get_setting_list', methods=['POST','GET'])
def get_setting_list():
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "404 NOT FOUND"
        
        item_list = project.query.all()
        item_list_dict = []
        for i_list in item_list:
            item_list_dict.append(json.dumps(i_list, cls = AlchemyEncoder))
            
        return jsonify(item_list_dict)
    else:
        return "false"

@app.route('/get_setting_item/<string:name>', methods=['POST','GET'])
def get_setting_item(name):
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        
        item = project.query.filter_by(name = name).first()

        return json.dumps(item, cls = AlchemyEncoder)
    else:
        return "false"

@app.route('/send_segment_range/<string:name>', methods=['POST','GET'])
def segment_file(name):
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        if request.method == 'POST':
            
            select_range = json.loads(request.get_data())
            current_project = project.query.filter_by(name=name).first()
            current_project_id = current_project.id
            current_book = book.query.filter_by(project_id=current_project_id).first()
            current_book_name = current_book.book_name
            out_files = split(current_book_name, select_range)
            for i in range(len(select_range)):
                temp = list(map(int, select_range[i]))
                start_page = temp[0] - 1
                end_page = temp[1] - 1
                
                task1 = task(project_id=current_project_id, start_page=start_page, end_page=end_page, task_path=out_files[i])
                db.session.add(task1)
                db.commit()

            return Response("Successfully segment the file", status=200)
    else:
        return "false"
        
@app.route('/terms/<string:name>', methods=['POST','GET'])
def replace_terms(name):
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        if request.method == 'POST':
            l_d = json.loads(request.get_data())
            target_language = l_d[0]

            current_project = project.query.filter_by(name=name).first()
            current_project.to_language = target_language
            current_project_id = current_project.id
            current_book = book.query.filter_by(project_id=current_project_id).first()
            current_book_name = current_book.book_name
            source_language = current_book.language
            text_current_book_name = current_book_name[0: current_book_name.rindex(".")] + ".txt"
            term_current_book_name = current_book_name[0: current_book_name.rindex(".")] + "_term.txt"

            target_language_index = {}
            source_language_string = []

            with open("./terms/wording-cn-jp.csv", "r") as f:
                line = f.readline()

                while line:
                    line = line.strip()
                    words = line.split(",")
                    if source_language == "en":
                        source_language_string.append(words[0])
                    elif source_language == "zh":
                        source_language_string.append(words[1])
                    elif source_language == "jp":
                        source_language_string.append(words[2])
                    if target_language == "en":
                        target_language_index[source_language_string[-1]] = words[0]
                    elif target_language == "zh":
                        target_language_index[source_language_string[-1]] = words[1]
                    elif target_language == "jp":
                        target_language_index[source_language_string[-1]] = words[2]
                    
                    line = f.readline()
            
            with open(text_current_book_name, "r") as f:
                
                line = f.readline()
                text = ""
                while line:
                    end_character = line[-1]
                    tree=AhoCorasick(*source_language_string)
                    results = tree.search(line, True)

                    lr = []
                    while len(results) > 0:
                        lr.append(results.pop())
                    lr = sorted(lr, key=lambda x: x[1][0], reverse=True)

                    for i in range(0,len(lr)):
                        source_language_index = lr[i][0]
                        start_index = lr[i][1][0]
                        end_index = lr[i][1][1]

                        substring1 = line[0:start_index]
                        substring2 = line[end_index:-1]
                        line = substring1 + target_language_index[source_language_index] + substring2 + end_character
                    text += line
                    line = f.readline()
                
                with open(term_current_book_name, "w", encoding="utf-8") as fl:
                        fl.write(text)
            return "true"
    else:
        return "false"

@app.route('/get_range_list/<string:name>', methods=['POST','GET'])
def get_range_list(name):
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        if request.method == 'POST':
            range_list = []
            current_project = project.query.filter_by(name=name).first()
            specific_tasks = task.query.filter_by(project_id=current_project.id).all()
            for specific_task in specific_tasks:
                range_list_item = [specific_task.start_page + 1, specific_task.end_page + 1]
                range_list.append(range_list_item)
            
            return jsonify(range_list)

            
    else:
        return "false"

@app.route('/translator_setion/<string:name>', methods=['POST','GET'])
def translator_setion(name):
    if request.method == 'POST':
        global n_t_s

        t_s = json.loads(request.get_data())
        n_t_s[name] = t_s
        log.info('n_t_s = %s', n_t_s)
        return Response('Successfully adds translators and sections', status=200)

@app.route('/get_translator_setion_file/<string:name>', methods=['POST','GET'])
def get_t_s_file(name):
    if request.method == 'POST':
        global n_t_s
        global out_files_list
        
        translator = json.loads(request.get_data())
        t_s = n_t_s[name]
        section = t_s[translator]
        filename = out_files_list[section]
        return jsonify(filename)

@app.route("/files/<path:path>", methods=['POST','GET'])
def send_source_file(path):
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        return send_file("../"+path)
    else: return "false"

@app.route('/translation/<list:ids>', methods=['POST','GET'])
def toTranslationPage(ids):
    """
    call translation api
    """
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        log.info("ids0 = %s", ids[0])
        log.info("ids1 = %s", ids[1])
        current_project = project.query.filter_by(name=ids[0]).first()
        log.info(current_project.name)
        current_book = book.query.filter_by(project_id=current_project.id).first()
        projId = current_book.book_name
        translationId = "./data/user/" + email + "/" + current_project.name + "/" + ids[1]
        if not os.path.isfile(translationId):
            tid = upload_to_fanyigou(book, current_project.id, current_project.from_language, current_project.to_language)

            if tid == False:
                return "false"
        else: tid = -1
        
        return render_template('translationpage.html', tid = tid, projId = projId, translationId = translationId)
    else:
        return "false"

@app.route('/query/<tid>', methods=['POST','GET'])
def query(tid):
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        if request.method == 'POST':
            #查询翻译进度
            process_data = query_process(tid)
            if process_data == False:
                return "false"
            return jsonify(process_data)
    else: return "false"    

@app.route('/download_file/<path:path>', methods=['POST','GET'])
def download(path):
    if session.get('email'):
        email = session.get('email')
        user1 = user.query.filter_by(email=email).first()
        if user1 is None:
            return "false"
        if request.method == 'POST':
            #下载翻译结果
            # ids[0] = cur_dir, ids[1] = tid
            tid = json.loads(request.get_data())
            feed_back = download_file("../"+path,tid)
            return feed_back
    else: return "false"

@app.route('/translator', methods=['POST','GET'])
def toTranslatorPage():
    return render_template('translator_homepage.html')

@app.route('/work/<string:filename>', methods=['POST','GET'])
def work_zone(filename):
    translation_path_file = '../static/uploads/'
    translation_fname = secure_filename(filename)
    log.info('translation_path_file = %s', translation_path_file)
    log.info('translation_fname = %s', translation_fname)
    return render_template('workingpage.html', translationId = translation_path_file + translation_fname)
