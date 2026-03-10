interface StatBlockProps {
  label: string;
  value: number;
}

const calculateModifier = (score: number): string => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

const StatBlock = ({ label, value }: StatBlockProps) => {
  const modifier = calculateModifier(value);
  
  return (
    <div className="flex flex-col items-center p-2 bg-muted rounded">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-xs text-gold font-medium">Mod: {modifier}</span>
    </div>
  );
};

export default StatBlock;
