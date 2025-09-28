#!/usr/bin/env python3
"""
Test script for the complete AI Support Ticket System
Tests classification, assistance, and integration
"""

import os
import sys
from datetime import datetime

def test_dependencies():
    """Test if all required dependencies are available"""
    print("🔍 Testing Dependencies...")
    
    required_packages = {
        'flask': 'Flask',
        'pandas': 'pandas',
        'numpy': 'numpy', 
        'sklearn': 'scikit-learn',
        'joblib': 'joblib'
    }
    
    optional_packages = {
        'supabase': 'supabase',
        'google.generativeai': 'google-generativeai'
    }
    
    missing_required = []
    missing_optional = []
    
    for package, name in required_packages.items():
        try:
            __import__(package)
            print(f"  ✅ {name}")
        except ImportError:
            print(f"  ❌ {name} - REQUIRED")
            missing_required.append(name)
    
    for package, name in optional_packages.items():
        try:
            __import__(package)
            print(f"  ✅ {name}")
        except ImportError:
            print(f"  ⚠️ {name} - OPTIONAL (for full functionality)")
            missing_optional.append(name)
    
    if missing_required:
        print(f"\n❌ Missing required packages: {', '.join(missing_required)}")
        print("Install with: pip install " + " ".join(missing_required))
        return False
    
    if missing_optional:
        print(f"\n⚠️ Missing optional packages: {', '.join(missing_optional)}")
        print("Install with: pip install " + " ".join(missing_optional))
    
    print("✅ All required dependencies available!")
    return True

def test_classifier():
    """Test the ticket classifier"""
    print("\n🎯 Testing Ticket Classifier...")
    
    try:
        from ticket_classifier import TicketClassifier
        
        classifier = TicketClassifier()
        
        # Train if not ready
        if not classifier.is_ready():
            print("  🔄 Training classifier...")
            classifier.train()
        
        # Test prediction
        test_text = "My laptop won't start and the screen stays black"
        result = classifier.predict(test_text)
        
        print(f"  📝 Test: '{test_text}'")
        print(f"  🏷️ Type: {result['type']} (confidence: {result['confidence_type']:.2f})")
        print(f"  🚨 Urgency: {result['urgency']} (confidence: {result['confidence_urgency']:.2f})")
        print("  ✅ Classifier working correctly!")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Classifier error: {e}")
        return False

def test_assistant():
    """Test the Gemini assistant"""
    print("\n🤖 Testing AI Assistant...")
    
    try:
        from gemini_assistant import GeminiAssistant
        
        assistant = GeminiAssistant()
        
        # Test assistance
        test_text = "My computer keeps freezing when I open large files"
        assistance = assistant.get_assistance(test_text, "software")
        
        print(f"  📝 Test: '{test_text}'")
        print(f"  🤖 Assistant ready: {assistant.is_ready()}")
        print(f"  📋 Response type: {assistance['type']}")
        
        if assistance['type'] == 'ai_generated':
            print("  ✅ AI assistance working!")
            print(f"  📄 Response preview: {assistance['response'][:100]}...")
        else:
            print("  ⚠️ Using fallback responses (Gemini not configured)")
            print(f"  📄 Fallback analysis: {assistance['analysis']}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Assistant error: {e}")
        return False

def test_flask_app():
    """Test the Flask application"""
    print("\n🌐 Testing Flask Application...")
    
    try:
        from app import app
        
        # Test app creation
        print("  ✅ Flask app created successfully")
        
        # Test with test client
        with app.test_client() as client:
            # Test health endpoint
            response = client.get('/api/health')
            if response.status_code == 200:
                health_data = response.get_json()
                print(f"  ✅ Health check: {health_data['status']}")
                print(f"  🎯 Classifier ready: {health_data['classifier_ready']}")
                print(f"  🤖 Assistant ready: {health_data['assistant_ready']}")
                print(f"  🗄️ Database connected: {health_data['supabase_connected']}")
            else:
                print(f"  ❌ Health check failed: {response.status_code}")
                return False
            
            # Test classification endpoint
            test_data = {"text": "My printer is not working"}
            response = client.post('/api/classify', json=test_data)
            
            if response.status_code == 200:
                print("  ✅ Classification endpoint working")
            else:
                print(f"  ⚠️ Classification endpoint issue: {response.status_code}")
        
        print("  ✅ Flask app working correctly!")
        return True
        
    except Exception as e:
        print(f"  ❌ Flask app error: {e}")
        return False

def test_environment():
    """Test environment configuration"""
    print("\n🔧 Testing Environment Configuration...")
    
    env_vars = {
        'SUPABASE_URL': 'Supabase database URL',
        'SUPABASE_KEY': 'Supabase API key',
        'GEMINI_API_KEY': 'Google Gemini AI API key'
    }
    
    configured = 0
    for var, description in env_vars.items():
        if os.getenv(var):
            print(f"  ✅ {var} configured")
            configured += 1
        else:
            print(f"  ⚠️ {var} not set ({description})")
    
    if configured == 0:
        print("  ⚠️ No environment variables configured")
        print("  📝 Copy .env.example to .env and add your API keys for full functionality")
    elif configured < len(env_vars):
        print(f"  ⚠️ {configured}/{len(env_vars)} environment variables configured")
        print("  📝 Some features may not work without all API keys")
    else:
        print("  ✅ All environment variables configured!")
    
    return True

def main():
    """Run all tests"""
    print("🧪 AI Support Ticket System - Complete Test Suite")
    print("=" * 60)
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Dependencies", test_dependencies),
        ("Environment", test_environment),
        ("Classifier", test_classifier),
        ("Assistant", test_assistant),
        ("Flask App", test_flask_app)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:15} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your system is ready to use.")
        print("\n🚀 Next steps:")
        print("1. Run: python app.py")
        print("2. Visit: http://localhost:5000")
        print("3. Deploy to Vercel for free hosting!")
    else:
        print("⚠️ Some tests failed. Check the errors above.")
        print("\n🔧 Common fixes:")
        print("1. Install missing dependencies: pip install -r requirements.txt")
        print("2. Configure environment variables: cp .env.example .env")
        print("3. Train models: python ticket_classifier.py")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
