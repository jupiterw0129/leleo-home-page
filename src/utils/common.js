export function setMeta(title,description,keywords,icon) {   
  // 设置标题
  document.title = title;

  // 设置描述
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }

  // 设置关键词
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.setAttribute('content', keywords);
  }

   // 设置图标ico
  const webico = document.querySelector('link[rel="icon"]');
   if (webico) {
    webico.href = icon;
  }
}

export function getFormattedTime(currentDate){
   return currentDate.toLocaleTimeString('en-US', {
       hour: '2-digit',
       minute: '2-digit',
       second: '2-digit',
       hour12: false,
     }).replace(/:/g, ' : ');
}

export function getFormattedDate(currentDate){
   const month = currentDate.getMonth() + 1;
   const day = currentDate.getDate();
   const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
   const weekday = weekdays[currentDate.getDay()];

   return `${month}/${day} ${weekday}`;
}

export function dataConsole(){
 console.log(`%c                                                             
                ,----------------,              ,---------, 
           ,-----------------------,          ,"        ,"| 
         ,"                      ,"|        ,"        ,"  | 
        +-----------------------+  |      ,"        ,"    | 
        |  .-----------------.  |  |     +---------+      | 
        |  |                 |  |  |     | -==----'|      | 
        |  |  I LOVE YOU!    |  |  |     |         |      | 
        |  |  FROM %cleleo.top%c |  |  |/----|'---=    |      | 
        |  |  Copyright ©    |  |  |   ,/|==== ooo |      ; 
        |  |      ${new Date().getFullYear()}       |  |  |  // |(((( [33]|    ,"  
        |  ·-----------------'  |," .;'| |((((     |  ,"    
        +-----------------------+  ;;  | |         |,"      
           /_)______________(_/  //'   | +---------+        
      ___________________________/___  ',                   
     /  oooooooooooooooo  .o.  oooo /,   \,"-----------      
    / ==ooooooooooooooo==.o.  ooo= //   ,'\--{)B     ,"      
   /_==__==========__==_ooo__ooo=_/'   /___________,"       
   '-----------------------------'                          
`,'background-color:#CFFFFB','background-color:#CFFFFB;color: #0045FE;','background-color:#CFFFFB');
   
}