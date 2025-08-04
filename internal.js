const { models } = require("mongoose");

const { NotificationTypes } = require("../../utils/types");

const ws = new WebSocket(`wss://${process.env.INFORMATION_SHARING_HOST}/realtime/v1/websocket?apikey=${process.env.INFORMATION_SHARING_KEY}`);

ws.onopen = () => {
    console.info("군소위키 정보 공유 시스템에 연결되었습니다.");

    ws.send(JSON.stringify({
		topic: "realtime:public:alerts",
		event: "phx_join",
		payload: {},
		ref: "1"
	}));

    ws.send(JSON.stringify({
		topic: "realtime:public:alerts",
		event: "postgres_changes",
		payload: {
			event: "INSERT",
			schema: "public",
			table: "alerts"
		},
		ref: "2"
	}));

    ws.send(JSON.stringify({
		topic: "realtime:public:aclgroups",
		event: "phx_join",
		payload: {},
		ref: "3"
	}));

    ws.send(JSON.stringify({
		topic: "realtime:public:aclgroups",
		event: "postgres_changes",
		payload: {
			event: "INSERT",
			schema: "public",
			table: "aclgroups"
		},
		ref: "4"
	}));
};

ws.onerror = (err) => {
	console.error("군소위키 정보 공유 시스템 연결에 실패했습니다.");
    console.error(err.message);
    console.error(err.stack !== undefined ? err.stack : "");
};

ws.onmessage = async (event) => {
	const data = JSON.parse(event.data);

    if (data.event === "INSERT") {
        if (data.payload.table === "alerts") {
            const adminUsers = await models.User.find({
                permissions:  {
                    $in: [
                        "admin",
                        "developer"
                    ]
                }
            });

            adminUsers.forEach(async (item) => {
                await models.Notification.create({
                    type: NotificationTypes.Plugin,
                    user: item.uuid,
                    data: `<div style=\"font-size: 1.4rem; font-weight: bold;\">${data.payload.record.title}</div>` +
                    "<a href=\"/admin/rapid-situation-sharing/receive\">군소위키 고속상황전파체계</a>에서 자세한 내용을 확인해 주세요."
                });
            });
        }
        else if (data.payload.table === "aclgroups") {
            try {
                const aclgroup = await models.ACLGroup.find({
                    name: {
                        $eq: "공유된 차단된 IP",
                    }
                });

                if (aclgroup.length === 0) {
                    console.warn(`공유된 차단된 IP ACLGroup이 존재하지 않아 차단된 사용자 ACLGroup에 생성을 시도합니다. 내부 ID: #${data.payload.record.id}`)
                    console.info("공유된 차단된 IP의 경우 차단 기록이 남지 않으므로 별도의 ACLGroup을 생성하여 관리하는 것을 강력히 추천합니다.");

                    const aclgroup = await models.ACLGroup.find({
                        name: {
                            $eq: "차단된 사용자",
                        }
                    });

                    if (aclgroup.length === 0) {
                        console.error("차단된 사용자 ACLGroup이 존재하지 않아 중단되었습니다.");

                        return;
                    }

                    console.log(await models.ACLGroupItem.create({
                        aclGroup: aclgroup[0].uuid,
                        ip: data.payload.record.target,
                        note: `${data.payload.record.wiki}의 ${data.payload.record.trigger}(이)가 추가함: ${data.payload.record.reason}`,
                        expiresAt: Number(new Date(data.payload.record.expires_at)) === 0 ? null : data.payload.record.expires_at,
                    }));

                    return;
                }

                await models.ACLGroupItem.create({
                    aclGroup: aclgroup[0].uuid,
                    ip: data.payload.record.target,
                    note: `${data.payload.record.wiki}의 ${data.payload.record.trigger}(이)가 추가함: ${data.payload.record.reason}`,
                    expiresAt: Number(new Date(data.payload.record.expires_at)) === 0 ? null : data.payload.record.expires_at,
                });
            }
            catch (e) {
                console.error("ACLGroup 요소 생성 중 오류가 발생했습니다.");
                console.info("이미 같은 요소가 존재하거나 서버 문제일 수 있습니다. 이유를 찾을 수 없는 경우 다음 기록와 함께 관리자에게 문의하세요.");
                console.error(e.message);
                console.error(e.stack !== undefined ? e.stack : "");
            }
        }
    }
};

let sendPermission = "admin";

if (config.testwiki) {
    sendPermission = "grant";
}

module.exports = {
    name: "군소위키 정보 공유 시스템 (Internal)",
    type: "preHook",
    condition () {
        return false;
    },
    sendPermission
};
