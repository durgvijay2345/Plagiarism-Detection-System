# ✅ Use Python 3.10 (FULLY COMPATIBLE with sklearn)
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for numpy / sklearn)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better caching)
COPY requirements.txt .

# Upgrade pip & install dependencies
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Download NLTK data at build time
RUN python - <<EOF
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('punkt_tab')
EOF

# Copy rest of the code
COPY . .

# Expose Render port
EXPOSE 10000

# Run with Gunicorn (PRODUCTION SAFE)
CMD ["gunicorn", "app_simple:app", "--bind", "0.0.0.0:10000"]

