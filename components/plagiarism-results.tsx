import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface PlagiarismResultsProps {
  result: {
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
}

export function PlagiarismResults({ result }: PlagiarismResultsProps) {
  const overallSimilarity = result.summary.overall_similarity
  const getSeverityColor = (percentage: number) => {
    if (percentage >= 70) return "text-destructive"
    if (percentage >= 40) return "text-orange-600"
    return "text-green-600"
  }

  const getSeverityBg = (percentage: number) => {
    if (percentage >= 70) return "bg-destructive/10"
    if (percentage >= 40) return "bg-orange-600/10"
    return "bg-green-600/10"
  }

  const getSeverityIcon = (percentage: number) => {
    if (percentage >= 70) return <XCircle className="h-5 w-5" />
    if (percentage >= 40) return <AlertTriangle className="h-5 w-5" />
    return <CheckCircle className="h-5 w-5" />
  }

  const getSeverityLabel = (percentage: number) => {
    if (percentage >= 70) return "High Plagiarism"
    if (percentage >= 40) return "Moderate Plagiarism"
    return "Low Plagiarism"
  }

  return (
    <div className="space-y-6">
      {/* Overall Results */}
      <Card>
        <CardHeader>
          <CardTitle>Plagiarism Detection Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Similarity Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Overall Similarity Score</h3>
              <div className={`flex items-center gap-2 rounded-lg px-3 py-1 ${getSeverityBg(overallSimilarity)}`}>
                <span className={getSeverityColor(overallSimilarity)}>{getSeverityIcon(overallSimilarity)}</span>
                <span className={`text-2xl font-bold ${getSeverityColor(overallSimilarity)}`}>
                  {overallSimilarity}%
                </span>
              </div>
            </div>
            <Progress value={overallSimilarity} className="h-3" />
            <Alert className={getSeverityBg(overallSimilarity)}>
              <div className={getSeverityColor(overallSimilarity)}>{getSeverityIcon(overallSimilarity)}</div>
              <AlertTitle className={getSeverityColor(overallSimilarity)}>
                {getSeverityLabel(overallSimilarity)}
              </AlertTitle>
              <AlertDescription className="text-muted-foreground">
                {overallSimilarity >= 70 &&
                  "The texts show significant similarity. This indicates potential plagiarism."}
                {overallSimilarity >= 40 &&
                  overallSimilarity < 70 &&
                  "The texts show moderate similarity. Further review is recommended."}
                {overallSimilarity < 40 && "The texts show low similarity. Minimal plagiarism detected."}
              </AlertDescription>
            </Alert>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">TF-IDF Match</div>
              <div className="mt-1 text-2xl font-bold">{result.level1_basic.similarity_percentage}%</div>
              <div className="mt-1 text-xs text-muted-foreground">Keyword-based</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Plagiarized Sentences</div>
              <div className="mt-1 text-2xl font-bold">{result.level2_sentence.plagiarized_count}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                of {result.level2_sentence.total_sentences} sentences
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Semantic Matches</div>
              <div className="mt-1 text-2xl font-bold">{result.level3_semantic.semantic_plagiarized_count}</div>
              <div className="mt-1 text-xs text-muted-foreground">Paraphrased content</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level 2: Sentence-Level Results */}
      {result.level2_sentence.plagiarized_count > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plagiarized Sentences (Level 2)</CardTitle>
              <Badge variant="secondary">{result.level2_sentence.plagiarized_count} found</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.level2_sentence.plagiarized_sentences.map((item, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <Badge variant="outline">Sentence {item.position}</Badge>
                  <Badge variant={item.similarity >= 80 ? "destructive" : "secondary"} className="font-mono">
                    {item.similarity}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Original:</div>
                    <p className="text-sm bg-muted/50 p-2 rounded">{item.sentence}</p>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Matches with:</div>
                    <p className="text-sm bg-destructive/10 p-2 rounded">{item.matching_sentence}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Level 3: Semantic Results */}
      {result.level3_semantic.semantic_plagiarized_count > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Semantic Matches (Level 3)</CardTitle>
              <Badge variant="secondary">{result.level3_semantic.semantic_plagiarized_count} found</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.level3_semantic.semantic_plagiarized_sentences.map((item, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Sentence {item.position}</Badge>
                    <Badge variant="default" className="bg-purple-600">
                      AI Detected
                    </Badge>
                  </div>
                  <Badge variant={item.semantic_similarity >= 80 ? "destructive" : "secondary"} className="font-mono">
                    {item.semantic_similarity}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Original:</div>
                    <p className="text-sm bg-muted/50 p-2 rounded">{item.sentence}</p>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Semantically similar to:</div>
                    <p className="text-sm bg-purple-50 dark:bg-purple-950/20 p-2 rounded">{item.matching_sentence}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Plagiarism Message */}
      {result.level2_sentence.plagiarized_count === 0 && result.level3_semantic.semantic_plagiarized_count === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">No Specific Matches Found</AlertTitle>
          <AlertDescription>
            While the overall similarity is {overallSimilarity}%, no individual sentences were flagged as plagiarized
            above the threshold.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
