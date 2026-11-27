import { useRef } from "react";
import { motion } from "framer-motion";

export function App() {
  const containerRef = useRef(null);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h2>Drag the Card</h2>

      <div
        ref={containerRef}
        data-testid="drag-container"
        style={{
          width: "100%",
          height: 350,
          border: "2px dashed #999",
          borderRadius: 12,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          data-testid="drag-card"
          drag
          dragConstraints={containerRef}
          dragElastic={0}
          whileDrag={{ scale: 1.05, cursor: "grabbing" }}
          style={{
            width: 150,
            height: 100,
            background: "#3182ce",
            color: "white",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          Drag Me
        </motion.div>
      </div>
    </div>
  );
}
