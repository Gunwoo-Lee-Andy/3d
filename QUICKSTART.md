# 🚀 5분 안에 배포하기

## 1단계: GitHub 저장소 생성 (2분)

### 1-1. GitHub.com에서 저장소 생성
1. https://github.com/new 접속
2. **Repository name**: `3d-platform`
3. **Description**: `3D 모델 업로드 · 뷰어 · 공유 플랫폼`
4. **Public** 선택
5. **Create repository** 클릭

### 1-2. 로컬에서 푸시

터미널을 열고 다음을 실행하세요:

```bash
cd /Users/andy/Antigravity/2026/3월/스케치팹/3d-platform

# GitHub 저장소 주소로 교체하세요
# (YOUR_USERNAME을 실제 사용자명으로)
git remote add origin https://github.com/YOUR_USERNAME/3d-platform.git
git branch -M main
git push -u origin main
```

**다음과 같이 표시되면 성공:**
```
Enumerating objects: 50, done.
...
To github.com:YOUR_USERNAME/3d-platform.git
 * [new branch]      main -> main
```

---

## 2단계: Vercel 배포 (3분)

### 2-1. Vercel 대시보드
1. https://vercel.com 로그인
2. **Add New** → **Project** 클릭

### 2-2. GitHub 연결
1. **Import Git Repository** 클릭
2. **3d-platform** 저장소 선택
3. 다음 설정 확인:
   - Framework: **Next.js** ✓
   - Build Command: **npm run build** ✓
   - Install Command: **npm install --legacy-peer-deps** ✓

4. **Deploy** 클릭

### 2-3. 배포 완료 대기 (2-3분)

Vercel 대시보드에서 배포 진행 상황 확인:
- ✅ Deploying...
- ✅ Building...
- ✅ Production Deployment Ready

### 2-4 배포 URL 획득

```
https://3d-platform-YOUR_USERNAME.vercel.app
```

---

## 3단계: 라이브 테스트 (1분)

배포된 URL을 브라우저에서 열기:

- [ ] 홈페이지 로드 ✓
- [ ] 파일 드래그앤드롭 ✓
- [ ] 업로드 후 `/view/:id` 리다이렉트 ✓
- [ ] 3D 뷰어 렌더링 ✓
- [ ] AR 모드 토글 ✓

---

## ✅ 배포 완료!

### 라이브 링크
```
https://3d-platform-YOUR_USERNAME.vercel.app
```

### 앞으로
- `git push` → 자동 배포됨
- 새 기능 추가 시 Vercel이 자동으로 빌드/배포
- 환경변수 변경: Vercel Settings → Environment Variables

---

## 🐛 문제 해결

### "Cannot find Git repository"
→ 저장소가 GitHub에 생성되었는지 확인

### 배포 실패 (Build Error)
→ 로컬에서 `npm run build` 성공 여부 확인

### `/view/:id` → 404
→ 배포 후 새로 파일을 업로드하면 정상 작동

---

## 📞 추가 도움말

- **배포 문서**: DEPLOYMENT.md
- **프로젝트 README**: README.md
- **Vercel 문서**: https://vercel.com/docs

---

**준비됐나요?** 위 단계를 따라 배포하세요! 🚀

