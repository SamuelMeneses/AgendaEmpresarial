import datetime
from functools import wraps

import jwt
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restx import Api, Resource, fields
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'colder'

# Configura la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///agenda.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

api = Api(app, version='1.0', title='API de Agenda Empresarial', doc='/')

ns = api.namespace('inicio', description='prueba')
auth_ns = api.namespace('auth', description='Autenticación')

api.add_namespace(auth_ns)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    rol = db.Column(db.String(20), nullable=False)  # 'admin' o 'cliente'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

def token_requerido(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return {'mensaje': 'Token no proporcionado'}, 401

        try:
            datos = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            usuario = Usuario.query.get(datos['id'])
        except:
            return {'mensaje': 'Token inválido o expirado'}, 401

        return f(usuario, *args, **kwargs)
    return decorador


user_model = auth_ns.model('User', {
    'username': fields.String(required=True, description='Nombre de usuario'),
    'email': fields.String(required=True, description='Correo electrónico'),
    'password': fields.String(required=True, description='Contraseña'),
    'rol': fields.String(required=True, description='Rol del usuario: admin o cliente')
})

login_model = auth_ns.model('Login', {
    'username': fields.String(required=True, description='Nombre de usuario'),
    'password': fields.String(required=True, description='Contraseña')
})

@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(user_model)
    def post(self):
        data = request.json

        # Validar si usuario ya existe
        if Usuario.query.filter((Usuario.username == data['username']) | (Usuario.email == data['email'])).first():
            return {'mensaje': 'Usuario o correo ya registrado'}, 400

        # Crear nuevo usuario
        nuevo_usuario = Usuario(
            username=data['username'],
            email=data['email'],
            rol=data['rol']
        )
        nuevo_usuario.set_password(data['password'])

        db.session.add(nuevo_usuario)
        db.session.commit()

        return {'mensaje': 'Usuario registrado exitosamente'}, 201

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.json

        usuario = Usuario.query.filter_by(username=data['username']).first()
        if not usuario or not usuario.check_password(data['password']):
            return {'mensaje': 'Usuario o contraseña incorrectos'}, 401

        # Crear token JWT con expiración (ejemplo: 1 hora)
        token = jwt.encode({
            'id': usuario.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return {'token': token}


@auth_ns.route('/whoami')
class WhoAmI(Resource):
    @token_requerido
    def get(current_user, *args, **kwargs):
        return {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'rol': current_user.rol
        }

@auth_ns.route('/usuarios')
class ListaUsuarios(Resource):
    @token_requerido
    def get(current_user, *args, **kwargs):
        usuarios = Usuario.query.all()

        if current_user.rol == 'admin':
            resultado = [
                {
                    'id': u.id,
                    'username': u.username,
                    'email': u.email,
                    'password_hash': u.password_hash,
                    'rol': u.rol
                } for u in usuarios
            ]
        elif current_user.rol == 'cliente':
            resultado = [
                {
                    'username': u.username,
                    'email': u.email
                } for u in usuarios
            ]
        else:
            return {'mensaje': 'Rol no autorizado'}, 403

        return resultado

with app.app_context():
    db.create_all()

with app.app_context():
    usuarios = Usuario.query.all()
    for u in usuarios:
        print(f'ID: {u.id}, Usuario: {u.username}, Email: {u.email}, Rol: {u.rol}')

if __name__ == '__main__':
    app.run(debug=True)