import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react";
import ForceGraph2D, {
  type ForceGraphMethods,
  type NodeObject,
  type LinkObject,
} from "react-force-graph-2d";
import { type Note, type Topic } from "../../types";

interface GraphViewProps {
  notes: Note[];
  topics: Topic[];
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  isTopic?: boolean;
}

interface GraphNodeInternal extends GraphNode {
  x: number;
  y: number;
}

interface GraphLink {
  source: string;
  target: string;
}

export const GraphView: React.FC<GraphViewProps> = ({ notes, topics }) => {
  const fgRef =
    useRef<
      ForceGraphMethods<NodeObject<GraphNode>, LinkObject<GraphNode, GraphLink>>
    >(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    topics.forEach((topic) => {
      const hasNotes = notes.some((n) => n.title === topic.label);
      if (hasNotes) {
        nodes.push({
          id: `topic-${String(topic.id)}`,
          name: topic.label,
          val: 8,
          color: topic.color,
          isTopic: true,
        });
      }
    });

    notes.forEach((note) => {
      const topic = topics.find((t) => t.label === note.title);
      const color = topic ? topic.color : "#94a3b8";
      const topicId = topic ? `topic-${String(topic.id)}` : null;

      nodes.push({
        id: `note-${String(note.id)}`,
        name:
          note.title === "Sem Tópico"
            ? note.content.substring(0, 20) + "..."
            : note.content.substring(0, 30) + "...",
        val: 3,
        color: color,
        isTopic: false,
      });

      if (topicId) {
        links.push({
          source: `note-${String(note.id)}`,
          target: topicId,
        });
      }
    });

    return { nodes, links };
  }, [notes, topics]);

  const paintNode = useCallback(
    (
      node: NodeObject<GraphNode>,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const n = node as NodeObject<GraphNodeInternal>;
      const label = n.name;
      const fontSize = n.isTopic ? 14 / globalScale : 10 / globalScale;
      ctx.font = `bold ${String(fontSize)}px "Inter", sans-serif`;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.val, 0, 2 * Math.PI, false);
      ctx.fillStyle = n.color;
      ctx.fill();

      // Glow effect for topics
      if (n.isTopic) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = n.color;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = n.isTopic ? "#ffffff" : "rgba(255,255,255,0.7)";
      ctx.fillText(label, n.x, n.y + n.val + fontSize);

      // Reset shadow
      ctx.shadowBlur = 0;
    },
    []
  );

  if (notes.length === 0) {
    return (
      <div
        style={{
          color: "var(--text-secondary)",
          textAlign: "center",
          padding: "4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        Nenhuma nota para gerar o grafo.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "inherit",
        overflow: "hidden",
      }}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeCanvasObject={paintNode}
        linkColor={() => "rgba(255,255,255,0.05)"}
        linkWidth={1.5}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.08}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
      />
    </div>
  );
};
