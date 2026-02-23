import React from "react";

const AdComponent = ({
  className = "",
  innerClassName = "",
  adClassName = "",
}) => {
  return (
    <div className={`hb-ad-inpage ${className}`}>
      <div className={`hb-ad-inner ${innerClassName}`}>
        <div
          className={`hbagency_cls hbagency_space_208526 ${adClassName}`}
        ></div>
      </div>
    </div>
  );
};

export default AdComponent;
