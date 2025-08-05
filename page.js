const { sendPermission }  = require("./internal.js");

module.exports = {
    name: "군소위키 정보 공유 시스템 (Frontend)",
    type: "page",
    menus: {
        "aclgroup": [{
            l: "/admin/shared-aclgroup",
            t: "군소위키 공유 ACL Group"
        }],
        "admin": [{
            l: "/admin/rapid-situation-sharing/receive",
            t: "군소위키 고속상황전파체계 (수신)"
        }]
    },
    url (url) {
        return url === "/admin/rapid-situation-sharing" || url === "/admin/rapid-situation-sharing/receive" || url === "/admin/rapid-situation-sharing/send" || url === "/admin/shared-aclgroup";
    },
    async handler (req, res) {
        let url = req.path;
        
        if(url.startsWith('/internal/')) url = url.slice('/internal'.length);

        res.setHeader("content-security-policy", "script-src 'self' 'unsafe-inline' https://unpkg.com;")

        const commonHTML = `
            <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
            <style>
                button {
                    padding: 0.3rem 1rem;
                    border: none;
                }

                h2, p {
                    margin: 0;
                    padding: 0;
                }

                .situation-element:first-child {
                    border-top: 0.004rem solid #afafaf;
                }

                .situation-element {
                    padding: 0.5rem 1rem;
                    border-bottom: 0.004rem solid #afafaf;
                }
                    
                .title {
                    font-size: 1.7rem;
                }

                .content {
                    font-size: 1.05rem;
                }

                .trigger {
                    margin-top: 0.2rem;
                    opacity: 0.8;
                    font-size: 0.95rem;
                }

                .plugin-send {
                    display: grid;
                }

                .plugin-input, #content, #expire {
                    border-radius: 0;
                    border: 1px solid #00000020;
                }

                .plugin-input, #content {
                    width: 100%;
                    padding: 0.4rem;
                }
                
                #content {
                    height: 10rem;
                    resize: none;
                    font-family: inherit;
                }

                #expire {
                    width: fit-content;
                    padding: 0.4rem 1rem;
                }

                .submit {
                    float: right;
                    margin-top: 1rem;
                    padding: 0.4rem 2.5rem;
                    background: #a0a0a050;
                }

                .submit:hover {
                    background: #6f6f6f50;
                }
            </style>
        `;

        if (url === "/admin/rapid-situation-sharing") {
            if (!req.permissions.includes("admin") || !req.permissions.includes(sendPermission)) return await res.error("권한이 부족합니다", 403);

            return await res.renderSkin("군소위키 고속상황전파체계", {
                contentHtml: commonHTML + `
                <div>타 위키에서 전파된 상황의 확인을 위해서는 수신을, 긴급하게 상황 전파가 필요한 경우 발신을 선택하시기 바랍니다.</div>
                <a href="/admin/rapid-situation-sharing/receive"><button>수신</button></a> 
                <a href="/admin/rapid-situation-sharing/send"><button>발신</button></a>
                `
            });
        }
        else if (url === "/admin/rapid-situation-sharing/receive") {
            if (!req.permissions.includes("admin")) return await res.error("권한이 부족합니다", 403);

            return await res.renderSkin("군소위키 고속상황전파체계 (수신)", {
                contentHtml: commonHTML + `
                <script type="module" nonce="c04e078a7c7ec81fa148902fc010e6bba93a82cc0b20662f748345c06e0f02d7">
                    const SUPABASE_URL = "https://${process.env.INFORMATION_SHARING_HOST}";
                    const SUPABASE_KEY = "${process.env.INFORMATION_SHARING_KEY}";
                    const database = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                
                    const { data } = await database.from("alerts").select("*").limit(10).order("created_at", {
                        ascending: false,
                    });
                    
                    const root = document.getElementById("plugin-root");

                    if (data.length === 0) {
                        root.innerHTML = "아직 수신된 상황이 없습니다.";
                    }
                    else {
                        root.innerHTML = "";
                    
                        for(const alert of data) {
                            const element = document.createElement("div");

                            if (alert.type === "announcement") {
                                element.innerHTML = \`
                                    <h2 class="title">\${alert.title} (#\${alert.id})</h2>
                                    <p class="content">\${alert.message.replaceAll("\\n", "<br>")}</p>
                                    <div class="trigger">\${new Date(alert.created_at).toLocaleDateString()} \${new Date(alert.created_at).toLocaleTimeString()}에 공지됨.</div>
                                \`;
                            }
                            else {
                                element.innerHTML = \`
                                    <h2 class="title">\${alert.title} (#\${alert.id})</h2>
                                    <p class="content">\${alert.message.replaceAll("\\n", "<br>")}</p>
                                    <div class="trigger">\${new Date(alert.created_at).toLocaleDateString()} \${new Date(alert.created_at).toLocaleTimeString()}에 전파됨.
                                    \${alert.wiki}의 \${alert.trigger}(이)가 전파함.</div>
                                \`;
                            }

                            element.className = "situation-element";
                            
                            root.appendChild(element);
                        }
                    }
                </script>
                <div id="plugin-root">Loading...</div>`
            });
        }
        else if (url === "/admin/rapid-situation-sharing/send") {
            if (!req.permissions.includes(sendPermission)) return await res.error("권한이 부족합니다", 403);

            return await res.renderSkin("군소위키 고속상황전파체계 (발신)", {
                contentHtml: commonHTML + `
                <form class="plugin-send" method="POST">
                    <label for="title">제목</label>
                    <input id="title" type="text" name="title" class="plugin-input" required>
                    <label for="title">내용</label>
                    <textarea id="content" name="content" requiredt></textarea>
                    <div>
                        <button class="submit">발신</button>
                    </div>
                </form>
                * 만약 발신 이후 오류 없이 이 화면으로 돌아왔다면 정상적으로 발신된 것입니다.
                `
            });
        }
        else if (url === "/admin/shared-aclgroup") {
            if (!req.permissions.includes("aclgroup")) return await res.error("권한이 부족합니다", 403);

            return await res.renderSkin("군소위키 공유 ACLGroup", {
                contentHtml: commonHTML + `
                <form class="plugin-send" method="POST">
                    <label for="target">IP (CIDR)</label>
                    <input id="target" type="text" name="target" class="plugin-input" required>
                    <label for="reason">이유</label>
                    <input id="reason" type="text" name="reason" class="plugin-input" required>
                    <label for="expire">기간</label>
                    <select id="expire" name="expire">
                        <option value="0" selected>영구</option>
                        <option value="86400">1일</option>
                        <option value="604800">1주</option>
                        <option value="2419200">1개월</option>
                        <option value="14515200">6개월</option>
                        <option value="29030400">1년</option>
                    </select>
                    <div>
                        <button class="submit">저장</button>
                    </div>
                    * 이 요소를 저장하면 군소위키 공유 ACLGroup에 가입한 모든 위키의 ACLGroup에 해당 요소가 추가됩니다. 잘못된 요소는 없는지 다시 한 번 검토해주시기 바랍니다.<br>
                    * 만약 저장 이후 오류 없이 이 화면으로 돌아왔다면 정상적으로 저장된 것입니다.
                </form>
                `
            });
        }
    }
}

const sendMenu = {
    l: "/admin/rapid-situation-sharing/send",
    t: "군소위키 고속상황전파체계 (발신)"
};

if(sendPermission === "admin") {
    module.exports.menus.admin.push(sendMenu);
}

else {
    module.exports.menus[sendPermission].push(sendMenu);
}
