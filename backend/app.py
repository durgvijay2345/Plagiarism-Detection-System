from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
import re
import string
from sentence_transformers import SentenceTransformer
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download required NLTK data (only needed once, but safe to run multiple times)
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt_tab', quiet=True)
except Exception as e:
    logger.warning(f"NLTK download warning: {e}")

# Initialize the transformer model for Level 3 (loaded once at startup)
try:
    sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("Sentence transformer model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load sentence transformer: {e}")
    sentence_model = None


def preprocess_text(text):
    """
    Preprocess text by:
    - Converting to lowercase
    - Removing punctuation
    - Removing extra whitespace
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text


def remove_stopwords(text):
    """
    Remove common stopwords from text
    """
    try:
        stop_words = set(stopwords.words('english'))
        words = text.split()
        filtered_words = [word for word in words if word not in stop_words]
        return ' '.join(filtered_words)
    except Exception as e:
        logger.warning(f"Stopwords removal failed: {e}. Returning original text.")
        return text


def level1_tfidf_similarity(text1, text2):
    """
    LEVEL 1: Basic TF-IDF + Cosine Similarity
    
    TF-IDF (Term Frequency-Inverse Document Frequency):
    - Converts text into numerical vectors based on word importance
    - Common words get lower weights, unique words get higher weights
    - Fast and effective for exact text matching
    
    Returns overall similarity percentage
    """
    try:
        # Preprocess texts
        processed_text1 = preprocess_text(text1)
        processed_text2 = preprocess_text(text2)
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([processed_text1, processed_text2])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        
        # Convert to percentage
        similarity_percentage = round(similarity * 100, 2)
        
        return {
            'method': 'TF-IDF + Cosine Similarity',
            'similarity_percentage': similarity_percentage,
            'explanation': 'Measures word overlap and frequency similarity'
        }
    except Exception as e:
        logger.error(f"Level 1 error: {e}")
        return {
            'method': 'TF-IDF + Cosine Similarity',
            'similarity_percentage': 0,
            'error': str(e)
        }


def level2_sentence_level(text1, text2, threshold=0.7):
    """
    LEVEL 2: Sentence-Level Plagiarism Detection
    
    Process:
    - Tokenizes both texts into individual sentences
    - Compares each sentence from text1 against all sentences in text2
    - Flags sentence as plagiarized if similarity > threshold
    
    Returns list of plagiarized sentences with similarity scores
    """
    try:
        # Tokenize into sentences
        sentences1 = sent_tokenize(text1)
        sentences2 = sent_tokenize(text2)
        
        if not sentences1 or not sentences2:
            return {
                'method': 'Sentence-Level Detection',
                'plagiarized_sentences': [],
                'total_sentences': len(sentences1),
                'plagiarized_count': 0
            }
        
        plagiarized_sentences = []
        
        # Compare each sentence from text1 with all sentences from text2
        for idx, sent1 in enumerate(sentences1):
            if len(sent1.strip()) < 10:  # Skip very short sentences
                continue
                
            processed_sent1 = preprocess_text(sent1)
            max_similarity = 0
            matching_sentence = ""
            
            for sent2 in sentences2:
                if len(sent2.strip()) < 10:
                    continue
                    
                processed_sent2 = preprocess_text(sent2)
                
                # Calculate TF-IDF similarity for sentence pair
                try:
                    vectorizer = TfidfVectorizer()
                    tfidf_matrix = vectorizer.fit_transform([processed_sent1, processed_sent2])
                    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
                    
                    if similarity > max_similarity:
                        max_similarity = similarity
                        matching_sentence = sent2
                except:
                    continue
            
            # Flag as plagiarized if above threshold
            if max_similarity >= threshold:
                plagiarized_sentences.append({
                    'sentence': sent1,
                    'similarity': round(max_similarity * 100, 2),
                    'matching_sentence': matching_sentence,
                    'position': idx + 1
                })
        
        return {
            'method': 'Sentence-Level Detection',
            'plagiarized_sentences': plagiarized_sentences,
            'total_sentences': len(sentences1),
            'plagiarized_count': len(plagiarized_sentences),
            'threshold': threshold * 100
        }
    except Exception as e:
        logger.error(f"Level 2 error: {e}")
        return {
            'method': 'Sentence-Level Detection',
            'plagiarized_sentences': [],
            'total_sentences': 0,
            'plagiarized_count': 0,
            'error': str(e)
        }


def level3_semantic_similarity(text1, text2, threshold=0.75):
    """
    LEVEL 3: Advanced Semantic Plagiarism Detection using Transformer Embeddings
    
    Difference from TF-IDF:
    - TF-IDF: Keyword-based, looks for exact word matches
    - Transformers: Understands meaning, detects paraphrased content
    
    Example:
    - "The cat sat on the mat" vs "A feline rested on the rug"
    - TF-IDF: Low similarity (different words)
    - Transformers: High similarity (same meaning)
    
    Uses pre-trained sentence-transformers model (all-MiniLM-L6-v2)
    to create semantic embeddings that capture meaning beyond keywords
    """
    if sentence_model is None:
        return {
            'method': 'Semantic Similarity (Transformer)',
            'error': 'Sentence transformer model not available',
            'semantic_plagiarized_sentences': []
        }
    
    try:
        # Tokenize into sentences
        sentences1 = sent_tokenize(text1)
        sentences2 = sent_tokenize(text2)
        
        if not sentences1 or not sentences2:
            return {
                'method': 'Semantic Similarity (Transformer)',
                'semantic_plagiarized_sentences': [],
                'total_sentences': len(sentences1),
                'semantic_plagiarized_count': 0
            }
        
        semantic_plagiarized = []
        
        # Generate embeddings for all sentences in text2 (more efficient)
        valid_sentences2 = [s for s in sentences2 if len(s.strip()) >= 10]
        if not valid_sentences2:
            return {
                'method': 'Semantic Similarity (Transformer)',
                'semantic_plagiarized_sentences': [],
                'total_sentences': len(sentences1),
                'semantic_plagiarized_count': 0
            }
            
        embeddings2 = sentence_model.encode(valid_sentences2)
        
        # Compare each sentence from text1
        for idx, sent1 in enumerate(sentences1):
            if len(sent1.strip()) < 10:
                continue
            
            # Generate embedding for current sentence
            embedding1 = sentence_model.encode([sent1])[0]
            
            # Calculate cosine similarity with all sentences in text2
            similarities = cosine_similarity([embedding1], embeddings2)[0]
            max_similarity_idx = np.argmax(similarities)
            max_similarity = similarities[max_similarity_idx]
            
            # Flag as semantically plagiarized if above threshold
            if max_similarity >= threshold:
                semantic_plagiarized.append({
                    'sentence': sent1,
                    'semantic_similarity': round(max_similarity * 100, 2),
                    'matching_sentence': valid_sentences2[max_similarity_idx],
                    'position': idx + 1,
                    'type': 'semantic'
                })
        
        return {
            'method': 'Semantic Similarity (Transformer)',
            'semantic_plagiarized_sentences': semantic_plagiarized,
            'total_sentences': len(sentences1),
            'semantic_plagiarized_count': len(semantic_plagiarized),
            'threshold': threshold * 100,
            'explanation': 'Detects paraphrased content using meaning-based analysis'
        }
    except Exception as e:
        logger.error(f"Level 3 error: {e}")
        return {
            'method': 'Semantic Similarity (Transformer)',
            'semantic_plagiarized_sentences': [],
            'error': str(e)
        }


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Plagiarism Detection API is running',
        'transformer_available': sentence_model is not None
    }), 200


@app.route('/check-plagiarism', methods=['POST', 'OPTIONS'])
def check_plagiarism():
    """
    Main endpoint for plagiarism detection
    
    Accepts:
    - JSON with 'text1' and 'text2' fields
    
    Returns:
    - Level 1: Overall similarity percentage (TF-IDF)
    - Level 2: Sentence-level plagiarism detection
    - Level 3: Semantic/paraphrase detection (if available)
    """
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        # Get data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        text1 = data.get('text1', '').strip()
        text2 = data.get('text2', '').strip()
        
        # Validate inputs
        if not text1 or not text2:
            return jsonify({'error': 'Both text1 and text2 are required'}), 400
        
        if len(text1) < 10 or len(text2) < 10:
            return jsonify({'error': 'Texts must be at least 10 characters long'}), 400
        
        logger.info(f"Processing plagiarism check - Text1: {len(text1)} chars, Text2: {len(text2)} chars")
        
        # Run all three levels of detection
        level1_result = level1_tfidf_similarity(text1, text2)
        level2_result = level2_sentence_level(text1, text2, threshold=0.7)
        level3_result = level3_semantic_similarity(text1, text2, threshold=0.75)
        
        # Compile comprehensive results
        response = {
            'success': True,
            'level1_basic': level1_result,
            'level2_sentence': level2_result,
            'level3_semantic': level3_result,
            'summary': {
                'overall_similarity': level1_result.get('similarity_percentage', 0),
                'total_plagiarized_sentences': level2_result.get('plagiarized_count', 0),
                'semantic_plagiarized_sentences': level3_result.get('semantic_plagiarized_count', 0),
                'text1_length': len(text1),
                'text2_length': len(text2)
            }
        }
        
        return jsonify(response), 200, {'Content-Type': 'application/json'}
        
    except Exception as e:
        logger.error(f"Error in check_plagiarism: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500, {'Content-Type': 'application/json'}


if __name__ == '__main__':
    print("\n" + "="*60)
    print(" Starting Plagiarism Detection API Server")
    print("="*60)
    print(f" Server running on: http://localhost:5000")
    print(f" Health check: http://localhost:5000/health")
    print(f" API endpoint: http://localhost:5000/check-plagiarism")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
