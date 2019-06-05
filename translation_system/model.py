from datetime import datetime, timedelta

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash  # 转换密码用到的库

from . import app


# 实例化

db = SQLAlchemy(app)
migrate = Migrate(app, db)

translators_tasks = db.Table("translators_projects",
                               db.Column("translator_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
                               db.Column("task_id", db.Integer, db.ForeignKey("task.id"), primary_key=True),
                               )


class user(db.Model):
    __tablename__ = 'user'
    email = db.Column(db.String(128), unique=True)
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(128), unique=True)
    password_hash = db.Column(db.String(128), nullable=False)
    register_on = db.Column(db.DateTime, nullable=False)
    role = db.Column(db.Integer, nullable=False, default=0)
    gender = db.Column(db.Boolean, nullable=False, default=True)
    signature = db.Column(db.String(128), nullable=True, default="This guy is too lazy~")

    def __init__(self, email, username, password, role):
        self.email = email
        self.username = username
        # 对password做10轮的加密，获得了加密之后的字符串hashed，
        self.password_hash = generate_password_hash(password)
        self.role = role
        self.register_on = datetime.now()

    def __repr__(self):
        return '<user %r>' % self.username

    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password_hash(self, password):
        print(self.password_hash)
        return check_password_hash(self.password_hash, password)


class login(db.Model):
    __tablename__ = 'login'
    email = db.Column(db.String(128), primary_key=True)
    log_time = db.Column(db.DateTime, primary_key=True)

    # 浏览器和ip

    def __init__(self, email):
        self.email = email
        self.log_time = datetime.now()


class mailconfirm(db.Model):
    __tablename__ = 'mailconfirm'
    email = db.Column(db.String(128), primary_key=True)
    num = db.Column(db.String(30), nullable=False)
    invalid = db.Column(db.DateTime, nullable=False)

    def __init__(self, email, num):
        self.email = email
        self.num = num
        self.invalid = datetime.now() + timedelta(minutes=5)

    @classmethod
    def search(cls, email, num):
        user = mailconfirm.query.filter(mailconfirm.email == email and mailconfirm.num == num).first()
        if user is None:
            return None
        else:
            return user


class project(db.Model):
    __tablename__ = 'project'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    manager_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    manager = db.relationship("user", lazy=True)
    deadline = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String(256), nullable=False, unique=True)
    from_language = db.Column(db.String(32), nullable=False)
    to_language = db.Column(db.String(32), nullable=True)
    href = db.Column(db.String(256), nullable=False)
    
    book = db.relationship("book", lazy=True)
    tasks = db.relationship("task", lazy=True)

    def __init__(self, name, manager_id, deadline, href, from_language, to_language=""):
        self.name = name
        self.manager_id = manager_id
        self.deadline = deadline
        self.from_language = from_language
        self.to_language = to_language
        self.href = href


class task(db.Model):
    __tablename__ = 'task'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    start_page = db.Column(db.Integer,nullable=True)
    end_page = db.Column(db.Integer,nullable=True)
    task_path = db.Column(db.String(256),nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)
    project = db.relationship("project", lazy=True)

    translators = db.relationship("user", secondary=translators_tasks, lazy="subquery")

    def __init__(self, project_id, start_page, end_page, task_path):
        self.project_id = project_id
        self.end_page = end_page
        self.start_page = start_page
        self.task_path = task_path

class book(db.Model):
    __tablename__ = 'book'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    file_type = db.Column(db.String(16), nullable=False)
    language = db.Column(db.String(32), nullable=False)
    page_number = db.Column(db.Integer, nullable=False)
    book_name = db.Column(db.String(256), nullable=False)
    
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)
    project = db.relationship("project", lazy=True)

    def __init__(self, book_name, file_type, language, page_number, project_id):
        self.book_name = book_name
        self.file_type = file_type
        self.language = language
        self.page_number = page_number
        self.project_id = project_id

db.create_all()
#db.session.add(a)
#db.session.commit()
