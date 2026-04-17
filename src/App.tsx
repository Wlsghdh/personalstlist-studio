import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`키: ${height}cm, 몸무게: ${weight}kg 로 스타일 분석을 시작합니다!`)
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Personal Stylist</h1>
        <p className="subtitle">나만의 스타일을 찾아드려요</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        {/* 사진 업로드 */}
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
                <small>클릭하여 사진 선택</small>
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

        {/* 키 & 몸무게 */}
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

        <button type="submit" className="btn-submit">
          스타일 분석 시작하기
        </button>
      </form>
    </div>
  )
}

export default App
