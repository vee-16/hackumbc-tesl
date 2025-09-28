#!/usr/bin/env python3
"""
Test script to verify that both the original Filter.py and new kaggle_data_loader.py work correctly.
"""

import sys
import os

def test_filter_py():
    """Test the original Filter.py file"""
    print("=" * 50)
    print("Testing Filter.py")
    print("=" * 50)
    
    try:
        # Import and run the filter module
        import Filter
        print("✅ Filter.py executed successfully!")
        return True
    except Exception as e:
        print(f"❌ Error in Filter.py: {e}")
        return False

def test_kaggle_loader():
    """Test the new kaggle_data_loader.py file"""
    print("\n" + "=" * 50)
    print("Testing kaggle_data_loader.py")
    print("=" * 50)
    
    try:
        # Import and run the kaggle loader module
        import kaggle_data_loader
        print("✅ kaggle_data_loader.py executed successfully!")
        return True
    except Exception as e:
        print(f"❌ Error in kaggle_data_loader.py: {e}")
        return False

def check_dependencies():
    """Check if required dependencies are installed"""
    print("Checking dependencies...")
    
    required_packages = [
        'pandas', 'numpy', 'scikit-learn', 'joblib', 
        'transformers', 'torch', 'datasets', 'evaluate'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - MISSING")
            missing_packages.append(package)
    
    # Check kagglehub separately
    try:
        import kagglehub
        print("✅ kagglehub")
    except ImportError:
        print("❌ kagglehub - MISSING")
        missing_packages.append('kagglehub')
    
    if missing_packages:
        print(f"\nMissing packages: {', '.join(missing_packages)}")
        print("Install with: pip install " + " ".join(missing_packages))
        return False
    
    return True

def main():
    """Main test function"""
    print("Testing Customer Support Ticket Classification Models")
    print("=" * 60)
    
    # Check dependencies first
    deps_ok = check_dependencies()
    
    if not deps_ok:
        print("\n⚠️  Some dependencies are missing. Please install them first.")
        return
    
    # Test both files
    filter_ok = test_filter_py()
    kaggle_ok = test_kaggle_loader()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    if filter_ok:
        print("✅ Filter.py: Working correctly")
    else:
        print("❌ Filter.py: Has issues")
    
    if kaggle_ok:
        print("✅ kaggle_data_loader.py: Working correctly")
    else:
        print("❌ kaggle_data_loader.py: Has issues")
    
    if filter_ok and kaggle_ok:
        print("\n🎉 All tests passed! Both models are ready to use.")
    else:
        print("\n⚠️  Some tests failed. Please check the error messages above.")

if __name__ == "__main__":
    main()
