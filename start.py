#!/usr/bin/env python3
"""
Cross-platform launcher for XAS Thickness Calculator
"""

import sys
import subprocess
import os
import platform
from pathlib import Path

def check_command(command):
    """Check if a command is available"""
    try:
        subprocess.run([command, "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def check_python_package(package):
    """Check if a Python package is installed"""
    try:
        __import__(package)
        return True
    except ImportError:
        return False

def main():
    print("🚀 Starting XAS Thickness Calculator...")
    print()
    
    # Check Python
    if not check_command("python"):
        print("❌ Python is not installed. Please install Python first.")
        sys.exit(1)
    
    # Check npm
    if not check_command("npm"):
        print("❌ npm is not installed. Please install Node.js and npm first.")
        sys.exit(1)
    
    # Check Python dependencies
    print("📦 Checking Python dependencies...")
    if not check_python_package("xraylib"):
        print("⚠️  xraylib is not installed. Installing Python dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    if not check_python_package("flask"):
        print("⚠️  Flask is not installed. Installing Python dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    # Check npm dependencies
    if not Path("node_modules").exists():
        print("📦 Installing npm dependencies...")
        subprocess.run(["npm", "install"])
    
    print()
    print("✅ All dependencies are installed!")
    print()
    print("🌐 Starting servers...")
    print("   - API server will run on: http://localhost:5001")
    print("   - Web app will run on:    http://localhost:5173")
    print()
    print("Press Ctrl+C to stop both servers")
    print()
    
    # Start both servers
    try:
        subprocess.run(["npm", "run", "start"])
    except KeyboardInterrupt:
        print("\n👋 Shutting down servers...")
        sys.exit(0)

if __name__ == "__main__":
    main()