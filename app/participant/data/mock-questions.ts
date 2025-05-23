import type { Question } from "../types/question"

export const mockQuestions: Record<string, Question[]> = {
  easy: [
    {
      id: "easy-1",
      title: "Two Sum",
      description: `
        <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
        <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
        <p>You can return the answer in any order.</p>
      `,
      difficulty: "Easy",
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
        },
        {
          input: "nums = [3,2,4], target = 6",
          output: "[1,2]",
        },
        {
          input: "nums = [3,3], target = 6",
          output: "[0,1]",
        },
      ],
      constraints: [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Only one valid answer exists.",
      ],
      testCases: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
        },
        {
          input: "nums = [3,2,4], target = 6",
          output: "[1,2]",
        },
        {
          input: "nums = [3,3], target = 6",
          output: "[0,1]",
        },
        {
          input: "nums = [1,2,3,4,5], target = 9",
          output: "[3,4]",
        },
      ],
    },
    {
      id: "easy-2",
      title: "Valid Parentheses",
      description: `
        <p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p>
        <p>An input string is valid if:</p>
        <ol>
          <li>Open brackets must be closed by the same type of brackets.</li>
          <li>Open brackets must be closed in the correct order.</li>
          <li>Every close bracket has a corresponding open bracket of the same type.</li>
        </ol>
      `,
      difficulty: "Easy",
      examples: [
        {
          input: 's = "()"',
          output: "true",
        },
        {
          input: 's = "()[]{}"',
          output: "true",
        },
        {
          input: 's = "(]"',
          output: "false",
        },
      ],
      constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
      testCases: [
        {
          input: 's = "()"',
          output: "true",
        },
        {
          input: 's = "()[]{}"',
          output: "true",
        },
        {
          input: 's = "(]"',
          output: "false",
        },
        {
          input: 's = "([)]"',
          output: "false",
        },
        {
          input: 's = "{[]}"',
          output: "true",
        },
      ],
    },
    {
      id: "easy-3",
      title: "Reverse String",
      description: `
        <p>Write a function that reverses a string. The input string is given as an array of characters <code>s</code>.</p>
        <p>You must do this by modifying the input array in-place with O(1) extra memory.</p>
      `,
      difficulty: "Easy",
      examples: [
        {
          input: 's = ["h","e","l","l","o"]',
          output: '["o","l","l","e","h"]',
        },
        {
          input: 's = ["H","a","n","n","a","h"]',
          output: '["h","a","n","n","a","H"]',
        },
      ],
      constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
      testCases: [
        {
          input: 's = ["h","e","l","l","o"]',
          output: '["o","l","l","e","h"]',
        },
        {
          input: 's = ["H","a","n","n","a","h"]',
          output: '["h","a","n","n","a","H"]',
        },
        {
          input: 's = ["a"]',
          output: '["a"]',
        },
        {
          input: 's = ["a","b","c","d"]',
          output: '["d","c","b","a"]',
        },
      ],
    },
  ],
  medium: [
    {
      id: "medium-1",
      title: "Add Two Numbers",
      description: `
        <p>You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.</p>
        <p>You may assume the two numbers do not contain any leading zero, except the number 0 itself.</p>
      `,
      difficulty: "Medium",
      examples: [
        {
          input: "l1 = [2,4,3], l2 = [5,6,4]",
          output: "[7,0,8]",
          explanation: "342 + 465 = 807.",
        },
        {
          input: "l1 = [0], l2 = [0]",
          output: "[0]",
        },
        {
          input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]",
          output: "[8,9,9,9,0,0,0,1]",
        },
      ],
      constraints: [
        "The number of nodes in each linked list is in the range [1, 100].",
        "0 <= Node.val <= 9",
        "It is guaranteed that the list represents a number that does not have leading zeros.",
      ],
      testCases: [
        {
          input: "l1 = [2,4,3], l2 = [5,6,4]",
          output: "[7,0,8]",
        },
        {
          input: "l1 = [0], l2 = [0]",
          output: "[0]",
        },
        {
          input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]",
          output: "[8,9,9,9,0,0,0,1]",
        },
      ],
    },
    {
      id: "medium-2",
      title: "Longest Substring Without Repeating Characters",
      description: `
        <p>Given a string <code>s</code>, find the length of the longest substring without repeating characters.</p>
      `,
      difficulty: "Medium",
      examples: [
        {
          input: 's = "abcabcbb"',
          output: "3",
          explanation: 'The answer is "abc", with the length of 3.',
        },
        {
          input: 's = "bbbbb"',
          output: "1",
          explanation: 'The answer is "b", with the length of 1.',
        },
        {
          input: 's = "pwwkew"',
          output: "3",
          explanation:
            'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.',
        },
      ],
      constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
      testCases: [
        {
          input: 's = "abcabcbb"',
          output: "3",
        },
        {
          input: 's = "bbbbb"',
          output: "1",
        },
        {
          input: 's = "pwwkew"',
          output: "3",
        },
        {
          input: 's = ""',
          output: "0",
        },
        {
          input: 's = "aab"',
          output: "2",
        },
      ],
    },
    {
      id: "medium-3",
      title: "3Sum",
      description: `
        <p>Given an integer array nums, return all the triplets <code>[nums[i], nums[j], nums[k]]</code> such that <code>i != j</code>, <code>i != k</code>, and <code>j != k</code>, and <code>nums[i] + nums[j] + nums[k] == 0</code>.</p>
        <p>Notice that the solution set must not contain duplicate triplets.</p>
      `,
      difficulty: "Medium",
      examples: [
        {
          input: "nums = [-1,0,1,2,-1,-4]",
          output: "[[-1,-1,2],[-1,0,1]]",
          explanation:
            "The distinct triplets are [-1,0,1] and [-1,-1,2]. Notice that the order of the output and the order of the triplets does not matter.",
        },
        {
          input: "nums = []",
          output: "[]",
        },
        {
          input: "nums = [0]",
          output: "[]",
        },
      ],
      constraints: ["0 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
      testCases: [
        {
          input: "nums = [-1,0,1,2,-1,-4]",
          output: "[[-1,-1,2],[-1,0,1]]",
        },
        {
          input: "nums = []",
          output: "[]",
        },
        {
          input: "nums = [0]",
          output: "[]",
        },
        {
          input: "nums = [0,0,0]",
          output: "[[0,0,0]]",
        },
      ],
    },
  ],
  hard: [
    {
      id: "hard-1",
      title: "Median of Two Sorted Arrays",
      description: `
        <p>Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return the median of the two sorted arrays.</p>
        <p>The overall run time complexity should be O(log (m+n)).</p>
      `,
      difficulty: "Hard",
      examples: [
        {
          input: "nums1 = [1,3], nums2 = [2]",
          output: "2.00000",
          explanation: "merged array = [1,2,3] and median is 2.",
        },
        {
          input: "nums1 = [1,2], nums2 = [3,4]",
          output: "2.50000",
          explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.",
        },
      ],
      constraints: [
        "nums1.length == m",
        "nums2.length == n",
        "0 <= m <= 1000",
        "0 <= n <= 1000",
        "1 <= m + n <= 2000",
        "-10^6 <= nums1[i], nums2[i] <= 10^6",
      ],
      testCases: [
        {
          input: "nums1 = [1,3], nums2 = [2]",
          output: "2.00000",
        },
        {
          input: "nums1 = [1,2], nums2 = [3,4]",
          output: "2.50000",
        },
        {
          input: "nums1 = [0,0], nums2 = [0,0]",
          output: "0.00000",
        },
        {
          input: "nums1 = [], nums2 = [1]",
          output: "1.00000",
        },
      ],
    },
    {
      id: "hard-2",
      title: "Regular Expression Matching",
      description: `
        <p>Given an input string <code>s</code> and a pattern <code>p</code>, implement regular expression matching with support for <code>'.'</code> and <code>'*'</code> where:</p>
        <ul>
          <li><code>'.'</code> Matches any single character.</li>
          <li><code>'*'</code> Matches zero or more of the preceding element.</li>
        </ul>
        <p>The matching should cover the entire input string (not partial).</p>
      `,
      difficulty: "Hard",
      examples: [
        {
          input: 's = "aa", p = "a"',
          output: "false",
          explanation: '"a" does not match the entire string "aa".',
        },
        {
          input: 's = "aa", p = "a*"',
          output: "true",
          explanation:
            "\"a*\" means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes \"aa\".",
        },
        {
          input: 's = "ab", p = ".*"',
          output: "true",
          explanation: '".*" means zero or more (*) of any character (.).',
        },
      ],
      constraints: [
        "1 <= s.length <= 20",
        "1 <= p.length <= 30",
        "s contains only lowercase English letters.",
        "p contains only lowercase English letters, '.', and '*'.",
        "It is guaranteed for each appearance of the character '*', there will be a previous valid character to match.",
      ],
      testCases: [
        {
          input: 's = "aa", p = "a"',
          output: "false",
        },
        {
          input: 's = "aa", p = "a*"',
          output: "true",
        },
        {
          input: 's = "ab", p = ".*"',
          output: "true",
        },
        {
          input: 's = "aab", p = "c*a*b"',
          output: "true",
        },
        {
          input: 's = "mississippi", p = "mis*is*p*."',
          output: "false",
        },
      ],
    },
    {
      id: "hard-3",
      title: "Merge k Sorted Lists",
      description: `
        <p>You are given an array of <code>k</code> linked-lists <code>lists</code>, each linked-list is sorted in ascending order.</p>
        <p>Merge all the linked-lists into one sorted linked-list and return it.</p>
      `,
      difficulty: "Hard",
      examples: [
        {
          input: "lists = [[1,4,5],[1,3,4],[2,6]]",
          output: "[1,1,2,3,4,4,5,6]",
          explanation:
            "The linked-lists are: [1->4->5, 1->3->4, 2->6]. Merging them into one sorted list: 1->1->2->3->4->4->5->6",
        },
        {
          input: "lists = []",
          output: "[]",
        },
        {
          input: "lists = [[]]",
          output: "[]",
        },
      ],
      constraints: [
        "k == lists.length",
        "0 <= k <= 10^4",
        "0 <= lists[i].length <= 500",
        "-10^4 <= lists[i][j] <= 10^4",
        "lists[i] is sorted in ascending order.",
        "The sum of lists[i].length won't exceed 10^4.",
      ],
      testCases: [
        {
          input: "lists = [[1,4,5],[1,3,4],[2,6]]",
          output: "[1,1,2,3,4,4,5,6]",
        },
        {
          input: "lists = []",
          output: "[]",
        },
        {
          input: "lists = [[]]",
          output: "[]",
        },
        {
          input: "lists = [[1],[2],[3]]",
          output: "[1,2,3]",
        },
      ],
    },
  ],
}
