/* Words, short sentences and the learning subjects table */
const WD=P('كلب,dog,🐶;قطة,cat,🐱;تفاحة,apple,🍎;موزة,banana,🍌;ماما,mom,👩;بابا,dad,👨;بيت,house,🏠;سيارة,car,🚗;كتاب,book,📖;كرة,ball,⚽;شمس,sun,☀️;قمر,moon,🌙;سمكة,fish,🐟;فيل,elephant,🐘;شجرة,tree,🌳;ماء,water,💧;عنب,grapes,🍇;وردة,flower,🌹;طائرة,plane,✈️;حليب,milk,🥛');

const SEN=P('القطة تشرب اللبن,The cat drinks milk,🐱;أنا أحب ماما,I love mom,👩;الشمس ساطعة,The sun is bright,☀️;أنا آكل تفاحة,I eat an apple,🍎;السمكة في الماء,The fish is in the water,🐟;الكلب يجري,The dog runs,🐶;أنا أقرأ كتابًا,I read a book,📖;السيارة سريعة,The car is fast,🚗;القمر في السماء,The moon is in the sky,🌙;أنا أغسل يدي,I wash my hands,🧼');

const SJ={
  ar:{
    t:'الحروف العربية',i:'أ',c:'#ff6b6b',d:AR,s:6,st:4
  },en:{
    t:'English ABC',i:'Ab',c:'#4dabf7',d:EN,s:6,st:4
  },num:{
    t:'الأرقام',i:'١٢٣',c:'#51cf66',d:NUM,s:4,st:2
  },wd:{
    t:'الكلمات',i:'📚',c:'#f06595',d:WD,s:6,st:3
  },sen:{
    t:'الجمل القصيرة',i:'💬',c:'#15aabf',d:SEN,s:3,st:2
  },math:{
    t:'الحساب',i:'➕',c:'#ae6bff',d:[],s:3,st:1
  }
};

const un=k=>SJ[k].d.length?Math.min(SJ[k].d.length,SJ[k].s+(S.rounds[k]||0)*SJ[k].st):0;
