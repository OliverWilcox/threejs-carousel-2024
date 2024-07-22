import React from "react";

export const Lights: React.FC = React.memo(() => (
  <>
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 10, 5]} intensity={1} />
  </>
));
Lights.displayName = "Lights";

export default Lights;
