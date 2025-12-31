#!/bin/bash

echo "=== Production Deployment Guide ==="
echo ""
echo "This script provides instructions for deploying to various platforms."
echo "Choose your preferred deployment method below:"
echo ""

show_vercel_deploy() {
    echo "--- Vercel Deployment (Frontend) ---"
    echo "1. Install Vercel CLI: npm i -g vercel"
    echo "2. Login: vercel login"
    echo "3. Deploy: vercel --prod"
    echo "4. Set environment variable: NEXT_PUBLIC_API_URL=https://your-api.com"
    echo ""
}

show_railway_deploy() {
    echo "--- Railway Deployment (Backend) ---"
    echo "1. Create account at railway.app"
    echo "2. Install Railway CLI: npm i -g @railway/cli"
    echo "3. Login: railway login"
    echo "4. Initialize: railway init"
    echo "5. Deploy backend: cd backend && railway up"
    echo "6. Get API URL from Railway dashboard"
    echo ""
}

show_docker_hub_deploy() {
    echo "--- Docker Hub + Cloud VM Deployment ---"
    echo "1. Build images:"
    echo "   docker build -t yourusername/plagiarism-api:latest ./backend"
    echo "   docker build -t yourusername/plagiarism-frontend:latest ."
    echo ""
    echo "2. Push to Docker Hub:"
    echo "   docker push yourusername/plagiarism-api:latest"
    echo "   docker push yourusername/plagiarism-frontend:latest"
    echo ""
    echo "3. On your server (AWS EC2, DigitalOcean, etc.):"
    echo "   docker-compose pull"
    echo "   docker-compose up -d"
    echo ""
}

show_aws_deploy() {
    echo "--- AWS Deployment ---"
    echo "Backend (Elastic Beanstalk):"
    echo "1. Install EB CLI: pip install awsebcli"
    echo "2. Initialize: eb init -p python-3.11 plagiarism-api"
    echo "3. Create environment: eb create production"
    echo "4. Deploy: eb deploy"
    echo ""
    echo "Frontend (Amplify or Vercel):"
    echo "- Use Vercel instructions above OR"
    echo "- Connect GitHub repo to AWS Amplify"
    echo ""
}

show_kubernetes_deploy() {
    echo "--- Kubernetes Deployment ---"
    echo "1. Create Kubernetes manifests in k8s/ directory"
    echo "2. Apply configurations:"
    echo "   kubectl apply -f k8s/backend-deployment.yaml"
    echo "   kubectl apply -f k8s/backend-service.yaml"
    echo "   kubectl apply -f k8s/frontend-deployment.yaml"
    echo "   kubectl apply -f k8s/frontend-service.yaml"
    echo "3. Set up ingress for routing"
    echo ""
}

# Show all options
show_vercel_deploy
show_railway_deploy
show_docker_hub_deploy
show_aws_deploy
show_kubernetes_deploy

echo "=== Environment Variables Required ==="
echo "Backend: No additional env vars needed for basic setup"
echo "Frontend: NEXT_PUBLIC_API_URL=<your-backend-url>"
echo ""
echo "=== CI/CD Setup ==="
echo "GitHub Actions workflows are provided in .github/workflows/"
echo "Required secrets:"
echo "- DOCKER_USERNAME and DOCKER_PASSWORD (Docker Hub)"
echo "- VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID (Vercel)"
echo ""
