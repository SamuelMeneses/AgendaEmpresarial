import datetime
from functools import wraps
import jwt
from flask import Flask, request
from flask_cors import CORS
from flask_restx import Api, Resource, fields
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash
import logging

logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)

console = logging.StreamHandler()
console.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
console.setFormatter(formatter)
logging.getLogger('').addHandler(console)

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
    apellido = db.Column(db.String(80))
    telefono = db.Column(db.String(20))
    empresa = db.Column(db.String(100))
    cargo = db.Column(db.String(100))
    jefe_inmediato = db.Column(db.String(100))
    en_proyecto = db.Column(db.Boolean, default=False)
    nombre_proyecto = db.Column(db.String(100))
    lider_proyecto = db.Column(db.String(100))
    cargo_proyecto = db.Column(db.String(100))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

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

        return f(args[0], usuario, *args[1:], **kwargs)

    return decorador


user_model = auth_ns.model('User', {
    'username': fields.String(required=True, description='Nombre de usuario'),
    'email': fields.String(required=True, description='Correo electrónico'),
    'password': fields.String(required=True, description='Contraseña'),
    'rol': fields.String(required=True, description='Rol del usuario: admin o cliente'),
    'apellido': fields.String(required=False),
    'telefono': fields.String(required=False),
    'empresa': fields.String(required=False),
    'cargo': fields.String(required=False),
    'jefe_inmediato': fields.String(required=False),
    'en_proyecto': fields.Boolean(required=False),
    'nombre_proyecto': fields.String(required=False),
    'lider_proyecto': fields.String(required=False),
    'cargo_proyecto': fields.String(required=False),
})

login_model = auth_ns.model('Login', {
    'username': fields.String(required=True, description='Nombre de usuario'),
    'password': fields.String(required=True, description='Contraseña')
})


@auth_ns.route('/whoami')
class WhoAmI(Resource):
    @token_requerido
    def get(self, current_user, *args, **kwargs):
        logging.info(
            f"Usuario {current_user.username} (id: {current_user.id}) solicitó su información personal (whoami)")
        return {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'rol': current_user.rol
        }

