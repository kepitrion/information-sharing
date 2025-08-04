# 군소위키 정보 공유 시스템
# 참여하는 방법
1. Kepitrion @ Discord로 연락해 소유자의 E-mail을 제공하고 API Endpoint, API Key, API Password를 제공받는다. (API E-mail은 처음에 제공한 소유자의 E-mail이다.)
2. .env에 다음과 같은 줄을 추가한다.
```env
INFORMATION_SHARING_HOST=(제공된 API Endpoint)
INFORMATION_SHARING_KEY=(제공된 API Key)
INFORMATION_SHARING_EMAIL=(API E-mail)
INFORMATION_SHARING_PASSWORD=(API Password)
```
3. 위키 엔진을 재시작한다.
4. 군소위키 정보 공유 시스템 페이지가 제대로 표시되는지 확인한다.
# 현재 존재하는 문제
1. SPA가 작동하지 않음.
