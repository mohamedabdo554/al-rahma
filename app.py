from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from datetime import datetime, date, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from config import Config
from models import db, Owner, Animal, Visit, Appointment
from forms import OwnerForm, AnimalForm, VisitForm, AppointmentForm
import os

IS_VERCEL = os.environ.get('VERCEL') == '1'

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.context_processor
def inject_now():
    return {'now': datetime.now()}

if not IS_VERCEL:
    scheduler = BackgroundScheduler()
    scheduler.start()

    def check_reminders():
        with app.app_context():
            tomorrow = date.today() + timedelta(days=1)
            upcoming = Appointment.query.filter(
                db.func.date(Appointment.appointment_date) == tomorrow,
                Appointment.reminder_sent == False,
                Appointment.status == 'pending'
            ).all()
            for apt in upcoming:
                apt.reminder_sent = True
                db.session.commit()

    try:
        scheduler.add_job(check_reminders, 'interval', hours=6, id='reminder_check')
    except:
        pass


@app.route('/')
def index():
    today = date.today()
    today_appointments = Appointment.query.filter(
        db.func.date(Appointment.appointment_date) == today,
        Appointment.status == 'pending'
    ).order_by(Appointment.appointment_date).all()
    total_owners = Owner.query.count()
    total_animals = Animal.query.count()
    upcoming = Appointment.query.filter(
        Appointment.appointment_date >= datetime.now(),
        Appointment.status == 'pending'
    ).order_by(Appointment.appointment_date).limit(5).all()
    return render_template('index.html', today_appointments=today_appointments,
                           total_owners=total_owners, total_animals=total_animals,
                           upcoming=upcoming)


@app.route('/search')
def search():
    q = request.args.get('q', '')
    if not q:
        return render_template('search.html', results=[], query='')
    owners = Owner.query.filter(
        db.or_(Owner.name.contains(q), Owner.phone.contains(q))
    ).all()
    animals = Animal.query.filter(Animal.name.contains(q)).all()
    return render_template('search.html', query=q, owners=owners, animals=animals)


# ─── Owners ────────────────────────────────────────────────────────
@app.route('/owners')
def owners_list():
    owners = Owner.query.order_by(Owner.created_at.desc()).all()
    return render_template('owners/list.html', owners=owners)


@app.route('/owners/add', methods=['GET', 'POST'])
def owners_add():
    form = OwnerForm()
    if form.validate_on_submit():
        owner = Owner(name=form.name.data, phone=form.phone.data, address=form.address.data)
        db.session.add(owner)
        db.session.commit()
        flash('تم إضافة المريض بنجاح', 'success')
        return redirect(url_for('owners_list'))
    return render_template('owners/add.html', form=form)


@app.route('/owners/<int:id>')
def owners_view(id):
    owner = Owner.query.get_or_404(id)
    animals = Animal.query.filter_by(owner_id=id).all()
    appointments = Appointment.query.filter_by(owner_id=id).order_by(Appointment.appointment_date.desc()).all()
    return render_template('owners/view.html', owner=owner, animals=animals, appointments=appointments)


@app.route('/owners/<int:id>/edit', methods=['GET', 'POST'])
def owners_edit(id):
    owner = Owner.query.get_or_404(id)
    form = OwnerForm(obj=owner)
    if form.validate_on_submit():
        form.populate_obj(owner)
        db.session.commit()
        flash('تم تحديث البيانات', 'success')
        return redirect(url_for('owners_view', id=id))
    return render_template('owners/add.html', form=form, edit=True)


@app.route('/owners/<int:id>/delete')
def owners_delete(id):
    owner = Owner.query.get_or_404(id)
    db.session.delete(owner)
    db.session.commit()
    flash('تم حذف المريض', 'success')
    return redirect(url_for('owners_list'))


# ─── Animals ────────────────────────────────────────────────────────
@app.route('/animals')
def animals_list():
    animals = Animal.query.order_by(Animal.created_at.desc()).all()
    return render_template('animals/list.html', animals=animals)


@app.route('/animals/add', methods=['GET', 'POST'])
def animals_add():
    form = AnimalForm()
    form.owner_id = None
    owner_id = request.args.get('owner_id')
    if owner_id:
        form.owner_id = owner_id

    if form.validate_on_submit():
        owner_id = request.form.get('owner_id')
        if not owner_id:
            flash('يجب اختيار صاحب الحيوان', 'danger')
            return render_template('animals/add.html', form=form, owners=Owner.query.all())
        animal = Animal(
            name=form.name.data,
            species=form.species.data,
            breed=form.breed.data,
            age=form.age.data,
            gender=form.gender.data,
            owner_id=owner_id
        )
        db.session.add(animal)
        db.session.commit()
        flash('تم إضافة الحيوان بنجاح', 'success')
        return redirect(url_for('animals_list'))
    return render_template('animals/add.html', form=form, owners=Owner.query.all())


@app.route('/animals/<int:id>')
def animals_view(id):
    animal = Animal.query.get_or_404(id)
    visits = Visit.query.filter_by(animal_id=id).order_by(Visit.visit_date.desc()).all()
    appointments = Appointment.query.filter_by(animal_id=id).order_by(Appointment.appointment_date.desc()).all()
    return render_template('animals/view.html', animal=animal, visits=visits, appointments=appointments)


@app.route('/animals/<int:id>/edit', methods=['GET', 'POST'])
def animals_edit(id):
    animal = Animal.query.get_or_404(id)
    form = AnimalForm(obj=animal)
    if form.validate_on_submit():
        form.populate_obj(animal)
        db.session.commit()
        flash('تم تحديث بيانات الحيوان', 'success')
        return redirect(url_for('animals_view', id=id))
    return render_template('animals/add.html', form=form, owners=Owner.query.all(), edit=True, animal=animal)


