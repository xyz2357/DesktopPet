import React, { useState, useEffect } from 'react';
import { CardData } from '../types/card';
import './StudyCard.css';

interface StudyCardProps {
  card: CardData;
  onAnswer: (result: 'know' | 'unknown' | 'later') => void;
  onPlayTTS: (text: string) => void;
  onClose: () => void;
}

const StudyCard: React.FC<StudyCardProps> = ({ card, onAnswer, onPlayTTS, onClose }) => {
  const [showTranslation, setShowTranslation] = useState(false);

  // ESC键关闭功能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleAnswer = (result: 'know' | 'unknown' | 'later') => {
    onAnswer(result);
  };

  const handlePlayTTS = () => {
    onPlayTTS(card.jp);
  };

  // 点击overlay关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="study-card-overlay" onClick={handleOverlayClick}>
      <div className="study-card">
        <button className="study-card__close" onClick={onClose}>
          ×
        </button>
        
        <div className="study-card__header">
          <span className="study-card__type">{card.type === 'word' ? '单词' : '短句'}</span>
          <span className="study-card__level">{card.jlpt}</span>
        </div>

        <div className="study-card__content">
          <div className="study-card__japanese">
            <span className="japanese-text">{card.jp}</span>
            <button 
              className="play-button" 
              onClick={handlePlayTTS}
              title="播放发音"
            >
              🔊
            </button>
          </div>
          
          <div className="study-card__pronunciation">
            <div className="kana">{card.kana}</div>
            <div className="romaji">{card.romaji}</div>
          </div>

          <button 
            className="translation-toggle"
            onClick={() => setShowTranslation(!showTranslation)}
          >
            {showTranslation ? '隐藏翻译' : '显示翻译'}
          </button>

          {showTranslation && (
            <div className="study-card__translation">
              <div className="chinese-text">{card.cn}</div>
              {card.example_jp && (
                <div className="example">
                  <div className="example__japanese">{card.example_jp}</div>
                  <div className="example__chinese">{card.example_cn}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="study-card__actions">
          <button 
            className="action-button action-button--unknown"
            onClick={() => handleAnswer('unknown')}
          >
            😵 不会
          </button>
          <button 
            className="action-button action-button--later"
            onClick={() => handleAnswer('later')}
          >
            ⏰ 稍后
          </button>
          <button 
            className="action-button action-button--know"
            onClick={() => handleAnswer('know')}
          >
            ✅ 会了
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyCard;