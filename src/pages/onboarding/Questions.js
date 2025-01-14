//make this shit
import React, {useState, useEffect} from "react";
import {Link, useNavigate} from 'react-router-dom';

const Questions = () => {
    const [progress, setProgress] = useState(25); // Initial progress value
    const [step, setStep] = useState(1); // Current step in onboarding

    const navigate = useNavigate();

    const questions = [
        {
            id: 1,
            title: "Tell Us About Your Cooking Goals",
            options: ["Eat Healthy", "Save Money", "Plan Better", "Learn How to Cook"],
        },
        {
            id: 2,
            title: "How Cooked Are You?",
            options: ["Beginner", "Average", "Intermediate", "Expert"],
        },
        {
            id: 3,
            title: "Tell Us About Your Diet Type",
            options: ["Low Carb", "Vegetarian", "Vegan", "Pescatarian", "Keto", "Halal"],
        },
        {
            id: 4,
            title: "Do You Have Any Dietary Restrictions?",
            options: ["Vegan", "Vegetarian", "Gluten-Free", "None"],
        },
    ];

    // Handle button click
    const handleOptionClick = (option) => {
        console.log(`Selected Option: ${option}`);
        if (step < questions.length) {
            setStep(step + 1);
            setProgress(((step + 1) / questions.length) * 100); // Update progress
        }
    };

    const handleBack = () => {
        if (step > 1){
            setStep(step-1)
            setProgress(((step-1) / questions.length) * 100);
        }
    }

    const handleSkip = () => {
        setStep(questions.length); // Jump to the last question
        setProgress(100); // Set progress to 100%
    };

    return (
        <div className="w-full max-w-md mx-auto font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={handleBack} // Go back to the previous question
                    className={`text-lg ${step === 1 ? "text-gray-300" : "text-gray-500"} cursor-pointer`}
                    disabled={step === 1} // Disable the button on the first step
                >
                    &larr;
                </button>
                <div className="flex-1 h-2 bg-gray-200 rounded mx-4 relative">
                    <div
                        className="h-full bg-green-500 rounded transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <button
                    onClick={handleSkip} // Skip to the last question
                    className="text-gray-500 text-sm font-medium"
                >
                    Skip
                </button>
            </div>

            {/* Content */}
            <div className="text-center px-4">
                {questions[step - 1] && (
                    <>
                        <h2 className="text-xl font-bold mb-6">
                            {questions[step - 1].title}
                        </h2>
                        <div className="space-y-4">
                            {questions[step - 1].options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleOptionClick(option)}
                                    className="w-full py-3 border-2 border-green-500 rounded-full text-green-500 font-semibold hover:bg-green-500 hover:text-white transition"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
            {step === questions.length ? (
                <div className="p-4">
                    <button
                        onClick={() => navigate("/home")}// Navigate to the Finish page
                        className="w-full py-3 bg-green-500 text-white rounded-full font-semibold hover:opacity-90 transition"
                    >
                        Finish
                    </button>
                </div>
            ) : (
                <div className="p-4">
                    <button
                        onClick={() => {
                            setStep(step + 1);
                            setProgress(((step + 1) / questions.length) * 100);
                        }}
                        className="w-full py-3 bg-green-500 text-white rounded-full font-semibold hover:opacity-90 transition"
                    >
                        Continue
                    </button>
                </div>
            )}
        </div>
    );
};

export default Questions;