@app.route('/animals/<int:id>/delete')
def animals_delete(id):
    animal = Animal.query.get_or_404(id)
    owner_id = animal.owner_id
    db.session.delete(animal)
    db.session.commit()
    flash('تم حذف الحيوان', 'success')
    return redirect(url_for('owners_view', id=owner_id))


# ─── Visits ────────────────────────────────────────────────────────
@app.route('/visits')
def visits_list():
    visits = Visit.query.order_by(Visit.visit_date.desc()).all()
    return render_template('visits/list.html', visits=visits)


@app.route('/visits/add/<int:animal_id>', methods=['GET', 'POST'])
def visits_add(animal_id):
    animal = Animal.query.get_or_404(animal_id)
    form = VisitForm()
    if request.method == 'POST':
        dt = request.form.get('visit_date', '')
        if dt and 'T' in dt:
            form_data = request.form.copy()
            form_data['visit_date'] = dt.replace('T', ' ')
            form = VisitForm(form_data)
    else:
        form.visit_date.data = datetime.now()
        form.discount.data = 0
        form.amount_paid.data = 0
        form.remaining_amount.data = 0
    if form.validate_on_submit():
        services_raw = request.form.get('services_json', '[]')
        import json
        try:
            services = json.loads(services_raw)
        except:
            services = []
        total = sum(float(s.get('price', 0)) for s in services)
        paid = float(form.amount_paid.data or 0)
        disc = float(form.discount.data or 0)
        remaining = total - paid - disc
        if remaining < 0:
            remaining = 0

        visit = Visit(
            animal_id=animal_id,
            visit_date=form.visit_date.data,
            diagnosis=form.diagnosis.data,
            treatment=form.treatment.data,
            medications=form.medications.data,
            notes=form.notes.data,
            services=json.dumps(services, ensure_ascii=False),
            total_amount=total,
            amount_paid=paid,
            discount=disc,
            remaining_amount=remaining
        )
        db.session.add(visit)
        owner = animal.owner
        owner.total_debt = (owner.total_debt or 0) + remaining
        db.session.commit()
        flash('تم تسجيل الزيارة والفواتير', 'success')
        return redirect(url_for('animals_view', id=animal_id))
    return render_template('visits/add.html', form=form, animal=animal)


# ─── Appointments ──────────────────────────────────────────────────
@app.route('/appointments')
def appointments_list():
    appointments = Appointment.query.order_by(Appointment.appointment_date).all()
    return render_template('appointments/list.html', appointments=appointments, today=date.today())


@app.route('/appointments/add', methods=['GET', 'POST'])
def appointments_add():
    form = AppointmentForm()
    if request.method == 'POST':
        dt = request.form.get('appointment_date', '')
        if dt and 'T' in dt:
            form_data = request.form.copy()
            form_data['appointment_date'] = dt.replace('T', ' ')
            form = AppointmentForm(form_data)
    if form.validate_on_submit():
        owner_id = request.form.get('owner_id')
        animal_id = request.form.get('animal_id')
        if not owner_id or not animal_id:
            flash('يجب اختيار صاحب الحيوان والحيوان', 'danger')
            return render_template('appointments/add.html', form=form, owners=Owner.query.all())
        apt = Appointment(
            owner_id=owner_id,
            animal_id=animal_id,
            appointment_date=form.appointment_date.data,
            reason=form.reason.data
        )
        db.session.add(apt)
        db.session.commit()
        flash('تم إضافة الموعد', 'success')
        return redirect(url_for('appointments_list'))
    return render_template('appointments/add.html', form=form, owners=Owner.query.all())


@app.route('/appointments/<int:id>/done')
def appointments_done(id):
    apt = Appointment.query.get_or_404(id)
    apt.status = 'done'
    db.session.commit()
    flash('تم تأكيد الموعد', 'success')
    return redirect(url_for('appointments_list'))


@app.route('/appointments/<int:id>/cancel')
def appointments_cancel(id):
    apt = Appointment.query.get_or_404(id)
    apt.status = 'cancelled'
    db.session.commit()
    flash('تم إلغاء الموعد', 'success')
    return redirect(url_for('appointments_list'))


@app.route('/appointments/<int:id>/delete')
def appointments_delete(id):
    apt = Appointment.query.get_or_404(id)
    db.session.delete(apt)
    db.session.commit()
    flash('تم حذف الموعد', 'success')
    return redirect(url_for('appointments_list'))


# ─── API: Command Palette Search ────────────────────────────────────
@app.route('/api/search')
def api_search():
    q = request.args.get('q', '').strip()
    if len(q) < 1:
        return jsonify([])
    owners = Owner.query.filter(
        db.or_(Owner.name.contains(q), Owner.phone.contains(q))
    ).all()
    animals = Animal.query.filter(Animal.name.contains(q)).all()
    results = []
    for o in owners:
        results.append({
            'type': 'owner',
            'id': o.id,
            'name': o.name,
            'phone': o.phone,
            'animal_count': len(o.animals)
        })
    for a in animals:
        results.append({
            'type': 'animal',
            'id': a.id,
            'name': a.name,
            'species': a.species,
            'owner_name': a.owner.name
        })
    return jsonify(results)

# ─── API: get animals by owner ──────────────────────────────────────
@app.route('/api/animals/<int:owner_id>')
def api_animals(owner_id):
    animals = Animal.query.filter_by(owner_id=owner_id).all()
    return jsonify([{'id': a.id, 'name': a.name, 'species': a.species} for a in animals])


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
