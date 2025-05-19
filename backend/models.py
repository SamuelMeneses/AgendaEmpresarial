from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    rol = db.Column(db.String(50), nullable=False)
    apellido = db.Column(db.String(100), nullable=True)
    telefono = db.Column(db.String(20), nullable=True)
    empresa = db.Column(db.String(100), nullable=True)
    cargo = db.Column(db.String(100), nullable=True)
    jefe_inmediato = db.Column(db.String(100), nullable=True)
    en_proyecto = db.Column(db.Boolean, default=False)
    nombre_proyecto = db.Column(db.String(100), nullable=True)
    lider_proyecto = db.Column(db.String(100), nullable=True)
    cargo_proyecto = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return f'<Usuario {self.username}>'
