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
    const resRibeye = document.getElementById('res-ribeye');
    const splitProtein = document.getElementById('split-protein');
    const splitFat = document.getElementById('split-fat');
    const splitRibeye = document.getElementById('split-ribeye');

    calcForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // フォーム入力値の取得
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseFloat(document.getElementById('age').value);
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const bodyFatStr = document.getElementById('bodyfat').value;
        const bodyFat = bodyFatStr !== '' ? parseFloat(bodyFatStr) : null;
        const activity = parseFloat(document.getElementById('activity').value);
        const goal = document.getElementById('goal').value;

        // 入力チェック
        if (isNaN(age) || isNaN(height) || isNaN(weight) || weight <= 0 || height <= 0 || age <= 0) {
            alert('年齢、身長、体重を正しく入力してください。');
            return;
        }

        // --- 計算ロジック ---
        let lbm = null;
        let bmr = 0;

        if (bodyFat !== null && bodyFat > 0) {
            // 体脂肪率入力時：Katch-McArdle式
            lbm = weight * (1 - (bodyFat / 100));
            bmr = 370 + (21.6 * lbm);
        } else {
            // 体脂肪率が空欄の場合：Harris-Benedict式
            if (gender === 'male') {
                bmr = 88.36 + (13.40 * weight) + (4.80 * height) - (5.68 * age);
            } else {
                bmr = 447.6 + (9.25 * weight) + (3.10 * height) - (4.33 * age);
            }
        }

        // 3. 1日の消費カロリー（TDEE）
        const tdee = bmr * activity;

        // 4. 目標カロリーとマクロ配分
        let targetCalories;
        let proteinRatio;
        let fatRatio;

        if (goal === 'loss') {
            targetCalories = tdee * 0.80; // 減量時
            proteinRatio = 0.35;
            fatRatio = 0.65;
        } else if (goal === 'maintain') {
            targetCalories = tdee * 1.00; // 維持時
            proteinRatio = 0.30;
            fatRatio = 0.70;
        } else if (goal === 'bulk') {
            targetCalories = tdee * 1.12; // 増量時
            proteinRatio = 0.30;
            fatRatio = 0.70;
        }

        let warnings = [];

        // 下限カロリーチェック (LBMがわかる場合)
        if (lbm !== null) {
            const minCalories = lbm * 30;
            if (targetCalories < minCalories) {
                targetCalories = minCalories;
                warnings.push(`目標カロリーが代謝維持の最低ライン(LBM×30kcal)に修正されました。`);
            }
        }

        // 5. タンパク質量の計算
        let proteinGrams = (targetCalories * proteinRatio) / 4;

        // 下限チェック
        if (lbm !== null) {
            const minProtein = lbm * 1.8;
            if (proteinGrams < minProtein) {
                proteinGrams = minProtein;
                warnings.push(`タンパク質が筋肉保護の最低ライン(LBM×1.8g/kg)に修正されました。`);
            }
        }

        // 6. 脂質量の計算 (残りのカロリー)
        const fatCal = targetCalories - (proteinGrams * 4);
        const fatGrams = Math.max(0, fatCal / 9);

        // 7. 牛リブロース換算（100gあたりタンパク質18g）
        const ribeyeEq = proteinGrams * (100 / 18);

        // 3食に均等分割
        const mealProtein = proteinGrams / 3;
        const mealFat = fatGrams / 3;
        const mealRibeye = ribeyeEq / 3;

        // --- 結果表示 ---
        const warningsDiv = document.getElementById('warning-messages');
        if (warnings.length > 0) {
            warningsDiv.innerHTML = warnings.map(w => `<p>⚠️ ${w}</p>`).join('');
            warningsDiv.classList.add('show');
        } else {
            warningsDiv.innerHTML = '';
            warningsDiv.classList.remove('show');
        }

        resultArea.classList.remove('hidden');
        
        setTimeout(() => {
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            animateValue(resCal, 0, Math.round(targetCalories), 1200);
            animateValue(resProtein, 0, Math.round(proteinGrams), 1200);
            animateValue(resFat, 0, Math.round(fatGrams), 1200);
            animateValue(resRibeye, 0, Math.round(ribeyeEq), 1200);
            animateValue(splitProtein, 0, Math.round(mealProtein), 1200);
            animateValue(splitFat, 0, Math.round(mealFat), 1200);
            animateValue(splitRibeye, 0, Math.round(mealRibeye), 1200);
        }, 50);
    });

    // === タイムライン機能 ===
    const tlForm = document.getElementById('timeline-form');
    const tlResultArea = document.getElementById('timeline-result-area');
    
    tlForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const matchDateStr = document.getElementById('match-date').value;
        const currentWeight = parseFloat(document.getElementById('tl-current-weight').value);
        const targetWeight = parseFloat(document.getElementById('tl-target-weight').value);
        
        if (!matchDateStr || isNaN(currentWeight) || isNaN(targetWeight)) {
            alert('すべての項目を正しく入力してください。');
            return;
        }
        
        const matchDate = new Date(matchDateStr);
        matchDate.setHours(0,0,0,0);
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const diffTime = matchDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            alert('試合日は今日以降の日付を指定してください。');
            return;
        }
        
        const diffWeeks = diffDays / 7;
        let diffWeeksFloor = Math.floor(diffWeeks);
        if(diffWeeksFloor < 0) diffWeeksFloor = 0;
        
        const weightLoss = currentWeight - targetWeight;
        const weeklyLoss = diffWeeks > 0 ? (weightLoss / diffWeeks) : weightLoss;
        
        // --- 警告チェック ---
        const tlWarningDiv = document.getElementById('tl-warning');
        if (weeklyLoss > 1.5) {
            tlWarningDiv.innerHTML = '<p>⚠️ 急激すぎる減量は筋肉喪失のリスクがあります</p>';
            tlWarningDiv.classList.add('show');
        } else {
            tlWarningDiv.innerHTML = '';
            tlWarningDiv.classList.remove('show');
        }
        
        // --- フェーズ判定 ---
        let phaseName = '';
        let phaseAdvice = '';
        
        if (diffWeeks >= 8) {
            phaseName = 'ベースキャンプ期';
            phaseAdvice = 'カーニボア適応開始に最適なタイミングです。最初の2〜3週間はカーニボアフルーに備えて電解質（岩塩・ボーン・ブロス）を増やしてください。タンパク質を体重1kgあたり2g以上確保しながら、脂質でカロリーを補います。';
        } else if (diffWeeks >= 4) {
            phaseName = '脂肪燃焼期';
            phaseAdvice = '脂肪適応が完了しつつある時期です。カーニボア計算ツールで算出した目標カロリーに従い、食事を安定させましょう。週0.5〜1kgのペースで落とすのが理想です。無理な急激な絞り込みは筋肉も落とします。';
        } else if (diffWeeks >= 2) {
            phaseName = '最終調整期';
            phaseAdvice = '炭水化物を段階的に削減する時期です。ウォーターローディング（水を多めに飲む）を始め、徐々に水分と塩分を調整します。練習の強度も徐々に落とし始めましょう。';
        } else {
            phaseName = '水抜きフェーズ (ファイトウィーク)';
            phaseAdvice = '「7〜5日前：大量飲水＋低ナトリウム」「4〜3日前：炭水化物ゼロ＋さらに減塩」「前日：水分制限」「計量日：最終水抜き→計量後すぐ電解質ドリンク」の順で進めてください。カーニボアの強みで炭水化物なしが自然に達成できています。';
        }
        
        // UI更新
        document.getElementById('res-tl-weeks').textContent = diffWeeksFloor + '週間';
        document.getElementById('res-days').textContent = diffDays;
        
        document.getElementById('phase-name').textContent = phaseName;
        document.getElementById('phase-advice').textContent = phaseAdvice;
        
        tlResultArea.classList.remove('hidden');
        
        setTimeout(() => {
            tlResultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            animateValue(document.getElementById('res-weeks'), 0, diffWeeksFloor, 1000);
            animateFloatValue(document.getElementById('res-weight-diff'), 0, weightLoss, 1200);
            animateFloatValue(document.getElementById('res-weekly-loss'), 0, weeklyLoss, 1200);
        }, 50);
    });

    // === トラッカー機能 ===
    const trackerForm = document.getElementById('tracker-form');
    const trackerResultArea = document.getElementById('tracker-result-area');
    
    trackerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const startDateStr = document.getElementById('start-date').value;
        if (!startDateStr) {
            alert('開始日を入力してください。');
            return;
        }
        
        const startDate = new Date(startDateStr);
        startDate.setHours(0,0,0,0);
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const diffTime = today.getTime() - startDate.getTime();
        let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
           alert('開始日は今日以前の日付を指定してください。');
           return;
        }

        const passedDays = diffDays + 1;
        const passedWeeks = Math.ceil(passedDays / 7);

        let phaseIndex = 0;
        let daysToNextPhase = 0;

        if (passedDays <= 7) {
            phaseIndex = 1;
            daysToNextPhase = 8 - passedDays;
        } else if (passedDays <= 21) {
            phaseIndex = 2;
            daysToNextPhase = 22 - passedDays;
        } else if (passedDays <= 42) {
            phaseIndex = 3;
            daysToNextPhase = 43 - passedDays;
        } else if (passedDays <= 56) {
            phaseIndex = 4;
            daysToNextPhase = 57 - passedDays;
        } else {
            phaseIndex = 5;
            daysToNextPhase = 0; 
        }

        const nextPhaseDiv = document.getElementById('next-phase-info');
        if (phaseIndex === 5) {
            nextPhaseDiv.innerHTML = '現在、最終の<span style="color:var(--accent-red); font-size:1.3rem;">維持・最適化フェーズ</span>に到達しています。';
        } else {
            nextPhaseDiv.innerHTML = `あと <span id="days-to-next" style="color: var(--accent-red); font-size: 1.3rem;">${daysToNextPhase}</span> 日で次のフェーズへ`;
        }

        const phaseBoxes = document.querySelectorAll('.phase-box');
        phaseBoxes.forEach(box => box.classList.remove('active'));
        const activeBox = document.querySelector(`.phase-box[data-phase="${phaseIndex}"]`);
        if (activeBox) activeBox.classList.add('active');

        trackerResultArea.classList.remove('hidden');

        setTimeout(() => {
            trackerResultArea.scrollIntoView({ behavior: 'smooth', block: 'end' });
            
            animateValue(document.getElementById('trk-days'), 0, passedDays, 1000);
            animateValue(document.getElementById('trk-weeks'), 0, passedWeeks, 1000);
            
            if (phaseIndex !== 5) {
                const dTN = document.getElementById('days-to-next');
                if(dTN) animateValue(dTN, 0, daysToNextPhase, 1000);
            }
        }, 50);
    });

    // === リカバリー機能 ===
    const recForm = document.getElementById('recovery-form');
    const recResultArea = document.getElementById('recovery-result-area');
    
    recForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const weight = parseFloat(document.getElementById('rec-weight').value);
        const hours = parseFloat(document.getElementById('rec-hours').value);
        const timing = document.querySelector('input[name="rec-timing"]:checked').value;
        
        if (isNaN(weight) || isNaN(hours) || weight <= 0 || hours <= 0) {
            alert('体重と試合までの時間を正しく入力してください。');
            return;
        }

        // 1. 必要水分量
        // 通常体重の予想 = 計量後体重 + 3%
        const diffWeight = weight * 0.03; 
        const totalWater = diffWeight * 1500; // mL
        
        const water2h = totalWater * 0.4;
        const waterRest = totalWater * 0.6;
        
        // 2. 電解質 (1000mg per L)
        const sodiumMg = totalWater * 1.0;
        const saltG = sodiumMg / 390; // 岩塩 約390mg/1g
        
        // 3. タンパク質補給 (0.5g / kg)
        const proteinG = weight * 0.5;
        const eggs = proteinG / 6; // 卵1個あたり6g
        
        // 4. 炭水化物補給 (試合12時間前を満たすか、前日計量の場合)
        // ここでは time >= 12 の場合に炭水化物を表示する。
        const carbDiv = document.getElementById('carb-recommendation');
        let carbsG = 0;
        let riceG = 0;
        let udonG = 0;

        if (hours >= 12 || timing === 'day-before') {
            carbsG = weight * 1.5; // 1.5g / kg目安
            riceG = carbsG * (100 / 36); // 白米100g=36g炭水化物
            udonG = carbsG * (100 / 21); // うどん(茹で)100g=21g炭水化物
            
            carbDiv.style.display = 'block';
        } else {
            carbDiv.style.display = 'none';
        }

        recResultArea.classList.remove('hidden');

        setTimeout(() => {
            recResultArea.scrollIntoView({ behavior: 'smooth', block: 'end' });
            
            animateValue(document.getElementById('res-water-total'), 0, Math.round(totalWater), 1000);
            animateValue(document.getElementById('res-water-2h'), 0, Math.round(water2h), 1000);
            animateValue(document.getElementById('res-water-rest'), 0, Math.round(waterRest), 1000);
            
            animateValue(document.getElementById('res-sodium'), 0, Math.round(sodiumMg), 1000);
            animateFloatValue(document.getElementById('res-salt'), 0, saltG, 1000);
            
            animateValue(document.getElementById('res-rec-protein'), 0, Math.round(proteinG), 1000);
            animateFloatValue(document.getElementById('res-egg'), 0, eggs, 1000);
            
            if (hours >= 12 || timing === 'day-before') {
                animateValue(document.getElementById('res-carbs'), 0, Math.round(carbsG), 1000);
                animateValue(document.getElementById('res-rice'), 0, Math.round(riceG), 1000);
                animateValue(document.getElementById('res-udon'), 0, Math.round(udonG), 1000);
            }
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

    /**
     * 小数をカウントアップするアニメーション関数
     * @param {HTMLElement} obj - 更新するDOM要素
     * @param {number} start - 開始値
     * @param {number} end - 終了値
     * @param {number} duration - アニメーション時間(ms)
     */
    function animateFloatValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = progress * (2 - progress);
            obj.innerHTML = (easeOut * (end - start) + start).toFixed(1);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // === カルーセル機能 ===
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const dotsNav = document.querySelector('.carousel-indicators');
    const dots = Array.from(document.querySelectorAll('.dot'));
    
    if (track && slides.length > 0) {
        let currentIndex = 0;
        let slideInterval;
        
        const updateCarousel = (index) => {
            track.style.transform = 'translateX(-' + index * 100 + '%)';
            dots.forEach(d => d.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');
        };
        
        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel(currentIndex);
        };
        
        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel(currentIndex);
        };
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                nextSlide();
                resetInterval();
            });
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                prevSlide();
                resetInterval();
            });
        }
        
        if (dotsNav) {
            dotsNav.addEventListener('click', e => {
                const targetDot = e.target.closest('.dot');
                if (!targetDot) return;
                currentIndex = dots.findIndex(d => d === targetDot);
                updateCarousel(currentIndex);
                resetInterval();
            });
        }
        
        const startInterval = () => {
            slideInterval = setInterval(nextSlide, 5000); // 5 sec interval
        };
        
        const resetInterval = () => {
            clearInterval(slideInterval);
            startInterval();
        };
        
        // Hover to pause
        const heroSection = document.querySelector('.home-hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => clearInterval(slideInterval));
            heroSection.addEventListener('mouseleave', startInterval);
        }
        
        startInterval();
    }
});
