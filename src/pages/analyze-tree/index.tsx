import { useNavigate } from 'react-router-dom'
import DecisionTree from './DecisionTree'

export default function AnalyzeTree() {
  const navigate = useNavigate()

  return (
    <main
      className="h-[calc(100dvh-5rem)] relative overflow-hidden"
      style={{ animation: 'fadeInUp 0.45s ease both' }}
    >
      <DecisionTree onBack={() => navigate('/analyze')} />
    </main>
  )
}
