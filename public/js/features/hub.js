/* Discover hub menu */
function hub(){
  view='hub';
  const T=[['#1c7ed6','🕒','ساعة',clock],['#2f9e44','💰','نقود',money],['#1098ad','🔬','علوم',science],['#ae3ec9','📐','أشكال واتجاهات',shapes],['#e8590c','🤲','أدعية وقيم',duas],['#4c6ef5','🇬🇧','English',english],['#7048e8','📚','قصص تفاعلية',istories],['#d6336c','🔤','أشكال الحرف',forms]];
  app.innerHTML='<h2>🌍 اكتشف</h2><div class="grid">'+T.map((t,i)=>'<button class="tile" style="background:'+t[0]+'" data-i="'+i+'"><b>'+t[1]+'</b>'+t[2]+'</button>').join('')+'</div>';
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>T[b.dataset.i][3]())
}
