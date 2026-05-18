from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, IntegerField, SelectField, DateTimeField, SubmitField, FloatField, HiddenField
from wtforms.validators import DataRequired


class OwnerForm(FlaskForm):
    name = StringField('الاسم', validators=[DataRequired()])
    phone = StringField('رقم التليفون', validators=[DataRequired()])
    address = TextAreaField('العنوان')
    submit = SubmitField('حفظ')


class AnimalForm(FlaskForm):
    name = StringField('اسم الحيوان', validators=[DataRequired()])
    species = SelectField('النوع', choices=[('cat', 'قط'), ('dog', 'كلب'), ('other', 'آخر')])
    breed = StringField('السلالة')
    age = IntegerField('العمر')
    gender = SelectField('الجنس', choices=[('male', 'ذكر'), ('female', 'أنثى')])
    submit = SubmitField('حفظ')


class VisitForm(FlaskForm):
    visit_date = DateTimeField('تاريخ الزيارة', format='%Y-%m-%d %H:%M')
    diagnosis = TextAreaField('التشخيص')
    treatment = TextAreaField('العلاج')
    medications = TextAreaField('الأدوية')
    notes = TextAreaField('ملاحظات')
    services_json = HiddenField('services_json')
    total_amount = FloatField('الإجمالي')
    amount_paid = FloatField('المدفوع')
    discount = FloatField('الخصم')
    remaining_amount = FloatField('المتبقي')
    submit = SubmitField('حفظ')


class AppointmentForm(FlaskForm):
    appointment_date = DateTimeField('تاريخ ووقت الموعد', format='%Y-%m-%d %H:%M', validators=[DataRequired()])
    reason = TextAreaField('السبب')
    submit = SubmitField('حفظ')
