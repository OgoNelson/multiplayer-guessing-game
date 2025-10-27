import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GAME_SETTINGS } from '../utils/socketEvents';
import './QuestionForm.css';

const QuestionForm = ({ onSubmit, disabled = false }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    } else if (question.trim().length > GAME_SETTINGS.MAX_QUESTION_LENGTH) {
      newErrors.question = `Question must be ${GAME_SETTINGS.MAX_QUESTION_LENGTH} characters or less`;
    }

    if (!answer.trim()) {
      newErrors.answer = 'Answer is required';
    } else if (answer.trim().length > GAME_SETTINGS.MAX_ANSWER_LENGTH) {
      newErrors.answer = `Answer must be ${GAME_SETTINGS.MAX_ANSWER_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(question.trim(), answer.trim());
      // Clear form after successful submission
      setQuestion('');
      setAnswer('');
      setErrors({});
    }
  };

  const handleQuestionChange = (e) => {
    const value = e.target.value;
    if (value.length <= GAME_SETTINGS.MAX_QUESTION_LENGTH) {
      setQuestion(value);
      if (errors.question) {
        setErrors({ ...errors, question: '' });
      }
    }
  };

  const handleAnswerChange = (e) => {
    const value = e.target.value;
    if (value.length <= GAME_SETTINGS.MAX_ANSWER_LENGTH) {
      setAnswer(value);
      if (errors.answer) {
        setErrors({ ...errors, answer: '' });
      }
    }
  };

  return (
    <div className="question-form">
      <h3 className="form-title">Create a Question</h3>
      
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="question" className="form-label">
            Question
          </label>
          <textarea
            id="question"
            className={`form-textarea ${errors.question ? 'error' : ''}`}
            value={question}
            onChange={handleQuestionChange}
            placeholder="Enter your question here..."
            disabled={disabled}
            rows={3}
            maxLength={GAME_SETTINGS.MAX_QUESTION_LENGTH}
          />
          <div className="form-hint">
            {question.length}/{GAME_SETTINGS.MAX_QUESTION_LENGTH} characters
          </div>
          {errors.question && (
            <div className="form-error">{errors.question}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="answer" className="form-label">
            Answer
          </label>
          <input
            id="answer"
            type="text"
            className={`form-input ${errors.answer ? 'error' : ''}`}
            value={answer}
            onChange={handleAnswerChange}
            placeholder="Enter the correct answer..."
            disabled={disabled}
            maxLength={GAME_SETTINGS.MAX_ANSWER_LENGTH}
          />
          <div className="form-hint">
            {answer.length}/{GAME_SETTINGS.MAX_ANSWER_LENGTH} characters
          </div>
          {errors.answer && (
            <div className="form-error">{errors.answer}</div>
          )}
        </div>

        <button
          type="submit"
          className="form-button"
          disabled={disabled || !question.trim() || !answer.trim()}
        >
          {disabled ? 'Creating...' : 'Create Question'}
        </button>
      </form>
    </div>
  );
};

QuestionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default QuestionForm;