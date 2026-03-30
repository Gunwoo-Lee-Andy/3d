# 3D Platform — Deployment Guide

## ✅ 로컬 테스트 완료

```
✓ POST /api/upload — 파일 업로드 + 자동 ID 발급
✓ GET /api/model/[id] — 메타데이터 조회 + 조회수 추적
✓ GET /view/[id] — 공개 공유 페이지 (OG 메타태그)
✓ 로컬 파일시스템 저장 (public/uploads/)
```

### 테스트 명령어

```bash
# 1. 개발 서버 시작 (포트 3000)
npm run dev

# 2. 프로덕션 빌드 + 실행 (포트 3001)
npm run build
PORT=3001 npm run start

# 3. 파일 업로드 테스트
curl -X POST http://localhost:3000/api/upload \
  -F "file=@model.glb"

# 응답 예시:
# {"id":"Flp3Xl9IN9","url":"/uploads/Flp3Xl9IN9.glb","shareUrl":"/view/Flp3Xl9IN9"}
```

---

## 🚀 Vercel 배포 (5분)

### Step 1: GitHub 저장소 생성

```bash
# 프로젝트 디렉터리에서
git remote add origin https://github.com/YOUR_USERNAME/3d-platform.git
git branch -M main
git push -u origin main
```

### Step 2: Vercel 대시보드 연결

1. https://vercel.com 에서 로그인
2. "Add New..." → "Project"
3. GitHub 저장소 선택: `3d-platform`
4. 설정 확인:
   - Framework: Next.js ✓
   - Build Command: `npm run build` ✓
   - Install Command: `npm install --legacy-peer-deps` ✓

### Step 3: 환경변수 설정

Vercel 프로젝트 Settings → Environment Variables 에서:

| 변수 | 값 | 설명 |
|------|-----|------|
| `BLOB_READ_WRITE_TOKEN` | `your-token` | Vercel Blob 토큰 (필수) |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | 배포 URL |

**Vercel Blob Token 얻는 방법:**
1. Vercel 대시보드 → "Storage" 탭
2. "Create" → "Blob"
3. 프로젝트와 연결
4. "Tokens" → 복사

### Step 4: 자동 배포

```bash
# 로컬에서 커밋 후 푸시
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

→ Vercel이 자동으로 빌드 및 배포합니다 (2-3분)

### Step 5: 검증

배포된 URL (예: `https://3d-platform.vercel.app`) 에서 테스트:

- [ ] 홈페이지 로드
- [ ] 파일 드래그앤드롭 → 업로드
- [ ] 업로드 후 `/view/:id` 리다이렉트
- [ ] 공유 URL 복사 가능
- [ ] 조회수 증가 확인

---

## 🛠️ 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 (HMR 활성화)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

### 환경 자동 감지

| 조건 | 스토리지 | 설명 |
|------|---------|------|
| 개발 (npm run dev) | `public/uploads/` | 로컬 파일시스템 |
| 프로덕션 (BLOB_READ_WRITE_TOKEN 설정) | Vercel Blob | 클라우드 저장소 |
| 프로덕션 (토큰 미설정) | `public/uploads/` | 로컬 폴백 |

---

## 🐛 문제 해결

### 업로드 실패

**증상:** `{"error": "업로드 실패"}`

**원인 및 해결:**
- 파일 크기 > 100MB → 제한 확인
- 지원하지 않는 형식 → GLB, OBJ, STL, USDZ, FBX만 지원
- Blob 토큰 미설정 → Vercel 환경변수 확인

### `/view/:id` → 404

**증상:** 404 Not Found

**원인:**
- 메타데이터 파일 손실 (`public/uploads/.meta.json`)
- 재배포 후 이전 모델 접근 불가 (현재: 인메모리 DB)

**해결:**
- SQLite 또는 PostgreSQL 통합 (다음 단계)

### 파일이 Vercel Blob에 저장되지 않음

**확인:**
```bash
# 환경변수 확인
echo $BLOB_READ_WRITE_TOKEN

# 로그에서 "Using Vercel Blob" 메시지 확인
```

---

## 📋 다음 단계 (선택사항)

### 우선순위 높음

- [ ] **데이터베이스 연동** — PostgreSQL (Neon) 또는 SQLite
  - 메타데이터 영구 저장
  - 배포 후에도 모델 조회 가능

- [ ] **썸네일 자동 생성** — Three.js로 GLB 렌더링
  - `/view/:id`에서 OG 이미지로 표시
  - 소셜 미디어 공유 향상

### 우선순위 중간

- [ ] **포맷 변환** — OBJ/FBX → GLB 자동 변환
- [ ] **모델 검색/필터** — 태그, 크기 등으로 필터링
- [ ] **사용자 인증** — GitHub/Google OAuth

### 우선순위 낮음

- [ ] **다운로드 분석** — 인기 모델 추적
- [ ] **API 문서** — OpenAPI/Swagger
- [ ] **모바일 최적화** — ARCore 테스트

---

## 📞 추가 도움말

- **Vercel 문서:** https://vercel.com/docs/frameworks/nextjs
- **Vercel Blob:** https://vercel.com/docs/storage/vercel-blob
- **Three.js:** https://threejs.org/docs
- **model-viewer:** https://modelviewer.dev
