#!/usr/bin/env python3
"""
Simple Flask server to provide xraylib calculations via REST API
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import xraylib
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'xraylib_version': xraylib.__version__})

@app.route('/edge_energy', methods=['POST'])
def edge_energy():
    try:
        data = request.json
        Z = data['Z']
        shell = data['shell']
        energy = xraylib.EdgeEnergy(Z, shell)
        return jsonify({'energy': energy})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/cs_total', methods=['POST'])
def cs_total():
    try:
        data = request.json
        Z = data['Z']
        energy = data['energy']
        cs = xraylib.CS_Total(Z, energy)
        return jsonify({'cs_total': cs})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/atomic_weight', methods=['POST'])
def atomic_weight():
    try:
        data = request.json
        Z = data['Z']
        weight = xraylib.AtomicWeight(Z)
        return jsonify({'atomic_weight': weight})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("Starting xraylib server on http://localhost:5001")
    print("Make sure you have xraylib installed: pip install xraylib")
    app.run(host='0.0.0.0', port=5001, debug=True)