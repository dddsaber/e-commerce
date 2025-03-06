import React from "react";
import "./LoadingPage.css";
const LoadingPage: React.FC = () => {
  return (
    <div className={"loader-container"}>
      <div className={"progress float shadow"}>
        <div className="progress__item"></div>
      </div>
    </div>
  );
};

export default LoadingPage;
