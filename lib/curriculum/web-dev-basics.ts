import { Curriculum } from '@/types/curriculum'

export const webDevBasicsCurriculum: Curriculum = {
  id: 'web-dev-basics',
  title: 'Web Development Fundamentals',
  description: 'Learn the essential building blocks of web development with ADHD-friendly micro-lessons',
  level: 'beginner',
  estimatedHours: 20,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  modules: [
    {
      id: 'html-basics',
      title: 'HTML Foundations',
      description: 'Understanding the structure of web pages',
      order: 1,
      estimatedMinutes: 120,
      lessons: [
        {
          id: 'html-intro',
          moduleId: 'html-basics',
          title: 'What is HTML?',
          description: 'Your first steps into web development',
          order: 1,
          estimatedMinutes: 15,
          objectives: [
            'Understand what HTML is and why it matters',
            'Recognize HTML in everyday websites',
            'Feel confident about starting your web journey'
          ],
          content: {
            introduction: "Let's start with something you already know - every website you've ever visited is built with HTML. Think of HTML as the skeleton of a website - it gives structure to everything you see!",
            sections: [
              {
                id: 'what-is-html',
                type: 'text',
                title: 'HTML in Real Life',
                content: "HTML stands for HyperText Markup Language. Don't let the fancy name scare you! It's just a way to tell browsers (like Chrome or Safari) what to display. Think of it like giving directions to a friend - you're telling the browser exactly what goes where."
              },
              {
                id: 'html-example',
                type: 'example',
                title: 'See It In Action',
                content: `<h1>Hello, World!</h1>
<p>This is my first webpage.</p>

This simple code creates:
- A big heading that says "Hello, World!"
- A paragraph with your message

That's it! You just learned HTML!`
              },
              {
                id: 'try-it',
                type: 'interactive',
                title: 'Your Turn!',
                content: 'Type your name in the box below and see it become a webpage heading!',
                interactionType: 'code'
              }
            ],
            summary: 'HTML is the foundation of every website. It tells browsers what content to display and how to structure it. You've just taken your first step into web development!',
            keyTakeaways: [
              'HTML structures web content',
              'It uses simple tags like <h1> and <p>',
              'Every website uses HTML',
              'You can start creating right away!'
            ]
          },
          activities: [
            {
              id: 'html-quiz-1',
              type: 'quiz',
              title: 'Quick Check',
              instructions: 'Let\'s make sure you\'ve got the basics!',
              questions: [
                {
                  id: 'q1',
                  text: 'What does HTML help us do?',
                  type: 'multiple-choice',
                  options: [
                    'Make coffee',
                    'Structure web content',
                    'Send emails',
                    'Play games'
                  ],
                  correctAnswer: 'Structure web content',
                  explanation: 'HTML gives structure to web content - it tells the browser what to display and how to organize it!'
                }
              ]
            }
          ]
        },
        {
          id: 'first-webpage',
          moduleId: 'html-basics',
          title: 'Creating Your First Webpage',
          description: 'Let\'s build something real!',
          order: 2,
          estimatedMinutes: 20,
          objectives: [
            'Create a complete HTML page',
            'Understand basic HTML structure',
            'Feel proud of your first creation!'
          ],
          content: {
            introduction: "Ready to create your very first webpage? In just 20 minutes, you'll have something you built yourself running in your browser!",
            sections: [
              {
                id: 'html-structure',
                type: 'text',
                title: 'The Basic Recipe',
                content: `Every HTML page follows a simple recipe:

<!DOCTYPE html> - Tells the browser "Hey, this is HTML!"
<html> - The container for everything
<head> - Information about your page (like its title)
<body> - What people actually see

Think of it like a letter:
- DOCTYPE is the envelope
- Head is the address and stamp
- Body is the actual message`
              },
              {
                id: 'complete-example',
                type: 'example',
                title: 'Your First Complete Page',
                content: `<!DOCTYPE html>
<html>
<head>
    <title>My Awesome Page</title>
</head>
<body>
    <h1>Welcome to My Website!</h1>
    <p>I'm learning HTML and it's actually fun!</p>
</body>
</html>`
              },
              {
                id: 'build-together',
                type: 'interactive',
                title: 'Build It Together',
                content: 'Let\'s create your personal webpage step by step. We\'ll add your name, a fun fact about you, and your favorite color!',
                interactionType: 'code'
              }
            ],
            summary: 'You just created your first complete webpage! You now know the essential structure that every single website on the internet uses.',
            keyTakeaways: [
              'Every HTML page needs DOCTYPE, html, head, and body',
              'The head contains page information',
              'The body contains visible content',
              'You can create websites now!'
            ]
          },
          activities: [
            {
              id: 'webpage-project',
              type: 'project',
              title: 'Make It Yours',
              instructions: 'Customize your webpage with 3 things about yourself',
              rubric: [
                'Added your name as the main heading',
                'Included at least one paragraph about yourself',
                'Changed the page title to something personal'
              ]
            }
          ],
          assessment: {
            id: 'html-basics-check',
            type: 'formative',
            passingScore: 70,
            questions: [
              {
                id: 'a1',
                text: 'Where does visible content go in an HTML page?',
                type: 'multiple-choice',
                options: ['<head>', '<body>', '<html>', '<title>'],
                correctAnswer: '<body>',
                explanation: 'The <body> tag contains everything users see on the webpage!'
              },
              {
                id: 'a2',
                text: 'What tag creates a paragraph?',
                type: 'short-answer',
                correctAnswer: ['<p>', 'p', '<p></p>'],
                hints: ['It starts with the letter p...']
              }
            ],
            feedback: {
              pass: 'Excellent work! You\'re ready to move on to more HTML elements!',
              fail: 'No worries! Let\'s review the basics once more. Every expert was once a beginner!'
            }
          }
        }
      ]
    },
    {
      id: 'css-basics',
      title: 'CSS Styling',
      description: 'Making your websites beautiful',
      order: 2,
      estimatedMinutes: 150,
      prerequisites: ['html-basics'],
      lessons: [
        {
          id: 'css-intro',
          moduleId: 'css-basics',
          title: 'Introduction to CSS',
          description: 'Adding style to your HTML',
          order: 1,
          estimatedMinutes: 20,
          objectives: [
            'Understand what CSS does',
            'Write your first CSS rule',
            'See immediate visual results'
          ],
          content: {
            introduction: "Remember how HTML is the skeleton? CSS is the clothing, makeup, and accessories! It makes your websites look amazing.",
            sections: [
              {
                id: 'what-is-css',
                type: 'text',
                title: 'CSS = Colors, Sizes, and Styles',
                content: `CSS (Cascading Style Sheets) controls how your HTML looks:
                
- Colors (text, backgrounds, borders)
- Sizes (big text, small text, spacing)
- Layout (where things appear)
- Effects (shadows, animations, hover states)

Without CSS, the web would be very boring!`
              },
              {
                id: 'css-syntax',
                type: 'example',
                title: 'Your First Style',
                content: `h1 {
    color: blue;
    font-size: 48px;
}

This CSS rule:
1. Targets all <h1> headings
2. Makes them blue
3. Makes them 48 pixels tall

It's like saying: "Hey, all main headings, wear blue and be this tall!"`
              },
              {
                id: 'try-css',
                type: 'interactive',
                title: 'Color Your World',
                content: 'Pick your favorite color and watch the heading change!',
                interactionType: 'code'
              }
            ],
            summary: 'CSS brings your HTML to life with colors, sizes, and styles. You can transform plain text into beautiful designs!',
            keyTakeaways: [
              'CSS controls appearance',
              'Rules have selectors and properties',
              'Small changes make big differences',
              'CSS makes websites beautiful'
            ]
          },
          activities: [
            {
              id: 'color-explorer',
              type: 'practice',
              title: 'Color Explorer',
              instructions: 'Try different color combinations and find your favorite palette'
            }
          ]
        }
      ]
    }
  ]
}