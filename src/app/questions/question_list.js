const questionList = [
  {
    type: "text",
    id: 1,
    text: "What career role are you currently aiming for?"

  },
  {
    type: "multiple-choice-ordered",
    id: 2,
    text: "How would you describe your current experience level in this field?",
    responses: [
      {text: "Beginner (little to no experience)"},
      {text: "Intermediate (some coursework/projects)"},
      {text: "Advanced (professional or extensive project experience)"}
    ]
  },
  {
    type: "multiple-choice-ordered",
    id: 3,
    text: "How many hours per week can you dedicate to learning?",
    responses: [
      {text: "Less than 5 hours"},
      {text: "5-10 hours"},
      {text: "10-20 hours"},
      {text: "More than 20 hours"}
    ]
  },
  {
    type: "multiple-choice-ordered",
    id: 4,
    text: "What is your target timeline to reach your goal?",
    responses: [
      {text: "Less than 3 months"},
      {text: "3-6 months"},
      {text: "6-12 months"},
      {text: "More than a year"},
      {text: "I'm not sure yet"}
    ]
  },
  {
    type: "multiple-choice-unordered",
    id: 5,
    text: "Which of these is most important in your learning journey? (Select all that apply)",
    responses: [
      {text: "Structured curriculum"},
      {text: "Hands-on projects"},
      {text: "Mentorship and guidance"},
      {text: "Community support"},
      {text: "Flexibility to learn at my own pace"},
      {text: "Building strong foundational knowledge"},
      {text: "Networking opportunities"},
      {text: "Access to industry insights and trends"},
      {text: "Exploring multiple areas before specializing"}
    ]
  }
];
export default questionList;