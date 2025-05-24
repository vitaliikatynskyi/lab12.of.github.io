document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links (from previous version, keep it)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add 'active' class to current navigation link
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });

    // --- Fitness Plan Calculator Logic ---
    const fitnessForm = document.getElementById('fitness-form');
    const resultsSection = document.getElementById('results');

    if (fitnessForm) { // Ensure we are on the correct page before adding event listener
        fitnessForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission

            // Get user inputs
            const gender = document.getElementById('gender').value;
            const age = parseInt(document.getElementById('age').value);
            const heightCm = parseFloat(document.getElementById('height').value);
            const weightKg = parseFloat(document.getElementById('weight').value);
            const activityLevel = parseFloat(document.getElementById('activity').value);
            const goal = document.getElementById('goal').value;

            // Basic Validation
            if (!gender || isNaN(age) || isNaN(heightCm) || isNaN(weightKg) || isNaN(activityLevel) || !goal) {
                alert('Будь ласка, заповніть усі поля коректно.');
                return;
            }
            if (age < 10 || age > 100 || heightCm < 50 || heightCm > 250 || weightKg < 20 || weightKg > 300) {
                 alert('Будь ласка, введіть реалістичні значення для віку, зросту та ваги.');
                 return;
            }

            // --- 1. BMI Calculation ---
            const heightM = heightCm / 100;
            const bmi = weightKg / (heightM * heightM);
            let bmiCategory = '';

            if (bmi < 16) {
                bmiCategory = 'Виражений дефіцит ваги';
            } else if (bmi >= 16 && bmi < 18.5) {
                bmiCategory = 'Недостатня вага';
            } else if (bmi >= 18.5 && bmi < 24.9) {
                bmiCategory = 'Нормальна вага';
            } else if (bmi >= 25 && bmi < 29.9) {
                bmiCategory = 'Надмірна вага';
            } else if (bmi >= 30 && bmi < 34.9) {
                bmiCategory = 'Ожиріння (I ступінь)';
            } else if (bmi >= 35 && bmi < 39.9) {
                bmiCategory = 'Ожиріння (II ступінь)';
            } else {
                bmiCategory = 'Ожиріння (III ступінь)';
            }


            document.getElementById('bmi-value').textContent = bmi.toFixed(2);
            document.getElementById('bmi-category').textContent = bmiCategory;

            // --- 2. Body Fat Percentage (Simplified Durnin-Womersley formula for estimation) ---
            // This is a very rough estimate and less accurate than proper methods.
            // For a basic app, it can serve as an indicator.
            let bodyFat = 0;
            if (gender === 'male') {
                bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
            } else { // female
                bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
            }
            // Add a boundary check for unrealistic results
            if (bodyFat < 5) bodyFat = 5;
            if (bodyFat > 40) bodyFat = 40;

            document.getElementById('body-fat-value').textContent = bodyFat.toFixed(1);

            // --- 3. BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation ---
            let bmr = 0;
            if (gender === 'male') {
                bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
            } else { // female
                bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
            }
            document.getElementById('bmr-value').textContent = bmr.toFixed(0);

            // --- 4. TDEE (Total Daily Energy Expenditure) ---
            const tdee = bmr * activityLevel;
            document.getElementById('tdee-value').textContent = tdee.toFixed(0);

            // --- 5. Target Calories based on Goal ---
            let targetCalories = tdee;
            if (goal === 'lose') {
                // Deficit for weight loss, common is 500-750 kcal/day
                targetCalories = tdee - 500;
                // Ensure minimum safe calorie intake
                if (targetCalories < 1200 && gender === 'female') targetCalories = 1200;
                if (targetCalories < 1500 && gender === 'male') targetCalories = 1500;
            } else if (goal === 'gain') {
                // Surplus for muscle gain, common is 250-500 kcal/day
                targetCalories = tdee + 400; // Slightly higher for gain
            }
            document.getElementById('target-calories').textContent = targetCalories.toFixed(0);

            // --- 6. Nutrition Plan Recommendations (Macros and Food Examples) ---
            const macrosRecommendationList = document.getElementById('macros-recommendation');
            macrosRecommendationList.innerHTML = ''; // Clear previous recommendations
            const foodExamplesList = document.getElementById('food-examples');
            foodExamplesList.innerHTML = ''; // Clear previous examples

            let proteinPercentage = 0;
            let carbsPercentage = 0;
            let fatsPercentage = 0;

            let foodExamples = [];

            if (goal === 'lose') {
                proteinPercentage = 35; // Higher protein for satiety and muscle preservation
                carbsPercentage = 35;
                fatsPercentage = 30;
                foodExamples = [
                    '**Білки:** курка, індичка, риба, яйця, нежирний сир, грецький йогурт.',
                    '**Вуглеводи:** овочі (броколі, шпинат, огірки, помідори), цільнозернові (кіноа, вівсянка в невеликих кількостях), ягоди.',
                    '**Жири:** авокадо, горіхи (в міру), оливкова олія, жирна риба (лосось).'
                ];
            } else if (goal === 'gain') {
                proteinPercentage = 30; // High protein
                carbsPercentage = 50; // Higher carbs for energy and muscle glycogen
                fatsPercentage = 20;
                foodExamples = [
                    '**Білки:** яловичина, курка, риба, яйця, протеїнові коктейлі.',
                    '**Вуглеводи:** рис, картопля, батат, макарони твердих сортів, хліб цільнозерновий, фрукти (банани, яблука).',
                    '**Жири:** арахісова паста, оливкова олія, авокадо, цілі яйця.'
                ];
            } else { // maintain
                proteinPercentage = 25;
                carbsPercentage = 50;
                fatsPercentage = 25;
                foodExamples = [
                    '**Білки:** різноманітні джерела (м\'ясо, риба, бобові, молочні продукти).',
                    '**Вуглеводи:** збалансоване споживання складних вуглеводів, фруктів та овочів.',
                    '**Жири:** здорові жири з різних джерел.'
                ];
            }

            const proteinGrams = (targetCalories * (proteinPercentage / 100)) / 4; // 4 kcal per gram of protein
            const carbsGrams = (targetCalories * (carbsPercentage / 100)) / 4;   // 4 kcal per gram of carbs
            const fatsGrams = (targetCalories * (fatsPercentage / 100)) / 9;     // 9 kcal per gram of fat

            macrosRecommendationList.innerHTML = `
                <li>Білки: ${proteinPercentage}% (${proteinGrams.toFixed(0)} г)</li>
                <li>Вуглеводи: ${carbsPercentage}% (${carbsGrams.toFixed(0)} г)</li>
                <li>Жири: ${fatsPercentage}% (${fatsGrams.toFixed(0)} г)</li>
            `;

            foodExamples.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = item; // Use innerHTML to allow bold tags within list items
                foodExamplesList.appendChild(li);
            });


            // --- 7. Training Plan Recommendations ---
            const workoutTypesList = document.getElementById('workout-types');
            workoutTypesList.innerHTML = '';
            const weeklyPlanDiv = document.getElementById('weekly-plan');
            weeklyPlanDiv.innerHTML = '';

            let workoutTypes = [];
            let weeklyPlan = '';

            if (goal === 'lose') {
                workoutTypes = ['Кардіо високої інтенсивності (ВІІТ)', 'Силові тренування з вагою тіла або легкими обтяженнями', 'Ходьба/Легкий біг', 'Йога/Розтяжка'];
                weeklyPlan = `
                    <p><strong>Понеділок:</strong> Силове тренування (все тіло) - 45-60 хв</p>
                    <p><strong>Вівторок:</strong> Кардіо (біг, скакалка, еліпс) - 30-40 хв</p>
                    <p><strong>Середа:</strong> Активний відпочинок (прогулянка, йога) - 30 хв</p>
                    <p><strong>Четвер:</strong> Силове тренування (все тіло) - 45-60 хв</p>
                    <p><strong>П'ятниця:</strong> ВІІТ тренування (20-25 хв) або інтенсивне кардіо</p>
                    <p><strong>Субота:</strong> Легке кардіо або активний відпочинок на свіжому повітрі</p>
                    <p><strong>Неділя:</strong> Повний відпочинок / Розтяжка</p>
                `;
            } else if (goal === 'gain') {
                workoutTypes = ['Силові тренування з обтяженнями (ваги)', 'Обмежене кардіо (низької інтенсивності)', 'Відновлювальні вправи та розтяжка'];
                weeklyPlan = `
                    <p><strong>Понеділок:</strong> Силове тренування (верх тіла / груди, трицепс) - 60-75 хв</p>
                    <p><strong>Вівторок:</strong> Силове тренування (низ тіла / ноги, сідниці) - 60-75 хв</p>
                    <p><strong>Середа:</strong> Відпочинок або легке кардіо (20-30 хв)</p>
                    <p><strong>Четвер:</strong> Силове тренування (спина, біцепс) - 60-75 хв</p>
                    <p><strong>П'ятниця:</strong> Силове тренування (плечі, прес) - 45-60 хв</p>
                    <p><strong>Субота:</strong> Активний відпочинок або розтяжка / йога</p>
                    <p><strong>Неділя:</strong> Повний відпочинок</p>
                `;
            } else { // maintain
                workoutTypes = ['Змішані тренування (силові, кардіо, гнучкість)', 'Йога/Пілатес', 'Функціональні тренування', 'Спорт на вибір'];
                weeklyPlan = `
                    <p><strong>Понеділок:</strong> Силове тренування (все тіло або спліт) - 45-60 хв</p>
                    <p><strong>Вівторок:</strong> Кардіо (біг, плавання, велосипед) - 40-50 хв</p>
                    <p><strong>Середа:</strong> Йога або пілатес / активний відпочинок - 30-45 хв</p>
                    <p><strong>Четвер:</strong> Силове тренування (інша група м'язів або все тіло) - 45-60 хв</p>
                    <p><strong>П'ятниця:</strong> Функціональне тренування або спорт на вибір - 30-45 хв</p>
                    <p><strong>Субота:</strong> Активний відпочинок (довга прогулянка, хайкінг) / Легке кардіо</p>
                    <p><strong>Неділя:</strong> Повний відпочинок</p>
                `;
            }

            workoutTypes.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                workoutTypesList.appendChild(li);
            });
            weeklyPlanDiv.innerHTML = weeklyPlan;

            // Show results section
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});