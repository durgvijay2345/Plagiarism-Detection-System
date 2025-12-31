# Plagiarism Detection API - Backend

A production-ready REST API for AI-based plagiarism detection using three levels of analysis.

## Features

### Three Levels of Detection

1. **Level 1 (Basic): TF-IDF + Cosine Similarity**
   - Fast keyword-based matching
   - Overall document similarity percentage
   - Best for detecting exact text copies

2. **Level 2 (Intermediate): Sentence-Level Detection**
   - Granular sentence-by-sentence comparison
   - Identifies specific plagiarized sentences
   - Provides similarity scores per sentence

3. **Level 3 (Advanced): Semantic Analysis**
   - Transformer-based embeddings (all-MiniLM-L6-v2)
   - Detects paraphrased content
   - Understands meaning beyond keywords

## Installation

### Local Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Docker Setup

1. Build the image:
```bash
docker build -t plagiarism-api .
```

2. Run the container:
```bash
docker run -p 5000:5000 plagiarism-api
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "message": "Plagiarism Detection API is running",
  "transformer_available": true
}
```

### Check Plagiarism
```
POST /check-plagiarism
Content-Type: application/json

{
  "text1": "Your first text here...",
  "text2": "Your second text here..."
}
```

Response:
```json
{
  "success": true,
  "level1_basic": {
    "method": "TF-IDF + Cosine Similarity",
    "similarity_percentage": 85.5,
    "explanation": "Measures word overlap and frequency similarity"
  },
  "level2_sentence": {
    "method": "Sentence-Level Detection",
    "plagiarized_sentences": [
      {
        "sentence": "Original sentence...",
        "similarity": 92.3,
        "matching_sentence": "Matching sentence...",
        "position": 1
      }
    ],
    "total_sentences": 5,
    "plagiarized_count": 2
  },
  "level3_semantic": {
    "method": "Semantic Similarity (Transformer)",
    "semantic_plagiarized_sentences": [...],
    "semantic_plagiarized_count": 3
  },
  "summary": {
    "overall_similarity": 85.5,
    "total_plagiarized_sentences": 2,
    "semantic_plagiarized_sentences": 3
  }
}
```

## Testing

Run the test suite:
```bash
python test_api.py
```

## Architecture

```
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
├── test_api.py           # API test suite
└── README.md            # This file
```

## Technical Details

### Text Preprocessing
- Lowercase conversion
- Punctuation removal
- Stopword filtering
- Whitespace normalization

### Algorithms

**TF-IDF (Term Frequency-Inverse Document Frequency)**
- Converts text to numerical vectors
- Weights words by importance
- Fast and effective for exact matches

**Cosine Similarity**
- Measures angle between vectors
- Range: 0 (completely different) to 1 (identical)

**Sentence Transformers**
- Pre-trained BERT-based model
- Generates 384-dimensional embeddings
- Captures semantic meaning

## Performance Considerations

- First request may be slow (model loading)
- Subsequent requests are fast (<1 second for typical documents)
- Memory usage: ~500MB (transformer model)
- Scalable with proper deployment

## Deployment

See the main project README for deployment instructions.
