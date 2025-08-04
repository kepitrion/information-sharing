# 군소위키 정보 공유 시스템
# 참여하는 방법
1. `plugins/information-sharing`에 이 저장소를 clone한다.
2. Kepitrion @ Discord로 연락해 소유자의 E-mail을 제공하고 API Endpoint, API Key, API Password를 제공받는다. (API E-mail은 처음에 제공한 소유자의 E-mail이다.)
3. .env에 다음과 같은 줄을 추가한다.
```env
INFORMATION_SHARING_HOST=(제공된 API Endpoint)
INFORMATION_SHARING_KEY=(제공된 API Key)
INFORMATION_SHARING_EMAIL=(API E-mail)
INFORMATION_SHARING_PASSWORD=(API Password)
```
4. 위키 엔진을 재시작한다.
5. 군소위키 정보 공유 시스템 페이지가 제대로 표시되는지 확인한다.
# 현재 존재하는 문제
N/A
# 라이선스 및 책임 보증
the tree 엔진과 마찬가지로 별도의 수정을 허용하지 않으며, 외부 DB 사용으로 인한 오작동 역시 책임지지 않습니다. 정식 시스템에 가입하지 않고 별도의 DB를 구축하여 사용하는 것을 막지는 않으나, 정식 시스템 외부의 DB에서 발생한 문제에 대해 별도의 A/S는 제공하지 않습니다.
