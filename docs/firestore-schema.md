# Firestore 스키마 가이드

## 1. classrooms

문서 예시: `classrooms/main`

```json
{
  "schoolYear": 2026,
  "grade": 5,
  "classNumber": 1,
  "maxInventorySlots": 12,
  "createdAt": "2026-03-15T08:30:00.000Z",
  "updatedAt": "2026-03-15T08:30:00.000Z"
}
```

## 2. students

문서 예시: `students/g5-c1-s01`

```json
{
  "loginKey": "g5-c1-s01",
  "grade": 5,
  "classNumber": 1,
  "studentNumber": 1,
  "name": "김하늘",
  "nickname": "하늘",
  "password4digit": "1111",
  "selectedCharacter": "maru",
  "inventory": [
    {
      "id": "inv-demo-01",
      "itemId": "item-pearl-necklace",
      "sessionId": "session-1",
      "obtainedBy": "purchase",
      "obtainedAt": "2026-03-07T05:00:00.000Z"
    }
  ],
  "createdAt": "2026-03-15T08:30:00.000Z",
  "updatedAt": "2026-03-15T08:30:00.000Z"
}
```

## 3. items

문서 예시: `items/item-pearl-necklace`

```json
{
  "name": "진주 목걸이",
  "description": "1차시에서 얻을 수 있는 장식 아이템입니다.",
  "price": 50,
  "imageUrl": "/assets/items/pearl-necklace.png",
  "applicableCharacters": [],
  "type": "purchase",
  "activeSessions": ["session-1"],
  "createdAt": "2026-03-15T08:30:00.000Z",
  "updatedAt": "2026-03-15T08:30:00.000Z"
}
```

## 4. sessions

문서 예시: `sessions/session-1`

```json
{
  "title": "1차시",
  "shopOpen": true,
  "purchaseItems": ["item-pearl-necklace", "item-sunglasses", "item-military-hat"],
  "bonusItems": [],
  "bonusEnabled": false,
  "notes": "1차시 실제 구매 아이템이 연결된 차시입니다.",
  "createdAt": "2026-03-15T08:30:00.000Z",
  "updatedAt": "2026-03-15T08:30:00.000Z"
}
```

## 5. logs

문서 예시: `logs/auto-id`

```json
{
  "studentId": "g5-c1-s01",
  "sessionId": "session-1",
  "actionType": "item_purchased",
  "payload": {
    "itemId": "item-pearl-necklace",
    "itemName": "진주 목걸이",
    "cost": 50,
    "inventoryEntryId": "inv-demo-01"
  },
  "timestamp": "2026-03-07T05:00:00.000Z"
}
```

## 6. admins

문서 예시: `admins/teacher`

```json
{
  "loginId": "teacher",
  "password": "1234",
  "name": "담임 선생님",
  "createdAt": "2026-03-15T08:30:00.000Z",
  "updatedAt": "2026-03-15T08:30:00.000Z"
}
```

## 로그 actionType 추천값

- `score_entered`
- `item_purchased`
- `item_bonus_received`
- `item_discarded`
- `admin_bonus_given`
- `admin_inventory_removed`
- `session_closed`
- `character_selected`

## 운영 팁

- 학생 문서 ID를 `g5-c1-s01` 같은 고정 패턴으로 두면 로그인 조회가 단순해집니다.
- 학생 인벤토리는 항상 길이 12 이하로 유지합니다.
- 보상 확정 시 학생 문서와 로그 문서를 함께 갱신하는 방식이 운영하기 편합니다.
- 실제 배포에서는 학생/관리자 로그인 보안을 별도 서버 또는 Firebase Authentication으로 강화하는 것을 권장합니다.