@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(user_model)
    def post(self):
        data = request.json
        logging.info(f"Intento de registro para usuario: {data['username']}")

        if Usuario.query.filter((Usuario.username == data['username']) | (Usuario.email == data['email'])).first():
            logging.warning(f"Registro fallido, usuario o correo ya registrado: {data['username']}")
            return {'mensaje': 'Usuario o correo ya registrado'}, 400

        nuevo_usuario = Usuario(
            username=data['username'],
            email=data['email'],
            rol=data['rol'],
            apellido=data.get('apellido'),
            telefono=data.get('telefono'),
            empresa=data.get('empresa'),
            cargo=data.get('cargo'),
            jefe_inmediato=data.get('jefe_inmediato'),
            en_proyecto=data.get('en_proyecto', False),
            nombre_proyecto=data.get('nombre_proyecto') if data.get('en_proyecto') else None,
            lider_proyecto=data.get('lider_proyecto') if data.get('en_proyecto') else None,
            cargo_proyecto=data.get('cargo_proyecto') if data.get('en_proyecto') else None
        )
        nuevo_usuario.set_password(data['password'])

        db.session.add(nuevo_usuario)
        db.session.commit()

        logging.info(f"Usuario registrado exitosamente: {data['username']}")
        return {'mensaje': 'Usuario registrado exitosamente'}, 201

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.json
        logging.info(f"Intento de login para usuario: {data.get('username')}")

        usuario = Usuario.query.filter_by(username=data['username']).first()
        if not usuario or not usuario.check_password(data['password']):
            logging.warning(f"Login fallido para usuario: {data.get('username')}")
            return {'mensaje': 'Usuario o contraseña incorrectos'}, 401

        # Crear token JWT con expiración (ejemplo: 1 hora)
        token = jwt.encode({
            'id': usuario.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        logging.info(f"Login exitoso para usuario: {data.get('username')}, token generado")
        return {'token': token}

@auth_ns.route('/usuarios')
class ListaUsuarios(Resource):
    @token_requerido
    def get(self, current_user, *args, **kwargs):
        logging.info(f"Usuario {current_user.username} (rol: {current_user.rol}) solicitó la lista de usuarios")
        usuarios = Usuario.query.all()

        if current_user.rol == 'admin':
            logging.info(f"Acceso autorizado para rol admin: devolviendo lista completa de usuarios")
            resultado = [
                {
                    'id': u.id,
                    'username': u.username,
                    'email': u.email,
                    'rol': u.rol,
                    'apellido': u.apellido,
                    'telefono': u.telefono,
                    'empresa': u.empresa,
                    'cargo': u.cargo,
                    'jefe_inmediato': u.jefe_inmediato,
                    'en_proyecto': u.en_proyecto,
                    'nombre_proyecto': u.nombre_proyecto,
                    'lider_proyecto': u.lider_proyecto,
                    'cargo_proyecto': u.cargo_proyecto,
                } for u in usuarios
            ]
        elif current_user.rol == 'cliente':
            logging.info(f"Acceso autorizado para rol cliente: devolviendo datos limitados de usuarios")
            resultado = [
                {
                    'username': u.username,
                    'apellido': u.apellido,
                    'email': u.email,
                    'empresa': u.empresa,
                    'cargo': u.cargo,
                    'en_proyecto': u.en_proyecto,
                    'nombre_proyecto': u.nombre_proyecto,
                    'lider_proyecto': u.lider_proyecto,
                    'cargo_proyecto': u.cargo_proyecto
                } for u in usuarios
            ]
        else:
            logging.warning(f"Acceso denegado a usuario {current_user.username} con rol {current_user.rol}")
            return {'mensaje': 'Rol no autorizado'}, 403

        logging.info(f"Lista de usuarios enviada correctamente a {current_user.username}")
        return resultado

@auth_ns.route('/editar_usuario/<int:id_usuario>')
class EditarUsuario(Resource):
    @token_requerido
    def put(self, current_user, id_usuario):
        logging.info(
            f"Usuario {current_user.username} (rol: {current_user.rol}) intenta editar usuario con ID {id_usuario}")
        if current_user.rol != 'admin':
            logging.warning(
                f"Acceso denegado a {current_user.username} para editar usuario {id_usuario} - permiso insuficiente")
            return {'mensaje': 'Acceso denegado. Solo los administradores pueden editar usuarios.'}, 403

        usuario = Usuario.query.get(id_usuario)
        if not usuario:
            logging.warning(f"Usuario con ID {id_usuario} no encontrado para edición")
            return {'mensaje': 'Usuario no encontrado'}, 404

        data = request.json
        logging.info(f"Datos recibidos para actualizar usuario {id_usuario}: {data}")

        # Actualizar los campos
        usuario.email = data.get('email', usuario.email)
        usuario.rol = data.get('rol', usuario.rol)
        usuario.telefono = data.get('telefono', usuario.telefono)
        usuario.empresa = data.get('empresa', usuario.empresa)
        usuario.cargo = data.get('cargo', usuario.cargo)
        usuario.jefe_inmediato = data.get('jefe_inmediato', usuario.jefe_inmediato)
        usuario.en_proyecto = data.get('en_proyecto', usuario.en_proyecto)

        if usuario.en_proyecto:
            usuario.nombre_proyecto = data.get('nombre_proyecto', usuario.nombre_proyecto)
            usuario.lider_proyecto = data.get('lider_proyecto', usuario.lider_proyecto)
            usuario.cargo_proyecto = data.get('cargo_proyecto', usuario.cargo_proyecto)
        else:
            usuario.nombre_proyecto = None
            usuario.lider_proyecto = None
            usuario.cargo_proyecto = None

        db.session.commit()
        logging.info(f"Usuario con ID {id_usuario} actualizado exitosamente por {current_user.username}")

        return {'mensaje': 'Usuario actualizado exitosamente'}


@auth_ns.route('/eliminar_usuario/<int:id_usuario>')
class EliminarUsuario(Resource):
    @token_requerido
    def delete(self, current_user, id_usuario):

        logging.info(f"Usuario {current_user.username} intenta eliminar al usuario con ID {id_usuario}")

        if current_user.rol != 'admin':
            logging.warning(f"Acceso denegado a {current_user.username} para eliminar usuario {id_usuario}")
            return {'mensaje': 'Acceso denegado. Solo los administradores pueden eliminar usuarios.'}, 403

        usuario = Usuario.query.get(id_usuario)
        if not usuario:
            logging.warning(f"Usuario con ID {id_usuario} no encontrado para eliminar")
            return {'mensaje': 'Usuario no encontrado'}, 404

        db.session.delete(usuario)
        db.session.commit()
        logging.info(f"Usuario con ID {id_usuario} eliminado exitosamente por {current_user.username}")

        return {'mensaje': 'Usuario eliminado exitosamente'}



with app.app_context():
    db.create_all()

with app.app_context():
    usuarios = Usuario.query.all()
    for u in usuarios:
        print(f'ID: {u.id}, Usuario: {u.username}, Email: {u.email}, Rol: {u.rol}')

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)