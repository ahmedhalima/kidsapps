# عالم الصغار (Kids World)

موقع تعليمي تفاعلي للأطفال (عمر ٥ سنوات): حروف وأرقام وحساب وقراءة وألعاب وتلوين وبرمجة بالسحب والإفلات،
مع صفحات منفصلة للأب (وقت اللعب، التقارير، ترتيب الصفحة الرئيسية، نسخ احتياطي...).

HTML/CSS/JavaScript عادي، بدون مكتبات وبدون خطوة بناء.

## التشغيل
- افتح `index.html` مباشرة في المتصفح، أو شغّل خادمًا محليًا: `npm run serve` ثم افتح http://localhost:8080
- ملف واحد للمشاركة: `npm run build` ينتج `dist/kids-world.html`.
- اختبار: `npm test` (يحمّل كل الملفات ويرسم كل الشاشات ويفشل عند أي خطأ).

## هيكل المشروع
```
index.html                 الصفحة (هيكل فقط) وترتيب تحميل الملفات
manifest.webmanifest       ليُثبَّت كتطبيق على الهاتف
css/
  base.css                 المتغيرات والألوان والوضع الداكن والصفحة
  components.css           الأزرار والبطاقات والشبكة
  games.css                خيارات الاختبار والألعاب والحركات
  arabic-text.css          خط القراءة العربي (يجب أن يُحمّل بعد games.css)
  parent.css               صفحات الأب
  print.css                المطبوعات
js/
  core/                    الحالة والحفظ، الصوت، التسجيل، الوقت والهدف، النجوم، الأطفال، التنقل (رجوع)
  data/                    المحتوى: حروف، كلمات، أرقام، قراءة، قصص، أدعية، علوم...
  features/                كل ميزة في ملف: تعلّم، قراءة، حساب، ألعاب، ألغاز، برمجة، مطبوعات، ساعة...
  parent/                  صفحات الأب: parent-core.js + page-*.js لكل صفحة
  main.js                  التشغيل
assets/images/             favicon.svg, logo.svg, icon-192.png, icon-512.png
scripts/                   build-single.js, check-secrets.sh, publish-to-github.sh
tests/                     harness.js, smoke.js
```

## ملاحظات للمطوّر
- الملفات سكربتات عادية (ليست ES modules) تتشارك النطاق العام، لذلك **ترتيب `<script>` في `index.html` مهم**:
  `core` ← `data` ← `features` ← `parent` ← `navigation.js` ← `main.js`.
- لإضافة ميزة جديدة: أنشئ `js/features/my-feature.js`، أضف سطر `<script>` قبل `js/parent/`، وأضف اسم دالة الشاشة إلى `NAV_SCREENS` في `js/core/navigation.js` ليعمل زر «رجوع»، وأضف زرًا في `htiles()` داخل `js/features/home.js`.
- لإضافة صفحة أب: أنشئ `js/parent/page-xxx.js` يعرّف `PG.xxx=h=>{...}` وأضفها إلى مصفوفة `PT` في `parent-core.js`.
- التقدم والإعدادات تُحفظ في المتصفح (localStorage) ولا ترفع إلى المستودع. تسجيلات الصوت في IndexedDB.
- الرقم السري الافتراضي للأب: `1234` (غيّره من صفحة الأمان).

## الأمان
- ملفات `.env` والمفاتيح مستثناة في `.gitignore`.
- `scripts/check-secrets.sh` يمنع الرفع إن وجد ما يشبه مفتاحًا سريًا.
- لا يحتاج المشروع أي مفاتيح API.
