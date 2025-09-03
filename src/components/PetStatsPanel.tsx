import React, { useState, useEffect } from 'react';
import { PetStats, StatChange, PetCondition, petStatsManager } from '../utils/petStatsManager';
import './PetStatsPanel.css';

interface PetStatsPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

const PetStatsPanel: React.FC<PetStatsPanelProps> = ({ isVisible, onToggle }) => {
  const [stats, setStats] = useState<PetStats>(petStatsManager.getStats());
  const [recentChanges, setRecentChanges] = useState<StatChange[]>([]);
  const [condition, setCondition] = useState<PetCondition>(petStatsManager.getOverallCondition());

  useEffect(() => {
    const handleStatsChange = (newStats: PetStats, changes?: StatChange[]) => {
      setStats(newStats);
      setCondition(petStatsManager.getOverallCondition());
      
      if (changes && changes.length > 0) {
        // 添加新变化到最近变化列表
        setRecentChanges(prev => {
          const updated = [...changes, ...prev].slice(0, 10); // 只保留最近10个变化
          return updated;
        });
        
        // 5秒后开始淡出旧的变化
        setTimeout(() => {
          setRecentChanges(prev => prev.filter(change => 
            !changes.some(newChange => 
              newChange.stat === change.stat && 
              newChange.reason === change.reason
            )
          ));
        }, 5000);
      }
    };

    petStatsManager.addListener(handleStatsChange);
    
    return () => {
      petStatsManager.removeListener(handleStatsChange);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const formatValue = (value: number): string => {
    return Math.round(value).toString();
  };

  const getConditionEmoji = (condition: PetCondition): string => {
    const emojis = {
      excellent: '🌟',
      good: '😊', 
      normal: '😐',
      poor: '😕',
      critical: '😰'
    };
    return emojis[condition];
  };

  const getConditionText = (condition: PetCondition): string => {
    const texts = {
      excellent: '状态极佳',
      good: '状态良好',
      normal: '状态一般', 
      poor: '状态不佳',
      critical: '状态危急'
    };
    return texts[condition];
  };

  const getConditionColor = (condition: PetCondition): string => {
    const colors = {
      excellent: '#4CAF50',
      good: '#8BC34A',
      normal: '#FF9800',
      poor: '#FF5722', 
      critical: '#F44336'
    };
    return colors[condition];
  };

  return (
    <div className="pet-stats-panel">
      <div className="pet-stats-header">
        <h3>🐱 桌宠状态</h3>
        <button onClick={onToggle} className="close-button">×</button>
      </div>
      
      <div className="pet-stats-content">
        {/* 整体状况 */}
        <div className="overall-condition">
          <div className="condition-emoji">{getConditionEmoji(condition)}</div>
          <div className="condition-info">
            <div className="condition-text" style={{ color: getConditionColor(condition) }}>
              {getConditionText(condition)}
            </div>
            <div className="condition-subtitle">
              整体数值: {Math.round((stats.happiness + stats.hunger + stats.energy + stats.health + stats.cleanliness) / 5)}
            </div>
          </div>
        </div>

        {/* 数值条 */}
        <div className="stats-bars">
          {/* 心情 */}
          <div className="stat-item">
            <div className="stat-header">
              <span className="stat-icon">😊</span>
              <span className="stat-name">心情</span>
              <span className="stat-value">{formatValue(stats.happiness)}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-fill"
                style={{
                  width: `${stats.happiness}%`,
                  backgroundColor: petStatsManager.getStatColor(stats.happiness)
                }}
              />
            </div>
            <div className="stat-status">
              {petStatsManager.getStatStatus('happiness', stats.happiness)}
            </div>
          </div>

          {/* 饱腹度 */}
          <div className="stat-item">
            <div className="stat-header">
              <span className="stat-icon">🍽️</span>
              <span className="stat-name">饱腹</span>
              <span className="stat-value">{formatValue(stats.hunger)}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-fill"
                style={{
                  width: `${stats.hunger}%`,
                  backgroundColor: petStatsManager.getStatColor(stats.hunger)
                }}
              />
            </div>
            <div className="stat-status">
              {petStatsManager.getStatStatus('hunger', stats.hunger)}
            </div>
          </div>

          {/* 体力 */}
          <div className="stat-item">
            <div className="stat-header">
              <span className="stat-icon">⚡</span>
              <span className="stat-name">体力</span>
              <span className="stat-value">{formatValue(stats.energy)}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-fill"
                style={{
                  width: `${stats.energy}%`,
                  backgroundColor: petStatsManager.getStatColor(stats.energy)
                }}
              />
            </div>
            <div className="stat-status">
              {petStatsManager.getStatStatus('energy', stats.energy)}
            </div>
          </div>

          {/* 健康 */}
          <div className="stat-item">
            <div className="stat-header">
              <span className="stat-icon">💚</span>
              <span className="stat-name">健康</span>
              <span className="stat-value">{formatValue(stats.health)}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-fill"
                style={{
                  width: `${stats.health}%`,
                  backgroundColor: petStatsManager.getStatColor(stats.health)
                }}
              />
            </div>
            <div className="stat-status">
              {petStatsManager.getStatStatus('health', stats.health)}
            </div>
          </div>

          {/* 清洁度 */}
          <div className="stat-item">
            <div className="stat-header">
              <span className="stat-icon">🛁</span>
              <span className="stat-name">清洁</span>
              <span className="stat-value">{formatValue(stats.cleanliness)}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-fill"
                style={{
                  width: `${stats.cleanliness}%`,
                  backgroundColor: petStatsManager.getStatColor(stats.cleanliness)
                }}
              />
            </div>
            <div className="stat-status">
              {petStatsManager.getStatStatus('cleanliness', stats.cleanliness)}
            </div>
          </div>
        </div>

        {/* 最近变化 */}
        {recentChanges.length > 0 && (
          <div className="recent-changes">
            <h4>最近变化</h4>
            <div className="changes-list">
              {recentChanges.slice(0, 5).map((change, index) => (
                <div key={index} className={`change-item ${change.amount > 0 ? 'positive' : 'negative'}`}>
                  <span className="change-stat">
                    {change.stat === 'happiness' && '😊'}
                    {change.stat === 'hunger' && '🍽️'}
                    {change.stat === 'energy' && '⚡'}
                    {change.stat === 'health' && '💚'}
                    {change.stat === 'cleanliness' && '🛁'}
                  </span>
                  <span className="change-amount">
                    {change.amount > 0 ? '+' : ''}{change.amount.toFixed(1)}
                  </span>
                  <span className="change-reason">{change.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="stats-actions">
          <button 
            className="action-button reset-button"
            onClick={() => {
              if (window.confirm('确定要重置桌宠数值吗？这将把所有数值恢复到初始状态。')) {
                petStatsManager.resetStats();
              }
            }}
          >
            🔄 重置数值
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetStatsPanel;