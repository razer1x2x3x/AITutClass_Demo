# 光的旅行：5 人成人試用版上線與 AI 啟用

更新：2026-09-21

## 已確認的範圍

- 先由 5 位成人（教師或同事）試用，每月總預算 NT$1,000 內。
- 電腦、iOS、Android 使用同一個 HTTPS 網址，不需安裝 App。
- 每台裝置各自保存紀錄，學生匯出給老師；本期沒有班級帳號、跨裝置同步或雲端學生成績庫。
- GitHub 帳號：razer1x2x3x。此任務目前未取得可用的 GitHub connector，也尚未驗證 repository 存取權。
- AI 文字程度沿用國小五、六年級；成人以此年段教材進行測試。

## 本次已完成

1. 比較頁：加入 AI 差異與原因分析。少於兩張、相同條件、同時變更多個條件時，先提供明確補卡建議，毋須支付 AI 請求。
2. 驗收頁：加入五步驟導覽；提交後可產生概念分析，並在教師頁同步呈現這台裝置的同一份結果。
3. 教師頁：整合已確認的新解釋、比較結果、實驗、設計想法、學生提問及逐題作答，產生教學建議。
4. 分析綁定提交內容；修改資料後不顯示過期分析。重新作答不套用先前結論。
5. 「我的發現」和「教師視角」可下載 HTML 教師參考摘要，含作答、提問、現有有效 AI 分析和教師回饋；完整資料仍可匯出 JSON。
6. 服務端重新計算證據物理結果及答案正誤；驗證 AI 回覆格式、引用證據 ID 與題目 ID。學生文字不被當成系統指令。
7. 雲端模式具試用碼入口與簽章 cookie；金鑰只放服務端。離線或尚未設定金鑰時明確顯示 AI 尚未啟用。

目前：程式与本機流程完成；真實 AI 尚未連線驗證，網站尚未部署到外部主機。

## 建議服務與費用分配

- GitHub 私人 repository：保存程式，建議名稱 `light-journey-trial`。上傳範圍為 light-lab 程式與文件，不包含父目錄教材、backup、參考圖、學生紀錄或秘密檔。
- Render：Hobby workspace + 一台付費 Node Web Service；現有 Node 服務可直接使用，無須改成另一套網站框架。官方列出的入門常駐服務為 US$7／月，實際以建立服務時頁面為準。先用提供的 onrender.com 網址，不購買網域。
- OpenAI API：獨立專案與專用金鑰。先安排 NT$300 的 AI 試用預算，保留餘額給主機、稅費與匯率差。模型在帳號可用清單與當時單價確認後選擇，不先假設昂貴模型。
- 建議總預算分配：網站 NT$350、AI NT$300、保留 NT$350。這是預算安排，並非服務商固定新台幣報價。
- 本版同時最多 2 個 AI 請求、全體每分鐘最多 10 次、每日預設最多 50 次、分析每次最多 2400 output tokens。日次數依 UTC，重啟程序會重設，因此它不是可靠的月費硬上限。付費前需在平台確認可用的預付額度、通知、充值及用量控制，不可把警示額度誤當強制停用。

## 使用者需完成或提供的最少事項

1. 登入自己的 GitHub 帳號，授權本專案的私人 repository 存取；若 Codex connector 尚未連上，可使用已登入的瀏覽器處理。
2. 用自己的 GitHub 身分登入／建立 Render 帳號，完成服務條款與付款設定。授權 Render 讀取這個 repository 即可。
3. 登入／建立 OpenAI API 平台帳號，建立本教材專用專案、啟用 API 計費並設定預算。這裡需要可用的 API 專案；網站不使用使用者的 ChatGPT 網頁對話作為 API。
4. 在代管平台的私密環境變數輸入專用 API 金鑰。不要貼在對話、GitHub、網頁程式或截圖中。模型 ID 由我們依可用模型和預算確認後填入。
5. 認可具體部署方案後，我可處理程式上傳、啟動與健康檢查設定、部署、試用碼配置、外部網址、手機排版與 AI 連線測試。需要帳號持有人親自操作的登入、驗證碼、付款和條款會留給你。

尚未建立付費服務、尚未付款、沒有傳送任何學生資料給 AI。以上登入／授權完成後才能進行真實上線驗證。

## Render 的具體設定

Repository 若以 light-lab 為根目錄：

- Service：Web Service，Node runtime，Node 22 以上。
- Build command：`npm install --ignore-scripts`（沒有第三方套件依賴）。
- Start command：`npm start`。
- Health check：`/healthz`。
- PORT：使用平台自動提供的值。
- PUBLIC_ORIGIN：實際 HTTPS 網址，例如 `https://實際服務名稱.onrender.com`，不得填未建立的示範網址。
- TRIAL_ACCESS_CODE：至少 16 字元的隨機試用碼，秘密環境變數。給五位試用者使用；它不是正式學生／教師權限系統。
- OPENAI_API_KEY：秘密環境變數。
- OPENAI_MODEL：待確認的實際模型 ID。
- AI_DAILY_REQUEST_LIMIT：50（五位共用）。

未設定 PUBLIC_ORIGIN 時服務只監聽 127.0.0.1；設定 HTTPS origin 和合格試用碼後，才監聽 0.0.0.0 供代管平台使用。不能只把 localhost 網址傳給外部使用者。

## 資料與限制

- 作答、證據、自由填答、AI 分析存在目前瀏覽器；清除瀏覽器資料會消失。試用者完成後下載教師摘要交給老師，老師直接以瀏覽器開啟。
- AI payload 只取分析所需欄位，不包含未確認解釋草稿、教師評分／回饋、完整時間線或歷史 AI 回覆。自由文字仍可能被使用者輸入個人資料，因此畫面提醒不要填寫姓名和聯絡資料。
- OpenAI 請求設 `store:false`，不代表已取得零資料保留資格，也不代表沒有服務商的其他必要紀錄。
- 此期先限成人測試。未來若讓國小學生實際使用，需要重新確認年齡、告知流程、自由填答資料及服務商未成年使用要求，不能直接把成人試用設定當成正式學生環境。
- 自動化測試中的 AI 回覆是注入測試替身，僅驗證接口與拒絕錯誤引用，沒有宣称是真實模型品質驗證。
- 已以桌面與 390px 瀏覽器寬度檢查。尚未在實體 iPhone 和 Android 上執行觸控、下載與長時間操作驗證；正式試用網址建立後再驗證。

## 官方參考

- Render Node 部署：https://render.com/docs/deploy-node-express-app
- Render 費用：https://render.com/pricing
- OpenAI 開始使用：https://developers.openai.com/api/docs/quickstart
- 結構化回覆：https://developers.openai.com/api/docs/guides/structured-outputs
- 未成年使用要求：https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance
