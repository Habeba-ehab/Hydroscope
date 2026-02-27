import { useNavigate } from 'react-router-dom'
import Upload from '../components/analyze/Upload'

export default function Analyze() {
  const navigate = useNavigate()

  return (
    <main className="h-[calc(100dvh-5rem)] flex items-center justify-center overflow-y-auto">
      <Upload onAnalyze={() => navigate('/analyze/tree')} />
    </main>
  )
}
