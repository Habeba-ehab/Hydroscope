import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const SESSION_KEY = 'analyzeImage'

interface Props {
  onAnalyze: () => void
}

export default function Upload({ onAnalyze }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [preview,  setPreview ] = useState<string | null>(null)

  // Restore image from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) setPreview(saved)
  }, [])

  function handleFile(f: File) {
    const allowed = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp', '.gif']
    const ext = f.name.toLowerCase().substring(f.name.lastIndexOf('.'))
    
    if (!allowed.includes(ext)) {
      toast.error('Unsupported file format. Please upload a valid microscopy image.')
      return
    }

    setFileName(f.name)
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      try { sessionStorage.setItem(SESSION_KEY, dataUrl) } catch {}
    }
    reader.readAsDataURL(f)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  function removeFile() {
    setFileName(null)
    setPreview(null)
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem('treeState')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="w-full flex flex-col items-center px-4">

      {/* Header */}
      <div className="text-center mb-10 mt-5">
        <p className="font-body text-bluenavy md:text-lg text-base font-semibold tracking-widest uppercase mb-4">
          · AI Analysis ·
        </p>
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-navy leading-tight mb-4">
          Upload Your <br />
          <em className="italic text-bluenavy">Microscope Image</em>
        </h1>
        <p className="font-body text-lightnavy text-sm md:text-base max-w-md mx-auto leading-relaxed">
          Photograph your bacteria slide and upload it here. Our AI will classify the species and guide you through the next steps.
        </p>
      </div>

      {/* Dropzone */}
      <div
        className={`group w-full max-w-xl bg-white rounded-3xl border-2 border-dashed transition-colors duration-300 ${!preview ? 'cursor-pointer hover:border-bluenavy hover:bg-bluenavy/5' : ''} ${
          dragging ? 'border-bluenavy bg-bluenavy/5' : 'border-bluenavy/30'
        }`}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !preview && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.bmp,.tiff,.webp,.gif"
          className="hidden"
          onChange={onInputChange}
        />

        {preview ? (
          <div className="p-5 flex flex-col items-center gap-3 max-h-80 overflow-hidden">
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-full h-36 object-contain rounded-xl"
            />
            <p className="font-body text-sm text-lightnavy">{fileName ?? 'Saved image'}</p>
            <div className="flex gap-3">
              <button
                onClick={e => { e.stopPropagation(); removeFile() }}
                className="font-body text-sm text-lightnavy border border-gray-200 rounded-full px-5 py-2 hover:border-gray-400 transition-colors cursor-pointer"
              >
                Remove
              </button>
              <button
                onClick={e => { e.stopPropagation(); sessionStorage.removeItem('treeState'); onAnalyze() }}
                className="font-body text-sm font-medium text-white bg-navy rounded-full px-5 py-2 hover:opacity-90 transition-opacity cursor-pointer"
              >
                Start Analysis
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 md:p-14 flex flex-col items-center gap-4">
            <div className="bg-bluenavy/10 group-hover:bg-bluenavy/20 rounded-2xl p-4 transition-colors duration-300">
              <svg className="w-8 h-8 text-lightnavy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="font-body text-base font-semibold text-navy">Drop your image here</p>
            <p className="font-body text-sm text-lightnavy">
              or{' '}
              <button
                onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                className="text-bluenavy underline underline-offset-2 hover:opacity-75 transition-opacity cursor-pointer"
              >
                browse from your device
              </button>
            </p>
            <div className="h-6" />{/* Spacer replaces the format badges */}
          </div>
        )}
      </div>
    </div>
  )
}
