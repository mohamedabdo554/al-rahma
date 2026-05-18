import os

DB_URL = os.environ.get('DATABASE_URL')
if DB_URL and DB_URL.startswith('postgres://'):
    DB_URL = DB_URL.replace('postgres://', 'postgresql://', 1)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'vet-clinic-secret-key-2024'
    SQLALCHEMY_DATABASE_URI = DB_URL or 'sqlite:///vet_clinic.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = True
