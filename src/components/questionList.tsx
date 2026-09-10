import questions from "@/app/questions/question_list";
export default function QuestionsList() {
    return (
        <div>
            {questions.map((question) => (
                <div key={question.id}>
                    <p>{question.text}</p>
                    {question.responses && (
                        <ul>
                            {question.responses.map((response, index) => (
                                <li key={index}>{response}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
}