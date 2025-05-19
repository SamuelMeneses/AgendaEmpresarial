from app import db, app
from models import Usuario

with app.app_context():
    db.drop_all()
    db.create_all()

    usuarios = [
        Usuario(
            username='carlos.mendoza',
            email='carlos.mendoza@example.com',
            rol='Admin',
            apellido='Mendoza',
            telefono='3001234567',
            empresa='TechCorp',
            cargo='Líder de Desarrollo',
            jefe_inmediato='Laura Ramírez',
            en_proyecto=True,
            nombre_proyecto='Migración a la nube',
            lider_proyecto='José Ortega',
            cargo_proyecto='Arquitecto de Soluciones',
            password='1234'
        ),
        Usuario(
            username='ana.lopez',
            email='ana.lopez@example.com',
            rol='Cliente',
            apellido='López',
            telefono='3109876543',
            empresa='FinanzasYA',
            cargo='Contadora',
            jefe_inmediato='Mario Vargas',
            en_proyecto=False,
            password='1234'
        ),
        Usuario(
            username='luis.garcia',
            email='luis.garcia@example.com',
            rol='Cliente',
            apellido='García',
            telefono='3015552233',
            empresa='InnovApp',
            cargo='Diseñador UX',
            jefe_inmediato='Natalia Ruiz',
            en_proyecto=True,
            nombre_proyecto='App de productividad',
            lider_proyecto='Andrés Gómez',
            cargo_proyecto='Project Manager',
            password='1234'
        ),
        Usuario(
            username='maria.fernandez',
            email='maria.fernandez@example.com',
            rol='Admin',
            apellido='Fernández',
            telefono='3121239876',
            empresa='BioHealth',
            cargo='Supervisora de Calidad',
            jefe_inmediato='Camilo Ríos',
            en_proyecto=False,
            password='1234'
        ),
        Usuario(
            username='pedro.sanchez',
            email='pedro.sanchez@example.com',
            rol='Cliente',
            apellido='Sánchez',
            telefono='3007654321',
            empresa='GreenSolutions',
            cargo='Gerente de TI',
            jefe_inmediato='Patricia León',
            en_proyecto=True,
            nombre_proyecto='Optimización de sistemas',
            lider_proyecto='Juliana Torres',
            cargo_proyecto='Scrum Master',
            password='1234'
        )
    ]

    db.session.add_all(usuarios)
    db.session.commit()

    print("Base de datos inicializada con 5 usuarios de prueba.")
