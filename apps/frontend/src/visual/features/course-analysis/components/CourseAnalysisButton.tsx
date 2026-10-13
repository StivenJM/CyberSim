import { Bot, Sparkles } from 'lucide-react';
import { useGenerateCourseAnalysis } from '../hooks/useGenerateCourseAnalysis';
import type { CourseAnalysisResponse } from '../types/courseAnalysis.types';
import Button from '../../../common/components/Button';

interface CourseAnalysisButtonProps {
  idCurso: number;
  idProfesor: number;
  hasExisting?: boolean;
  onAnalysisGenerated?: (analysis: CourseAnalysisResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function CourseAnalysisButton({
  idCurso,
  idProfesor,
  hasExisting,
  onAnalysisGenerated,
  onError,
  className
}: CourseAnalysisButtonProps) {
  const { generateAnalysis, loading } = useGenerateCourseAnalysis();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const response = await generateAnalysis(idCurso, idProfesor);

    if (response.success && response.analysis) {
      onAnalysisGenerated?.(response.analysis);
    } else if (response.error) {
      onError?.(response.error);
    }
  };

  return (
    <Button
      variant="ai"
      className={className}
      onClick={handleClick}
      disabled={loading}
      icon={loading ? <Bot size={14} /> : <Sparkles size={14} />}
    >
      {loading ? 'Generando...' : hasExisting ? 'Generar nuevo análisis' : 'Analizar Curso'}
    </Button>
  );
}
