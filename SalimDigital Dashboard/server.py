#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
import json
import uuid
from urllib.parse import parse_qs

# Change to the directory of this script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8081

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")
    
    def do_POST(self):
        if self.path == '/submit-order':
            self.handle_submit_order()
        elif self.path == '/update-livraison':
            self.handle_update_livraison()
        elif self.path == '/delete-order':
            self.handle_delete_order()
        else:
            self.send_error(404, "Not Found")
    def handle_update_livraison(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = parse_qs(post_data)
            order_id = data.get('order_id', [''])[0]
            livraison = data.get('livraison', [''])[0]
            orders_file = 'orders.json'
            if os.path.exists(orders_file):
                with open(orders_file, 'r', encoding='utf-8') as f:
                    orders = json.load(f)
            else:
                orders = []
            found = False
            for order in orders:
                if order.get('order_id') == order_id:
                    order['livraison'] = livraison
                    found = True
                    break
            if found:
                with open(orders_file, 'w', encoding='utf-8') as f:
                    json.dump(orders, f, indent=2, ensure_ascii=False)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'message': 'Statut livraison mis à jour'}).encode('utf-8'))
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': 'Commande non trouvée'}).encode('utf-8'))
        except Exception as e:
            self.send_error(500, f"Erreur serveur: {str(e)}")
    
    def do_GET(self):
        if self.path == '/orders.json':
            self.handle_get_orders()
        else:
            super().do_GET()
    
    def handle_submit_order(self):
        try:
            # Lire les données POST
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = parse_qs(post_data)
            # Générer un identifiant unique pour la commande
            order_id = str(uuid.uuid4())
            # Convertir en dictionnaire simple
            order = {
                'order_id': order_id,
                'timestamp': data.get('timestamp', [''])[0],
                'fullName': data.get('fullName', [''])[0],
                'email': data.get('email', [''])[0],
                'phone': data.get('phone', [''])[0],
                'product': data.get('product', [''])[0],
                'quantity': data.get('quantity', [''])[0],
                'livraison': 'non livré'
            }
            # Charger les commandes existantes
            orders_file = 'orders.json'
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
            # Répondre
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'order_id': order_id, 'message': 'Commande enregistrée'}).encode('utf-8'))
        except Exception as e:
            self.send_error(500, f"Erreur serveur: {str(e)}")

    def handle_delete_order(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = parse_qs(post_data)
            order_id = data.get('order_id', [''])[0]
            orders_file = 'orders.json'
            if os.path.exists(orders_file):
                with open(orders_file, 'r', encoding='utf-8') as f:
                    orders = json.load(f)
            else:
                orders = []
            new_orders = [order for order in orders if order.get('order_id') != order_id]
            if len(new_orders) != len(orders):
                with open(orders_file, 'w', encoding='utf-8') as f:
                    json.dump(new_orders, f, indent=2, ensure_ascii=False)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': 'Commande non trouvée'}).encode('utf-8'))
        except Exception as e:
            self.send_error(500, f"Erreur serveur: {str(e)}")
    
    def handle_get_orders(self):
        try:
            orders_file = 'orders.json'
            if os.path.exists(orders_file):
                with open(orders_file, 'r', encoding='utf-8') as f:
                    orders = json.load(f)
            else:
                orders = []
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(orders, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Erreur serveur: {str(e)}")

try:
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"✅ Serveur Web lancé sur: http://localhost:{PORT}")
        print(f"📂 Répertoire: {os.getcwd()}")
        print(f"🌐 Ouvrez: http://localhost:{PORT}/index.html")
        print(f"📊 API Orders: http://localhost:{PORT}/orders.json")
        print(f"⚠️  Appuyez sur Ctrl+C pour arrêter le serveur")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n🛑 Serveur arrêté")
    sys.exit(0)
except Exception as e:
    print(f"❌ Erreur: {e}")
    sys.exit(1)
