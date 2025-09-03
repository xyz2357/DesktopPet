import React, { useState, useRef, useEffect } from 'react';
import { PetConfig } from '../config/appConfig';
import { PetState } from '../utils/mediaManager';
import { TimeBasedEmotion } from '../utils/interactionManager';
import { PetReaction } from '../types/item';
import './DebugPanel.css';

interface DebugPanelProps {
  // 控制显示
  isVisible: boolean;
  onToggle: () => void;
  
  // Pet状态
  autonomousState: PetState;
  isHovered: boolean;
  isDragging: boolean;
  isActive: boolean;
  isLoading: boolean;
  position: { x: number; y: number };
  
  // 媒体状态
  currentMedia: {[key: string]: any};
  mediaLoadError: {[key: string]: boolean};
  
  // 交互状态
  specialMessage: string;
  timeBasedEmotion: TimeBasedEmotion | null;
  customInteractionMessage: string;
  customInteractionState: PetState | null;
  itemReaction: PetReaction | null;
  currentItemState: PetState | null;
  isDraggedOver: boolean;
  lastUsedItem: string | undefined;
  customInteractionsBlocked: boolean;
  
  // 鼠标跟踪状态
  isFollowingMouse: boolean;
  eyeDirection: { x: number; y: number };
  
  // 倒计时相关 - 这些需要从Pet组件传递过来
  lastUserInteractionTime: number;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  isVisible,
  onToggle,
  autonomousState,
  isHovered,
  isDragging,
  isActive,
  isLoading,
  position,
  currentMedia,
  mediaLoadError,
  specialMessage,
  timeBasedEmotion,
  customInteractionMessage,
  customInteractionState,
  itemReaction,
  currentItemState,
  isDraggedOver,
  lastUsedItem,
  customInteractionsBlocked,
  isFollowingMouse,
  eyeDirection,
  lastUserInteractionTime
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 每秒更新时间用于显示倒计时
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimeUntilNextBehavior = () => {
    const timeSinceLastInteraction = currentTime - lastUserInteractionTime;
    const cooldownPeriod = 5000; // 固定5秒冷却时间
    const behaviorInterval = PetConfig.states.autonomous.idleStateChangeInterval || 30000;
    
    if (timeSinceLastInteraction < cooldownPeriod) {
      return Math.ceil((cooldownPeriod - timeSinceLastInteraction) / 1000);
    } else {
      const timeSinceCooldown = timeSinceLastInteraction - cooldownPeriod;
      const timeUntilNext = behaviorInterval - (timeSinceCooldown % behaviorInterval);
      return Math.ceil(timeUntilNext / 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const getStateColor = (state: string) => {
    const colors: {[key: string]: string} = {
      'idle': '#4CAF50',
      'active': '#2196F3',
      'loading': '#FF9800',
      'walking': '#9C27B0',
      'sleeping': '#607D8B',
      'observing': '#3F51B5',
      'yawning': '#795548',
      'stretching': '#E91E63'
    };
    return colors[state] || '#666';
  };

  if (!isVisible) {
    return null;
  }

  const timeUntilNextBehavior = calculateTimeUntilNextBehavior();

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>🐱 Pet Debug Panel</h3>
        <button 
          onClick={onToggle}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >×</button>
      </div>
      
      <div className="debug-content">
        {/* 主要状态 */}
        <div className="debug-section">
          <h4>🎯 主要状态</h4>
          <div className="debug-item">
            <span className="debug-label">自主行为状态:</span>
            <span className="debug-value" style={{color: getStateColor(autonomousState)}}>
              {autonomousState}
            </span>
          </div>
          <div className="debug-item">
            <span className="debug-label">悬停状态:</span>
            <span className="debug-value">{isHovered ? '是' : '否'}</span>
          </div>
          <div className="debug-item">
            <span className="debug-label">拖拽状态:</span>
            <span className="debug-value">{isDragging ? '是' : '否'}</span>
          </div>
          <div className="debug-item">
            <span className="debug-label">活跃状态:</span>
            <span className="debug-value">{isActive ? '是' : '否'}</span>
          </div>
          <div className="debug-item">
            <span className="debug-label">加载状态:</span>
            <span className="debug-value">{isLoading ? '是' : '否'}</span>
          </div>
        </div>

        {/* 位置信息 */}
        <div className="debug-section">
          <h4>📍 位置信息</h4>
          <div className="debug-item">
            <span className="debug-label">X坐标:</span>
            <span className="debug-value">{position.x}px</span>
          </div>
          <div className="debug-item">
            <span className="debug-label">Y坐标:</span>
            <span className="debug-value">{position.y}px</span>
          </div>
        </div>

        {/* 鼠标跟踪 */}
        <div className="debug-section">
          <h4>👀 鼠标跟踪</h4>
          <div className="debug-item">
            <span className="debug-label">跟随鼠标:</span>
            <span className="debug-value">{isFollowingMouse ? '是' : '否'}</span>
          </div>
          <div className="debug-item">
            <span className="debug-label">眼睛方向:</span>
            <span className="debug-value">
              X: {eyeDirection.x.toFixed(2)}, Y: {eyeDirection.y.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 倒计时 */}
        <div className="debug-section">
          <h4>⏰ 倒计时</h4>
          <div className="debug-item">
            <span className="debug-label">距下次行为:</span>
            <span className="debug-value countdown">
              {formatTime(timeUntilNextBehavior)}
            </span>
          </div>
          <div className="debug-item">
            <span className="debug-label">上次交互:</span>
            <span className="debug-value">
              {formatTime(Math.floor((currentTime - lastUserInteractionTime) / 1000))} 前
            </span>
          </div>
        </div>

        {/* 交互状态 */}
        <div className="debug-section">
          <h4>🎭 交互状态</h4>
          {timeBasedEmotion && (
            <div className="debug-item">
              <span className="debug-label">时间情绪:</span>
              <span className="debug-value">
                {timeBasedEmotion.emotion} - {timeBasedEmotion.text}
              </span>
            </div>
          )}
          {specialMessage && (
            <div className="debug-item">
              <span className="debug-label">特殊消息:</span>
              <span className="debug-value">{specialMessage}</span>
            </div>
          )}
          {customInteractionMessage && (
            <div className="debug-item">
              <span className="debug-label">自定义消息:</span>
              <span className="debug-value">{customInteractionMessage}</span>
            </div>
          )}
          {customInteractionState && (
            <div className="debug-item">
              <span className="debug-label">自定义状态:</span>
              <span className="debug-value" style={{color: getStateColor(customInteractionState)}}>
                {customInteractionState}
              </span>
            </div>
          )}
          <div className="debug-item">
            <span className="debug-label">自定义交互阻塞:</span>
            <span className="debug-value">{customInteractionsBlocked ? '是' : '否'}</span>
          </div>
        </div>

        {/* 道具系统 */}
        <div className="debug-section">
          <h4>🎁 道具系统</h4>
          {itemReaction && (
            <div className="debug-item">
              <span className="debug-label">道具反应:</span>
              <span className="debug-value">{itemReaction.message}</span>
            </div>
          )}
          {currentItemState && (
            <div className="debug-item">
              <span className="debug-label">道具状态:</span>
              <span className="debug-value" style={{color: getStateColor(currentItemState)}}>
                {currentItemState}
              </span>
            </div>
          )}
          {lastUsedItem && (
            <div className="debug-item">
              <span className="debug-label">最后使用道具:</span>
              <span className="debug-value">{lastUsedItem}</span>
            </div>
          )}
          <div className="debug-item">
            <span className="debug-label">拖拽悬停:</span>
            <span className="debug-value">{isDraggedOver ? '是' : '否'}</span>
          </div>
        </div>

        {/* 媒体状态 */}
        <div className="debug-section">
          <h4>🎬 媒体状态</h4>
          {Object.keys(currentMedia).length > 0 && (
            <div className="debug-item">
              <span className="debug-label">当前媒体:</span>
              <div className="debug-media-list">
                {Object.entries(currentMedia).map(([state, media]) => (
                  <div key={state} className="debug-media-item">
                    <strong>{state}:</strong> {media ? '已加载' : '未加载'}
                  </div>
                ))}
              </div>
            </div>
          )}
          {Object.keys(mediaLoadError).some(key => mediaLoadError[key]) && (
            <div className="debug-item">
              <span className="debug-label">媒体错误:</span>
              <div className="debug-error-list">
                {Object.entries(mediaLoadError)
                  .filter(([, hasError]) => hasError)
                  .map(([state]) => (
                    <div key={state} className="debug-error-item">{state}</div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 配置信息 */}
        <div className="debug-section">
          <h4>⚙️ 配置信息</h4>
          <div className="debug-item">
            <span className="debug-label">行为间隔:</span>
            <span className="debug-value">
              {(PetConfig.states.autonomous.idleStateChangeInterval || 30000) / 1000}s
            </span>
          </div>
          <div className="debug-item">
            <span className="debug-label">交互冷却:</span>
            <span className="debug-value">
              5s
            </span>
          </div>
          <div className="debug-item">
            <span className="debug-label">鼠标跟踪:</span>
            <span className="debug-value">
              {PetConfig.mouseTracking.enabled ? '启用' : '禁用'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;