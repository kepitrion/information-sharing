const { Address4, Address6 } = require('ip-address');

const { sendPermission }  = require("./internal.js");

module.exports = {
    name: "군소위키 정보 공유 시스템 (Backend)",
    type: "preHook",
    condition (req) {
        if (req.method !== "POST") return false;

        const url = req.path;

        return url === "/admin/rapid-situation-sharing/send" || url === "/admin/shared-aclgroup";
    },
    async handler (req, res) {
        const url = req.path;

        if (url === "/admin/rapid-situation-sharing/send") {
            if (!req.permissions.includes(sendPermission)) return res.status(403).send('권한이 부족합니다.');

            const { name: username } = req.user;

            const login = await fetch(`https://${process.env.INFORMATION_SHARING_HOST}/auth/v1/token?grant_type=password`, {
                method: "POST",
                headers: {
                    'apikey': process.env.INFORMATION_SHARING_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: process.env.INFORMATION_SHARING_EMAIL,
                    password: process.env.INFORMATION_SHARING_PASSWORD
                })
            });

            if (!login.ok) {
                return res.error("군소위키 정보 공유 시스템 로그인에 실패했습니다. 서버 관리자에게 문의하여 정보를 점검해 주세요.", 500);
            }
            
            const { access_token } = await login.json();
            const insert = await fetch(`https://${process.env.INFORMATION_SHARING_HOST}/rest/v1/alerts`, {
                method: "POST",
                headers: {
                    apikey: process.env.INFORMATION_SHARING_KEY,
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify([{
                    wiki: config.site_name,
                    trigger: username,
                    title: req.body.title,
                    message: req.body.content,
                    type: "alert"
                }])
            });

            if(!insert.ok) {
                return res.error("발신에 실패했습니다.", 500);
            }

            return res.redirect("/admin/rapid-situation-sharing/send");
        }
        else if (url === "/admin/shared-aclgroup") {
            const { name: username } = req.user;

            if(!Address4.isValid(req.body.target) && !Address6.isValid(req.body.target)) {
                return res.error("잘못된 IP가 제공되었습니다.", 400);
            }

            const login = await fetch(`https://${process.env.INFORMATION_SHARING_HOST}/auth/v1/token?grant_type=password`, {
                method: "POST",
                headers: {
                    'apikey': process.env.INFORMATION_SHARING_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: process.env.INFORMATION_SHARING_EMAIL,
                    password: process.env.INFORMATION_SHARING_PASSWORD
                })
            });

            if (!login.ok) {
                return res.error("군소위키 정보 공유 시스템 로그인에 실패했습니다. 서버 관리자에게 문의하여 정보를 점검해 주세요.", 500);
            }
            
            const { access_token } = await login.json();
            const insert = await fetch(`https://${process.env.INFORMATION_SHARING_HOST}/rest/v1/aclgroups`, {
                method: "POST",
                headers: {
                    apikey: process.env.INFORMATION_SHARING_KEY,
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify([{
                    wiki: config.site_name,
                    trigger: username,
                    target: req.body.target,
                    reason: req.body.reason,
                    expires_at: new Date(req.body.expire === "0" ? 0 : Number(new Date()) + Number(req.body.expire)).toISOString(),
                }])
            });

            if(!insert.ok) {
                return res.error("저장에 실패했습니다.", 500);
            }

            return res.redirect("/admin/shared-aclgroup");
        }
    }
}