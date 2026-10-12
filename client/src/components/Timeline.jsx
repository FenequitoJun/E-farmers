import React from 'react';

export const Timeline = ({ status }) => {
  const steps = ['Placed', 'Processing', 'Shipped', 'Delivered'];
  const statusIndexMap = {
    processing: 1,
    shipped: 2,
    delivered: 3,
  };
  const currentIndex = statusIndexMap[status] ?? 0;

  return (
    <div className="tl">
      {steps.map((stepName, i) => {
        const reached = status === 'delivered' || i <= currentIndex;
        const isCurrent = status !== 'delivered' && i === currentIndex;

        return (
          <React.Fragment key={stepName}>
            <div className={`tl-step ${reached ? 'done' : ''} ${isCurrent ? 'cur' : ''}`}>
              <div className="tl-dot">{isCurrent ? '●' : reached ? '✓' : i + 1}</div>
              <div className="tl-lab">{stepName}</div>
            </div>
            {i < steps.length - 1 && (
              <div className={`tl-bar ${status === 'delivered' || i + 1 <= currentIndex ? 'fill' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Timeline;
