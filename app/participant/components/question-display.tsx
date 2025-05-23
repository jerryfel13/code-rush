"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Question } from "../types/question"

interface QuestionDisplayProps {
  question: Question
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{question.title}</CardTitle>
            <CardDescription>
              Difficulty: <Badge variant="outline">{question.difficulty}</Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="problem">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="problem">Problem</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="constraints">Constraints</TabsTrigger>
          </TabsList>

          <TabsContent value="problem" className="space-y-4 mt-4">
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: question.description }} />
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4 mt-4">
            {question.examples.map((example, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">Example {index + 1}:</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-mono text-sm">
                    <strong>Input:</strong> {example.input}
                  </p>
                  <p className="font-mono text-sm">
                    <strong>Output:</strong> {example.output}
                  </p>
                  {example.explanation && (
                    <p className="text-sm mt-2">
                      <strong>Explanation:</strong> {example.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="constraints" className="space-y-4 mt-4">
            <div className="prose dark:prose-invert max-w-none">
              <ul className="list-disc pl-5 space-y-1">
                {question.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
