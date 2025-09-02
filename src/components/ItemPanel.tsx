import React, { useState, useEffect } from 'react';
import { ItemData } from '../types/item';
import { itemManager } from '../utils/itemManager';
import { dragDropManager } from '../utils/dragDropManager';
import { itemImageManager } from '../utils/itemImageManager';
import './ItemPanel.css';

interface ItemPanelProps {
  visible: boolean;
  onClose: () => void;
  onItemDragStart: (item: ItemData, event: React.DragEvent) => void;
}

const ItemPanel: React.FC<ItemPanelProps> = ({ visible, onClose, onItemDragStart }) => {
  const [items, setItems] = useState<ItemData[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | ItemData['type']>('all');
  const [cooldowns, setCooldowns] = useState<Map<string, number>>(new Map());
  const [isDragging, setIsDragging] = useState(false);

  // 加载道具列表和图标
  useEffect(() => {
    const initializeItems = async () => {
      // 初始化道具图标管理器
      await itemImageManager.initialize();
      
      // 加载道具列表
      const allItems = itemManager.getAllItems();
      setItems(allItems);
    };
    
    initializeItems().catch(console.error);
  }, []);

  // 更新冷却时间
  useEffect(() => {
    if (!visible) return;

    const updateCooldowns = () => {
      const newCooldowns = new Map<string, number>();
      items.forEach(item => {
        const remaining = itemManager.getCooldownRemaining(item.id);
        if (remaining > 0) {
          newCooldowns.set(item.id, remaining);
        }
      });
      setCooldowns(newCooldowns);
    };

    updateCooldowns();
    const interval = setInterval(updateCooldowns, 1000);
    return () => clearInterval(interval);
  }, [visible, items]);

  // 监听拖拽状态
  useEffect(() => {
    if (!visible) return;

    const handleDragState = (dragData: any) => {
      setIsDragging(!!dragData);
    };

    // 添加全局拖拽结束监听
    const handleGlobalDragEnd = () => {
      dragDropManager.endDrag();
    };

    dragDropManager.addDragListener(handleDragState);
    
    // 监听全局拖拽结束事件
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);
    
    return () => {
      dragDropManager.removeDragListener(handleDragState);
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, [visible]);

  // 筛选道具
  const filteredItems = items.filter(item => 
    selectedType === 'all' || item.type === selectedType
  );

  // 获取道具可用性状态
  const getItemStatus = (item: ItemData) => {
    const canUse = itemManager.canUseItem(item.id);
    const cooldownRemaining = cooldowns.get(item.id) || 0;
    const usageCount = itemManager.getUsageCount(item.id);
    
    return {
      canUse: canUse.canUse,
      reason: canUse.reason,
      cooldownRemaining,
      usageCount,
      maxUsage: item.usageLimit
    };
  };

  // 格式化冷却时间
  const formatCooldown = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  // 获取稀有度颜色
  const getRarityColor = (rarity: ItemData['rarity']): string => {
    switch (rarity) {
      case 'common': return '#9e9e9e';
      case 'uncommon': return '#4caf50';
      case 'rare': return '#2196f3';
      case 'epic': return '#9c27b0';
      case 'legendary': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  // 处理拖拽开始
  const handleDragStart = (item: ItemData, event: React.DragEvent) => {
    const status = getItemStatus(item);
    if (!status.canUse) {
      event.preventDefault();
      return;
    }
    
    // 调用父组件的处理函数
    onItemDragStart(item, event);
    
    // 添加拖拽结束监听
    const handleDragEnd = () => {
      event.currentTarget.removeEventListener('dragend', handleDragEnd);
      setTimeout(() => dragDropManager.endDrag(), 100); // 延迟一点确保drop事件已处理
    };
    
    event.currentTarget.addEventListener('dragend', handleDragEnd);
  };

  if (!visible) return null;

  return (
    <div className={`item-panel ${isDragging ? 'dragging' : ''}`}>
      <div 
        className={`item-panel__backdrop ${isDragging ? 'dragging' : ''}`} 
        onClick={onClose} 
      />
      <div className="item-panel__content">
        <div className="item-panel__header">
          <h3>道具箱</h3>
          <button className="item-panel__close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="item-panel__filters">
          <button 
            className={`item-filter ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            全部
          </button>
          <button 
            className={`item-filter ${selectedType === 'food' ? 'active' : ''}`}
            onClick={() => setSelectedType('food')}
          >
            🍎 食物
          </button>
          <button 
            className={`item-filter ${selectedType === 'toy' ? 'active' : ''}`}
            onClick={() => setSelectedType('toy')}
          >
            🎾 玩具
          </button>
          <button 
            className={`item-filter ${selectedType === 'tool' ? 'active' : ''}`}
            onClick={() => setSelectedType('tool')}
          >
            🔧 工具
          </button>
          <button 
            className={`item-filter ${selectedType === 'medicine' ? 'active' : ''}`}
            onClick={() => setSelectedType('medicine')}
          >
            💊 药品
          </button>
          <button 
            className={`item-filter ${selectedType === 'decoration' ? 'active' : ''}`}
            onClick={() => setSelectedType('decoration')}
          >
            🎨 装饰
          </button>
          <button 
            className={`item-filter ${selectedType === 'special' ? 'active' : ''}`}
            onClick={() => setSelectedType('special')}
          >
            ✨ 特殊
          </button>
        </div>

        <div className="item-panel__grid">
          {filteredItems.map(item => {
            const status = getItemStatus(item);
            return (
              <div
                key={item.id}
                className={`item-card ${!status.canUse ? 'disabled' : ''}`}
                draggable={status.canUse}
                onDragStart={(e) => handleDragStart(item, e)}
                style={{
                  '--rarity-color': getRarityColor(item.rarity)
                } as React.CSSProperties}
                title={item.description}
              >
                <div className="item-card__icon">
                  {(() => {
                    const imageUrl = itemImageManager.getItemImageUrl(item.id);
                    if (imageUrl) {
                      return (
                        <img 
                          src={imageUrl} 
                          alt={item.name}
                          className="item-card__image"
                          onError={(e) => {
                            // 如果图片加载失败，隐藏图片元素，显示emoji
                            e.currentTarget.style.display = 'none';
                            const emojiDiv = e.currentTarget.parentElement?.querySelector('.item-card__emoji-fallback') as HTMLElement;
                            if (emojiDiv) {
                              emojiDiv.style.display = 'block';
                            }
                          }}
                        />
                      );
                    } else {
                      return null;
                    }
                  })()}
                  <div 
                    className="item-card__emoji-fallback" 
                    style={{ display: itemImageManager.hasCustomImage(item.id) ? 'none' : 'block' }}
                  >
                    {item.emoji}
                  </div>
                </div>
                <div className="item-card__name">{item.nameJa || item.name}</div>
                
                {status.cooldownRemaining > 0 && (
                  <div className="item-card__cooldown">
                    {formatCooldown(status.cooldownRemaining)}
                  </div>
                )}
                
                {item.usageLimit && (
                  <div className="item-card__usage">
                    {status.usageCount}/{item.usageLimit}
                  </div>
                )}
                
                {!status.canUse && status.reason && (
                  <div className="item-card__disabled-overlay">
                    {status.reason === 'Usage limit exceeded' ? '用完了' : '冷却中'}
                  </div>
                )}
                
                <div className="item-card__rarity-indicator" />
              </div>
            );
          })}
        </div>

        <div className="item-panel__instructions">
          <p>💡 将道具拖到桌宠身上来使用</p>
          <p>🎯 不同道具会有不同的效果</p>
        </div>
      </div>
    </div>
  );
};

export default ItemPanel;