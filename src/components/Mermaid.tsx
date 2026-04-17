import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  themeVariables: {
    primaryColor: '#ffffff',
    primaryTextColor: '#000000',
    primaryBorderColor: '#000000',
    lineColor: '#ffffff',
    secondaryColor: '#f59e0b', // Orange for decisions
    tertiaryColor: '#2dd4bf',  // Teal for start/end
    fontFamily: 'Inter, sans-serif',
  },
  flowchart: {
    curve: 'basis',
    htmlLabels: true,
  },
});

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
      
      // We need to re-render when chart changes
      const renderChart = async () => {
        try {
          const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid render error:', error);
        }
      };
      renderChart();
    }
  }, [chart]);

  return (
    <div className="bg-[#1e1e1e] p-8 rounded-3xl overflow-x-auto flex flex-col items-center my-8 border border-gray-800 shadow-2xl">
      <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Visual Logic Flowchart</h4>
      <div ref={ref} className="mermaid" />
    </div>
  );
};

export default Mermaid;
