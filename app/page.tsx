"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, CheckCircle, FileText, Upload } from "lucide-react"
import { PlagiarismResults } from "@/components/plagiarism-results"

interface PlagiarismResult {
  success: boolean
  level1_basic: {
    similarity_percentage: number
    method: string
    explanation: string
  }
  level2_sentence: {
    plagiarized_sentences: Array<{
      sentence: string
      similarity: number
      matching_sentence: string
      position: number
    }>
    total_sentences: number
    plagiarized_count: number
  }
  level3_semantic: {
    semantic_plagiarized_sentences: Array<{
      sentence: string
      semantic_similarity: number
      matching_sentence: string
      position: number
      type: string
    }>
    semantic_plagiarized_count: number
  }
  summary: {
    overall_similarity: number
    total_plagiarized_sentences: number
    semantic_plagiarized_sentences: number
  }
}

export default function Home() {
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PlagiarismResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const API_URL = "/api"

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setTextFunction: (text: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".txt")) {
      setError("Please upload a .txt file")
      return
    }

    try {
      const text = await file.text()
      setTextFunction(text)
      setError(null)
    } catch (err) {
      setError("Failed to read file")
    }
  }

  const handleCheckPlagiarism = async () => {
    // Validation
    if (!text1.trim() || !text2.trim()) {
      setError("Please enter both texts")
      return
    }

    if (text1.length < 10 || text2.length < 10) {
      setError("Each text must be at least 10 characters long")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/check-plagiarism`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text1: text1.trim(),
          text2: text2.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Analysis failed")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while checking plagiarism")
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setText1("")
    setText2("")
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Plagiarism Detector</h1>
              <p className="text-sm text-muted-foreground">Multi-level plagiarism detection using NLP and AI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Texts to Compare</CardTitle>
            <CardDescription>
              Type or upload two texts to check for plagiarism. Our system uses three levels of detection: TF-IDF,
              sentence-level, and semantic analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Text 1 Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="text1" className="text-sm font-medium">
                    Original Text
                  </label>
                  <label htmlFor="file1" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Upload className="h-4 w-4" />
                      Upload .txt
                    </div>
                    <input
                      id="file1"
                      type="file"
                      accept=".txt"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setText1)}
                    />
                  </label>
                </div>
                <Textarea
                  id="text1"
                  placeholder="Enter the original text here..."
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                  className="min-h-[300px] resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">{text1.length} characters</p>
              </div>

              {/* Text 2 Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="text2" className="text-sm font-medium">
                    Text to Check
                  </label>
                  <label htmlFor="file2" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Upload className="h-4 w-4" />
                      Upload .txt
                    </div>
                    <input
                      id="file2"
                      type="file"
                      accept=".txt"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setText2)}
                    />
                  </label>
                </div>
                <Textarea
                  id="text2"
                  placeholder="Enter the text to check for plagiarism..."
                  value={text2}
                  onChange={(e) => setText2(e.target.value)}
                  className="min-h-[300px] resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">{text2.length} characters</p>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleCheckPlagiarism} disabled={loading} className="min-w-[200px]" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Check Plagiarism
                  </>
                )}
              </Button>
              <Button onClick={handleClear} variant="outline" size="lg" disabled={loading}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && <PlagiarismResults result={result} />}

        {/* How It Works Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Our three-level detection system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">
                  Level 1
                </Badge>
                <div>
                  <h4 className="font-semibold">TF-IDF + Cosine Similarity</h4>
                  <p className="text-sm text-muted-foreground">
                    Keyword-based analysis that measures word frequency and overlap. Fast and effective for detecting
                    exact text copies.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">
                  Level 2
                </Badge>
                <div>
                  <h4 className="font-semibold">Sentence-Level Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Compares texts sentence by sentence to identify specific plagiarized sections with individual
                    similarity scores.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">
                  Level 3
                </Badge>
                <div>
                  <h4 className="font-semibold">Semantic Analysis (AI)</h4>
                  <p className="text-sm text-muted-foreground">
                    Uses advanced algorithms to detect paraphrased content by understanding meaning beyond keywords.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
