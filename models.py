from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Owner(db.Model):
    __tablename__ = 'owners'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False, index=True)
    address = db.Column(db.Text)
    total_debt = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.now)

    animals = db.relationship('Animal', backref='owner', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='owner', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Owner {self.name}>'


class Animal(db.Model):
    __tablename__ = 'animals'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    species = db.Column(db.String(50), nullable=False)
    breed = db.Column(db.String(100))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    owner_id = db.Column(db.Integer, db.ForeignKey('owners.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    visits = db.relationship('Visit', backref='animal', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='animal', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Animal {self.name}>'


class Visit(db.Model):
    __tablename__ = 'visits'
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animals.id'), nullable=False)
    visit_date = db.Column(db.DateTime, nullable=False, default=datetime.now)
    diagnosis = db.Column(db.Text)
    treatment = db.Column(db.Text)
    medications = db.Column(db.Text)
    notes = db.Column(db.Text)
    services = db.Column(db.Text, default='[]')
    total_amount = db.Column(db.Float, default=0.0)
    amount_paid = db.Column(db.Float, default=0.0)
    discount = db.Column(db.Float, default=0.0)
    remaining_amount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.now)

    def service_list(self):
        import json
        try:
            return json.loads(self.services) if self.services else []
        except:
            return []

    def __repr__(self):
        return f'<Visit {self.id}>'


class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('owners.id'), nullable=False)
    animal_id = db.Column(db.Integer, db.ForeignKey('animals.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    reminder_sent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    def __repr__(self):
        return f'<Appointment {self.id}>'
