import React from "react";
interface SpaceDivProps {
  width?: number;
  height?: number;
}
export const SpaceDiv: React.FC<SpaceDivProps> = ({
  width = 1,
  height = 1,
}) => {
  return <div style={{ width, height }}></div>;
};
