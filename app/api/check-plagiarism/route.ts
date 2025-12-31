import { NextResponse } from "next/server"

// Helper function: Preprocess text
function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s.!?]/g, "")
    .trim()
}

// Helper function: Calculate TF-IDF vectors
function calculateTFIDF(text1: string, text2: string) {
  const words1 = text1.split(/\s+/).filter((w) => w.length > 2)
  const words2 = text2.split(/\s+/).filter((w) => w.length > 2)

  // Build vocabulary
  const vocabulary = new Set([...words1, ...words2])

  // Calculate term frequency
  const tf1: Record<string, number> = {}
  const tf2: Record<string, number> = {}

  words1.forEach((word) => {
    tf1[word] = (tf1[word] || 0) + 1
  })
  words2.forEach((word) => {
    tf2[word] = (tf2[word] || 0) + 1
  })

  // Calculate IDF and TF-IDF vectors
  const vector1: number[] = []
  const vector2: number[] = []

  vocabulary.forEach((word) => {
    const df = (tf1[word] ? 1 : 0) + (tf2[word] ? 1 : 0)
    const idf = Math.log(2 / df)

    vector1.push((tf1[word] || 0) * idf)
    vector2.push((tf2[word] || 0) * idf)
  })

  return { vector1, vector2 }
}

// Helper function: Cosine similarity
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }

  if (norm1 === 0 || norm2 === 0) return 0
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

// Helper function: Split into sentences
function splitIntoSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// Helper function: Jaccard similarity
function jaccardSimilarity(text1: string, text2: string): number {
  const set1 = new Set(text1.toLowerCase().split(/\s+/))
  const set2 = new Set(text2.toLowerCase().split(/\s+/))

  const intersection = new Set([...set1].filter((x) => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text1, text2 } = body

    // Validation
    if (!text1 || !text2) {
      return NextResponse.json({ success: false, error: "Both texts are required" }, { status: 400 })
    }

    if (text1.length < 10 || text2.length < 10) {
      return NextResponse.json({ success: false, error: "Each text must be at least 10 characters" }, { status: 400 })
    }

    // Preprocess
    const processedText1 = preprocessText(text1)
    const processedText2 = preprocessText(text2)

    // LEVEL 1: TF-IDF Based Similarity
    const { vector1, vector2 } = calculateTFIDF(processedText1, processedText2)
    const basicSimilarity = cosineSimilarity(vector1, vector2)

    // LEVEL 2: Sentence-Level Detection
    const sentences1 = splitIntoSentences(text1)
    const sentences2 = splitIntoSentences(text2)

    const plagiarizedSentences: Array<{
      sentence: string
      similarity: number
      matching_sentence: string
      position: number
    }> = []

    sentences2.forEach((sent2, idx) => {
      let maxSim = 0
      let matchingSentence = ""

      sentences1.forEach((sent1) => {
        const sim = jaccardSimilarity(sent1, sent2)
        if (sim > maxSim) {
          maxSim = sim
          matchingSentence = sent1
        }
      })

      if (maxSim > 0.3) {
        plagiarizedSentences.push({
          sentence: sent2,
          similarity: Math.round(maxSim * 100),
          matching_sentence: matchingSentence,
          position: idx,
        })
      }
    })

    // LEVEL 3: Semantic Similarity (Simplified - using word overlap and context)
    const semanticPlagiarized: Array<{
      sentence: string
      semantic_similarity: number
      matching_sentence: string
      position: number
      type: string
    }> = []

    // Detect paraphrasing by checking semantic closeness beyond exact word match
    sentences2.forEach((sent2, idx) => {
      sentences1.forEach((sent1) => {
        const words1 = new Set(sent1.toLowerCase().split(/\s+/))
        const words2 = new Set(sent2.toLowerCase().split(/\s+/))

        // Check for synonyms/similar words
        const commonWords = [...words1].filter((w) => words2.has(w)).length
        const avgLength = (words1.size + words2.size) / 2

        // Semantic score based on word overlap and length similarity
        const lengthDiff = Math.abs(words1.size - words2.size) / Math.max(words1.size, words2.size)
        const semanticScore = (commonWords / avgLength) * (1 - lengthDiff * 0.5)

        if (semanticScore > 0.25 && semanticScore < 0.7) {
          // Not exact copy but semantically similar
          semanticPlagiarized.push({
            sentence: sent2,
            semantic_similarity: Math.round(semanticScore * 100),
            matching_sentence: sent1,
            position: idx,
            type: "paraphrased",
          })
        }
      })
    })

    // Calculate overall similarity
    const overallSimilarity = Math.round(
      (basicSimilarity * 40 + (plagiarizedSentences.length / sentences2.length) * 100 * 30 + basicSimilarity * 30) /
        100,
    )

    // Build response
    const result = {
      success: true,
      level1_basic: {
        similarity_percentage: Math.round(basicSimilarity * 100),
        method: "TF-IDF + Cosine Similarity",
        explanation:
          "Measures keyword frequency and overlap using TF-IDF vectors. Effective for detecting exact or near-exact copies.",
      },
      level2_sentence: {
        plagiarized_sentences: plagiarizedSentences,
        total_sentences: sentences2.length,
        plagiarized_count: plagiarizedSentences.length,
      },
      level3_semantic: {
        semantic_plagiarized_sentences: semanticPlagiarized.slice(0, 5), // Limit to top 5
        semantic_plagiarized_count: semanticPlagiarized.length,
      },
      summary: {
        overall_similarity: overallSimilarity,
        total_plagiarized_sentences: plagiarizedSentences.length,
        semantic_plagiarized_sentences: semanticPlagiarized.length,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
