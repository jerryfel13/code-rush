export interface Example {
  input: string
  output: string
  explanation?: string
}

export interface TestCase {
  input: string
  output: string
}

export interface Question {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  examples: Example[]
  constraints: string[]
  testCases: TestCase[]
}
