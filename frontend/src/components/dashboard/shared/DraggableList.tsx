// src/components/dashboard/shared/DraggableList.tsx
/**
 * A reusable drag-and-drop list component using native HTML5 drag and drop
 * Supports reordering items with visual feedback
 */

'use client';

import { useState, useCallback, DragEvent } from 'react';
import { GripVertical } from 'lucide-react';

interface DraggableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (reorderedItems: T[]) => void;
  renderItem: (item: T, index: number, isDragging: boolean, isDropTarget: boolean) => React.ReactNode;
  keyExtractor?: (item: T) => string;
  className?: string;
  itemClassName?: string;
  showDragHandle?: boolean;
  disabled?: boolean;
}

export function DraggableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  keyExtractor = (item) => item.id,
  className = '',
  itemClassName = '',
  showDragHandle = true,
  disabled = false,
}: DraggableListProps<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, item: T) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    setDraggedId(item.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    // Add a small delay to allow the drag image to be captured
    setTimeout(() => {
      (e.target as HTMLElement).classList.add('opacity-50');
    }, 0);
  }, [disabled]);

  const handleDragEnd = useCallback((e: DragEvent<HTMLDivElement>) => {
    setDraggedId(null);
    setDropTargetId(null);
    (e.target as HTMLElement).classList.remove('opacity-50');
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, targetItem: T) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedId && targetItem.id !== draggedId) {
      setDropTargetId(targetItem.id);
    }
  }, [draggedId]);

  const handleDragLeave = useCallback(() => {
    setDropTargetId(null);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, targetItem: T) => {
    e.preventDefault();
    const draggedItemId = e.dataTransfer.getData('text/plain');

    if (!draggedItemId || draggedItemId === targetItem.id) {
      setDropTargetId(null);
      return;
    }

    const draggedIndex = items.findIndex((item) => item.id === draggedItemId);
    const targetIndex = items.findIndex((item) => item.id === targetItem.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDropTargetId(null);
      return;
    }

    // Reorder items
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    onReorder(newItems);
    setDropTargetId(null);
  }, [items, onReorder]);

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => {
        const key = keyExtractor(item);
        const isDragging = draggedId === item.id;
        const isDropTarget = dropTargetId === item.id;

        return (
          <div
            key={key}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, item)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item)}
            className={`
              flex items-start gap-2 transition-all duration-200
              ${isDragging ? 'opacity-50' : ''}
              ${isDropTarget ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}
              ${disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
              ${itemClassName}
            `}
          >
            {showDragHandle && !disabled && (
              <div className="flex-shrink-0 p-2 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {renderItem(item, index, isDragging, isDropTarget)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simpler version without type generics for common use cases
interface SimpleDraggableItem {
  id: string;
  content: React.ReactNode;
}

interface SimpleDraggableListProps {
  items: SimpleDraggableItem[];
  onReorder: (items: SimpleDraggableItem[]) => void;
  className?: string;
  disabled?: boolean;
}

export function SimpleDraggableList({
  items,
  onReorder,
  className,
  disabled,
}: SimpleDraggableListProps) {
  return (
    <DraggableList
      items={items}
      onReorder={onReorder}
      className={className}
      disabled={disabled}
      renderItem={(item) => (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
          {item.content}
        </div>
      )}
    />
  );
}

export default DraggableList;
