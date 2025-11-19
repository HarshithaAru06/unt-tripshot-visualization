interface ChartExplanationProps {
  text: string;
}

export default function ChartExplanation({ text }: ChartExplanationProps) {
  return (
    <p className="text-sm text-muted-foreground/80 mt-2 leading-relaxed">
      {text}
    </p>
  );
}
