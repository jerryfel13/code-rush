"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CodeEditorProps {
  code: string
  language: string
  onCodeChange: (code: string) => void
  onLanguageChange: (language: string) => void
}

export function CodeEditor({ code, language, onCodeChange, onLanguageChange }: CodeEditorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Code Editor</CardTitle>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="font-mono min-h-[300px] resize-none"
          placeholder={getPlaceholderCode(language)}
        />
      </CardContent>
    </Card>
  )
}

function getPlaceholderCode(language: string): string {
  switch (language) {
    case "javascript":
      return `// Write your JavaScript solution here
function solution(input) {
  // Your code here
  return output;
}`
    case "python":
      return `# Write your Python solution here
def solution(input):
    # Your code here
    return output`
    case "java":
      return `// Write your Java solution here
public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
    
    public static String solution(String input) {
        // Your code here
        return output;
    }
}`
    case "cpp":
      return `// Write your C++ solution here
#include <iostream>
#include <string>

std::string solution(std::string input) {
    // Your code here
    return output;
}

int main() {
    // Your code here
    return 0;
}`
    case "csharp":
      return `// Write your C# solution here
using System;

public class Solution {
    public static void Main() {
        // Your code here
    }
    
    public static string Solution(string input) {
        // Your code here
        return output;
    }
}`
    default:
      return "// Write your solution here"
  }
}
