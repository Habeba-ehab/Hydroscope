import { useNavigate } from 'react-router-dom'
import Upload from './Upload'

export default function Analyze() {
  const navigate = useNavigate()

  return (
    <main className="min-h-[calc(100dvh-5rem)] flex items-center justify-center py-8">
      <Upload onAnalyze={() => navigate('/analyze/tree')} />
    </main>
  )
}
