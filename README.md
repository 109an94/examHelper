# examhelper

간단한 시험 암기용 문장 암기 페이지입니다.

데모(호스팅): https://109an94.github.io/examHelper/

사용법
1. 웹에서 바로 접속: 위 URL 방문  
2. 로컬에서 실행: 프로젝트 루트의 [index.html](index.html)를 브라우저로 엽니다.  
3. 챕터 선택 후 `학습 시작` 클릭 — 챕터 목록은 `STUDY_CHAPTERS`([index.html](index.html))에서 관리합니다.  
4. 내부 로직은 [`window.startStudy`](study.js)를 통해 선택한 챕터를 불러옵니다. 자세한 파서/렌더링은 [study.js](study.js)를 참고하세요.

간단 수정
- 챕터 추가/제거: `STUDY_CHAPTERS` (index.html) 배열을 편집하세요.  
- 로직 변경: [study.js](study.js) 내부의 함수들을 수정하세요 (`loadChapter`, `loadAll`, `rebuildOrder` 등).

저장소 이름: examhelper
```// filepath: README.md
# examhelper

간단한 시험 암기용 문장 암기 페이지입니다.

데모(호스팅): https://109an94.github.io/examHelper/

사용법
1. 웹에서 바로 접속: 위 URL 방문  
2. 로컬에서 실행: 프로젝트 루트의 [index.html](index.html)를 브라우저로 엽니다.  
3. 챕터 선택 후 `학습 시작` 클릭 — 챕터 목록은 `STUDY_CHAPTERS`([index.html](index.html))에서 관리합니다.  
4. 내부 로직은 [`window.startStudy`](study.js)를 통해 선택한 챕터를 불러옵니다. 자세한 파서/렌더링은 [study.js](study.js)를 참고하세요.

간단 수정
- 챕터 추가/제거: `STUDY_CHAPTERS` (index.html) 배열을 편집하세요.  
- 로직 변경: [study.js](study.js) 내부의 함수들을 수정하세요 (`loadChapter`, `loadAll`, `rebuildOrder` 등).

저장소 이름: examhelper