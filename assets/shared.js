(function(){
  const STORAGE_KEY='spmi-assessment-participant-key-v1';
  function getParticipantKey(){
    try{let key=localStorage.getItem(STORAGE_KEY);if(!key){key=(crypto&&crypto.randomUUID)?crypto.randomUUID():('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16)}));localStorage.setItem(STORAGE_KEY,key)}return key}catch(e){return(crypto&&crypto.randomUUID)?crypto.randomUUID():'00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0')}
  }
  window.SPMI={getParticipantKey};
  document.querySelectorAll('[data-qr]').forEach(img=>{const path=img.getAttribute('data-qr');const target=new URL('/'+path,location.origin).href;img.src='https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data='+encodeURIComponent(target);img.referrerPolicy='no-referrer';img.title='QR menuju '+target;});
})();
