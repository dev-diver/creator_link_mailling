# GAS creatorlink mailling project

## clasp 사용법

- google apps script에서는 clasp를 사용하여 local 코드와 연동시킬 수 있음

```javascript
npm install -g @google/clasp
clasp login //로그인
clasp clone <scriptId>
```

- `scriptId`는 주소창에 `script.google.com/home/prjoects/<scriptId>/edit`의 형태로 나타나있음

```javascript
clasp pull //현재 프로젝트 가져옴
clasp push //local code를 프로젝트에 반영
```

## git과 연동전략

- local에서 코딩하는 경우
  - `clasp push`로 GAS프로젝트에 올린 후 잘 돌아가는지 확인
  - `git commit->push->PR`
- GAS 프로젝트에서 에서 코딩하는 경우
  - GAS프로젝트에서 잘 돌아가는 지 확인 후 local에서 `clasp pull`
  - `git commit->push->PR`
