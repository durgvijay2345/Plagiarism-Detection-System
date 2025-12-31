from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import nltk

app = Flask(__name__)
CORS(app)

# Download NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

def preprocess_text(text):
    """Clean and normalize text"""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def calculate_tfidf_similarity(text1, text2):
    """Calculate TF-IDF based similarity"""
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([text1, text2])
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    return float(similarity * 100)

def calculate_sentence_similarity(text1, text2):
    """Calculate sentence-level similarity"""
    sentences1 = nltk.sent_tokenize(text1)
    sentences2 = nltk.sent_tokenize(text2)
    
    matched_sentences = []
    
    for sent1 in sentences1:
        best_match = 0
        best_sentence = None
        
        for sent2 in sentences2:
            # Simple word overlap calculation
            words1 = set(sent1.lower().split())
            words2 = set(sent2.lower().split())
            
            if len(words1) > 0 and len(words2) > 0:
                overlap = len(words1.intersection(words2))
                similarity = (overlap / max(len(words1), len(words2))) * 100
                
                if similarity > best_match:
                    best_match = similarity
                    best_sentence = sent2
        
        if best_match > 30:  # Threshold
            matched_sentences.append({
                'original': sent1,
                'matched': best_sentence,
                'similarity': round(best_match, 2)
            })
    
    return matched_sentences

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

@app.route('/check-plagiarism', methods=['POST', 'OPTIONS'])
def check_plagiarism():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        text1 = data.get('text1', '').strip()
        text2 = data.get('text2', '').strip()
        
        if not text1 or not text2:
            return jsonify({'error': 'Both texts are required'}), 400
        
        # Preprocess
        processed_text1 = preprocess_text(text1)
        processed_text2 = preprocess_text(text2)
        
        # Calculate similarities
        tfidf_similarity = calculate_tfidf_similarity(processed_text1, processed_text2)
        sentence_matches = calculate_sentence_similarity(text1, text2)
        
        # Calculate overall score
        if sentence_matches:
            sentence_similarity = sum(s['similarity'] for s in sentence_matches) / len(sentence_matches)
        else:
            sentence_similarity = 0
        
        overall_similarity = (tfidf_similarity * 0.6 + sentence_similarity * 0.4)
        
        result = {
            'overall_similarity': round(overall_similarity, 2),
            'tfidf_similarity': round(tfidf_similarity, 2),
            'sentence_similarity': round(sentence_similarity, 2),
            'matched_sentences': sentence_matches,
            'total_sentences_original': len(nltk.sent_tokenize(text1)),
            'total_sentences_comparison': len(nltk.sent_tokenize(text2)),
            'plagiarism_level': 'High' if overall_similarity > 70 else 'Medium' if overall_similarity > 40 else 'Low'
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Plagiarism Detection Backend (Lightweight Version)...")
    print("Backend running on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
