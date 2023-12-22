var password = [], key;
window.addEventListener('DOMContentLoaded', (event) => {
   if(localStorage.getItem('passHannah') === null){
      let pass = prompt('Senha');
      if(pass === null || pass.length != 32){
         alert('A senha deve ter 32 caracteres');
         location.reload();
         return;
      }
      localStorage.setItem('passHannah', pass);
   }
   localStorage.getItem('passHannah').split('').forEach(element => {
      password.push(element.charCodeAt(0));
   });
   window.crypto.subtle.importKey('raw', new Uint8Array(password), 'AES-GCM', true, ['encrypt', 'decrypt']).then(pass => {
      key = pass;
      getFunctions().then(plain => {
         (0, eval)(plain);
         query();
         defineDuties();
         showMonths();
      }).catch(error => {
         alert('Senha incorreta');
         location.reload();
         return;
      });
   });
});
function decrypt(encrypted){
   return new Promise((resolve, reject) => {
      window.crypto.subtle.decrypt(
         {
            name: "AES-GCM",
            iv: encrypted.slice(encrypted.length - 12)
         },
         key,
         encrypted.slice(0, encrypted.length - 12)
      ).then(decrypted => {
         resolve(new TextDecoder().decode(decrypted));
         return 1;
      }).catch(error => {
         reject(error);
      });
   });
}
function encrypt(encoded){
   return new Promise((resolve, reject) => {
      let iv = window.crypto.getRandomValues(new Uint8Array(12));
      window.crypto.subtle.encrypt(
         {name: "AES-GCM", iv: iv},
         key,
         encoded
      ).then(buffer => {
         var encryptedWIV = new Uint8Array(buffer.byteLength + iv.length);
         const encrypted = new Uint8Array(buffer);
         encryptedWIV.set(encrypted);
         encryptedWIV.set(iv, encrypted.length);
         resolve(encryptedWIV);
      }).catch(error => {
         reject(error);
      });
   });
}
function getFunctions(){
   return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.open('GET', 'functions.js', true);
      xhr.onreadystatechange = function() {
         if(xhr.readyState == 4 && xhr.status == 200){
            decrypt(new Uint8Array(xhr.response)).then(decrypted => {
               resolve(decrypted);
            }).catch(error => {
               reject(error);
            });
         }
      }
      xhr.send();
   });
}