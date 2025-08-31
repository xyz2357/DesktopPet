import React, { useState, useEffect, useRef } from 'react';
import { CardData } from '../types/card';
import './StudyCard.css';

interface StudyCardProps {
  card: CardData;
  onAnswer: (result: 'know' | 'unknown' | 'later') => void;
  onPlayTTS: (text: string) => void;
  onClose: () => void;
}

// 新增：音频卡选择题的答案接口
interface AudioCardAnswer {
  isCorrect: boolean;
  selectedChoice: string;
}

const StudyCard: React.FC<StudyCardProps> = ({ card, onAnswer, onPlayTTS, onClose }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [tooltip, setTooltip] = useState<{show: boolean, content: string, x: number, y: number}>({
    show: false,
    content: '',
    x: 0,
    y: 0
  });
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [arrangeResult, setArrangeResult] = useState<{show: boolean, isCorrect: boolean}>({
    show: false,
    isCorrect: false
  });

  // 定时器引用，用于清理
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);
  const arrangeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取卡片类型的中文名称
  const getCardTypeName = (type: string) => {
    switch (type) {
      case 'word': return '单词';
      case 'sentence': return '短句';
      case 'example': return '例句';
      case 'grammar': return '语法';
      case 'image': return '图片';
      case 'audio': return '音频';
      case 'arrange': return '排句';
      default: return '未知';
    }
  };

  // 初始化拖拽拼句
  useEffect(() => {
    if (card.type === 'arrange' && card.words_to_arrange) {
      // 打乱顺序
      const shuffled = [...card.words_to_arrange];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setArrangedWords(shuffled);
    }
  }, [card]);

  // 清理定时器的effect
  useEffect(() => {
    return () => {
      // 组件卸载时清理所有定时器
      if (audioTimerRef.current) {
        clearTimeout(audioTimerRef.current);
        audioTimerRef.current = null;
      }
      if (arrangeTimerRef.current) {
        clearTimeout(arrangeTimerRef.current);
        arrangeTimerRef.current = null;
      }
    };
  }, []);

  // 卡片变化时也清理定时器
  useEffect(() => {
    // 清理上一张卡片的定时器
    if (audioTimerRef.current) {
      clearTimeout(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    if (arrangeTimerRef.current) {
      clearTimeout(arrangeTimerRef.current);
      arrangeTimerRef.current = null;
    }
    
    // 重置状态
    setSelectedChoice(null);
    setShowResult(false);
    setArrangeResult({ show: false, isCorrect: false });
  }, [card.id]); // 使用card.id作为依赖，确保每次卡片切换都清理

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
    // 用户手动操作时清理所有定时器
    if (audioTimerRef.current) {
      clearTimeout(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    if (arrangeTimerRef.current) {
      clearTimeout(arrangeTimerRef.current);
      arrangeTimerRef.current = null;
    }
    
    onAnswer(result);
  };

  const handlePlayTTS = () => {
    onPlayTTS(card.jp);
  };

  // 处理选择题选择
  const handleChoiceSelect = (choice: string) => {
    if (showResult) return;
    setSelectedChoice(choice);
    setShowResult(true);
    
    // 清理之前的定时器
    if (audioTimerRef.current) {
      clearTimeout(audioTimerRef.current);
    }
    
    // 1.5秒后自动提交答案
    audioTimerRef.current = setTimeout(() => {
      const isCorrect = card.type === 'audio' && choice === card.correct_answer;
      onAnswer(isCorrect ? 'know' : 'unknown');
      audioTimerRef.current = null; // 清理引用
    }, 1500);
  };

  // 处理鼠标悬停显示提示
  const handleMouseEnter = (e: React.MouseEvent, content: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      content,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setTooltip({show: false, content: '', x: 0, y: 0});
  };

  // 拖拽相关处理函数
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;
    
    const newWords = [...arrangedWords];
    const draggedWord = newWords[draggedIndex];
    
    // 移除拖拽的元素
    newWords.splice(draggedIndex, 1);
    // 在新位置插入
    newWords.splice(dropIndex, 0, draggedWord);
    
    setArrangedWords(newWords);
    setDraggedIndex(null);
  };

  const handleCheckArrangement = () => {
    if (card.type !== 'arrange') return;
    
    const correctSequence = card.correct_order.map((index: number) => card.words_to_arrange[index]);
    const isCorrect = JSON.stringify(arrangedWords) === JSON.stringify(correctSequence);
    
    setArrangeResult({ show: true, isCorrect });
    
    // 清理之前的定时器
    if (arrangeTimerRef.current) {
      clearTimeout(arrangeTimerRef.current);
    }
    
    // 2秒后自动提交答案
    arrangeTimerRef.current = setTimeout(() => {
      onAnswer(isCorrect ? 'know' : 'unknown');
      arrangeTimerRef.current = null; // 清理引用
    }, 2000);
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
          <span className="study-card__type">{getCardTypeName(card.type)}</span>
          <span className="study-card__level">{card.jlpt}</span>
        </div>

        <div className="study-card__content">
          {/* 语法卡特殊布局 */}
          {card.type === 'grammar' && (
            <>
              <div className="study-card__grammar">
                <div className="grammar-pattern">{card.grammar_pattern}</div>
                <div 
                  className="grammar-title tooltip-trigger"
                  onMouseEnter={(e) => handleMouseEnter(e, card.cn)}
                  onMouseLeave={handleMouseLeave}
                >
                  {card.jp}
                </div>
                <div className="grammar-meaning">{card.cn}</div>
                {card.grammar_explanation && (
                  <div className="grammar-explanation">{card.grammar_explanation}</div>
                )}
              </div>
              {card.example_jp && (
                <div className="example">
                  <div className="example__japanese">{card.example_jp}</div>
                  <div className="example__chinese">{card.example_cn}</div>
                </div>
              )}
            </>
          )}

          {/* 图片卡特殊布局 */}
          {card.type === 'image' && (
            <>
              <div className="study-card__image">
                <div className="image-placeholder">
                  📷 {card.image_path?.split('/').pop()?.replace('.empty', '')}
                </div>
              </div>
              <div className="study-card__japanese">
                <span 
                  className="japanese-text tooltip-trigger"
                  onMouseEnter={(e) => handleMouseEnter(e, card.kana ? `${card.kana} / ${card.cn}` : card.cn)}
                  onMouseLeave={handleMouseLeave}
                >
                  {card.jp}
                </span>
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
              <div className="chinese-text">{card.cn}</div>
            </>
          )}

          {/* 音频卡特殊布局 */}
          {card.type === 'audio' && (
            <>
              <div className="study-card__audio">
                <div className="audio-title">{card.jp}</div>
                <div className="audio-subtitle">{card.cn}</div>
                <button 
                  className="audio-play-button" 
                  onClick={handlePlayTTS}
                  title="播放音频"
                >
                  🎵 播放音频
                </button>
                <div className="audio-placeholder">
                  🎵 {card.audio_path?.split('/').pop()?.replace('.empty', '')}
                </div>
              </div>
              
              {card.choices && (
                <div className="study-card__choices">
                  <div className="choices-title">请选择正确的发音：</div>
                  <div className="choices-grid">
                    {card.choices.map((choice, index) => (
                      <button
                        key={index}
                        className={`choice-button ${
                          selectedChoice === choice ? 'selected' : ''
                        } ${
                          showResult && choice === card.correct_answer ? 'correct' : ''
                        } ${
                          showResult && selectedChoice === choice && choice !== card.correct_answer ? 'incorrect' : ''
                        }`}
                        onClick={() => handleChoiceSelect(choice)}
                        disabled={showResult}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                  {showResult && (
                    <div className="result-message">
                      {selectedChoice === card.correct_answer ? 
                        '🎉 正确！' : 
                        `❌ 错误。正确答案是：${card.correct_answer}`
                      }
                    </div>
                  )}
                </div>
              )}

              {card.example_jp && (
                <div className="example">
                  <div className="example-title">例句：</div>
                  <div className="example__japanese">{card.example_jp}</div>
                  <div className="example__chinese">{card.example_cn}</div>
                </div>
              )}
            </>
          )}

          {/* 拖拽拼句卡特殊布局 */}
          {card.type === 'arrange' && (
            <>
              <div className="study-card__arrange">
                <div className="arrange-title">请将下面的词汇拖拽到正确位置：</div>
                <div className="arrange-target">
                  <div className="arrange-chinese">{card.cn}</div>
                </div>
                
                <div className="arrange-words">
                  {arrangedWords.map((word, index) => (
                    <div
                      key={index}
                      className={`arrange-word ${draggedIndex === index ? 'dragging' : ''}`}
                      draggable={!arrangeResult.show}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      {word}
                    </div>
                  ))}
                </div>

                <div className="arrange-sentence">
                  {arrangedWords.join('')}
                </div>

                {arrangeResult.show && (
                  <div className="arrange-result">
                    {arrangeResult.isCorrect ? 
                      '🎉 正确！' : 
                      `❌ 错误。正确答案：${card.jp}`
                    }
                  </div>
                )}

                {!arrangeResult.show && (
                  <button 
                    className="check-arrangement-button"
                    onClick={handleCheckArrangement}
                  >
                    检查答案
                  </button>
                )}
              </div>
            </>
          )}

          {/* 普通卡片（单词、句子、例句）布局 */}
          {(card.type === 'word' || card.type === 'sentence' || card.type === 'example') && (
            <>
              <div className="study-card__japanese">
                <span 
                  className="japanese-text tooltip-trigger"
                  onMouseEnter={(e) => handleMouseEnter(e, card.kana ? `${card.kana} / ${card.cn}` : card.cn)}
                  onMouseLeave={handleMouseLeave}
                >
                  {card.jp}
                </span>
                <button 
                  className="play-button" 
                  onClick={handlePlayTTS}
                  title="播放发音"
                >
                  🔊
                </button>
              </div>
              
              {(card.kana || card.romaji) && (
                <div className="study-card__pronunciation">
                  {card.kana && <div className="kana">{card.kana}</div>}
                  {card.romaji && <div className="romaji">{card.romaji}</div>}
                </div>
              )}

              <button 
                className="translation-toggle"
                onClick={() => setShowTranslation(!showTranslation)}
              >
                {showTranslation ? '隐藏翻译' : '显示翻译'}
              </button>

              {showTranslation && (
                <div className="study-card__translation">
                  <div className="chinese-text">{card.cn}</div>
                  {card.example_jp && card.type !== 'example' && (
                    <div className="example">
                      <div className="example__japanese">{card.example_jp}</div>
                      <div className="example__chinese">{card.example_cn}</div>
                    </div>
                  )}
                </div>
              )}
            </>
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
      
      {/* Tooltip */}
      {tooltip.show && (
        <div 
          className="tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%) translateY(-100%)',
            pointerEvents: 'none',
            zIndex: 1001
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default StudyCard;