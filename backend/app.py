from flask import Flask, request, jsonify, g
from flask_cors import CORS
import mysql.connector
import os
import jwt
import datetime
import bcrypt
from functools import wraps

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Database configuration
db_config = {
    'host': 'b3qkerahnkmvg0vzmrfo-mysql.services.clever-cloud.com',
    'user': 'ug0mbw5bsjxhsdh8',
    'password': '97dHOs62cTyj8tqcXUir',
    'database': 'b3qkerahnkmvg0vzmrfo'
}

# Secret key for JWT
app.config['SECRET_KEY'] = 'Sai@1933'  # Change this to a secure random key in production

# Database helper functions
def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(**db_config)
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# Authentication middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            conn = get_db()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE id = %s", (data['id'],))
            current_user = cursor.fetchone()
            cursor.close()
            
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    username = data['username']
    email = data['email']
    password = data['password']
    
    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Check if email already exists
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        return jsonify({'message': 'User with this email already exists'}), 409
    
    # Create new user
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, hashed_password)
        )
        conn.commit()
        
        # Get the user id
        user_id = cursor.lastrowid
        
        # Generate token
        token = jwt.encode({
            'id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        # Return user data and token
        cursor.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        return jsonify({
            'token': token,
            'user': user
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
    
    email = data['email']
    password = data['password']
    
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Check password
    if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        # Generate token
        token = jwt.encode({
            'id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        # Remove password from user data
        user.pop('password', None)
        
        return jsonify({
            'token': token,
            'user': user
        }), 200
    else:
        cursor.close()
        return jsonify({'message': 'Invalid email or password'}), 401

@app.route('/api/auth/user', methods=['GET'])
@token_required
def get_user(current_user):
    # Remove password from user data
    user_data = {
        'id': current_user['id'],
        'username': current_user['username'],
        'email': current_user['email']
    }
    
    return jsonify(user_data), 200

@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions(current_user):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute(
        "SELECT * FROM transactions WHERE user_id = %s ORDER BY date DESC, created_at DESC",
        (current_user['id'],)
    )
    
    transactions = cursor.fetchall()
    cursor.close()
    
    return jsonify(transactions), 200

@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
@token_required
def get_transaction(current_user, transaction_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute(
        "SELECT * FROM transactions WHERE id = %s AND user_id = %s",
        (transaction_id, current_user['id'])
    )
    
    transaction = cursor.fetchone()
    cursor.close()
    
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    
    return jsonify(transaction), 200

@app.route('/api/transactions', methods=['POST'])
@token_required
def create_transaction(current_user):
    data = request.get_json()
    
    if not data or not all(key in data for key in ['amount', 'category', 'description', 'date', 'type']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if data['type'] not in ['income', 'expense']:
        return jsonify({'message': 'Type must be either "income" or "expense"'}), 400
    
    if float(data['amount']) <= 0:
        return jsonify({'message': 'Amount must be greater than 0'}), 400
    
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "INSERT INTO transactions (user_id, amount, category, description, date, type) VALUES (%s, %s, %s, %s, %s, %s)",
            (
                current_user['id'],
                data['amount'],
                data['category'],
                data['description'],
                data['date'],
                data['type']
            )
        )
        conn.commit()
        
        # Get the transaction
        transaction_id = cursor.lastrowid
        cursor.execute("SELECT * FROM transactions WHERE id = %s", (transaction_id,))
        transaction = cursor.fetchone()
        
        return jsonify(transaction), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
@token_required
def update_transaction(current_user, transaction_id):
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    if 'type' in data and data['type'] not in ['income', 'expense']:
        return jsonify({'message': 'Type must be either "income" or "expense"'}), 400
    
    if 'amount' in data and float(data['amount']) <= 0:
        return jsonify({'message': 'Amount must be greater than 0'}), 400
    
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Check if transaction exists and belongs to user
    cursor.execute(
        "SELECT * FROM transactions WHERE id = %s AND user_id = %s",
        (transaction_id, current_user['id'])
    )
    
    if not cursor.fetchone():
        cursor.close()
        return jsonify({'message': 'Transaction not found'}), 404
    
    # Update fields that are provided
    update_fields = []
    update_values = []
    
    for key in ['amount', 'category', 'description', 'date', 'type']:
        if key in data:
            update_fields.append(f"{key} = %s")
            update_values.append(data[key])
    
    if not update_fields:
        cursor.close()
        return jsonify({'message': 'No fields to update'}), 400
    
    update_values.append(transaction_id)
    
    try:
        cursor.execute(
            f"UPDATE transactions SET {', '.join(update_fields)} WHERE id = %s",
            tuple(update_values)
        )
        conn.commit()
        
        # Get the updated transaction
        cursor.execute("SELECT * FROM transactions WHERE id = %s", (transaction_id,))
        transaction = cursor.fetchone()
        
        return jsonify(transaction), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
@token_required
def delete_transaction(current_user, transaction_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Check if transaction exists and belongs to user
    cursor.execute(
        "SELECT * FROM transactions WHERE id = %s AND user_id = %s",
        (transaction_id, current_user['id'])
    )
    
    if not cursor.fetchone():
        cursor.close()
        return jsonify({'message': 'Transaction not found'}), 404
    
    try:
        cursor.execute("DELETE FROM transactions WHERE id = %s", (transaction_id,))
        conn.commit()
        
        return jsonify({'message': 'Transaction deleted successfully'}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()

if __name__ == '__main__':
    app.run(debug=True)
