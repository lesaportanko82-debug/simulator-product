import React from 'react';
import { useDragLayer } from 'react-dnd';
import { ItemType, TicketCardVisual, KanbanTicket } from './KanbanTask';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(initialOffset: any, currentOffset: any) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  let { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px) rotate(4deg)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const KanbanDragLayer = () => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {itemType === ItemType && (
            <div className="w-[300px] shadow-2xl opacity-90 scale-105">
                <TicketCardVisual ticket={item as KanbanTicket} />
            </div>
        )}
      </div>
    </div>
  );
};
