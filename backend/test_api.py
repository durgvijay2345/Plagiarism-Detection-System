"""
Test script for the Plagiarism Detection API
Run this after starting the Flask server to verify all endpoints work
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    print("\n=== Testing Health Check ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200


def test_plagiarism_check():
    """Test the plagiarism detection endpoint"""
    print("\n=== Testing Plagiarism Detection ===")
    
    # Test case 1: High plagiarism (identical text)
    print("\n--- Test Case 1: Identical Text ---")
    text1 = "Artificial intelligence is transforming the world. Machine learning algorithms can process vast amounts of data. Deep learning has revolutionized computer vision."
    text2 = "Artificial intelligence is transforming the world. Machine learning algorithms can process vast amounts of data. Deep learning has revolutionized computer vision."
    
    response = requests.post(
        f"{BASE_URL}/check-plagiarism",
        json={"text1": text1, "text2": text2}
    )
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Overall Similarity: {result['summary']['overall_similarity']}%")
    print(f"Plagiarized Sentences: {result['summary']['total_plagiarized_sentences']}")
    
    # Test case 2: Paraphrased content (semantic plagiarism)
    print("\n--- Test Case 2: Paraphrased Content ---")
    text1 = "The quick brown fox jumps over the lazy dog. This is a common English pangram."
    text2 = "A fast auburn fox leaps above the sleepy canine. This sentence contains all letters of the alphabet."
    
    response = requests.post(
        f"{BASE_URL}/check-plagiarism",
        json={"text1": text1, "text2": text2}
    )
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Overall Similarity: {result['summary']['overall_similarity']}%")
    print(f"Semantic Plagiarized: {result['summary']['semantic_plagiarized_sentences']}")
    
    # Test case 3: Different content (no plagiarism)
    print("\n--- Test Case 3: Different Content ---")
    text1 = "Climate change is affecting global weather patterns. Rising temperatures are causing ice caps to melt."
    text2 = "The stock market experienced significant volatility today. Investors are concerned about inflation rates."
    
    response = requests.post(
        f"{BASE_URL}/check-plagiarism",
        json={"text1": text1, "text2": text2}
    )
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Overall Similarity: {result['summary']['overall_similarity']}%")
    print(f"Plagiarized Sentences: {result['summary']['total_plagiarized_sentences']}")


def test_error_handling():
    """Test error handling"""
    print("\n=== Testing Error Handling ===")
    
    # Test empty request
    print("\n--- Test: Empty Request ---")
    response = requests.post(f"{BASE_URL}/check-plagiarism", json={})
    print(f"Status Code: {response.status_code}")
    print(f"Error: {response.json().get('error')}")
    
    # Test short text
    print("\n--- Test: Text Too Short ---")
    response = requests.post(
        f"{BASE_URL}/check-plagiarism",
        json={"text1": "Hi", "text2": "Hello"}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Error: {response.json().get('error')}")


if __name__ == "__main__":
    print("Starting API Tests...")
    print("Make sure the Flask server is running on http://localhost:5000")
    
    try:
        # Run all tests
        test_health_check()
        test_plagiarism_check()
        test_error_handling()
        
        print("\n=== All Tests Complete ===")
    except requests.exceptions.ConnectionError:
        print("\nERROR: Could not connect to the server.")
        print("Please start the Flask server first: python app.py")
    except Exception as e:
        print(f"\nERROR: {e}")
