from flask import Flask
from flask_restx import Api, Resource

app = Flask(__name__)
api = Api(app, version='1.0', title='API de Agenda Empresarial', doc='/')

ns = api.namespace('inicio', description='prueba')

@ns.route('/')
class HolaMundo(Resource):
    def get(self):
        return {'mensaje': 'Hola mundo'}

if __name__ == '__main__':
    app.run(debug=True)