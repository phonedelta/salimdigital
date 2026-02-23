from flask import Flask, request, jsonify, send_from_directory
import json
import os
import uuid

app = Flask(__name__)

# Dossier des fichiers statiques
STATIC_FOLDER = os.path.join(os.path.dirname(__file__), 'static')
if not os.path.exists(STATIC_FOLDER):
    STATIC_FOLDER = os.path.dirname(__file__)

# Fichier orders à la racine du projet (SalimDigital Dashboard)
ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'orders.json')

@app.route('/')
def index():
    return send_from_directory(STATIC_FOLDER, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(STATIC_FOLDER, filename)

@app.route('/submit-order', methods=['POST'])
def submit_order():
    try:
        data = request.form
        
        order = {
            'order_id': str(uuid.uuid4()),
            'timestamp': data.get('timestamp', ''),
            'fullName': data.get('fullName', ''),
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'product': data.get('product', ''),
            'quantity': data.get('quantity', ''),
            'livraison': 'non livré'
        }
        
        # Charger les commandes existantes (fichier à la racine)
        orders_file = ORDERS_FILE
        if os.path.exists(orders_file):
            with open(orders_file, 'r', encoding='utf-8') as f:
                orders = json.load(f)
        else:
            orders = []
        
        # Ajouter la nouvelle commande
        orders.append(order)
        
        # Sauvegarder
        with open(orders_file, 'w', encoding='utf-8') as f:
            json.dump(orders, f, indent=2, ensure_ascii=False)
        
        return jsonify({'success': True, 'message': 'Commande enregistrée'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/orders.json')
def get_orders():
    try:
        orders_file = ORDERS_FILE
        if os.path.exists(orders_file):
            with open(orders_file, 'r', encoding='utf-8') as f:
                orders = json.load(f)
        else:
            orders = []
        
        return jsonify(orders)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/update-livraison', methods=['POST'])
def update_livraison():
    try:
        order_id = request.form.get('order_id', '')
        livraison = request.form.get('livraison', '')
        timestamp = request.form.get('timestamp', '')

        orders_file = ORDERS_FILE
        if os.path.exists(orders_file):
            with open(orders_file, 'r', encoding='utf-8') as f:
                orders = json.load(f)
        else:
            orders = []

        found = False
        # Prefer matching by order_id
        if order_id:
            for order in orders:
                if order.get('order_id') == order_id:
                    order['livraison'] = livraison
                    found = True
                    break
        # Fallback to timestamp match
        if not found and timestamp:
            for order in orders:
                if order.get('timestamp') == timestamp:
                    order['livraison'] = livraison
                    found = True
                    break

        if found:
            with open(orders_file, 'w', encoding='utf-8') as f:
                json.dump(orders, f, indent=2, ensure_ascii=False)
            return jsonify({'success': True, 'message': 'Statut livraison mis à jour'})
        else:
            return jsonify({'success': False, 'error': 'Commande non trouvée'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Endpoint pour supprimer une commande
@app.route('/delete-order', methods=['POST'])
def delete_order():
    try:
        # Accept either order_id or timestamp for deletion
        order_id = request.form.get('order_id')
        timestamp = request.form.get('timestamp')
        orders_file = ORDERS_FILE
        if os.path.exists(orders_file):
            with open(orders_file, 'r', encoding='utf-8') as f:
                orders = json.load(f)
        else:
            orders = []

        if order_id:
            new_orders = [order for order in orders if order.get('order_id') != order_id]
        elif timestamp:
            new_orders = [order for order in orders if order.get('timestamp') != timestamp]
        else:
            return jsonify({'success': False, 'error': 'Missing order identifier'}), 400

        if len(new_orders) != len(orders):
            with open(orders_file, 'w', encoding='utf-8') as f:
                json.dump(new_orders, f, indent=2, ensure_ascii=False)
            return jsonify({'success': True, 'message': 'Commande supprimée'})
        else:
            return jsonify({'success': False, 'error': 'Commande non trouvée'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)