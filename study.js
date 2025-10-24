const STORAGE_KEY_EXCLUDES = "study_excludes_v3";
let pairs = [];
let order = [];
let idx = 0;
let phase = "kr";
let excludes = JSON.parse(localStorage.getItem(STORAGE_KEY_EXCLUDES) || "{}");
let mode = "sequential";

function saveExcludes() {
  localStorage.setItem(STORAGE_KEY_EXCLUDES, JSON.stringify(excludes));
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    [a[i], a[r]] = [a[r], a[i]];
  }
  return a;
}
//도우미 함수
function textKeepBreaksFromHTML(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")     // <br> → \n
    .replace(/<\/p>\s*<p>/gi, "\n")    // 문단 사이도 줄바꿈(있다면)
    .replace(/<[^>]+>/g, "")           // 나머지 태그 제거
    .replace(/\u00a0/g, " ")           // nbsp → 공백
    .replace(/[ \t]+\n/g, "\n")        // 줄 끝 공백 정리
    .replace(/\n[ \t]+/g, "\n")        // 줄 시작 공백 정리
    .replace(/[ \t]{2,}/g, " ")        // 다중 공백 1칸
    .trim();
}

// ===== 파서 (필터 유지) =====
async function loadChapter(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`불러오기 실패: ${url}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  const enNodes = doc.querySelectorAll("ul.to-do-list span.to-do-children-unchecked");
  const result = [];

  enNodes.forEach((enNode) => {
    const en = textKeepBreaksFromHTML(enNode.innerHTML || "");
    const ul = enNode.closest("ul.to-do-list");
    if (!ul) return;

    // 한글 문장은 to-do-list 바로 다음 bulleted-list
    let next = ul.nextElementSibling;
    while (next && !next.matches("ul.bulleted-list")) {
      next = next.nextElementSibling;
    }
    if (!next) return;

    // 제외: 설명용 리스트(circle/square)
    const krLi = next.querySelector("li");
    if (!krLi) return;
    const listStyle = krLi.getAttribute("style") || "";
    if (/list-style-type\s*:\s*(circle|square)/i.test(listStyle)) return;

    const kr =  textKeepBreaksFromHTML(krLi.innerHTML || "");
    if (!en || !kr) return;
    if (/callout|quote|table/i.test(kr)) return;

    result.push({ en, kr, id: en.slice(0, 40) });
  });

  return result;
}

// ===== 선택한 챕터만 로딩 =====
async function loadAll(paths) {
  const list = [];
  for (const path of paths) {
    try {
      const part = await loadChapter(path);
      list.push(...part);
    } catch (e) {
      console.error(e);
    }
  }
  pairs = list;
  rebuildOrder();
  buildChecklist();
  renderPairKR();
}

// ===== 순서/체크리스트/렌더 =====
function rebuildOrder() {
  //제외 체크 된 문장ID 들은 아예 순회 대상에서 빼기
  // const base = Array.from({ length: pairs.length }, (_, i) => i);
  const base = [];  
  for (let i = 0; i < pairs.length; i++) {
    const id = pairs[i].id;
    if (!excludes[id]) base.push(i);
  }
  order = (mode === "random") ? shuffle(base) : base;
  idx = 0;
  phase = "kr";
}

function buildChecklist() {
  const cont = document.getElementById("listContainer");
  cont.innerHTML = "";
  pairs.forEach((p, i) => {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!excludes[p.id];
    cb.addEventListener("change", () => {
      excludes[p.id] = cb.checked;
      saveExcludes();

       // 순서 재구성(제외 반영)
      const curId = pairs[order[idx]]?.id;
      rebuildOrder();
      // 방금 체크한 게 현재 문장이면 다음으로 넘어가기
      if (cb.checked && curId === p.id) {
        if (order.length) renderPairKR();
        else {
          document.getElementById("kr").textContent = "모든 문장이 제외되어 표시할 항목이 없습니다.";
          document.getElementById("en").style.display = "none";
          document.getElementById("progress").textContent = "";
        }
      } else {
        renderPairKR();
      }
    });
    label.append(cb, `${i + 1}. ${p.kr}`);
    cont.append(label);
  });
}

function renderPairKR() {
  const krEl = document.getElementById("kr");
  const enEl = document.getElementById("en");
  const progressEl = document.getElementById("progress");

  if (!pairs.length) {
    krEl.textContent = "로딩된 문장이 없습니다. 챕터를 선택하고 [학습 시작]을 눌러주세요.";
    enEl.style.display = "none";
    enEl.textContent = "";
    progressEl.textContent = "";
    return;
  }
  const cur = pairs[order[idx]];
  krEl.textContent = cur.kr;
  enEl.style.display = "none";
  enEl.textContent = "";
  progressEl.textContent = `${idx + 1}/${order.length} (${mode})`;
}

function renderPairEN() {
  const enEl = document.getElementById("en");
  const cur = pairs[order[idx]];
  if (excludes[cur.id]) {
    nextSentence();
    return;
  }
  enEl.textContent = cur.en;
  enEl.style.display = "block";
}

function next() {
  if (!pairs.length) return;
  if (phase === "kr") {
    phase = "en";
    renderPairEN();
  } else {
    nextSentence();
  }
}

function prev() {
  if (!pairs.length) return;
  if (phase === "en") {
    phase = "kr";
    renderPairKR();
  } else {
    idx = Math.max(0, idx - 1);
    phase = "kr";
    renderPairKR();
  }
}

function nextSentence() {
  if (idx < order.length - 1) {
    idx++;
    phase = "kr";
    renderPairKR();
  } else {
    const krEl = document.getElementById("kr");
    const enEl = document.getElementById("en");
    krEl.textContent = "✅ 모든 문장을 학습했습니다!";
    enEl.textContent = "";
    enEl.style.display = "none";
  }
}

// ===== 이벤트 바인딩 =====
document.getElementById("btnNext").addEventListener("click", next);
document.getElementById("btnPrev").addEventListener("click", prev);
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    next();
  }
});
document.querySelectorAll("input[name=mode]").forEach((r) => {
  r.addEventListener("change", () => {
    mode = r.value;
    rebuildOrder();
    renderPairKR();
  });
});

// ===== 공개 함수: index.html에서 선택 후 호출 =====
window.startStudy = async function(selectedPaths) {
  // 아무 것도 선택 안 했으면 안내
  if (!selectedPaths || !selectedPaths.length) {
    pairs = [];
    rebuildOrder();
    buildChecklist();
    renderPairKR();
    return;
  }

  // 로딩
  await loadAll(selectedPaths);

  // excludes의 고아 id 정리
  const valid = new Set(pairs.map(p => p.id));
  let changed = false;
  for (const k of Object.keys(excludes)) {
    if (!valid.has(k)) { delete excludes[k]; changed = true; }
  }
  if (changed) saveExcludes();
};
