import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, FileArchive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './QuizModals.css';

// --- Base Modal Component ---
const Modal = ({ children, title, className = '' }) => (
  <div className="modal-overlay">
    <div className={`modal-content ${className}`}>
      {title && <h3 className="modal-title">{title}</h3>}
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

// --- 1. Screen Access Modal ---
export const ScreenAccessModal = ({ onAllow, onDeny }) => {
  const { t } = useTranslation();
  const [showInstructions, setShowInstructions] = useState(false);

  if (showInstructions) {
    return <InstructionsModal onStartQuiz={onAllow} onCancel={onDeny} />;
  }

  return (
    <Modal>
      <Monitor size={50} className="access-icon" />
      <h2 className="modal-sub-title">
        {t('quiz_modals.screen_access_title')}
      </h2>

      <p className="access-subtitle">
        {t('quiz_modals.screen_access_desc')}
      </p>

      <div className="screen-access-buttons">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowInstructions(true)}
        >
          {t('quiz_modals.allow')}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onDeny}
        >
          {t('quiz_modals.deny')}
        </button>
      </div>
    </Modal>
  );
};

// --- 2. Instructions Modal ---
const InstructionsModal = ({ onStartQuiz, onCancel }) => {
  const { t } = useTranslation();

  return (
    <Modal title={t('quiz_modals.instructions_title')}>
      <div className="instructions-wrapper">
        <ol className="instructions-list">
          <li>{t('quiz_modals.instruction_1')}</li>
          <li>{t('quiz_modals.instruction_2')}</li>
          <li>{t('quiz_modals.instruction_3')}</li>
          <li>{t('quiz_modals.instruction_4')}</li>
          <li>{t('quiz_modals.instruction_5')}</li>
        </ol>

        <div className="instructions-modal-buttons">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onStartQuiz}
          >
            {t('quiz_modals.start_quiz')}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {t('quiz_modals.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// --- 3. Submit Confirmation Modal ---
export const SubmitConfirmationModal = ({ onConfirmSubmit, onCancel }) => {
  const { t } = useTranslation();

  return (
    <Modal className="confirmation-content">
      <FileArchive size={50} className="confirmation-icon" />
      <h2 className="modal-sub-title">
        {t('quiz_modals.submit_title')}
      </h2>

      <p className="submit-prompt">
        {t('quiz_modals.submit_confirm')}
      </p>

      <div className="modal-buttons">
        <button
          type="button"
          className="btn-submit"
          onClick={onConfirmSubmit}
        >
          {t('quiz_modals.submit')}
        </button>

        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
        >
          {t('quiz_modals.cancel')}
        </button>
      </div>
    </Modal>
  );
};

// --- 4. Quiz Result Modal ---
export const QuizResultModal = ({ score, total, onReview, onExit }) => {
  const { t } = useTranslation();

  const scoreRatio = total > 0 ? score / total : 0;
  const circumference = 2 * Math.PI * 50;
  const dashoffset = circumference * (1 - scoreRatio);

  return (
    <Modal className="result-content">
      <h2 className="modal-sub-title success">
        {t('quiz_modals.quiz_submitted')}
      </h2>

      <p className="result-subtitle">
        {t('quiz_modals.quiz_submitted_desc')}
      </p>

      <div className="score-circle-container">
        <svg className="score-ring" viewBox="0 0 120 120">
          <circle className="circle-bg" cx="60" cy="60" r="50" strokeWidth="10" />
          <circle
            className="circle-progress"
            cx="60"
            cy="60"
            r="50"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
          />
        </svg>
        <div className="circle-text">
          {score}/{total}
        </div>
      </div>

      <div className="result-buttons">
        <button
          type="button"
          className="btn-review"
          onClick={onReview}
        >
          {t('quiz_modals.review_answers')}
        </button>

        <button
          type="button"
          className="btn-cancel"
          onClick={onExit}
        >
          {t('quiz_modals.exit')}
        </button>
      </div>
    </Modal>
  );
};

// --- 5. Time Up Modal ---
export const TimeUpModal = ({ countdown }) => {
  const { t } = useTranslation();

  return (
    <Modal className="confirmation-content">
      <FileArchive size={50} className="confirmation-icon" />
      <h2 className="modal-sub-title">
        {t('quiz_modals.time_up')}
      </h2>

      <p className="submit-prompt">
        {t('quiz_modals.time_up_desc', { countdown })}
      </p>
    </Modal>
  );
};
