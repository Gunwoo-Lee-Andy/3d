# 🎨 3D Platform

간단하지만 강력한 3D 모델 업로드 · 뷰어 · 공유 플랫폼입니다.

- **드래그앤드롭 업로드** — GLB, OBJ, STL, USDZ, FBX 지원
- **3D 웹 뷰어** — Three.js 기반 인터랙티브 렌더링
- **AR 모드** — iOS/Android에서 증강현실 체험
- **공유 링크** — 공개 URL로 모델 즉시 공유
- **클라우드 저장** — Vercel Blob 또는 로컬 파일시스템

---

## 🚀 빠른 시작

### 로컬 개발

\`\`\`bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 시작 (http://localhost:3000)
npm run dev

# 3. 브라우저에서 테스트
# GLB 파일을 드래그앤드롭하면 즉시 렌더링됩니다
\`\`\`

### 프로덕션 배포

\`\`\`bash
# 빌드
npm run build

# 실행
npm run start
\`\`\`

**Vercel 자동 배포 (추천):**
→ [DEPLOYMENT.md](./DEPLOYMENT.md) 참고

---

## 📋 기능

| 기능 | 상태 | 설명 |
|------|------|------|
| 파일 업로드 | ✅ | 드래그앤드롭 또는 클릭 → 자동 ID 발급 |
| 3D 뷰어 | ✅ | Three.js로 GLB 렌더링 (줌, 회전, 조명) |
| AR 모드 | ✅ | model-viewer 연동 (iOS/Android) |
| 공유 URL | ✅ | /view/:id 고유 링크 + OG 메타태그 |
| 조회수 추적 | ✅ | 모델별 조회수 표시 |
| 데이터베이스 | ⏳ | SQLite/PostgreSQL (다음 단계) |
| 썸네일 생성 | ⏳ | 자동 미리보기 이미지 |
| 사용자 인증 | ⏳ | GitHub/Google OAuth |

---

## 🏗️ 아키텍처

\`\`\`
3d-platform/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 홈페이지 (업로드)
│   │   ├── view/[id]/
│   │   │   ├── page.tsx                # 공유 페이지
│   │   │   └── SharedViewer.tsx        # 3D 뷰어 컴포넌트
│   │   ├── components/
│   │   │   ├── UploadAndView.tsx       # 업로드 + 미리보기
│   │   │   ├── GLBViewer.tsx           # Three.js 뷰어
│   │   │   └── ARViewer.tsx            # model-viewer AR
│   │   └── api/
│   │       ├── upload/route.ts         # POST /api/upload
│   │       └── model/[id]/route.ts     # GET /api/model/:id
│   └── lib/
│       ├── storage.ts                  # 파일 저장소 (로컬/Blob)
│       └── db.ts                       # 메타데이터 (JSON 파일)
├── public/
│   └── uploads/                        # 로컬 저장소
├── DEPLOYMENT.md                       # 배포 가이드
└── package.json
\`\`\`

---

## 🔧 환경 설정

### 개발 환경 (\`.env.local\`)

\`\`\`bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 프로덕션 환경 (Vercel)

\`\`\`bash
BLOB_READ_WRITE_TOKEN=<your-vercel-blob-token>
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
\`\`\`

---

## 💡 기술 스택

- **프레임워크:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS
- **3D 렌더링:** Three.js
- **AR:** Google model-viewer
- **스토리지:** Vercel Blob + 로컬 파일시스템
- **배포:** Vercel
- **타입:** TypeScript

---

## 📝 다음 단계

- [ ] PostgreSQL 통합 (Neon)
- [ ] 썸네일 자동 생성
- [ ] 사용자 인증 (GitHub OAuth)
- [ ] 모델 검색/필터

---

**Made with ❤️ for 3D enthusiasts**
