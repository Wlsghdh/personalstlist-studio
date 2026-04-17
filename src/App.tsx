import { useState, useRef } from 'react'
import './App.css'

type Step = 'input' | 'loading' | 'result'

function App() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [report, setReport] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStep('loading')

    try {
      const res = await fetch('/api/style-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: photo ?? null,
          height: Number(height),
          weight: Number(weight),
        }),
      })
      const data = await res.json() as { report?: string; error?: string }
      if (!res.ok || data.error) {
        throw new Error(data.error ?? '알 수 없는 오류')
      }
      setReport(data.report ?? '')
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setStep('input')
    }
  }

  const handleReset = () => {
    setStep('input')
    setReport('')
    setError('')
  }

  if (step === 'loading') {
    return (
      <div className="container center">
        <div className="spinner" />
        <p className="loading-text">스타일 분석 중...</p>
        <p className="loading-sub">AI가 맞춤 보고서를 작성하고 있어요</p>
      </div>
    )
  }

  if (step === 'result') {
    return (
      <div className="container">
        <header className="header">
          <h1 className="title">스타일 컨설팅 보고서</h1>
          <p className="subtitle">AI가 분석한 나만의 스타일 가이드</p>
        </header>

        <div className="report-card">
          {photo && (
            <div className="report-photo">
              <img src={photo} alt="프로필" />
              <div className="report-info">
                <span>키 {height}cm</span>
                <span>몸무게 {weight}kg</span>
              </div>
            </div>
          )}
          <div className="report-content">
            {report.split('\n').map((line, i) => {
              if (/^#{1,3}\s/.test(line)) {
                return <h3 key={i}>{line.replace(/^#{1,3}\s/, '')}</h3>
              }
              if (/^\d+\.\s/.test(line)) {
                return <h3 key={i}>{line}</h3>
              }
              if (line.trim() === '') return <br key={i} />
              return <p key={i}>{line}</p>
            })}
          </div>
        </div>

        <button className="btn-reset" onClick={handleReset}>
          다시 분석하기
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Personal Stylist</h1>
        <p className="subtitle">나만의 스타일을 찾아드려요</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="photo-section">
          <div
            className="photo-upload"
            onClick={() => fileInputRef.current?.click()}
          >
            {photo ? (
              <img src={photo} alt="업로드된 사진" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>사진 업로드</span>
                <small>클릭하여 사진 선택 (선택사항)</small>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
          {photo && (
            <button
              type="button"
              className="btn-change"
              onClick={() => fileInputRef.current?.click()}
            >
              사진 변경
            </button>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="height">키</label>
          <div className="input-with-unit">
            <input
              id="height"
              type="number"
              placeholder="예) 170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min={100}
              max={250}
              required
            />
            <span className="unit">cm</span>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="weight">몸무게</label>
          <div className="input-with-unit">
            <input
              id="weight"
              type="number"
              placeholder="예) 60"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min={20}
              max={300}
              required
            />
            <span className="unit">kg</span>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="btn-submit">
          스타일 분석 시작하기
        </button>
      </form>
    </div>
  )
}

export default App
