"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

interface TestResult {
  input: string
  expectedOutput: string
  actualOutput: string
  passed: boolean
}

interface TestCaseRunnerProps {
  results: {
    passed: boolean
    results: TestResult[]
  }
}

export function TestCaseRunner({ results }: TestCaseRunnerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {results.passed ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>All Tests Passed!</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <span>Some Tests Failed</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.results.map((result, index) => (
            <div key={index} className="border rounded-md overflow-hidden">
              <div
                className={`flex items-center justify-between p-3 ${
                  result.passed
                    ? "bg-green-50 dark:bg-green-950/30 border-b border-green-100 dark:border-green-900/50"
                    : "bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/50"
                }`}
              >
                <span className="font-medium">Test Case {index + 1}</span>
                {result.passed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="p-3 space-y-2 text-sm">
                <div>
                  <span className="font-medium">Input:</span>
                  <pre className="mt-1 bg-muted p-2 rounded-md overflow-x-auto">{result.input}</pre>
                </div>
                <div>
                  <span className="font-medium">Expected Output:</span>
                  <pre className="mt-1 bg-muted p-2 rounded-md overflow-x-auto">{result.expectedOutput}</pre>
                </div>
                <div>
                  <span className="font-medium">Your Output:</span>
                  <pre className="mt-1 bg-muted p-2 rounded-md overflow-x-auto">{result.actualOutput}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
