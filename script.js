document.addEventListener('DOMContentLoaded', () => {
    // === タブ切り替え機能 ===
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 全てのタブとコンテンツからactiveクラスを削除
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // クリックされたタブをactiveにする
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // === 計算ツール機能 ===
    const calcForm = document.getElementById('calc-form');
    const resultArea = document.getElementById('result-area');
    
    // 表示用要素の取得
    const resCal = document.getElementById('res-cal');
    const resProtein = document.getElementById('res-protein');
    const resFat = document.getElementById('res-fat');
    const resSteak = document.getElementById('res-steak');
    const splitProtein = document.getElementById('split-protein');
    const splitFat = document.getElementById('split-fat');

    calcForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // フォーム入力値の取得
        const weight = parseFloat(document.getElementById('weight').value);
        const bodyFat = parseFloat(document.getElementById('bodyfat').value);
        const activity = parseFloat(document.getElementById('activity').value);
        const goal = document.getElementById('goal').value;

        // 入力チェック
        if (isNaN(weight) || isNaN(bodyFat) || weight <= 0 || bodyFat <= 0) {
            alert('体重と体脂肪率を正しく入力してください。');
            return;
        }

        // --- 計算ロジック ---
        // 1. 除脂肪体重（LBM）= 体重 × (1 − 体脂肪率/100)
        const lbm = weight * (1 - (bodyFat / 100));
        
        // 2. 基礎代謝量（BMR）= 370 + (21.6 × LBM)
        const bmr = 370 + (21.6 * lbm);
        
        // 3. 1日の消費カロリー（TDEE）= BMR × 活動係数
        const tdee = bmr * activity;

        // 4. 目標カロリーとマクロ配分の決定
        let targetCalories;
        let proteinRatio;
        let fatRatio;

        if (goal === 'loss') {
            targetCalories = tdee * 0.80; // 減量時
            proteinRatio = 0.35;
            fatRatio = 0.65;
        } else if (goal === 'maintain') {
            targetCalories = tdee; // 維持時
            proteinRatio = 0.30;
            fatRatio = 0.70;
        } else if (goal === 'bulk') {
            targetCalories = tdee * 1.10; // 増量時
            proteinRatio = 0.30;
            fatRatio = 0.70;
        }

        // 5. 各栄養素のグラム数計算
        // タンパク質(g) = 目標カロリー × タンパク質割合 / 4
        // 脂質(g) = 目標カロリー × 脂質割合 / 9
        const proteinCal = targetCalories * proteinRatio;
        const fatCal = targetCalories * fatRatio;

        const proteinGrams = proteinCal / 4;
        const fatGrams = fatCal / 9;

        // 6. 追加情報の計算
        // ステーキ換算（ステーキ100gあたりタンパク質20gとして計算）
        const steakEq = proteinGrams * (100 / 20);

        // 3食に均等分割
        const mealProtein = proteinGrams / 3;
        const mealFat = fatGrams / 3;

        // --- 結果の表示とアニメーション ---
        // 隠していた結果エリアを表示
        resultArea.classList.remove('hidden');
        
        // 少し遅らせてスムーズスクロール＆数字アニメーション開始
        setTimeout(() => {
            // 結果エリアへスクロール
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // 各数字をカウントアップアニメーションで表示
            animateValue(resCal, 0, Math.round(targetCalories), 1200);
            animateValue(resProtein, 0, Math.round(proteinGrams), 1200);
            animateValue(resFat, 0, Math.round(fatGrams), 1200);
            animateValue(resSteak, 0, Math.round(steakEq), 1200);
            animateValue(splitProtein, 0, Math.round(mealProtein), 1200);
            animateValue(splitFat, 0, Math.round(mealFat), 1200);
        }, 50);
    });

    /**
     * 数字をカウントアップするアニメーション関数
     * @param {HTMLElement} obj - 更新するDOM要素
     * @param {number} start - 開始値
     * @param {number} end - 終了値
     * @param {number} duration - アニメーション時間(ms)
     */
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // イーズアウト（徐々に遅くなる）
            const easeOut = progress * (2 - progress);
            obj.innerHTML = Math.floor(easeOut * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
