# Deployment Guide

## Prerequisites

1. **Vercel 계정** — https://vercel.com
2. **GitHub 계정** — 리포지토리 연결용
3. **Vercel Blob Token** — Blob 스토리지 활성화

## Steps

### 1. GitHub에 Push

```bash
git remote add origin https://github.com/YOUR_USERNAME/3d-platform.git
git branch -M main
git push -u origin main
```

### 2. Vercel Import

Vercel 대시보드에서:
- 상단 "New Project" → "Import Git Repository"
- GitHub 리포지토리 선택
- Framework: `Next.js`
- Root Directory: `./`
- Build Command: `npm run build`
- Install Command: `npm install --legacy-peer-deps`

### 3. Environment Variables 설정

Vercel 프로젝트 Settings → Environment Variables:

```
BLOB_READ_WRITE_TOKEN = <your-vercel-blob-token>
NEXT_PUBLIC_APP_URL = https://<your-deployment-url>.vercel.app
```

Vercel Blob Token 얻기:
1. Vercel 대시보드 → Storage
2. "Create Database" → "Blob"
3. "Configure" → Token 복사

### 4. Deploy

```bash
git push origin main
```

Vercel가 자동으로 빌드 및 배포합니다.

### 5. Verify

배포 URL에 접속하여:
- [ ] 파일 드래그앤드롭 → 업로드
- [ ] `/view/:id` 페이지 접근
- [ ] AR 버튼 확인
- [ ] 공유 링크 복사

## Local Development

```bash
npm run dev
# 로컬: public/uploads/ 디렉터리에 저장
# API: /api/upload, /api/model/[id]
```

## Troubleshooting

### 업로드 실패
- `BLOB_READ_WRITE_TOKEN` 환경변수 확인
- 파일 크기 100MB 초과 확인
- 지원 형식: GLB, GLTF, OBJ, STL, USDZ, FBX

### `/view/:id` 404
- `src/lib/db.ts`의 메타데이터 구조 확인
- SQLite 또는 외부 DB 연결 필요 (현재: 인메모리)

## 다음 단계

- [ ] 데이터베이스 통합 (PostgreSQL/SQLite)
- [ ] 썸네일 자동 생성
- [ ] 모델 검색/필터링
- [ ] 사용자 인증
