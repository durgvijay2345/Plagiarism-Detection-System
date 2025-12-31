# AI-Powered Plagiarism Detection System

A complete, production-ready plagiarism detection system using NLP and AI techniques. Built with Flask (backend) and Next.js (frontend).

![Plagiarism Detection](https://img.shields.io/badge/Python-3.11-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Three-Level Detection System

1. **Level 1: TF-IDF + Cosine Similarity**
   - Basic keyword-based matching
   - Fast overall document similarity analysis
   - Effective for detecting exact text copies

2. **Level 2: Sentence-Level Detection**
   - Granular sentence-by-sentence comparison
   - Identifies specific plagiarized sentences
   - Provides similarity scores for each match

3. **Level 3: Semantic Analysis (AI)**
   - Transformer-based embeddings (all-MiniLM-L6-v2)
   - Detects paraphrased content
   - Understands meaning beyond keywords

### Key Capabilities
- Text input or file upload (.txt)
- Real-time plagiarism analysis
- Visual highlighting of plagiarized content
- Detailed similarity scores and explanations
- Clean, professional UI
- RESTful API
- Docker-ready
- CI/CD pipelines included

## Project Structure

```
.
├── backend/                    # Python Flask API
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend container
│   ├── test_api.py           # API tests
│   └── README.md             # Backend documentation
├── app/                       # Next.js frontend
│   ├── page.tsx              # Main page
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── plagiarism-results.tsx
│   └── ui/                   # UI components
├── .github/workflows/        # CI/CD pipelines
│   ├── backend-deploy.yml
│   └── frontend-deploy.yml
├── docker-compose.yml        # Multi-container setup
├── nginx.conf               # Reverse proxy config
├── DEPLOYMENT.md            # Deployment guide
├── INTERVIEW.md             # Interview explanations
└── README.md                # This file
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker (optional)

### Local Development

**1. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Backend runs on `http://localhost:5000`

**2. Frontend Setup**
```bash
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

### Docker Setup (Recommended)

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## API Documentation

### Health Check
```http
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
```http
POST /check-plagiarism
Content-Type: application/json

{
  "text1": "Your original text here...",
  "text2": "Text to check for plagiarism..."
}
```

Response:
```json
{
  "success": true,
  "level1_basic": {
    "similarity_percentage": 85.5,
    "method": "TF-IDF + Cosine Similarity",
    "explanation": "Measures word overlap and frequency similarity"
  },
  "level2_sentence": {
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

## Architecture

### Backend (Flask + Python)
- **Flask**: Lightweight web framework
- **scikit-learn**: TF-IDF vectorization and cosine similarity
- **NLTK**: Text preprocessing and sentence tokenization
- **sentence-transformers**: Semantic embeddings (BERT-based)
- **Flask-CORS**: Cross-origin resource sharing

### Frontend (Next.js + React)
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Styling
- **shadcn/ui**: UI components
- **Lucide Icons**: Icon library

### Text Processing Pipeline

```
Input Text
    ↓
Preprocessing (lowercase, remove punctuation, stopwords)
    ↓
├─→ Level 1: TF-IDF Vectorization → Cosine Similarity
├─→ Level 2: Sentence Tokenization → Pairwise Comparison
└─→ Level 3: Transformer Embeddings → Semantic Similarity
    ↓
Comprehensive Results
```

## Technical Highlights

### TF-IDF vs Transformers

**TF-IDF (Level 1 & 2):**
- Converts text to numerical vectors based on word frequency
- Fast and computationally efficient
- Works well for exact or near-exact text matches
- Misses paraphrased content

**Example:**
- "The cat sat on the mat" vs "The cat sat on the mat" → High similarity ✓
- "The cat sat on the mat" vs "A feline rested on the rug" → Low similarity ✗

**Transformers (Level 3):**
- Uses pre-trained BERT model (all-MiniLM-L6-v2)
- Generates 384-dimensional semantic embeddings
- Captures meaning and context
- Detects paraphrased content

**Example:**
- "The cat sat on the mat" vs "The cat sat on the mat" → High similarity ✓
- "The cat sat on the mat" vs "A feline rested on the rug" → High similarity ✓

### Why Three Levels?

1. **Comprehensive Coverage**: Catches different types of plagiarism
2. **Performance Balance**: Fast TF-IDF for quick checks, deep learning for semantic analysis
3. **Transparency**: Users see exactly what was detected and how
4. **Flexibility**: Can adjust thresholds per level

## Testing

### Backend Tests
```bash
cd backend
python test_api.py
```

Test cases include:
- Identical text (100% plagiarism)
- Paraphrased content (semantic plagiarism)
- Different content (no plagiarism)
- Error handling

### Manual Testing
1. Start both backend and frontend
2. Enter sample texts in the UI
3. Click "Check Plagiarism"
4. Verify results are accurate

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy Options:**
- **Vercel (Frontend)**: `vercel --prod`
- **Railway (Backend)**: Connect GitHub repo
- **Docker**: `docker-compose up -d`

## CI/CD

GitHub Actions workflows are included:
- `.github/workflows/backend-deploy.yml` - Backend deployment
- `.github/workflows/frontend-deploy.yml` - Frontend deployment

**Required Secrets:**
- `DOCKER_USERNAME` and `DOCKER_PASSWORD`
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

## Performance

- **First request**: 2-5 seconds (model loading)
- **Subsequent requests**: <1 second
- **Memory usage**: ~500MB (transformer model)
- **Scalable**: Can handle concurrent requests

## Interview Questions & Answers

See [INTERVIEW.md](./INTERVIEW.md) for comprehensive interview preparation.

## Environment Variables

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend
No environment variables required for basic setup.

## Troubleshooting

### Backend not starting
- Ensure Python 3.11+ is installed
- Check all dependencies are installed: `pip install -r requirements.txt`
- Verify port 5000 is not in use

### Frontend cannot connect to backend
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Ensure backend is running and healthy: `curl http://localhost:5000/health`
- Check CORS is enabled in backend

### Model loading takes long
- First request loads transformer model (~500MB)
- Subsequent requests are fast
- Consider keeping instance warm in production

### CORS errors
- Ensure Flask-CORS is installed
- Verify `CORS(app)` is called in app.py
- Check browser console for specific errors

## Future Enhancements

- [ ] Database integration for storing scan history
- [ ] User authentication and accounts
- [ ] Batch processing for multiple documents
- [ ] PDF and Word document support
- [ ] Advanced reporting with charts
- [ ] API rate limiting
- [ ] Plagiarism source attribution
- [ ] Custom threshold configuration

## License

MIT License - feel free to use for personal and commercial projects.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions:
- Open a GitHub issue
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review [INTERVIEW.md](./INTERVIEW.md) for technical explanations

## Acknowledgments

- **sentence-transformers**: Pre-trained models
- **scikit-learn**: Machine learning utilities
- **NLTK**: Natural language processing
- **Next.js**: React framework
- **shadcn/ui**: Beautiful UI components

---

Built with ❤️ for production-ready plagiarism detection
